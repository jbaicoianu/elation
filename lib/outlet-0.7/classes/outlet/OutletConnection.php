<?php

class OutletConnection {
	private $driver;
	private $dialect;
	private $pdo;

	protected $nestedTransactionLevel = 0;

	function __construct (PDO $pdo, $driver, $dialect) {
		$this->pdo = $pdo;
		$this->driver = $driver;
		$this->dialect = $dialect;
	}	

	function getDialect () {
		return $this->dialect;
	}

	function getPDO () {
		return $this->pdo;
	}

	function beginTransaction () {
		if (!$this->nestedTransactionLevel++) {
			
			// since dblib driver doesn't support transactions
			if ($this->driver == 'dblib') {
				return $this->exec('BEGIN TRANSACTION');
			} else {
				return $this->pdo->beginTransaction();
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
				return $this->pdo->commit();
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
				return $this->pdo->rollBack();
			}
		}
		return true;
	}
	
	function quote ($v) {
		if ($this->driver == 'odbc') {
			if (is_null($v)) return 'NULL';
			
			return "'".str_replace("'", "''", $v)."'";
		} else {
			return $this->pdo->quote($v);
		}
	}

	function __call ($method, $args) {
		return call_user_func_array(array($this->pdo, $method), $args);
	}
}


