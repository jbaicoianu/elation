<?php

class OutletQuery {
	private $from;
	private $with = array();
	private $joins = array();
	private $query;
	private $params = array();
	private $orderby;
	private $limit;
    private $offset;
	
	/**
	 * @param string $from
	 * @return OutletQuery
	 */
	function from ($from) {
		$this->from = $from;
		
		return $this;
	}
	
	/**
	 * @param string $q
	 * @param array $params
	 * @return OutletQuery
	 */
	function where ($q, array $params=array()) {
		$this->query = $q;
		$this->params = $params;
		
		return $this;
	}
	
	function innerJoin ($join) {
		$this->joins[] = 'INNER JOIN ' . $join . "\n";
		
		return $this;
	}

	function leftJoin ($join) {
		$this->joins[] = 'LEFT JOIN ' . $join . "\n";

		return $this;
	}
	
	/**
	 * @return OutletQuery
	 */
	function with () {
		$this->with = func_get_args();
		
		return $this;
	}
	
	/**
	 * @param string $v Order clause 
	 * @return OutletQuery
	 */
	function orderBy ($v) {
		$this->orderby = $v;
		
		return $this;
	}
	
	/**
	 * @param $num
	 * @return OutletQuery
	 */
	function limit ($num) {
		$this->limit = $num;
		
		return $this;
	}
    
    /**
     * @param $num
     * @return OutletQuery
     */
    function offset ($num) {
        $this->offset = $num;
        
        return $this;
    }
	
	/**
	 * @return array
	 */
	function find () {
		$outlet = Outlet::getInstance();
		
		// get the 'from'
		$tmp = explode(' ', $this->from);

		$from = $tmp[0];
		$from_aliased = (count($tmp)>1 ? $tmp[1] : $tmp[0]);

		$config = Outlet::getInstance()->getConfig();
		$entity_config = $config->getEntity($from);
		$props = $entity_config->getProperties();
		
		$from_props = $props;
		
		$select_cols = array();
		foreach ($props as $key=>$p) {
			$select_cols[] = "\n{".$from_aliased.'.'.$key.'} as '.$from_aliased.'_'.$key;
		}
		
		// get the include entities
		$with = array();
		$with_aliased = array();
		
		$join_q = '';
		foreach ($this->with as $with_key=>$j) {
			$tmp = explode(' ', $j);
			
			$with[$with_key] = $tmp[0];
			$with_aliased[$with_key] = (count($tmp)>1 ? $tmp[1] : $tmp[0]);
			
			$assoc = $entity_config->getAssociation($with[$with_key]);

			if (!$assoc) throw new OutletException('No association found with entity or alias ['.$with[$with_key].']');
			
			$props = $config->getEntity($assoc->getForeign())->getProperties();
			foreach ($props as $key=>$p) {
				$select_cols[] = "\n{".$with_aliased[$with_key].'.'.$key.'} as '.$with_aliased[$with_key].'_'.$key;
			}
		
			$aliased_join = $with_aliased[$with_key];
			$join_q .= "LEFT JOIN {".$assoc->getForeign()." ".$aliased_join."} ON {".$from_aliased.'.'.$assoc->getKey()."} = {".$with_aliased[$with_key].'.'.$assoc->getRefKey()."} \n";
		}
		
		$q = "SELECT ".implode(', ', $select_cols)." \n";
		$q .= " FROM {".$this->from."} \n";
		$q .= $join_q;
		
		$q .= implode("\n", $this->joins);
		
		if ($this->query) 		$q .= 'WHERE ' . $this->query."\n";
		if ($this->orderby) 	$q .= 'ORDER BY ' . $this->orderby . "\n";
        // TODO: Make it work on MS SQL
        //       In SQL Server 2005 http://www.singingeels.com/Articles/Pagination_In_SQL_Server_2005.aspx
		if ($this->limit){
            $q .= 'LIMIT '.$this->limit;
            if ($this->offset)
                $q .= ' OFFSET '.$this->offset;
        }                                                            
	
		$stmt = $outlet->query($q, $this->params);
		
		$res = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {         
			$data = array();
			// Postgres returns columns as lowercase
			// TODO: Maybe everything should be converted to lower in query creation / processing to avoid this
			if ($outlet->getConnection()->getDialect() == 'pgsql')
        		foreach ($from_props as $key=>$p) {
					$data[$p[0]] = $row[strtolower($from_aliased).'_'.strtolower($key)];
				}
			else
				foreach ($from_props as $key=>$p) {
					$data[$p[0]] = $row[$from_aliased.'_'.$key];
				}

			$obj = $outlet->getEntityForRow($from, $data);
		
			foreach ($with as $with_key=>$w) {
				$a = $entity_config->getAssociation($w);
				
				if ($a) {
					$data = array();					
					$setter = $a->getSetter();
					$foreign = $a->getForeign();
                    $with_entity = $config->getEntity($foreign);
                    
                    if ($a instanceof OutletOneToManyConfig)
                    {
                        // TODO: Implement...                                             
                    }
                    elseif ($a instanceof OutletManyToManyConfig)
                    {
                        // TODO: Implement...
                    }
                    // Many-to-one or one-to-one
                    else
                    {   
                        foreach ($with_entity->getProperties() as $key=>$p) {
                            $data[$p[0]] = $row[$with_aliased[$with_key].'_'.$key];
                        }

                        $obj->$setter($outlet->getEntityForRow($foreign, $data));
                    }
				}
			}
			
			$res[] = $obj;
		}
		
		return $res;
	}
	
	public function findOne () {
		$res = $this->find();
		
		if (count($res)) return $res[0];
	}
}
