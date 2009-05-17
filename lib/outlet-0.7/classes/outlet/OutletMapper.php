<?php

class OutletMapper {
	static $conf;
	static $map = array();
	
	/**
	 * @var bool
	 */
	private $new = true;

	function __construct (&$obj) {
		throw new Exception('deprecated');

		if (!is_object($obj)) throw new OutletException('You must pass an object');
		if ($obj instanceof OutletMapper) throw new OutletException('You passed and OutletMapper object');
		
		if ($obj instanceof OutletProxy) $this->new = false;
		
		$this->cls = self::getEntityClass($obj);

		// validate that mapping for this object exists
		if (!isset(self::$conf[$this->cls])) throw new OutletException('No mapping exists for entity ['.$this->cls.'] in configuration');

		$this->obj = &$obj;
		
		$this->original = self::toArray($this->obj);
	}
	
	static function getEntityClass ($obj) {
		if ($obj instanceof OutletProxy) {
			return substr(get_class($obj), 0, -(strlen('_OutletProxy')));
		} else {
			return get_class($obj);
		}
	}

	static function save (&$obj) {
		if (self::isNew($obj)) {
			return self::insert($obj);
		} else {
			return self::update($obj);
		}
	}

	static function isNew($obj) {
		return ! $obj instanceof OutletProxy;
	}
	
	static function load ($cls, $pk) {
		if (!$pk) throw new OutletException("Must pass a valid primary key value, passed: ".var_export($pk));

		if (!is_array($pk)) $pks = array($pk);
		else $pks = $pk;
		
		// try to retrieve it from the cache first
		$data = self::get($cls, $pks);

		// if it's there
		if ($data) {
			$obj = $data['obj'];
			
		// else, populate it from the database
		} else {
			// create a proxy
			$proxyclass = "{$cls}_OutletProxy";
		
			$obj = new $proxyclass;
			
			$props_conf = self::getFields( $cls );
			$props = array_keys($props_conf);

			// craft select
			$q = "SELECT {".$cls.'.';
			$q .= implode('}, {'.$cls.'.', $props) . "}\n";
			$q .= "FROM {".$cls."} \n";

			$pk_props = self::getConfig($obj)->getPkFields();
			
			$pk_q = array();
			foreach ($pk_props as $pkp) {
				$pk_q[] = '{'.$cls.'.'.$pkp.'} = ?';
			}
			
			$q .= "WHERE " . implode(' AND ', $pk_q);
			
			$q = self::processQuery($q);
	
			$stmt = Outlet::getInstance()->getConnection()->prepare($q);

			$stmt->execute(array_values($pks));
	
			$row = $stmt->fetch(PDO::FETCH_ASSOC);
			
			// if there's matching row, 
			// return null
			//if (!$row) throw new Exception("No matching row found for {$cls} with primary key of [".implode(',', $pks)."]");
			if (!$row) return null;
			
			// cast the row to the types defined on the config
			self::castRow($cls, $row);
	
			foreach ($props_conf as $key=>$f) {
                self::setProp($obj, $key, $row[$f[0]]);
			}
			
			// add it to the cache
			self::set($cls, self::getPkValues($obj), array(
				'obj' => $obj,
				'original' => self::toArray($obj)
			));
		}
		
		return $obj;
	}
	
	public function setPk ($obj, $pk) {
		if (!is_array($pk)) $pk = array($pk);
		
		$pk_props = self::getConfig($obj)->getPkFields();
		
		if (count($pk)!=count($pk_props)) throw new OutletException('You must pass the following pk: ['.implode(',', $pk_props).'], you passed: ['.implode(',', $pk).']');
		
		foreach ($pk_props as $key=>$prop) {
			$obj->$prop = $pk[$key];
		}
	}
	
	/**
	 * Get the PK values for the entity, casted to the type defined on the config 
	 *
	 * @return array
	 */
	static function getPkValues ($obj) {
		return self::getPkValuesForObject($obj);
	}
	
