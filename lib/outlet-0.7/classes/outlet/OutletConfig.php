<?php

class OutletConfig {
	public $conf;

	private $con;

	private $entities;

	function __construct (array $conf) {
		// validate config
		if (!isset($conf['connection'])) throw new OutletConfigException('Element [connection] not found in configuration');
		if (!isset($conf['connection']['dsn'])) throw new OutletConfigException('Element [connection][dsn] not found in configuration');
		if (!isset($conf['connection']['dialect'])) throw new OutletConfigException('Element [connection][dialect] not found in configuration');
		if (!isset($conf['classes'])) throw new OutletConfigException('Element [classes] missing in configuration');

		$this->conf = $conf;
	}	

	/**
	 * @return OutletConnection
	 */
	function getConnection () {
		if (!$this->con) {
			$conn = $this->conf['connection'];

			$dsn = $conn['dsn'];
			$driver = substr($dsn, 0, strpos($dsn, ':'));

			$pdo = new PDO($conn['dsn'], @$conn['username'], @$conn['password']);
			$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

			$this->con = new OutletConnection($pdo, $driver, $conn['dialect']);
		} 
		return $this->con;
	}

	/**
	 * @return array
	 */
	function getEntities () {
		if (is_null($this->entities)) {
			$this->entities = array();
			foreach ($this->conf['classes'] as $key=>$cls) {
				$this->entities[$key] = new OutletEntityConfig($this, $key, $cls);
			}
		}
		return $this->entities;
	}

	/**
	 * @param string $cls
	 * @return OutletEntityConfig
	 */
	function getEntity ($cls) {
		if (is_null($this->entities)) $this->getEntities();

		if (!isset($this->entities[$cls])) throw new OutletException('Entity ['.$cls.'] has not been defined in the configuration');

		return $this->entities[$cls];
	}
	
	function useGettersAndSetters () {
		return isset($this->conf['useGettersAndSetters']) ? $this->conf['useGettersAndSetters'] : false;
	}

  function addEntities($entities) {
    foreach ($entities as $key=>$cls) {
      $this->conf['classes'][$key] = $cls;
      $this->entities[$key] = new OutletEntityConfig($this, $key, $cls);
    }
    OutletMapper::$conf = &$this->conf['classes'];
    return $this->entities;
  }
}

class OutletEntityConfig {
	private $data;

	private $config;

	private $clazz;
	private $props;
	private $associations;
	
	private $sequenceName = '';
	
	private $useGettersAndSetters;

	function __construct (OutletConfig $config, $entity, array $conf) {
		$this->config = $config;

		if (!isset($conf['table'])) throw new OutletConfigException('Mapping for entity ['.$entity.'] is missing element [table]');
		if (!isset($conf['props'])) throw new OutletConfigException('Mapping for entity ['.$entity.'] is missing element [props]');

		// i need to leave this for for the outletgen script
		//if (!class_exists($entity)) throw new OutletConfigException('Class does not exist for mapped entity ['.$entity.']');

		// validate that there's a pk
		foreach ($conf['props'] as $p=>$f) {
			if (@$f[2]['pk']) {
				$pk = $p;
				break;
			}
		}
		if (!isset($pk)) throw new OutletConfigException("Entity [$entity] must have at least one column defined as a primary key in the configuration");

		// save basic data
		$this->table = $conf['table'];
		$this->clazz = $entity;
		$this->props = $conf['props'];
		$this->sequenceName = isset($conf['sequenceName']) ? $conf['sequenceName'] : '';
		
		$this->useGettersAndSetters = isset($conf['useGettersAndSetters']) ? $conf['useGettersAndSetters'] : $config->useGettersAndSetters();
		
		// Adjusts sequence name for postgres if it is not specified
		if (($config->getConnection()->getDialect() == 'pgsql') && ($this->sequenceName == ''))
		{
			foreach ($this->props as $key=>$d) {
				// Property needs to be primary key and auto increment
				if ((isset($d[2]['pk']) && $d[2]['pk']) && (isset($d[2]['autoIncrement']) && $d[2]['autoIncrement'])){
					// default name for sequence = {table}_{column}_seq
					$this->sequenceName = $this->table.'_'.$d[0].'_seq';
					break;					
				}
			}
		}
	}

	function getClass () {
		return $this->clazz;
	}

