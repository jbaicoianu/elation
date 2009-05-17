<?php
require 'OutletConnection.php';
require 'OutletMapper.php';
require 'OutletProxy.php';
require 'OutletConfig.php';
require 'Collection.php';
require 'OutletCollection.php';

class Outlet {
	static $instance;
	
	private $config;
	
	/**
	 * @var OutletPDO
	 */
	private $con;
	
	static function init ( array $conf ) {
		// instantiate
		self::$instance = new self( $conf );
	}

	/**
	 * @return Outlet instance
	 */
	static function getInstance () {
		if (!self::$instance) throw new OutletException('You must first initialize Outlet by calling Outlet::init( $conf )');
		return self::$instance;
	}

	private function __construct (array $conf) {
		$this->config = new OutletConfig( $conf );
		
		$this->con = $this->config->getConnection();

		OutletMapper::$conf = &$conf['classes'];
	}

	/**
	 * Persist the passed entity to the database by executing an INSERT or an UPDATE
	 *
	 * @param object $obj
	 * @return object OutletProxy object representing the Entity
	 */
	public function save (&$obj) {
		$con = $this->getConnection();

		$con->beginTransaction();

		$return = OutletMapper::save( $obj );
	
		$con->commit();

		return $return;
	}

	public function delete ($clazz, $id) {
		if (!is_array($id)) $id = array($id);
		
		$pks = $this->config->getEntity($clazz)->getPkFields();
		
		$pk_q = array();
		foreach ($pks as $pk) {
			$pk_q[] = '{'.$clazz.'.'.$pk.'} = ?';
		}
		
		$q = "DELETE FROM {"."$clazz} WHERE " . implode(' AND ', $pk_q);

		$q = OutletMapper::processQuery($q);
		
		$stmt = $this->getConnection()->prepare($q);

		$res = $stmt->execute($id);

		// remove from identity map
		OutletMapper::clear($clazz, $id);

		return $res;
	}

	public function quote ($val) {
		return $this->getConnection()->quote($val);
	}

	/**
	 * Select entities from the database. 
	 * 
	 * @param string $clazz Name of the class as mapped on the configuration
	 * @param string $query Optional query to execute as a prepared statement
	 * @param string $params Optional parameters to bind to the query
	 * @return array Collection returned by the query
	 */
	public function select ( $clazz, $query='', $params=array()) {
		// select plus criteria
		$q = "SELECT {"."$clazz}.* FROM {".$clazz."} " . $query;

		$proxyclass = "{$clazz}_OutletProxy";
		$collection = array();
		
		$stmt = $this->query($q, $params);
		
		// get the pk column in order to check the map
		$pk = $this->getConfig()->getEntity($clazz)->getPkColumns();
			
		while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
			$collection[] = $this->getEntityForRow($clazz, $row);
		}

		return $collection;
	}

	public function createProxies () {
		require_once 'OutletProxyGenerator.php';
		$gen = new OutletProxyGenerator($this->config);
		$c = $gen->generate();
		eval($c);
	} 
  public function createClasses () {
    require_once 'OutletClassGenerator.php';
    $gen = new OutletClassGenerator($this->config);
    $c = $gen->generate();
    eval($c);
  }


	public function load ($clazz, $pk) {
		return OutletMapper::load($clazz, $pk);
	}

	/**
	 * @return OutletConnection
	 */
	function getConnection () {
		return $this->config->getConnection();
	}

	/**
	 * @return OutletConfig
	 */
	function getConfig () {
		return $this->config;
	}
	
	/**
	 * Returns last generated ID
	 * 
	 * If using PostgreSQL the $sequenceName needs to be specified
	 */
	function getLastInsertId ($sequenceName = '') {
		if ($this->getConnection()->getDialect() == 'mssql') {
			return $this->con->query('SELECT SCOPE_IDENTITY()')->fetchColumn(0);
		} else{
			return $this->con->lastInsertId($sequenceName);
		}
	}


	public function populateObject($clazz, $obj, array $values) {
		OutletMapper::castRow($clazz, $values);
		
		$entity = $this->config->getEntity($clazz);
		$fields = $entity->getProperties();
		foreach ($fields as $key=>$f) {
			if (!array_key_exists($f[0], $values)) throw new OutletException("Field [$f[0]] defined in the config is not defined in table [".$entity->getTable()."]");

			$obj->$key = $values[$f[0]];
		}

		return $obj;
	}
	
	/**
	 * Return the entity for a database row
	 * This method checks the identity map
	 *
	 * @param string $clazz
	 * @param array $row
	 */
	public function getEntityForRow ($clazz, array $row) {
		OutletMapper::castRow($clazz, $row);
		
		// get the pk column in order to check the map
		$pks = $this->getConfig()->getEntity($clazz)->getPkColumns();
		
		$values = array();
		foreach ($pks as $pk) {
			$values[] = $row[$pk];
		}

		$data = OutletMapper::get($clazz, $values);
		
		$proxyclass = "{$clazz}_OutletProxy";
		
		if ($data) {
			return $data['obj'];
		} else {
			$obj = self::populateObject($clazz, new $proxyclass, $row);
			
			// add it to the cache
			OutletMapper::set($clazz, $values, array(
				'obj' => $obj,
				'original' => OutletMapper::toArray($obj)
			));	
			
			return $obj;
		}
	}

	public function selectOne ($clazz, $query='', $params=array()) {
		$res = $this->select($clazz, $query, $params);
		if (count($res)) {
			return $res[0];
		} else {
			return null;
		}
	}
	
	private function getTable($clazz) {
		return $this->conf['classes'][$clazz]['table'];
	}
		
	private function getFields ($clazz) {
		return $this->conf['classes'][$clazz]['props'];
	}
	
	private function getPkFields( $clazz ) {
		$fields = $this->conf['classes'][$clazz]['props'];
		
		$pks = array();
		foreach ($fields as $key => $f) {
			if (isset($f[2]) && isset($f[2]['pk']) && $f[2]['pk']) $pks[$key] = $f;
		}
		
		return $pks;
	}

	private function removeAutoIncrement ( $fields ) {
		$newArr = array();
		foreach ($fields as $key=>$f) {
			if (isset($f[2]) && isset($f[2]['autoIncrement']) && $f[2]['autoIncrement']) continue;
			$newArr[$key] = $f;	
		}
		return $newArr;
	}

	public function clearCache () {
		OutletMapper::clearCache();
	}
	
	/**
	 * @param string $query
	 * @param array $params
	 * @return PDOStatement
	 */
	public function query ( $query='', array $params=array()) {
		// process the query
		$q = OutletMapper::processQuery($query);

		$stmt = $this->con->prepare($q);
		$stmt->execute($params);

		return $stmt;
	}
	
	/**
	 * @param string $from
	 * @return OutletQuery
	 */
	public function from ($from) {
		require_once 'OutletQuery.php';
		$q = new OutletQuery;
		$q->from($from);
		
		return $q;
	}
}

class OutletException extends Exception {}