	/**
	 * @param $class
	 * @param $obj
	 * @return array
	 */
	static function getPkValuesForObject ($obj) {
		$pks = array();
		foreach (self::getConfig($obj)->getProperties() as $key=>$p) {
			if (@$p[2]['pk']) {
				$value = self::getProp($obj, $key);
				
				// cast it if the property is defined to be an int
				if ($p[1]=='int') $value = (int) $value;
				
				$pks[$key] = $value;
			}
		}
		return $pks;
	}
	
	public static function castRow ($clazz, array &$row) {
		foreach (Outlet::getInstance()->getConfig()->getEntity($clazz)->getProperties() as $key=>$p) {
			$column = $p[0];

			if (!array_key_exists($column, $row)) throw new OutletException('No value found for ['.$column.'] in row ['.var_export($row, true).']');	
		
			// cast if it's anything other than a string
			$row[$column] = self::toPhpValue($p, $row[$column]);
		}
	}

	static function getPkProp ( $obj ) {
		return self::getConfig($obj)->getPkField();
	}

	static function getTable ($clazz) {
		return self::$conf[$clazz]['table'];
	}
	
	static function getFields ($clazz) {
		return self::$conf[$clazz]['props'];
	}

	static function saveOneToMany ($obj) {
		$conf = self::getConfig($obj);
		
		$pks = self::getPkValues($obj);
		
		foreach ($conf->getAssociations() as $assoc) {
			if ($assoc->getType() != 'one-to-many') continue;
                            
			$key 		= $assoc->getKey();
			$getter 	= $assoc->getGetter();
			$setter		= $assoc->getSetter();
            $foreign    = $assoc->getForeign();

			/* @var $children Collection */
			$children = $obj->$getter(null);
			
			if (is_null($children)) continue;
			
			// if we don't have an OutletCollection yet
			if (! $children instanceof OutletCollection) {
				$arr = $children->getArrayCopy();
				
				/* @var $children OutletCollection */
				$children = $obj->$getter();
				$children->exchangeArray($arr);
			}                                          
            
            // if removing all connections
            if ($children->isRemoveAll()) {
                // TODO: Make it work with composite keys
                $q = self::processQuery('DELETE FROM {'.$foreign.'} WHERE {'.$foreign.'.'.$assoc->getKey().'} = ?');                
                $stmt = Outlet::getInstance()->getConnection()->prepare($q);            
                $stmt->execute($pks);
            }
                
            foreach (array_keys($children->getArrayCopy()) as $k) {
                // TODO: make it work with composite keys
                self::setProp($children[$k], $key, current($pks));
                self::save($children[$k]);
            }

			$obj->$setter( $children );
		}
	}


	private function saveManyToMany ($obj) {
		$con = Outlet::getInstance()->getConnection();
        $pks = self::getPkValues($obj);
		
		foreach (self::getConfig($obj)->getAssociations() as $assoc) {
			if ($assoc->getType() != 'many-to-many') continue;

			$key_column = $assoc->getTableKeyLocal();
			$ref_column = $assoc->getTableKeyForeign();
			$table = $assoc->getLinkingTable();
			$name = $assoc->getForeignName();
            
            $getter     = $assoc->getGetter();
            $setter        = $assoc->getSetter();
			
			$children = $obj->$getter();
			
			// if removing all connections
			if ($children->isRemoveAll()) {
                // TODO: Make it work with composite keys
				$q = "DELETE FROM $table WHERE $key_column = ?";
				
				$stmt = $con->prepare($q);
			
				$stmt->execute(array_values($pks));
			}

			$new = $children->getLocalIterator();
			
			foreach ($new as $child) {
				if ($child instanceof OutletProxy) {
					$child_pks = self::getPkValues($child);
					$id = current($child_pks);
				} else {
					$id = $child;
				}

				$q = "
					INSERT INTO $table ($key_column, $ref_column) 
					VALUES (?, ?)
				";	

				$stmt = $con->prepare($q);

				$stmt->execute(array(current($pks), $id));	
			}
                                        
			$obj->$setter( $children );
		}
	}
	
	/**
	 * @param $obj
	 * @return OutletEntityConfig
	 */
	static function getConfig ( $obj ) {
		return Outlet::getInstance()->getConfig()->getEntity( self::getEntityClass($obj) );
	}