	function getTable () {
		return $this->table;
	}

	/**
	 * @return array
	 */
	function getProperties () {
		return $this->props;
	}
	
	/**
	 * @return array Primary key columns for this entity
	 */
	function getPkColumns () {
		// get the pk column in order to check the map
		$pk = array();
		foreach ($this->props as $key=>$d) {
			if (isset($d[2]['pk']) && $d[2]['pk']) $pk[] = $d[0]; 
		}
		return $pk;
	}

	/**
	 * @return array OutletAssociationConfig collection
	 */
	function getAssociations () {
		if (is_null($this->associations)) {
			$this->associations = array();
			$conf = $this->config->conf['classes'][$this->clazz];
			if (isset($conf['associations'])) {
				foreach ($conf['associations'] as $assoc) {
					switch ($assoc[0]) {
						case 'one-to-many': 
							$a = new OutletOneToManyConfig($this->config, $this->getClass(), $assoc[1], $assoc[2]);
							break;
						case 'many-to-one':
							$a = new OutletManyToOneConfig($this->config, $this->getClass(), $assoc[1], $assoc[2]);
							break;
						case 'many-to-many':
							$a = new OutletManyToManyConfig($this->config, $this->getClass(), $assoc[1], $assoc[2]);
							break;
						case 'one-to-one':
							$a = new OutletOneToOneConfig($this->config, $this->getClass(), $assoc[1], $assoc[2]);
							break;
						default:
							$a = new OutletAssociationConfig($this->config, $assoc[0], $this->getClass(), $assoc[1], $assoc[2]);
					}
					$this->associations[] = $a;
				}
			}
		}
		return $this->associations;
	}
	
	/**
	 * @param string $name
	 * @return OutletAssociationConfig
	 */
	function getAssociation ($name) {
		foreach ($this->getAssociations() as $assoc) {
			//$assoc = new OutletAssociationConfig();
			if ($assoc->getForeignName() == $name) return $assoc;
		}
	}

	function getPkFields () {
		$fields = array();
		foreach ($this->props as $prop=>$def) {
			if (@$def[2]['pk']) $fields[] = $prop;
		}
		return $fields;
	}
	
	function getSequenceName(){
		return $this->sequenceName;
	}
	
	function useGettersAndSetters () {
		return $this->useGettersAndSetters;
	}
}

abstract class OutletAssociationConfig {
	protected $config;

	protected $local;
	protected $pk;
	protected $foreign;
	protected $type;
	protected $key;
    protected $localUseGettersAndSetters;
    protected $foreignUseGettersAndSetters;

	/**
	 * @param OutletConfig $config
	 * @param string $type Type of association: one-to-many, many-to-one, etc
	 * @param string $local Name of the entity where the association is defined
	 * @param string $foreign Name of the entity that is referenced by the association
	 * @param array $options
	 */
	function __construct (OutletConfig $config, $local, $foreign, array $options) {
		$this->config 	= $config;

        $this->local 	= $local;
		$this->foreign 	= $foreign;
		$this->options	= $options;
        $this->localUseGettersAndSetters = $this->config->getEntity($local)->useGettersAndSetters();
        $this->foreignUseGettersAndSetters = $this->config->getEntity($foreign)->useGettersAndSetters();
	}

    function getForeignUseGettersAndSetters(){
        return $this->foreignUseGettersAndSetters;
    }

    function getLocalUseGettersAndSetters(){
        return $this->localUseGettersAndSetters;
    }

	function getLocal () {
		return $this->local;
	}

	function getType () {
		return $this->type;
	}

	function isOptional () {
		return (isset($this->options['optional']) && $this->options['optional']);
	}

	/**
	 * @return string Foreign entity name
	 */
	function getForeign () {
		return $this->foreign;
	}

	function getGetter () {
		switch ($this->type) {
			case 'many-to-one':
			case 'one-to-one':
				return "get".$this->getForeignName();
			default:
				return "get".$this->getForeignPlural();
		}
	}
	
	/**
	 * @return string
	 */
	function getSetter () {
		switch ($this->type) {
			case 'many-to-one':
			case 'one-to-one':
				return "set".$this->getForeignName();
			default: 
				return "set".$this->getForeignPlural();
		}
	}

	/**
	 * @return string Name of the association
	 */
	function getForeignName () {
		if (isset($this->options['name'])) {
			$name = $this->options['name'];
		} else {
			$name = $this->foreign;
		}
		return $name;
	}

