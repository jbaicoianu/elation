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

	function getConnection () {
		if (!$this->con) {
			$conn = $this->conf['connection'];
			$this->con = new OutletPDO($conn['dsn'], @$conn['username'], @$conn['password']);	
			$this->con->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
			$this->con->setDialect( $conn['dialect'] );
		} 
		return $this->con;
	}

	function getEntities () {
		if (is_null($this->entities)) {
			$this->entities = array();
			foreach ($this->conf['classes'] as $key=>$cls) {
				$this->entities[$key] = new OutletEntityConfig($this, $key, $cls);
			}
		}
		return $this->entities;
	}

	function getEntity ($cls) {
		if (is_null($this->entities)) {
      $this->getEntities();
    }
		return $this->entities[$cls];
	}
}

class OutletEntityConfig {
	private $data;

	private $config;

	private $clazz;
	private $props;
	private $associations;

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
	}

	function getClass () {
		return $this->clazz;
	}

	function getTable () {
		return $this->table;
	}

	function getProperties () {
		return $this->props;
	}

	function getAssociations () {
		if (is_null($this->associations)) {
			$this->associations = array();
			$conf = $this->config->conf['classes'][$this->clazz];
			if (isset($conf['associations'])) {
				foreach ($conf['associations'] as $assoc) {
					$this->associations[] = new OutletAssociationConfig($this->config, $assoc[0], $this->getClass(), $assoc[1], $assoc[2]);
				}
			}
		}
		return $this->associations;
	}

	function getPkField () {
		foreach ($this->props as $prop=>$def) {
			if (@$def[2]['pk']) return $prop;
		}
	}
}

class OutletAssociationConfig {
	private $config;

	private $local;
	private $pk;
	private $foreign;
	private $type;
	private $key;

	function __construct (OutletConfig $config, $type, $local, $foreign, array $options) {
		// all associations require a key
		if (!isset($options['key'])) throw new OutletConfigException("Entity $local, association with $foreign: You must specify a key when defining a $type relationship");

		$this->config 	= $config;

		$this->local 	= $local;
		$this->foreign 	= $foreign;
		$this->type 	= $type;
		$this->options	= $options;
	}

	function getLocal () {
		return $this->local;
	}

	function getType () {
		return $this->type;
	}

	function getKey () {
		return $this->options['key'];
	}

	function getRefKey () {
		if (isset($this->options['refKey'])) {
			return $this->options['refKey'];
		} else {
			if ($this->type == 'one-to-many') {
				return $this->config->getEntity($this->local)->getPkField();
			} else {
				return $this->config->getEntity($this->foreign)->getPkField();
			}
		}
	}

	function isOptional () {
		return (isset($this->options['optional']) && $this->options['optional']);
	}

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
	
	function getSetter () {
		if ($this->type == 'many-to-one') {
			return "set".$this->getForeignName();
		} else {
			return "set".$this->getForeignPlural();
		}
	}

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

class OutletConfigException extends OutletException {}