	private function saveManyToOne ($obj) {
		$conf = self::getConfig($obj);

		foreach ($conf->getAssociations() as $assoc) {
			if ($assoc->getType() != 'many-to-one') continue;

			$key 	= $assoc->getKey();
			$refKey	= $assoc->getRefKey();
			$getter = $assoc->getGetter();

			$ent =& $obj->$getter();

			if ($ent) {
				if (self::isNew($ent)) self::save($ent);
                
                self::setProp($obj, $key, self::getProp($ent, $refKey));
			}
		}
	}

	static function saveOneToOne ($obj) {
		$conf = self::getConfig($obj);

		foreach ($conf->getAssociations() as $assoc) {
			if ($assoc->getType() != 'one-to-one') continue;

			$key 	= $assoc->getKey();
			$refKey	= $assoc->getRefKey();
			$getter = $assoc->getGetter();

			$ent = $obj->$getter();

			if ($ent) {
				if (self::isNew($ent)) self::save($ent);

				$obj->$key = $ent->$refKey;
			}
		}
	}

	static function insert (&$obj) {
		$outlet = Outlet::getInstance();
		
		$con = $outlet->getConnection();
		$config = $outlet->getConfig();

		$entity = $config->getEntity(self::getEntityClass($obj));

		self::saveOneToOne( $obj );
		self::saveManyToOne( $obj );

		$properties = $entity->getProperties();

		$props = array_keys($properties);
		$table = $entity->getTable();

		// grab insert fields
		$insert_fields = array();
		$insert_props = array();
		$insert_defaults = array();

		$config = Outlet::getInstance()->getConfig();

		foreach ($entity->getProperties() as $prop=>$f) {
			// skip autoIncrement fields
			if (isset($f[2]) && isset($f[2]['autoIncrement']) && $f[2]['autoIncrement']) continue;

			$insert_props[] = $prop;
			$insert_fields[] = $f[0];

			// if there's options
			// TODO: Clean this up
			if (isset($f[2])) {
				if (is_null( self::getProp( $obj, $prop ) )) {
					if (isset($f[2]['default'])) {
						self::setProp( $obj, $prop, $f[2]['default']);
						$insert_defaults[] = false;
					} elseif (isset($f[2]['defaultExpr'])) {
						$insert_defaults[] = $f[2]['defaultExpr'];
					} else {
						$insert_defaults[] = false;
					}
				} else {
					$insert_defaults[] = false;
				}
				continue;
			} else {
				$insert_defaults[] = false;
			}
		}
	
		$q = "INSERT INTO $table ";
		$q .= "(" . implode(', ', $insert_fields) . ")";
		$q .= " VALUES ";

		// question marks for each value
		// except for defaults
		$values = array();
		foreach ($insert_fields as $key=>$f) {
			if ($insert_defaults[$key]) $values[] = $insert_defaults[$key];
			else $values[] = '?';
		}	
		$q .="(" . implode(', ', $values) . ")";
	
		$stmt = $con->prepare($q);
	
		// get the values
		$values = array();
		foreach ($insert_props as $key=>$p) {
			// skip the defaults
			if ($insert_defaults[$key]) continue;

            $values[] = self::toSqlValue( $properties[$p], self::getProp($obj, $p) );
		}
    
		$stmt->execute($values);

		// create a proxy
		$proxy_class = self::getEntityClass($obj) . '_OutletProxy';
		$proxy = new $proxy_class;
		
		// copy the properties to the proxy
        foreach ($entity->getProperties() as $key=>$f) {
            $field = $key;
            if (@$f[2]['autoIncrement']) {
                // Sequence name will be set and is needed for Postgres
                $id = $outlet->getLastInsertId($entity->getSequenceName());
                self::setProp( $proxy, $field , $id);
            } else {
                self::setProp( $proxy, $field , self::getProp( $obj, $field ));
            }
        }
	
		// copy the associated objects to the proxy
		foreach ($entity->getAssociations() as $a) {
			$type = $a->getType();
			if ($type == 'one-to-many' || $type == 'many-to-many') {
				$getter = $a->getGetter();
				$setter	= $a->getSetter();

				$ref = $obj->$getter();
				if ($ref) $proxy->$setter( $obj->$getter() );
			}
		}
		$obj = $proxy;

		self::saveOneToMany($obj);
        self::saveManyToMany($obj);

		// add it to the cache
		self::set(self::getEntityClass($obj), self::getPkValues($obj), array(
			'obj' => $obj,
			'original' => self::toArray($obj)
		));	
	}
	