	function getForeignPlural () {
		// if this association has a name
		if (isset($this->options['name'])) {
			// if this association has a plural, use that
			// else use the name plus an 's' 
			if (isset($this->options['plural'])) $plural = $this->options['plural'];
			else $plural = $this->options['name'].'s';
		// else check the entity definition
		} else {
			if (!isset($this->config->conf['classes'][$this->foreign])) 
				throw new OutletConfigException("Entity [{$this->foreign}] not found in configuration");	
			
			$foreign_def = $this->config->conf['classes'][$this->foreign];
			// if there's a plural defined at the foreign entity
			// else use the entity plus an 's'
			if (isset($foreign_def['plural'])) $plural = $foreign_def['plural'];
			else $plural = $this->foreign.'s';
		}
		return $plural;
	}
}

class OutletOneToManyConfig extends OutletAssociationConfig {
	protected $type = 'one-to-many';
	
	public function __construct (OutletConfig $config, $local, $foreign, array $options) {
		// one-to-many requires a key
		if (!isset($options['key'])) throw new OutletConfigException("Entity $local, association with $foreign: You must specify a 'key' when defining a one-to-many relationship");

		parent::__construct($config, $local, $foreign, $options);
	}
	
	public function getKey() {
		return $this->options['key'];
	}
	
	function getRefKey () {
		if (isset($this->options['refKey'])) {
			return $this->options['refKey'];
		} else {
			return current($this->config->getEntity($this->local)->getPkFields());
		}
	}
}

class OutletManyToOneConfig extends OutletAssociationConfig {
	protected $type = 'many-to-one';
	
	public function __construct (OutletConfig $config, $local, $foreign, array $options) {
		// many-to-one requires a key
		if (!isset($options['key'])) throw new OutletConfigException("Entity $local, association with $foreign: You must specify a 'key' when defining a many-to-one relationship");
		
		parent::__construct($config, $local, $foreign, $options);
	}
	
	public function getKey() {
		return $this->options['key'];
	}
	
	function getRefKey () {
		if (isset($this->options['refKey'])) {
			return $this->options['refKey'];
		} else {
			return current($this->config->getEntity($this->foreign)->getPkFields());
		}
	}
}

class OutletOneToOneConfig extends OutletAssociationConfig {
	protected $type = 'one-to-one'; 
	
	public function __construct (OutletConfig $config, $local, $foreign, array $options) {
		if (!isset($options['key'])) throw new OutletConfigException("Entity $local, association with $foreign: You must specify a 'key' when defining a one-to-one relationship");
	
		parent::__construct($config, $local, $foreign, $options);
	}
	
	public function getKey () {
		return $this->options['key'];
	}
	
	function getRefKey () {
		if (isset($this->options['refKey'])) {
			return $this->options['refKey'];
		} else {
			return current($this->config->getEntity($this->local)->getPkFields());
		}
	}
}

class OutletManyToManyConfig extends OutletAssociationConfig {
	protected $type = 'many-to-many';
	protected $table;
	protected $tableKeyLocal;
	protected $tableKeyForeign;
	
	public function __construct (OutletConfig $config, $local, $foreign, array $options) {
		if (!isset($options['table'])) throw new OutletConfigException("Entity $local, association with $foreign: You must specify a table when defining a many-to-many relationship");
		
		$this->table 			= $options['table'];
		$this->tableKeyLocal 	= $options['tableKeyLocal'];
		$this->tableKeyForeign 	= $options['tableKeyForeign'];
		
		parent::__construct($config, $local, $foreign, $options);
	}
	
	public function getTableKeyLocal () {
		return $this->tableKeyLocal;
	}
	
	public function getTableKeyForeign () {
		return $this->tableKeyForeign;
	}
	
	public function getLinkingTable () {
		return $this->table;
	}
	
	function getKey () {
		if (isset($this->options['key'])) {
			return $this->options['key'];
		} else {
			return current($this->config->getEntity($this->foreign)->getPkFields());
		}
	}

	function getRefKey () {
		if (isset($this->options['refKey'])) {
			return $this->options['refKey'];
		} else {
			return current($this->config->getEntity($this->local)->getPkFields());
		}
	}
}

class OutletConfigException extends OutletException {}
