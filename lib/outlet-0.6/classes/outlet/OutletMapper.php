<?php

class OutletMapper {
	private $cls;
	private $original;
	private $obj;
	
	static $conf;
	static $map = array();
	
	/**
	 * @var bool
	 */
	private $new = true;

	function __construct (&$obj) {
		if (!is_object($obj)) throw new Exception('You must pass and object');
		if ($obj instanceof OutletMapper) throw new Exception('You passed and OutletMapper object');
		
		if ($obj instanceof OutletProxy) $this->new = false;
		
		$this->cls = self::getEntityClass($obj);

		// validate that mapping for this object exists
		if (!isset(self::$conf[$this->cls])) throw new OutletException('No mapping exists for entity ['.$this->cls.'] in configuration');

		$this->obj = &$obj;
		
		$this->original = $this->toArray();
	}
	
	static function getEntityClass ($obj) {
		if ($obj instanceof OutletProxy) {
			return substr(get_class($obj), 0, -(strlen('_OutletProxy')));
		} else {
			return get_class($obj);
		}
	}
	
	function getClass () {
		return $this->cls;
	}

	function save () {
		if ($this->new) {
			return $this->insert();
		} else {
			return $this->update();
		}
	}

	private function isNew() {
		return $this->new;
	}
	
	public function load () {
		// try to retrieve it from the cache first
		$data = self::get($this->cls, $this->getPk());

		// if it's there
		if ($data) {
			$this->obj = &$data['obj'];
			
		// else, populate it from the database
		} else {
			$props_conf = self::getFields($this->cls);
			$props = array_keys($props_conf);
			$pk_prop = self::getPkProp($this->cls);
	
			// craft select
			$q = "SELECT {".$this->cls.'.';
			$q .= implode('}, {'.$this->cls.'.', $props) . "}\n";
			$q .= "FROM {".$this->cls."} \n";
			$q .= "WHERE {".$this->cls.'.'.$pk_prop."} = ?";
			
			$q = self::processQuery($q);
	
			$stmt = Outlet::getInstance()->getConnection()->prepare($q);
			$stmt->execute(array($this->obj->$pk_prop));
	
			$row = $stmt->fetch(PDO::FETCH_ASSOC);
			
			// if there's matching row, 
			// return null
			if (!$row) throw new Exception("No matching row found for {$this->cls} with primary key of {$this->obj->$pk_prop}");
	
			foreach ($props_conf as $key=>$f) {
				$this->obj->$key = $row[$f[0]];
			}
			
			// add it to the cache
			self::set($this->cls, $this->getPk(), array(
				'obj' => $this->obj,
				'original' => $this->toArray()
			));	
		} 
	}
	
	public function setPk ($pk) {
		$pk_prop = self::getPkProp($this->cls);
		$this->obj->$pk_prop = $pk;
	}

	public function getPK() {
		$pk_prop = self::getPkProp($this->cls);
		return $this->obj->$pk_prop;
	}

	static function getPkProp ( $clazz ) {
		return Outlet::getInstance()->getConfig()->getEntity($clazz)->getPkField();
	}

	static function getTable ($clazz) {
		return self::$conf[$clazz]['table'];
	}
	
	static function getFields ($clazz) {
		return self::$conf[$clazz]['props'];
	}

	private function saveOneToMany () {
		$conf = Outlet::getInstance()->getConfig()->getEntity($this->cls);
		
		foreach ($conf->getAssociations() as $assoc) {
			if ($assoc->getType() != 'one-to-many') continue;

			$key 		= $assoc->getKey();
			$getter 	= $assoc->getGetter();
			$setter		= $assoc->getSetter();

			$children = $this->obj->$getter(null);
			foreach ($children as &$child) {
				$child->$key = $this->getPK();

				$mapped = new self($child);
				if ($mapped->isNew()) {
					$mapped->save();
				}
			}

			$this->obj->$setter( $children );
		}
	}


	private function saveManyToMany () {
		foreach ((array) @$this->conf['associations'] as $assoc) {
			$type = $assoc[0];
			$entity = $assoc[1];

			if ($type != 'many-to-many') continue;

			$key_column = $assoc[2]['key_column'];
			$ref_column = $assoc[2]['ref_column'];
			$table = $assoc[2]['table'];
			$name = $assoc[2]['name'];

			$getter = "get{$name}s";

			$children = $this->obj->$getter(null);
			foreach ($children as &$child) {
				$mapped = new self($child);
				if ($mapped->isNew()) {
					$mapped->save();
				}

				$q = "
					INSERT INTO $table ($key_column, $ref_column) 
					VALUES (?, ?)
				";	

				$stmt = $this->con->prepare($q);

				$stmt->execute(array($this->getPK(), $mapped->getPK()));	
			}

			$setter = "set{$name}s";
			$this->obj->$setter( $children );
		}
	}

	private function saveManyToOne () {
		$conf = Outlet::getInstance()->getConfig()->getEntity($this->cls);

		foreach ($conf->getAssociations() as $assoc) {
			if ($assoc->getType() != 'many-to-one') continue;

			$key 	= $assoc->getKey();
			$refKey	= $assoc->getRefKey();
			$getter = $assoc->getGetter();

			$ent = $this->obj->$getter();

			if ($ent) {
				// wrap with a mapper
				$mapped = new self($ent);

				if ($mapped->isNew()) $mapped->save();

				$this->obj->$key = $ent->$refKey;
			}
		}
	}