	static function getProp ($obj, $prop) {
		$config = self::getConfig($obj);
        
		if ($config->useGettersAndSetters()) {
			$getter = "get$prop";
			return $obj->$getter();
		} else {
			return $obj->$prop;
		}
	}
	
	static function setProp ($obj, $prop, $value) {
		$config = self::getConfig($obj);
		
		if ($config->useGettersAndSetters()) {
			$setter = "set$prop";
			$obj->$setter( $value );
		} else {
			$obj->$prop = $value;
		}
	}
	
	/**
	 * Check to see if an entity values (row) have been modified
	 *
	 * @param object $obj
	 * @return boolean
	 */
	public function getModifiedFields ($obj) {
		$data = self::get( self::getEntityClass($obj), self::getPkValues($obj) );

		/* not sure about this yet
		// if this entity hasn't been saved to the map
		if (!$data) return self::toArray($this->obj);
		*/
		
		$new = self::toArray($data['obj']);
		
		$diff = array_diff_assoc($data['original'], $new);
		
		return array_keys($diff);
	}

	public function update(&$obj) {
		// get the class
		$cls = self::getEntityClass($obj);
		
		// this first since this references the key
		self::saveManyToOne($obj);
		
		if ($mod = self::getModifiedFields($obj)) {
			$con = Outlet::getInstance()->getConnection();
	
			$q = "UPDATE {".$cls."} \n";
			$q .= "SET \n";
	
			$ups = array();
			foreach (self::$conf[$cls]['props'] as $key=>$f) {
				// skip fields that were not modified
				if (!in_array($key, $mod)) continue;
				
				// skip primary key 
				if (@$f[2]['pk']) continue;

                $value = self::getProp($obj, $key);
				if (is_null($value)) {
					$value = 'NULL';
				} else {
					$value = $con->quote( self::toSqlValue( $f, $value ) );
				}
	
				$ups[] = "  {".$cls.'.'.$key."} = $value";
			}
			$q .= implode(", \n", $ups);
	
			$q .= "\nWHERE ";
	
			$clause = array();
			foreach (self::$conf[$cls]['props'] as $key=>$pk) {
				// if it's not a primary key, skip it
				if (!@$pk[2]['pk']) continue;
	
				$value = $con->quote( self::toSqlValue( $pk, self::getProp($obj, $key) ) );
				$clause[] = "$pk[0] = $value";
			}
			$q .= implode(' AND ', $clause);
			
			$q = self::processQuery($q);

			$con->exec($q);
		}

		// these last since they reference the key
		self::saveOneToMany($obj);
		self::saveManyToMany($obj);
	}

	static function toArray ($entity) {
		if (!$entity) throw new OutletException('You must pass an entity');

		$class = self::getEntityClass($entity);
	
		$arr = array();
		foreach (Outlet::getInstance()->getConfig()->getEntity($class)->getProperties() as $key=>$p) {
			$arr[$key] = self::toSqlValue($p, self::getProp($entity, $key));
		}
		return $arr;
	}

	static function toSqlValue ($conf, &$v) {
		if (is_null($v)) return NULL;

		switch ($conf[1]) {
			case 'date': return $v->format('Y-m-d');
			case 'datetime': return $v->format('Y-m-d H:i:s');

			case 'int': return (int) $v;

            case 'float': return (float) $v;

            // Strings
			default: return $v;
		}
	}

