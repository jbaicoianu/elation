<?php
include_once("include/datawrappers/connectionwrapper_class.php");
if (dir_exists_in_path('thrift/')) {
  require_once 'thrift/Thrift.php';
  require_once 'thrift/transport/TTransport.php';
  require_once 'thrift/transport/TSocket.php';
  require_once 'thrift/protocol/TBinaryProtocol.php';
  require_once 'thrift/transport/TFramedTransport.php';
  require_once 'thrift/transport/TBufferedTransport.php';

  require_once 'thrift/packages/cassandra/Cassandra.php';
  require_once 'thrift/packages/cassandra/cassandra_types.php';
  require_once 'thrift/packages/cassandra/cassandra_constants.php';

  /**
   * class CassandraWrapper
   * Connection wrapper for Cassandra.  Based on CassandraDB by Mike Peters:
   * http://www.softwareprojects.com/resources/programming/t-cassandra-php-wrapper-07-1979.html
   * which bears a striking resemblance to PHPCassa - https://github.com/thobbs/phpcassa/
   * @package Framework
   * @subpackage Datasources
   */
  class CassandraWrapper extends ConnectionWrapper {
    public $version = 0;

    function CassandraWrapper($name, $cfg, $lazy=false) {
      global $cassandra_E_ConsistencyLevel;
      $this->cfg = $cfg;
      $this->keyspace = $this->cfg["keyspace"];
      $this->consistency = any((is_numeric($this->cfg["consistency"]) ? $this->cfg["consistency"] : $cassandra_E_ConsistencyLevel[$this->cfg["consistency"]]), cassandra_ConsistencyLevel::ONE);
      $this->version = $this->cfg["version"];
    }
    function Open() {
      try {
        $this->socket = new TSocket($this->cfg["host"], $this->cfg["port"]);
        //$this->transport = new TBufferedTransport($this->socket, 1024, 1024);
        $this->transport = new TFramedTransport($this->socket);
        $this->protocol = new TBinaryProtocol($this->transport);
        $this->client = new CassandraClient($this->protocol);
        $this->transport->open();
        //$this->client->set_keyspace($this->keyspace);
      } catch (TException $e) {
        $this->Debug($e->why . " " . $e->getMessage());
        return false;
      }
      return true;
    }

    function Close() {
      if (!empty($this->transport))
        $this->transport->close();
      if (!empty($this->socket))
        $this->socket->close();
      unset($this->socket);
      unset($this->protocol);
      unset($this->client);
      unset($this->transport);
      return true;
    }
    
    function QueryFetch($queryid, $table, $where=array(), $extras=NULL) {
      if ($this->Open()) {
        try {
          $keyspace = $this->keyspace;
          if (strpos($table, ".") !== false)
            list($keyspace, $table) = explode(".", $table, 2);

          // If we failed init, bail
          if ($this->flag_failed_init) 
            return null;
      
          $consistency = any($extras["consistency"], $this->consistency, cassandra_ConsistencyLevel::ONE);
          $key = $queryid->hash;
          Logger::Warn("Cassandra fetch: $keyspace.$table#" . $queryid->hash . " (consistency $consistency)");

          // Prepare query
          $column_parent = new cassandra_ColumnParent();
          $column_parent->column_family = $table;

          $slice_range = new cassandra_SliceRange();
          $slice_range->start = any($extras["start"], "");
          $slice_range->finish = any($extras["finish"], "");
          if (!empty($extras["limit"]))
            $slice_range->count = $extras["limit"];
          if (!empty($extras["reverse"])) 
            $slice_range->reversed = true;
          $predicate = new cassandra_SlicePredicate();
          $predicate->slice_range = $slice_range;
     
          $this->setKeyspace($keyspace);
          if (is_array($key)) {
            $arr_result = array();
            if ($this->version <= 0.6) {
              $resp = $this->client->multiget_slice($keyspace, $key, $column_parent, $predicate, $consistency);
            } else {
              $resp = $this->client->multiget_slice($key, $column_parent, $predicate, $consistency);
            }

            if (!empty($resp)) {
              foreach ($resp as $key => $data) {
                $arr_result[$key] = $this->supercolumns_or_columns_to_array($data);
              }
            }
            return $arr_result;
          } else {
            if ($this->version <= 0.6) {
              $resp = $this->supercolumns_or_columns_to_array($this->client->get_slice($keyspace, $key, $column_parent, $predicate, $consistency));
            } else {
              $resp = $this->supercolumns_or_columns_to_array($this->client->get_slice($key, $column_parent, $predicate, $consistency));
            }
            if (!empty($extras["orderby"])) {
              return $this->SortResults($resp, $extras["orderby"], $extras["reverse"]);
            } else {
              return $resp;
            }
            //return $this->supercolumns_or_columns_to_array($resp);
          }
        } catch (TException $tx) {
          $this->Debug($tx->why." ".$tx->getMessage());
          return null;
        }
      }
    }
    /**
     * Execute an insert query (1 record)
     *
     * @param string $table
     * @param array $values
     * @return int
     */
    function QueryInsert($queryid, $table, $values, $extra=NULL) {
      $consistency = any($extras["consistency"], $this->consistency, cassandra_ConsistencyLevel::ONE);
      Logger::Warn("Cassandra insert: $table#" . $queryid->hash . " (consistency $consistency)");
      if ($this->Open()) {
        $keyspace = $this->keyspace;
        if (strpos($table, ".") !== false)
          list($keyspace, $table) = explode(".", $table, 2);
        try {
          $timestamp = $this->getTimestamp();
          $mutations = array($queryid->hash => array($table => $this->array_to_supercolumns_or_columns($values, $timestamp)));
          //print_pre($mutations);
          //Logger::Error(print_r($mutations, true));
          $this->setKeyspace($keyspace); 
          if ($this->version <= 0.6) {
            $this->client->batch_mutate($keyspace, $mutations, $consistency);
          } else {
            $this->client->batch_mutate($mutations, $consistency);
          }
        } catch (TException $e) {
          $this->Debug($e->why . " " . $e->getMessage());
          return false;
        }
        return true;
      }
    }
    /**
     * Execute an update query
     *
     * @param string $table
     * @param array $values
     * @param string $where_condition
     * @param array $bind_vars
     * @return int
     */
    function &QueryUpdate($queryid, $table, $values, $where_condition, $bind_vars=array()) {
      // Cassandra treats inserts and updates the same, but we should probably do something with $where_condition if provided
      return $this->QueryInsert($queryid, $table, $values);
    }
    /**
     * Execute a delete query
     *
     * @param string $queryid
     * @param string $table
     * @param string $where_condition
     * @param array $bind_vars
     * @return int
     */
    function &QueryDelete($queryid, $table, $where, $extras=array()) {
      $consistency = any($extras["consistency"], $this->consistency, cassandra_ConsistencyLevel::ONE);
      if ($this->Open()) {
        $keyspace = $this->keyspace;
        if (strpos($table, ".") !== false)
          list($keyspace, $table) = explode(".", $table, 2);
        Logger::Warn("Cassandra delete: $table#" . $queryid->hash . " (consistency $consistency)");
        try {
          $timestamp = $this->getTimestamp();
          $deletion = new cassandra_Deletion(array("timestamp" => $timestamp));
          if (is_array($where)) {
            $deletion->predicate = new cassandra_SlicePredicate(array("column_names" => $this->GenerateIndex($extras["indexby"], $where)));
          } else {
            $super_column = new cassandra_SuperColumn();
            $super_column->name = $this->unparse_column_name($where, true);
            $deletion->supercolumn = $super_column;
          }

          $mutations = array($queryid->hash => array($table => array(new cassandra_Mutation(array("deletion" => $deletion)))));
          //print_pre($mutations);
          //Logger::Error(print_r($mutations, true));
          $this->setKeyspace($keyspace);
          if ($this->version <= 0.6) {
            $this->client->batch_mutate($keyspace, $mutations, $consistency);
          } else {
            $this->client->batch_mutate($mutations, $consistency);
          }
        } catch (TException $e) {
          $this->Debug($e->why . " " . $e->getMessage());
          return false;
        }
        return true;
      }
    }
    function &QueryCreate($queryid, $table, $columns=NULL) { 
      // Initialize
      $result = 0;

      $keyspace = $this->keyspace;
      if (strpos($table, ".") !== false) {
        list($keyspace, $table) = explode(".", $table, 2);
      }

      try {
        // Add columnfamily
        $cfdef = new Cassandra_CFDef();
        $cfdef->table = $keyspace; // Here, table seems to refer to keyspace
        $cfdef->name = $table; // and name refers to columnfamily
        $cfdef->column_type = (is_array($columns) ? "Super" : "Standard");
        
        $this->client->system_add_column_family($cfdef); // Add column family
      } catch (TException $tx) {
        if (strpos($tx->why,"already defined")!==false) { // If columnfamily already defined, consider this a success
          $result = 1;
        } else { // Otherwise - different error
          $this->Debug("AddColumnFamily error");
          print_r($tx);

          // Error occured
          $this->err_str = $tx->why;
          $this->Debug($tx->why." ".$tx->getMessage());
        }
      }

      return $result;
    }
    /**
     * This function perform a count query from a cassandra datasource.
     *
     * @param string $id (resource id)
     * @param string $table
     * @param array $where
     * @return integer $count
     */
    function &QueryCount($queryid, $table, $where, $extra=NULL) {
      $count = 0;
      if ($this->Open()) {
        try {
          $keyspace = $this->keyspace;
          if (strpos($table, ".") !== false)
            list($keyspace, $table) = explode(".", $table, 2);

          // If we failed init, bail
          if ($this->flag_failed_init) 
            return array();
      
          $consistency = any($extras["consistency"], $this->consistency, cassandra_ConsistencyLevel::ONE);
          $key = $queryid->hash;

          // Prepare query
          $column_parent = new cassandra_ColumnParent();
          $column_parent->column_family = $table;

          if ($this.version <= 0.6) {
            $count = $this->client->get_count($keyspace, $key, $column_parent, $consistency);
          } else {
            $this->setKeyspace($keyspace);
            $count = $this->client->get_count($key, $column_parent, $consistency);
          }
        } catch (TException $tx) {
          $this->Debug($tx->why." ".$tx->getMessage());
        }
      }
      return $count;
    }


    // Add keyspace 
    function AddKeyspace($cfdef) {
      $result = 0;

      try {
        // Prepare record
        $ks = new cassandra_KsDef(array("name" => $this->keyspace,
                                        "strategy_class" => "org.apache.cassandra.locator.RackAwareStrategy",
                                        "replication_factor"=>$this->consistency, "cf_defs"=>$cfdef));

        // Create new keyspace
        $this->client->system_add_keyspace($ks);

        // If we're up to here - all is well
        $result = 1;

        // Disconnect and reconnect (FIXME - is this necessary?)
        $this->Close();
        $this->Open();
      } catch (TException $tx) {
        if (strpos($tx->why, "already exists") !== false) { // If keyspace already exists, consider this a success
          $result = 1;
        } else {
          // (Otherwise - different error)
          $this->Debug("AddKeyspace error");
          print_r($tx);
        
          // Error occured
          $this->err_str = $tx->why;
          $this->Debug($tx->why." ".$tx->getMessage());
        }
      }
      return $result;
    }
    // Build cf array
    function array_to_supercolumns_or_columns($array, $timestamp=null) {
      if(empty($timestamp)) $timestamp = $this->getTimestamp();

      foreach($array as $name => $value) {
        if ($value !== NULL) {
          $c_or_sc = new cassandra_ColumnOrSuperColumn();
          if(is_array($value)) {
            $c_or_sc->super_column = new cassandra_SuperColumn();
            $c_or_sc->super_column->name = $this->unparse_column_name($name, true);
            $c_or_sc->super_column->columns = $this->array_to_columns($value, $timestamp);
            $c_or_sc->super_column->timestamp = $timestamp;
            //$c_or_sc->super_column->clock = new cassandra_Clock( array('timestamp'=>$timestamp) );				
          } else {
            $c_or_sc->column = new cassandra_Column();
            $c_or_sc->column->name = $this->unparse_column_name($name, true);
            $c_or_sc->column->value = $value;
            $c_or_sc->column->timestamp = $timestamp;
            //$c_or_sc->column->clock = new cassandra_Clock( array('timestamp'=>$timestamp) );				
          }
          $ret[] = new cassandra_mutation(array('column_or_supercolumn' => $c_or_sc ));
        }
      }

      return $ret;
    }
    // Parse column names for Cassandra
    function parse_column_name($column_name, $is_column=true) {
      if(!$column_name) return NULL;
      return $column_name;
    }
    // Unparse column names for Cassandra
    function unparse_column_name($column_name, $is_column=true) {
      if(!$column_name) return NULL;
      return $column_name;
    }
    // Convert supercolumns or columns into an array 
    function supercolumns_or_columns_to_array($array) { 
      $ret = null; 
      for ($i=0; $i<count($array); $i++) 
      foreach ($array[$i] as $object) { 
        if ($object) { 
          // If supercolumn 
          if (isset($object->columns)) { 
            $record = array(); 
            for ($j=0; $j<count($object->columns); $j++) { 
              $column = $object->columns[$j]; 
              $record[$column->name] = $column->value; 
            } 
            $ret[$object->name] = $record; 
          } else { 
            // (Otherwise - not supercolumn) 
            $ret[$object->name] = $object->value; 
          } 
        } 
      } 

      return $ret; 
    } 
    // Convert array to columns
    function array_to_columns($array, $timestamp=null) {
      if(empty($timestamp)) $timestamp = $this->getTimestamp();

      $ret = null;
      foreach($array as $name => $value) {
        if ($value !== NULL) {
          $column = new cassandra_Column();
          $column->name = $this->unparse_column_name($name, false);
          $column->value = $value;
          $column->timestamp = $timestamp;
          //$column->clock = new cassandra_Clock( array('timestamp'=>$timestamp) );				
          $ret[] = $column;
        }

      }
      return $ret;
    }
    function Debug($msg) {
      Logger::Error($msg);
      //print_pre($msg);
    }

    function SortResults($results, $sortby, $reverse) {
      $this->_sortby = $sortby;
      $this->_sortreverse = $reverse;
      uasort($results, array($this, "SortResultsHelper"));
      return $results;
    }
    function SortResultsHelper($a, $b) {
      $mult = (!empty($this->_sortreverse) ? -1 : 1);
      if (!empty($this->_sortby)) {
        if ($a[$this->_sortby] != $b[$this->_sortby])
          return ($a[$this->_sortby] > $b[$this->_sortby] ? 1 : -1) * $mult;
      }
      return 0;
    }
    function getTimestamp() {
      if (is_64bit()) {
        return (int) (microtime(true) * 1000000); // time in microseconds
      } else {
        // 32-bit systems need to treat the timestamp as a string and then convert to float, or they overflow
        $mt = explode(" ", microtime(false)); 
        return (float) ($mt[1] . ((int) ($mt[0] * 1000000)));
      }
    }
    function setKeyspace($keyspace) {
      // FIXME - hardcoded to set keyspace every query since it sometimes seems to not work otherwise
      if (true || $this->currentkeyspace != $keyspace) {
        if ($this->version >= 0.7) {
          Logger::Debug("keyspace set to $keyspace");
          $this->client->set_keyspace($keyspace);
          $this->currentkeyspace = $keyspace;
          return true;
        }
      } else {
        Logger::Error("keyspace already set to " . $this->currentkeyspace);
      }
      return false;
    }
  }
} else {
  Logger::Error("CassandraWrapper failed to init, no thrift libraries");
  class CassandraWrapper extends ConnectionWrapper {
  }
}
