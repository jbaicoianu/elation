<?php

class OutletPDO extends PDO {
	private $driver;
	private $dialect;

	protected $nestedTransactionLevel = 0;

	function __construct ($dsn, $user=null, $pass=null) {
		// store the driver
		$this->driver = substr($dsn, 0, strpos($dsn, ':'));		

		parent::__construct($dsn, $user, $pass);
	}	

	function setDialect ($dialect) {
		$this->dialect = $dialect;
	}
	function getDialect () {
		return $this->dialect;
	}

	function beginTransaction () {
		if (!$this->nestedTransactionLevel++) {
			
			// since dblib driver doesn't support transactions
			if ($this->driver == 'dblib') {
				return $this->exec('BEGIN TRANSACTION');
			} else {
				return parent::beginTransaction();
			}
		}
		return true;
	}

	function commit () {
		if (!--$this->nestedTransactionLevel) {
			
			// since dblib driver doesn't support transactions
			if ($this->driver == 'dblib') {
				return $this->exec('COMMIT TRANSACTION');
			} else {
				return parent::commit();
			}
		}
		return true;
	}
	
	function rollBack () {
		if (!--$this->nestedTransactionLevel) {
			
			// since dblib driver doesn't support transactions
			if ($this->driver == 'dblib') {
				$this->exec('ROLLBACK TRANSACTION');
			} else {
				return parent::rollBack();
			}
		}
		return true;
	}
	
	function quote ($v) {
		if ($this->driver == 'odbc') {
			if (is_null($v)) return 'NULL';
			
			return "'".str_replace("'", "''", $v)."'";
		} else {
			return parent::quote($v);
		}
	}
}