	static function toPhpValue ($conf, $v) {
		if (is_null($v)) return NULL;

		switch ($conf[1]) {
			case 'date':
			case 'datetime':
				if ($v instanceof DateTime) return $v;
				return new DateTime($v);
			
			case 'int': return (int) $v;

            case 'float': return (float) $v;

            // Strings
			default: return $v;
		}
	}
	
	static function processQuery ( $q ) {
		preg_match_all('/\{[a-zA-Z0-9_]+(( |\.)[a-zA-Z0-9_]+)*\}/', $q, $matches, PREG_SET_ORDER);
		
		// check if it's an update statement
		$update = (stripos(trim($q), 'UPDATE')===0);
		
		// get the table names
		$aliased = array();
		foreach ($matches as $key=>$m) {
			// clear braces
			$str = substr($m[0], 1, -1);

			// if it's an aliased class
			if (strpos($str, ' ')!==false) {
				$tmp = explode(' ', $str);
				$aliased[$tmp[1]] = $tmp[0];

				$q = str_replace($m[0], self::$conf[$tmp[0]]['table'].' '.$tmp[1], $q);

			// if it's a non-aliased class
			} elseif (strpos($str, '.')===false) {
			// if it's a non-aliased class
				$table = self::$conf[$str]['table'];
				$aliased[$table] = $str;
				$q = str_replace($m[0], $table, $q);
			}

		}

		// update references to the properties
		foreach ($matches as $key=>$m) {
			// clear braces
			$str = substr($m[0], 1, -1);

			// if it's a property
			if (strpos($str, '.')!==false) {
				list($en, $prop) = explode('.', $str);

				// if it's an alias
				if (isset($aliased[$en])) {
					$entity = $aliased[$en];

					// check for the existence of the field configuration
					if (!isset(self::$conf[$entity]['props'][$prop])) {
						throw new OutletException("Property [$prop] does not exist on configuration for entity [$entity]");
					}
					
					$col = $en.'.'.self::$conf[$entity]['props'][$prop][0];
				} else {
					$entity = $en;

					if (!isset(self::$conf[$entity])) throw new OutletException('String ['.$entity.'] is not a valid entity or alias, check your query');

					// if it's an update statement,
					// we must not include the table
					if ($update) {
						$col = self::$conf[$entity]['props'][$prop][0];
					} else {
						$table = self::$conf[$entity]['table'];
						
						// check for existence of the field configuration
						if (!isset(self::$conf[$entity]['props'][$prop])) {
							throw new OutletException("Property [$prop] does not exist on configuration for entity [$entity]");
						}
						
						$col = $table.'.'.self::$conf[$entity]['props'][$prop][0];
					}
				}

				$q = str_replace(
					$m[0], 
					$col,
					$q
				);
			} 

		}
		
		return $q;
	}

	/**
	 * Save object to the identity map
	 * 
	 * @param string $clazz
	 * @param array $pks Primary key values
	 * @param array $data
	 */
	static function set ( $clazz, array $pks, array $data ) {
		// store on the map using the write type for the key (int, string)
		$pks = self::getPkValuesForObject($data['obj']);
		
		// just in case
		reset($pks);
		
		// if there's only one pk, use it instead of the array
		if (is_array($pks) && count($pks)==1) $pks = current($pks);
		
		// initialize map for this class
		if (!isset(self::$map[$clazz])) self::$map[$clazz] = array();
		
		self::$map[$clazz][serialize($pks)] = $data;
	}

	static function clear ( $clazz, $pk ) {
		if (isset(self::$map[$clazz])) unset(self::$map[$clazz]);
	}

	static function clearCache () {
		self::$map = array();
	}
	
	/**
	 * @param string $clazz
	 * @param mixed $pk Primary key
	 * @return array array('obj'=>Entity, 'original'=>Original row used to populate entity)
	 */
	function get ( $clazz, array $pk ) {
		// if there's only one pk, use instead of the array
		if (is_array($pk) && count($pk)==1) $pk = array_shift($pk);
		
		if (isset(self::$map[$clazz]) && isset(self::$map[$clazz][serialize($pk)])) {
			return self::$map[$clazz][serialize($pk)];
		}
		return null;
	}
	
}