	private function saveOneToOne () {
		$conf = Outlet::getInstance()->getConfig()->getEntity($this->cls);

		foreach ($conf->getAssociations() as $assoc) {
			if ($assoc->getType() != 'one-to-one') continue;

			$key 	= $assoc->getKey();
			$refKey	= $assoc->getRefKey();
			$getter = $assoc->getGetter();

			$ent = $this->obj->$getter();

			if ($ent) {
				// wrap with a mapper
				$mapped = new self($ent);

				if ($mapped->isNew()) $mapped->save();

				$this->obj->$key = $ent->$refKey;
			}
		}
	}

	private function insert () {
		$outlet = Outlet::getInstance();
		
		$con = $outlet->getConnection();
		$config = $outlet->getConfig();

		$entity = $config->getEntity($this->cls);

		$this->saveOneToOne();
		$this->saveManyToOne();

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
				if (isset($f[2]['default'])) {
					$this->obj->$prop = $f[2]['default'];
					$insert_defaults[] = false;
				} elseif (isset($f[2]['defaultExpr'])) $insert_defaults[] = $f[2]['defaultExpr'];
				else $insert_defaults[] = false;
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

			$values[] = $this->obj->$p;
		}
	
		$stmt->execute($values);

		// create a proxy
		$proxy_class = "{$this->cls}_OutletProxy";
		$proxy = new $proxy_class;
		
		// copy the properties to the proxy
		foreach ($entity->getProperties() as $key=>$f) {
			$field = $key;
			if (@$f[2]['autoIncrement']) {
				$id = $outlet->getLastInsertId();
				$proxy->$field = $id;
			} else {
				$proxy->$field = $this->obj->$field;
			}
		}
	
		// copy the associated objects to the proxy
		foreach ($entity->getAssociations() as $a) {
			$type = $a->getType();
			if ($type == 'one-to-many' || $type == 'many-to-many') {
				$getter = $a->getGetter();
				$setter	= $a->getSetter();

				$ref = $this->obj->$getter();
				if ($ref) $proxy->$setter( $this->obj->$getter() );
			}
		}
		$this->obj = $proxy;

		$this->saveOneToMany();
	}

	public function update() {
		// this first since this references the key
		$this->saveManyToOne();
		
		$con = Outlet::getInstance()->getConnection();

		$q = "UPDATE {".$this->cls."} \n";
		$q .= "SET \n";

		$ups = array();
		foreach (self::$conf[$this->cls]['props'] as $key=>$f) {
			// skip primary key 
			if (@$f[2]['pk']) continue;

			$value = $con->quote( $this->obj->$key );
			$ups[] = "  {".$this->cls.'.'.$key."} = $value";
		}
		$q .= implode(", \n", $ups);

		$q .= "\nWHERE ";

		$clause = array();
		foreach (self::$conf[$this->cls]['props'] as $key=>$pk) {
			// if it's not a primary key, skip it
			if (!@$pk[2]['pk']) continue;

			$value = $con->quote( $this->obj->$key );
			$clause[] = "$pk[0] = $value";
		}
		$q .= implode(' AND ', $clause);
		
		$q = self::processQuery($q);

		$con->exec($q);

		// these last since they reference the key
		$this->saveOneToMany();
		$this->saveManyToMany();
	}

	function toArray () {
		$arr = array();
		foreach (self::$conf[$this->cls]['props'] as $prop=>$settings) {
			$arr[$prop] = $this->obj->$prop;
		}
		return $arr;
	}
	
	static function processQuery ( $q ) {
		preg_match_all('/\{[a-zA-Z0-9_]+(( |\.)[a-zA-Z0-9_]+)*\}/', $q, $matches, PREG_SET_ORDER);
		
		// check if it's an update statement
		$update = (stripos(trim($q), 'UPDATE')===0);

		// get the aliased classes
		$aliased = array();
		foreach ($matches as $key=>$m) {
			// clear braces
			$str = substr($m[0], 1, -1);

			// if it's an aliased class
			if (strpos($str, ' ')!==false) {
				$tmp = explode(' ', $str);
				$aliased[$tmp[1]] = $tmp[0];

				$q = str_replace($m[0], self::$conf[$tmp[0]]['table'].' '.$tmp[1], $q);

			// if it's a property
			} elseif (strpos($str, '.')!==false) {
				$tmp = explode('.', $str);

				// if it's an alias
				if (isset($aliased[$tmp[0]])) {
					$aliased_table = $aliased[$tmp[0]];
					
					// check for the existence of the field configuration
					if (!isset(self::$conf[$aliased_table]['props'][$tmp[1]])) {
						throw new Exception("Property [$tmp[1]] does not exist on configuration for entity [$aliased_table]");
					}
					
					$col = $tmp[0].'.'.self::$conf[$aliased_table]['props'][$tmp[1]][0];
				} else {
					// if it's an update statement,
					// we must not include the table
					if ($update) {
						$col = self::$conf[$tmp[0]]['props'][$tmp[1]][0];
					} else {
						$table = self::$conf[$tmp[0]]['table'];
						$col = $table.'.'.self::$conf[$tmp[0]]['props'][$tmp[1]][0];
					}
				}

				$q = str_replace(
					$m[0], 
					$col,
					$q
				);
				


			// if it's a non-aliased class
			} else {
				$table = self::$conf[$str]['table'];
				$aliased[$table] = $str;
				$q = str_replace($m[0], $table, $q);
			}

		}
		
		return $q;
	}
	
	function &getObj () {
		return $this->obj;
	}

	static function set ( $clazz, $pk, array $data ) {
		// initialize map for this class
		if (!isset(self::$map[$clazz])) self::$map[$clazz] = array();
		
		self::$map[$clazz][$pk] = $data;
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
	 * @return OutletMapper
	 */
	function get ( $clazz, $pk ) {
		if (isset(self::$map[$clazz]) && isset(self::$map[$clazz][$pk])) {
			return self::$map[$clazz][$pk];
		}
		return null;
	}
	
}

