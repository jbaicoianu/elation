<?
//include_once("include/hashdispenser_class.php");
include_once("include/datawrappers/connectionwrapper_class.php");

/**
 * class DBWrapper
 * Connection wrapper for databases.  Uses PDO for further abstraction to different database types.
 * @package Framework
 * @subpackage Datasources
 */
class DBWrapper extends ConnectionWrapper {
  protected $transactionLevel = 0;
  function DBWrapper($name, $cfg, $lazy=false) {
    $this->ConnectionWrapper($name, $cfg, $lazy);
    if (!empty($this->cfg["buckets"])) {
      //$this->hasher = new HashDispenser(count($this->cfg["servers"]), count($this->cfg["buckets"]), 16);
      $this->hasher = new SimpleHasher($this->cfg["buckets"]);
    }
  }
  function Open($servernum=0) {
    Profiler::StartTimer("DBWrapper:Open()", 1);
    Profiler::StartTimer("DBWrapper:Open({$this->name})", 2);

    // Determine server configuration
    $servers = $this->cfg["servers"];

    /* 
    // FIXME - simplified 7/13/12...but need to check that this doesn't break sharding
    if ($servernum == 0 && !empty($this->cfg["host"])) {
      //Profiler::StartTimer("DBWrapper:Open() - dbconnect");
      if (!empty($this->cfg["username"])) {
        $servers[0] = $this->cfg;
      } else {
        Logger::Error("Could not connect to database username is not set.");
      }
      //Profiler::StopTimer("DBWrapper:Open() - dbconnect");
    } else {
      if (!isset($servers[$servernum]["username"]))
        $servers[$servernum]["username"] = any($this->cfg["username"], "");
      if (!isset($servers[$servernum]["password"]))
        $servers[$servernum]["password"] = any($this->cfg["password"], "");
    }
    */
    if (empty($servers[$servernum])) {
      $servers[$servernum] = array();
    }
    $servers[$servernum] = array_merge($servers[$servernum], $this->cfg);

    // Establish database connection
    if (isset($servers[$servernum])) {
      $this->conn[$servernum] = new Database($servers[$servernum]);
      if (!$this->conn[$servernum]) {
        Logger::Error("Could not connect to database '" . $servers[$servernum]["host"] . "'");
      }
    }

    Profiler::StopTimer("DBWrapper:Open({$this->name})");
    Profiler::StopTimer("DBWrapper:Open()");
    return $this->Ping($servernum);
  }

  function Close($servernum=0) {
    //Profiler::StartTimer("DBWrapper:Close({$this->name})");
    if ($this->conn[$servernum]) {
      unset($this->conn[$servernum]);
    }
    //Profiler::StopTimer("DBWrapper:Close({$this->name})");
  }

  function Ping($servernum) {
    return ($this->conn[$servernum] !== NULL && $this->conn[$servernum]->isConnected());
  }

  function &Query($queryid, $query, $args=NULL) {
    $servers = $this->HashToServer($queryid);
    Profiler::StartTimer("DBWrapper:Query()", 1);
    Profiler::StartTimer("DBWrapper:Query({$this->name})");

    foreach ($servers as $server) {
      $servernum = $server[0];
      if (!$this->LazyOpen($servernum)) {
        Logger::Info("Database connection '{$this->name}:{$servernum}' marked as failed, skipping SELECT query");
        continue;
        //return NULL;
      } else {
        //print_pre($server);
        $sqlinfo = array();
        if (preg_match("/^\s*(SELECT|INSERT|UPDATE|DELETE|SHOW)\s*(.*?)\s*(?:FROM|INTO) (\S+)(?: .*)?$/i", $query, $m)) {
          $sqlinfo["type"] = $m[1];
          $sqlinfo["columns"] = $m[2];
          $sqlinfo["table"] = $m[3];
        }
        //print_pre($sqlinfo);
        // Double check that conn exists before using it (FIXME - could be smarter here)
        $resource = null;
        $realsql = ($server[1] != NULL && !empty($sqlinfo["table"]) ? str_replace($sqlinfo["table"], $sqlinfo["table"] . "_" . $server[1], $query) : $query);
        Logger::Notice("Execute query: '" . $realsql . "' " . (!empty($args) ? "Args: " . print_ln($args, true, true) : "") . "\n");
        if ($this->conn[$servernum]) {
          // execute the SQL and return the result
          try {
            //print_pre($realsql);
            $resource = $this->conn[$servernum]->queryBind($realsql, $args);
          } catch (Exception $e) {
            // display the error on the page, just the SQL statement
            $backtrace = $e->getTrace();
            $errmsg = "File: " . $backtrace[2]["file"] . "\t"
              . "Line: " . $backtrace[2]["line"] . "\t"
              . "Msg: " . $e->getMessage() . "\t"
              . "SQL: " . $backtrace[2]["args"][1] . "\t"
              . "Binds: " . print_ln($backtrace[2]["args"][2],true,true) . "\t";
            Logger::Error($errmsg);
            return false;
          }
          if ($resource) {
            $dbwrapper_obj = new DBWrapperResults();
            $dbwrapper_obj->loadDBResult($query, $resource, $this->conn[$servernum]);
            $result = $dbwrapper_obj;
            if ($sqlinfo["type"] == "SELECT")
              break;
            //Logger::Debug("Query successful: " . print_r($result->results, true));
          } else {
            Logger::Error("Mysql error: query=$realsql, args=" . print_r($args, true)); 
          }
        } else {
          Logger::Warn("Tried to use db '{$this->name}', but no connection was active");
        }
      }
    }
    
    Profiler::StopTimer("DBWrapper:Query({$this->name})");
    Profiler::StopTimer("DBWrapper:Query()");
    return $result;
  }

  
  /**
   * Execute an insert query (1 record)
   *
   * @param string $table
   * @param array $values
   * @return int
   */
  function &QueryInsert($queryid, $table, $values, $extra=NULL) {
    $servers = $this->HashToServer($queryid);
    $failed = false;
    Profiler::StartTimer("DBWrapper:QueryInsert()");
    foreach ($servers as $server) {
      $servernum = $server[0];
      // If we're not connected and we're in lazy mode, open the connection.  Bail out if lazy connect fails.
      if (!$this->LazyOpen($servernum)) {
        $failed = true;
        Logger::Info("Database connection '{$this->name}:{$servernum}' marked as failed, skipping INSERT query");
      } else {
        // Double check that conn exists before using it (FIXME - could be smarter here)
        $last_insert_id = null;
        if ($this->conn[$servernum]) {
          $realtable = $table . ($server[1] !== NULL ? "_" . $server[1] : "");
          try {
            $last_insert_id = $this->conn[$servernum]->insert($realtable, $values, $extra);
            if ($last_insert_id !== false) {
              Logger::Notice("Insert into table $realtable succeeded: $last_insert_id");
            } else {
              Logger::Error("Mysql error: error inserting into $realtable with data " . print_ln($values,true)); 
              $failed = true;
              break;
            }
          } catch (Exception $e) {
            $failed = true;
            $last_insert_id = NULL;
            if ($extra["exceptionpassthrough"]) { // Duplicate key constraint violation
              throw($e);
            } else {
              Logger::Error("Failed to insert '{$queryid->id}' into '$realtable': " . $e->getMessage());
            }
          }
        } else {
          Logger::Warn("Tried to use db '{$this->name}', but no connection was active");
        }
      }
    }
    Profiler::StopTimer("DBWrapper:QueryInsert()");
    return ($failed ? null : $last_insert_id);
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
    // If we passed an array for the where clause, we need to synthesize a string and populate the appropriate bind_vars
    if (is_array($where_condition)) { 
      $new_wheres = array();
      foreach ($where_condition as $k=>$v) {
        $bind_vars[':where'.$k] = $v;
        $new_wheres[] = $k . "=:where" . $k;
      }
      $where_condition = implode(" AND ", $new_wheres);
    }
    $servers = $this->HashToServer($queryid);
    foreach ($servers as $server) {
      $servernum = $server[0];
      // If we're not connected and we're in lazy mode, open the connection.  Bail out if lazy connect fails.
      if (!$this->LazyOpen($servernum)) {
        Logger::Info("Database connection '{$this->name}:{$servernum}' marked as failed, skipping UPDATE query");
      } else {
        Profiler::StartTimer("DBWrapper:QueryUpdate()");
        
        // Double check that conn exists before using it (FIXME - could be smarter here)
        $rows_affected = null;
        if ($this->conn[$servernum]) {
          $realtable = $table . ($server[1] !== NULL ? "_" . $server[1] : "");
          /*
          print_pre($realtable);
          print_pre($values);
          print_pre($where_condition);
          print_pre($bind_vars);
          */
          if (is_array(current($values))) { // FIXME - dirty hack to only use the first element if we're passed a multi-dimensional array
            if (count($values) > 1)
              Logger::Error("DBWrapper::QueryUpdate() passed multiple updates, but could only execute the first one");
            $values = current($values);
          }
          try {
            $rows_affected = $this->conn[$servernum]->update($realtable, $values, $where_condition, $bind_vars);
            if ($rows_affected > 0) {
              $this->CacheClear($queryid);
            }
            Logger::Notice("Execute update query into table $table (Using " . $this->dsn . ")");
          } catch (Exception $e) {
            Logger::Error("Failed to update '{$queryid->id}' in '$realtable': " . $e->getMessage());
            $last_insert_id = NULL;
          }
        } else {
          Logger::Warn("Tried to use db '{$this->name}:{$servernum}', but no connection was active");
        }
      }
    }

    Profiler::StopTimer("DBWrapper:QueryUpdate()");
    return $rows_affected;
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
  function &QueryDelete($queryid, $table, $where_condition, $bind_vars=array()) {
    // If we passed an array for the where clause, we need to synthesize a string and populate the appropriate bind_vars
    if (is_array($where_condition)) { 
      $new_wheres = array();
      foreach ($where_condition as $k=>$v) {
        $bind_vars[':where'.$k] = $v;
        $new_wheres[] = $k . "=:where" . $k;
      }
      $where_condition = implode(" AND ", $new_wheres);
    }
    $servers = $this->HashToServer($queryid);
    //print_pre($servers);
    foreach ($servers as $server) {
      $servernum = $server[0];
      // If we're not connected and we're in lazy mode, open the connection.  Bail out if lazy connect fails.
      if (!$this->LazyOpen($servernum)) {
        Logger::Info("Database connection '{$this->name}:{$servernum}' marked as failed, skipping DELETE query");
      } else {
        Profiler::StartTimer("DBWrapper:QueryDelete()");
        
        // Double check that conn exists before using it (FIXME - could be smarter here)
        $rows_affected = null;
        if ($this->conn[$servernum]) {
          $realtable = $table . ($server[1] !== NULL ? "_" . $server[1] : "");
          /*
          print_pre($realtable);
          print_pre($where_condition);
          print_pre($bind_vars);
          */
          try {
            $rows_affected = $this->conn[$servernum]->delete($realtable, $where_condition, $bind_vars);
            Logger::Notice("Execute delete query on table $table (Using " . $this->dsn . ")");
          } catch (Exception $e) {
            Logger::Error("Failed to delete '{$queryid->id}' from '$realtable': " . $e->getMessage());
          }
        } else {
          Logger::Warn("Tried to use db '{$this->name}:{$servernum}', but no connection was active");
        }
      }
    }

    Profiler::StopTimer("DBWrapper:QueryDelete()");
    return $rows_affected;
  }
  function &QueryCreate($queryid, $table, $columns) { 
    $columnsql = "(" . implode(", ", $columns) . ")";
    $ret = false;
    //print_pre($queryid);
    //print_pre($table);
    //print_pre($columnsql);
    if (empty($this->cfg["buckets"])) {
      if (!$this->LazyOpen(0)) {
        Logger::Info("Database connection '{$this->name}' marked as failed, skipping CREATE query");
        return false;
      }
      if ($this->conn[0]) {
        $result = $this->conn[0]->queryBind("CREATE TABLE " . $table . " " . $columnsql);
        $ret = !empty($result);
      }
    } else {
      $tables = array();
      $ret = true;
      foreach ($this->cfg["buckets"] as $bucket) {
        //$brick = $this->hasher->lookupShard($i);

        //$fmt = "%s_%0" . strlen($this->cfg["buckets"]) . "d";
        $fmt = "%s_%s";
        $tablename = sprintf($fmt, $table, $bucket["name"]);
        $sql = sprintf("CREATE TABLE %s %s", $tablename, $columnsql);
        //$servernum = $brick->server[0] + 1;
        foreach ($bucket["servers"] as $servernum) {
          if (!$this->LazyOpen($servernum)) {
            Logger::Info("Database connection '{$this->name}:{$servernum}' marked as failed, skipping CREATE query");
            $ret = false;
          }
          if ($this->conn[$servernum]) {
            //print_pre($sql);

            $result = $this->conn[$servernum]->queryBind($sql);
            $ret &= !empty($result);
            $tables[$servernum][] = $tablename;
          }
        }
      }
      /* Creating a VIEW for each of the sharded tables on this server could be dangerous with large datasets.  Should we make this an option?
      if (!empty($tables)) {
        foreach ($tables as $servernum=>$ts) {
          $viewsql = "CREATE VIEW $table AS ";
          //$viewsql .= implode(" UNION SELECT * FROM ", $t);
          $unionsql = "";
          foreach ($ts as $t) {
            $unionsql .= ($unionsql != "" ? " UNION " : "") . " SELECT *,'$t' AS shard FROM $t";
          }
          $viewsql .= $unionsql;
          //print_pre($viewsql);
          $this->conn[$servernum]->queryBind($viewsql);
        }
      }
      */
    }
    return $ret;
  }
  /**
   * This function perform a simple fetch from a SQL datasource.
   *
   * @param DatamanagerQueryID $queryid
   * @param string $table
   * @param array $where
   * @return integer $count
   */
  function &QueryFetch($queryid, $table, $where, $extra=NULL) {
    $servers = $this->HashToServer($queryid);
    foreach ($servers as $server) {
      $servernum = $server[0];
      // If we're not connected and we're in lazy mode, open the connection.  Bail out if lazy connect fails.
      if (!$this->LazyOpen($servernum)) {
        Logger::Info("Database connection '{$this->name}:{$servernum}' marked as failed, skipping FETCH query");
      } else {
        if ($this->conn[$servernum]) {
          $realtable = $table . ($server[1] !== NULL ? "_" . $server[1] : "");
          $whereflat = $this->flatten_where($where);
          $query = "SELECT * FROM {$table} " . $whereflat["where"];
          if (!empty($extra["orderby"])) {
            $query .= " ORDER BY " . $extra["orderby"];
            if (!empty($extra["reverse"])) { // "reverse" only applies if "orderby" is also passed
              $query .= " DESC";
            }
          }
          if (!empty($extra["limit"])) {
            $query .= " LIMIT " . $extra["limit"];
          }
          if (!empty($extra["offset"])) {
            $query .= " OFFSET " . $extra["offset"];
          }					
          $results = $this->Query($queryid, $query, $whereflat["args"]);
          if (!empty($results) && $results->numrows > 0) {
            foreach ($results->rows as $row) {
              $item = object_to_array($row);
              if (!empty($extra["indexby"])) {
                $idx = $this->GenerateIndex($extra["indexby"], $item);
                $ret[$idx] = $item;
              }
              else
                $ret[] = $item;
            }
            break; // If we've found results, no need to check the next server
          }
        }
      }
    }
    return $ret;
  }
  /**
   * This function perform a count query from a SQL datasource.
   *
   * @param DatamanagerQueryID $queryid
   * @param string $table
   * @param array $where
   * @return integer $count
   */
  function &QueryCount($queryid, $table, $where=NULL, $extra=NULL) {
    $ret = 0;
    $servers = $this->HashToServer($queryid);
    foreach ($servers as $server) {
      $servernum = $server[0];
      // If we're not connected and we're in lazy mode, open the connection.  Bail out if lazy connect fails.
      if (!$this->LazyOpen($servernum)) {
        Logger::Info("Database connection '{$this->name}:{$servernum}' marked as failed, skipping COUNT query");
      } else {
        if ($this->conn[$servernum]) {
          $realtable = $table . ($server[1] !== NULL ? "_" . $server[1] : "");
          $query = "SELECT count(*) AS cnt FROM {$realtable}";

          $bindings = array();
          if (!empty($where)) {
            if (is_string($where)) {
              $query .= " WHERE " . $where;
            } else {
              $whereargs = array();
              foreach ($where as $k=>$v) {
                $whereargs[] = "$k=:{$k}";
                $bindings[":".$k] = $v;
              }
              if (!empty($whereargs)) {
                $query .= " WHERE " . implode(" AND ", $whereargs);
              }
            }
          }
          try {
            $resource = $this->conn[$servernum]->queryBind($query, $bindings);
          } catch (Exception $e) {
            // display the error on the page, just the SQL statement
            $backtrace = $e->getTrace();
            $errmsg = "File: " . $backtrace[2]["file"] . "\t"
              . "Line: " . $backtrace[2]["line"] . "\t"
              . "Msg: " . $e->getMessage() . "\t"
              . "SQL: " . $backtrace[2]["args"][1] . "\t"
              . "Binds: " . print_ln($backtrace[2]["args"][2],true,true) . "\t";
            Logger::Error($errmsg);
            return 0;
          }
          $rows = array();
          foreach ($resource as $r) {
            $rows[] = $r; 
          }
          if (count($rows) == 1) {
            $ret = $rows[0]->cnt;
            break;
          }
        }
      }
    }
    return $ret;
  }
  
  function CacheGet($queryid, $query, $args) {
    $ret = NULL;

    $split = explode(" ", $query, 2);
    $cmd = strtoupper(trim($split[0]));
    $is_select = ($cmd == 'SELECT' || $cmd == 'SHOW') ? TRUE : FALSE;

    // If statement is SELECT, get the MD5 of the query and see if this in cache.
    if ($this->cache && $is_select) {
      // determine the md5 of the query and md5 of the args
      $cachedresult = $this->cache->get($queryid->id);
      if ($cachedresult !== false) {
        //$dbwrapper_obj = new DBWrapperResults();
        //$dbwrapper_obj->loadCacheResult($cachedresult);
        
        switch ($this->cachepolicy) {
        case 1:
          Logger::Debug("Found resource '%s' in memcache", $queryid->id);
          $ret = new CacheEntry($queryid->id, $cachedresult, false, $this->cachetimeout);
          break;
        case 2:
          //Logger::Debug("Found resource '%s' in memcache (%d seconds to soft-expiry)", $queryid->id, $cachedresult->timeout - (time() - $cachedresult->timestamp));
          $ret = $cachedresult; // Already a CacheEntry object
          break;
        }
        //Logger::Debug("Cache get successful: " . print_ln($ret, true));
      }
    }
    return $ret;
  }

  function CacheSet($queryid, $query, $args, $result) {
    $split = explode(" ", $query, 2);
    $cmd = strtoupper(trim($split[0]));
    $is_select = ($cmd == 'SELECT' || $cmd == 'SHOW') ? TRUE : FALSE;

    // If statement is SELECT, get the MD5 of the query and see if this in cache.
    if ($this->cache && $is_select) {
      switch ($this->cachepolicy) {
        case 1: // Just cache the results, not the whole CacheEntry object
          $this->cache->set($queryid->id, $result);
          break;
        case 2: // Cache a whole CacheEntry object so we can do soft-expiry
          // Set underlying cache's lifetime to 0 when we're soft-expiring
          $this->cache->set($queryid->id, new CacheEntry($queryid->id, $result, true, $this->cachetimeout), array("lifetime" => 0));
          break;
      }
    }
  }

  function HashToServer($queryid) {
    if (empty($this->cfg["buckets"])) {
      return array(array(0, NULL));
    } else if (!empty($this->cfg["servers"])) {
      if (!empty($queryid->hash)) {
        $hashon = $queryid->hash;
      } else {
        // If no hash was given, then we'll just hash based on the whole id
        // This could suck if we change db names, so it's important that all
        // queries provide a hash when using sharded tables.  For read-only
        // table-level queries (eg, DESCRIBE dbname.tablename) this works fine.
        $hashon = $queryid->id;
      }
      $bricks = $this->hasher->lookupList($hashon);
      foreach ($bricks as $brick) {
        $ret[] = array($brick->server, $brick->shard);
      }
      return $ret;
    }
  }
  function flatten_where($where) {
    $ret = NULL;
    $bindings = array();
    if (!empty($where)) {
      $whereargs = array();
      foreach ($where as $k=>$v) {
        $whereargs[] = "$k=:where{$k}";
        $bindings[":where".$k] = $v;
      }
      if (!empty($whereargs)) {
        $ret["where"] = "WHERE " . implode(" AND ", $whereargs);
        $ret["args"] = $bindings;
      }
    }
    return $ret;
  }
  function BeginTransaction($queryid) {
    $ret = true;
    if (!$this->transactionLevel++) {
      $servers = $this->HashToServer($queryid);
      foreach ($servers as $server) {
        if (!$this->LazyOpen($server[0])) {
          Logger::Info("Database connection '{$this->name}:{$servernum}' marked as failed, skipping BeginTransaction");
        } else {
          if ($this->conn[$server[0]]) {
            $ret &= $this->conn[$server[0]]->beginTransaction();
          }
        }
      }
    }
    return $ret;
  }
  function Commit($queryid) {
    $ret = true;
    if (!--$this->transactionLevel) {
      $servers = $this->HashToServer($queryid);
      foreach ($servers as $server) {
        if (!$this->LazyOpen($server[0])) {
          Logger::Info("Database connection '{$this->name}:{$servernum}' marked as failed, skipping Commit");
        } else {
          if ($this->conn[$server[0]]) {
            $ret &= $this->conn[$server[0]]->commit();
          }
        }
      }
    }
    return $ret;
  }
  function Rollback($queryid) {
    $ret = true;
    if (!--$this->transactionLevel) {
      $servers = $this->HashToServer($queryid);
      foreach ($servers as $server) {
        if (!$this->LazyOpen($server[0])) {
          Logger::Info("Database connection '{$this->name}:{$servernum}' marked as failed, skipping rollback");
        } else {
          if ($this->conn[$server[0]]) {
            $ret &= $this->conn[$server[0]]->rollBack();
          }
        }
      }
    }
    return $ret;
  }
  function Quote($queryid, $str) {
    $servers = $this->HashToServer($queryid);
    foreach ($servers as $server) {
      $servernum = $server[0];
      if (!$this->LazyOpen($servernum)) {
        Logger::Info("Database connection '{$this->name}:{$servernum}' marked as failed, can't quote");
      } else {
        return $this->conn[$servernum]->quote($str);
      }
    }
    return mysql_escape_string($str); // Deprecated function call used as a last-ditch fallback
  }
}

/**
 * class DBWrapperResults
 * Container object for results returned by the database
 * @package Framework
 * @subpackage Datasources
 */
class DBWrapperResults {
  //var $dbconn;
  //var $resource;
  var $query;
  var $results;
  var $rows;
  var $numrows;
  var $id;

  function __construct() {
  }
  function __sleep() {
    return array("resource", "query", "rows", "numrows", "id");
  }
  function __wakeup() {
    $this->fixResultsAlias();
  }
  
  function loadDBResult($query, $resource, $dbconn) {
    $this->query = $query;
    //$this->dbconn = $dbconn;
    
    if ($resource) {
      // determine what type of query
      $split = explode(" ", $query, 2);
      $type = strtoupper(trim($split[0]));
      switch($type) {
        case "SELECT":
        case "SHOW":
          foreach($resource as $row) {
            $this->rows[] = $row;
          }
          $this->numrows = count($this->rows);
          $this->results =& $this->rows;     // backwards compatability
          break;
        case "INSERT":
          $this->id = $dbconn->lastInsertId();
          $this->results =& $this->id;      // backwards compatability
          break;
        case "UPDATE":
        case "DELETE":
          $this->numrows = $resource->rowCount();
          $this->results =& $this->numrows; // backwards compatability
          break;
      }
    }
  }

  function fixResultsAlias() {
    // Needed for backwards compatability - lots of old code still uses $data->results regardless of query type

    $split = explode(" ", $this->query, 2);
    $type = strtoupper(trim($split[0]));
    switch($type) {
      case "SELECT":
      case "SHOW":
        $this->results =& $this->rows;
        break;
      case "INSERT":
        $this->results =& $this->id;
        break;
      case "UPDATE":
      case "DELETE":
        $this->results =& $this->numrows;
        break;
    }
  }

  function loadCacheResult($results) {
    /**
     * Since we have to consider that all the existing cache objects
     * are the entire object, including query, resource, connection,
     * we have to detect which one and act accordingly.
     */
    if ($results instanceOf CacheEntry)
      $results = $results->getPayload();

    if (!empty($results->query)) {
      $this->loadDBResult($results->query, $results->resource, $resource->dbconn);
    } else {
      $this->results = $results;
      $this->numrows = count($results);
      $this->rows = $results;
    }
  }

  function setResults($results) {
    $this->results = $results;
    $this->rows = $results;
  }

  function GetResults() {
    return $this->results;
  }
  
  function GetResult($num) {
    if (isset($this->results[$num]))
      return $this->results[$num];
    return NULL;
  }
  
  function NumResults() {
    return count($this->results);
  }
}

/**
 * This is the database object layer that utilize the PHP PDO object
 * for the DB activities (insert, update, deleted, etc.)
 *
 * @todo
 * 1) Integrate the Profiler class for debugging
 *
 */
class DataBase {
  // debug
  public static $debug = FALSE;

  // caching
  protected $cache_obj = NULL;

  // db
  private $db = NULL;
  protected $dsn;
  protected $username;
  protected $password;
  protected $driver_options;      // PDO driver connection options

  /**
   * The contructor
   *
   * @param string $dns
   * @param string $username
   * @param string $password
   * @param string $driver_options
   * @param boolean $connect connect to the database?
   */
  public function __construct($cfg, $connect = TRUE) {
    $this->dsn = self::dsn($cfg);
    $this->username = $cfg["username"];
    $this->password = $cfg["password"];
    $this->driver_options = $cfg["driver_options"];
    $this->cfg = $cfg;
    if ($connect) {
      $this->connect($this->dsn, $this->username, $this->password, $this->driver_options);
    }
    $this->initCache();
  }

  /**
   * This function is used to connect to the DataBase.
   *
   * @param string $dns
   * @param string $username
   * @param string $password
   * @param string $driver_options
   *
   * @return boolean FALSE = failure
   */
  public function connect($dsn, $username, $password, $driver_options=array()) {
    try {
      $this->db = new PDO($dsn, $username, $password, $driver_options);
      
      // change the Statement Class that PDO uses.
      //$this->db->setAttribute(PDO::ATTR_STATEMENT_CLASS, array('DataBaseStatement', array($this->db)));

      $driver = $this->cfg["driver"];
      
      $this->db->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );

      switch ($this->cfg["driver"]) {
        case 'mysql':
          $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );

          // fix multiple queries with mysql so we don't have to create multiple objects.
          $this->db->setAttribute(PDO::MYSQL_ATTR_USE_BUFFERED_QUERY, TRUE);

          // force lower case return column names
          $this->db->setAttribute( PDO::ATTR_CASE, PDO::CASE_LOWER );
          break;
        case 'sqlite':
          $this->db->setAttribute( PDO::ATTR_EMULATE_PREPARES, true );
          break;
      }
      
      // connection made, done
      $return = TRUE;
    } catch (PDOException $e) {
      Logger::Error($e->getMessage());
      $return = FALSE;
    }
    return $return;
  }

  /**
   * disconnect from the DB
   * @return void
   */
  public function disconnect() {
    unset($this->db);
  }

  public function isConnected() {
    return (!empty($this->db));
  }
  /**
   * This will use memcache by default.
   */
  protected function initCache() {
    /*
    if (Cache::isCacheEnabled()) {
      $cache = DataCache::singleton();
    } else {
      $cache = NoCache::singleton();
    }
    $this->cache_obj = $cache;
    */
    // Caching is handled by the DataManager, it's not needed here
    //$cache = NoCache::singleton();
  }

  /**
   * This static method builds a proper formated DSN to connect
   * to a DB.
   *
   * @param array $cfg DSN configuration (type-specific)
   * @return string
   */
  public static function dsn($cfg) {
    $driver = any($cfg['driver'], "mysql");
    switch ($driver) {
      case 'mysql':
        $dsn_port = '';
        if (!is_null($cfg['port']) && is_numeric($cfg['port'])) {
          $dsn_port = ';port='.$cfg['port'];
        }
        $driveroptions = 'dbname='.$cfg['dbname'].';host='.$cfg['host'].$dsn_port;
        break;
      case 'sqlite':
        $driveroptions = $cfg['file'];
        break;
    }
    if (!empty($driveroptions))
      $ret = $driver.':'.$driveroptions;
    return $ret;
  }

  /**
   * This method is used to INSERT a new record into a table.
   *
   * @param string  the table name
   * @param array the array of column name => value pairs
   * @return int lastInsertId
   */
  public function insert($table, $values, $extra = null) {
    // make sure we have some columns to actually update
    if ( empty($values) ) {
      throw new PDOException('No Values Defined.');
    }

    if (is_string($extra)) { // Force $extra to be an associative array of options
      $extra = array("extrasql" => $extra);
    }

    $bind_vars = array();
    $keys = array_keys($values);
    if (is_array($values[$keys[0]]) || is_object($values[$keys[0]])) {
      $keys = array_keys($values[$keys[0]]);
      foreach ($values as $k=>$item) { 
        $safekey = preg_replace("/[^\w\d_]+/", "_", $k);
        $row = array();
        foreach ($item as $itemkey=>$itemval) {
          $bindname = ":" . $safekey . "_" . $itemkey; 
          $row[] = $bindname;
          $bind_vars[$bindname] = $itemval;
        }
        $allrows[] = "(".implode(",",$row).")";
      }
      $insertstr = implode(",",$allrows);
    } else {
      $insertstr = "(:" . implode(",:", $keys) . ")";
      foreach ($values as $k=>$v) {
        $bind_vars[":".$k] = $v;
      }
    }

    $sql = "INSERT " . ($extra["ignore"] ? "IGNORE " : "") . "INTO $table ("
         . implode(',', $keys)
         . ") VALUES " . $insertstr;

    if ($extra["extrasql"] !== null)
      $sql .= " " . $extra["extrasql"];

    Logger::Notice("Execute query: '" . $sql . "' " . print_ln($bind_vars, true));
    /**
     * Prepare the SQL, bind it, and execute it.
     */
    try {
      $stmt = $this->db->prepare($sql);
    } catch (PDOException $e) {
      //throw new DataBaseException($e->getMessage(), $e->getCode(), $sql, $bind_vars);
      throw $e;
    }
    foreach($bind_vars as $key => $value) {
      $stmt->bindValue($key, $value);
    }
    try {
      $result = $stmt->execute();
    } catch (PDOException $e) {
      //throw new DataBaseException($e->getMessage(), $e->getCode(), $sql, $bind_vars);
      throw $e;
    }

    $ret = false;
    $errorcode = $this->db->errorCode();
    if ($errorcode == '00000') { // '00000' means success
      // get and return the last inserted id, or true if no insertid is returned.
      $id = $this->db->lastInsertId();
      //$ret = ($id || $extra["ignore"] ? $id : true);
      if ($id > 0) {
        $ret = $id;
      } else {
        $ret = ($stmt->rowCount() > 0);
      }
    }
    return $ret;
  }

  /**
   * This method is used to UPDATE a specific record in a
   * table.
   *
   * @param string  the table name
   * @param array the array of column name => value pairs
   * @param string the where clause condition
   *        NOTE: this doesn't include the 'where' word.
   *        Example: 'siteid=:siteid and foo=:foo'
   * @param array the bind vars that live in the where clause
   *        Example: array(':siteid' => 69,
   *                       ':foo' => 'blah blah');
   * @return boolean TRUE = success
   */
  public function update($table, $values, $where_condition, $bind_vars=array()) {
    // make sure we have some columns to actually update
    if ( empty($values) ) {
      throw new PDOException('No Values Defined.');
    }

    /**
     * Compose the UPDATE statement
     */
    $sql = "UPDATE $table SET ";
    foreach ($values as $key => $value) {
      $sql .= $key . "=:" . $key . ",";
    }
    $sql = rtrim($sql, ",");
    if ( !is_null($where_condition) ) {
      $sql .= " WHERE " . $where_condition;
    }
    /**
     * Prepare the SQL, bind it, and execute it.
     */
    Logger::Notice("Execute query: '" . $sql . "' " . print_ln($bind_vars, true));
    try {
      $stmt = $this->db->prepare($sql);
    } catch (PDOException $e) {
      $err = $this->db->errorInfo();
      throw new DataBaseException($e->getMessage(), $e->getCode(), $sql, $bind_vars);
    }
    if (! empty($bind_vars)) {
      $i = 1;
      foreach($bind_vars as $key => $value) {
        // determine if this is binding by ? or by :name
        $key = ($key[0] == ":") ? $key : $i;
        $stmt->bindValue($key, $value);
        $i++;
      }
    }
    foreach($values as $key => $value) {
      $bind_vars[':' . $key] = $value;
      $stmt->bindValue(':' . $key, $value);
    }
    try {
      $result = $stmt->execute();
      Logger::Debug("Database::update() - $sql");
    } catch (PDOException $e) {
      throw new DataBaseException($e->getMessage(), $e->getCode(), $sql, $bind_vars);
    }
    return $result;
  }

  /**
   * This method is used to delete record(s) from
   * a table in the db.
   *
   * @param string the table name
   * @param string the where clause condition
   *        NOTE: this doesn't include the 'where' word.
   *        Example: 'siteid=:siteid and foo=:foo'
   * @param array the bind vars that live in the where clause
   *        Example: array(':siteid' => 69,
   *                       ':foo' => 'blah blah');
   * @return boolean TRUE = success
   */
  public function delete($table, $where_condition=NULL, $bind_vars=array()) {
    $sql = 'DELETE FROM ' . $table;

    if (!is_null($where_condition)) {
      $sql .= ' WHERE '.$where_condition;


      Logger::Notice("Execute query: '" . $sql . "' " . print_ln($bind_vars, true));
      //we now have to prepare the query
      //and bind all of the values.
      try {
        $stmt = $this->db->prepare($sql);
      } catch (PDOException $e) {
        throw new DataBaseException($e->getMessage(), $e->getCode(), $sql, $bind_vars);
      }

      //ok now bind the parameters
      //first bind the user provided vars
      if (! empty($bind_vars)) {
        $i = 1;
        foreach($bind_vars as $key => $value) {
          // determine if this is binding by ? or by :name
          $key = ($key[0] == ":") ? $key : $i;
          $stmt->bindValue($key, $value);
          $i++;
        }
      }
    } else {
      //we now have to prepare the query
      //and bind all of the values.
      $stmt = $this->db->prepare($sql);
    }
    //and now execute it!
    $result = $stmt->execute();
    Logger::Debug("Database::delete() - $sql");
    return $result;
  }

  /**************************/
  /* QUERY (SELECT) methods */
  /**************************/

  /**
   * This method is used to do a raw exec on
   * a sql query.
   *
   * @param string the sql query
   * @return DataBaseStatement
   */
  public function exec($sql) {
    // execute the SQL statement
    try {
      $stmt = $this->db->exec($sql);
      Logger::Debug("Database::exec() - $sql");
    } catch (PDOException $e) {
      throw new DataBaseException($e->getMessage(), $e->getCode(), $sql, $bind_vars=array());
    }
    return $stmt;
  }

  /**
   * This method is used to do a select query.
   * @param string the sql query
   * @return DataBaseStatement
   */
  public function query($sql) {
    // execute the SQL statement
    try {
      $stmt = $this->db->query($sql);
      Logger::Debug("Database::query() - $sql");
    } catch (PDOException $e) {
      throw new DataBaseException($e->getMessage(), $e->getCode(), $sql, $bind_vars=array());
    }
    return $stmt;
  }

  /**
   * This method is used to do a select query with bind variables.
   * This is the preferred method to use when talking to the DB for
   * queries to help aleviate sql injection issues.  If the mysqli
   * interface is loaded, then it will speed things up a bit.
   *
   * Instead of manually placing values in the query, use a ?
   * and then pass in the values in the bind_vars array.
   *
   * ie.
   *   select * from foo where blah='test1' and blah2='test2';
   *
   *   is replaced by
   *
   *   select * from foo where blah=? and blah2=?
   *   $bind_vars = array('test1', 'test2');
   *
   * @param string the sql query with the bind vars
   * @param array the array of bind vars
   * @return DataBaseStatement
   */
  public function queryBind($sql, $bind_vars=array()) {
    if (!empty($this->db)) {
      // Prepare the query and bind all of the values.
      try {
        $stmt = $this->db->prepare($sql);
        $stmt->setFetchMode(PDO::FETCH_OBJ);
      } catch (PDOException $e) {
        //throw new DataBaseException($e->getMessage(), $e->getCode(), $sql, $bind_vars=array());
        Logger::Error($e->getMessage());
        throw $e;
      }

      // bind the parameters
      if (! empty($bind_vars)) {
        $i = 1;
        foreach($bind_vars as $key => $value) {
          // determine if this is binding by ? or by :name
          $key = ($key[0] == ":") ? $key : (is_numeric($key) ? $i : ":" . $key);
          $stmt->bindValue($key, $value);
          $i++;
        }
      }

      // and now execute it!
      if (!empty($stmt)) {
        try {
          $stmt->execute();
        }  catch (PDOException $e) {
          // must have been something wrong in the constructed SQL
          //throw new DataBaseException($e->getMessage(), DataBaseException::QUERY_EXECUTE_FAILED, $sql, $bind_vars);
          throw $e;
        }
      }
    }
    return $stmt;
  }

  /**
   * This method uses bind variabls to return exactly one row
   * of data from the bind query.
   *
   * @param string the sql query with the bind vars
   * @param array the array of bind vars
   * @return stdClass
   */
  public function queryBindOneRow($sql, $bind_vars=array()) {
    //make sure we are using the new mysqli interface
    $stmt = $this->queryBind($sql, $bind_vars);
    if ( $stmt ) {
      $obj = $stmt->fetch();
    }
    return $obj;
  }

  /**
   * This method executes a bind query, then returns the first
   * value of the result set.  It assumes you only wanted 1 column
   * back from the query.  If multiple columns are fetched from the
   * select, then only the first column's value will be returned.
   *
   * @param string the sql query with the bind vars
   * @param array the array of bind vars
   * @return mixed FALSE on error or 1 column value
   */
  public function queryBindOneValue($sql, $bind_vars=array()) {
    $result = $this->queryBindOneRow($sql, $bind_vars);
    if ( $result ) {
      list($name, $result) = each( $result );
    }
    return $result;
  }

  /**
   * This function is used to limit the select bind query.
   * Don't use this for anything other then a
   * select
   *
   * @param string the sql statement to execute
   * @param int number of rows to limit the results to
   * @param int offset into the result set to start from
   *
   * @see http://troels.arvin.dk/db/rdbms/#select-limit-offset
   */
  public function queryBindLimit($sql, $bind_vars=array(), $nrows=-1, $offset=-1) {
    // first we have to build the sql query
    switch ($this->db->getAttribute(PDO::ATTR_DRIVER_NAME)) {
      case 'mysql':
        $offsetStr = ($offset >= 0) ? ((integer)$offset) . "," : '';
        $sql .= " LIMIT $offsetStr" . ((integer)$nrows);
        break;
      case 'pgsql':
        $offsetStr = ($offset >= 0) ? " OFFSET " . ((integer)$offset) : '';
        $limitStr  = ($nrows >= 0)  ? " LIMIT " . ((integer)$nrows) : '';
        $sql .= $limitStr.$offsetStr;
        break;
      case "oracle":
        $sql = "select * from (" . $sql . ") where rownum <= :offset";
        $bind_vars[':offset'] = $nrows;
        break;
      default:
        // we don't support this driver yet
        throw new PDOException('Unsupported driver for queryBindLimit');
        break;
    }
    $stmt = $this->queryBind($sql, $bind_vars);
    return $stmt;
  }

  /************************/
  /*  Cache query methods */
  /************************/

  /**
   * This is identical to queryBindOneRow but that it can
   * cache the results and return cached results if it's in the cache.
   *
   * @see queryBindOneRow
   *
   * This method uses bind variabls to return exactly one row
   * of data from the bind query.
   *
   * @param string the sql query with the bind vars
   * @param array the array of bind vars
   * @param int $timeout (in seconds, Default: 60)
   * @return stdClass
   */
  public function queryBindOneRowCache($sql, $bind_vars=array(), $timeout=60) {
    if (is_null($this->cache_obj)) {
      throw new DataBaseException("No Cache object set",
                                  DataBaseException::QUERY_CACHE_MISSING,
                                  $sql, $bind_vars);
    }

    $key = $this->constructCacheKey($sql, $bind_vars);
    $value = $this->cache_obj->get($key);
    if (!$value) {
      $value = $this->queryBindOneRow($sql, $bind_vars);
      $this->cache_obj->set($key, $value, $timeout);
    }
    return $value;
  }


  /**
   * This method is used to cache ALL rows in a select query.
   *
   * @param string the sql query with the bind vars
   * @param array the array of bind vars
   * @param int $timeout (in seconds, Default: 60)
   * @return array of stdClass objects
   */
  public function queryBindAllRowsCache($sql, $bind_vars=array(), $timeout=60) {
    if (is_null($this->cache_obj)) {
      throw new DataBaseException("No Cache object set",
      DataBaseException::QUERY_CACHE_MISSING,
      $sql, $bind_vars);
    }

    $key = $this->construct_cache_key($sql, $bind_vars);
    $values = $this->cache_obj->get($key);
    if (!$values) {
      $stmt = $this->queryBind($sql, $bind_vars);
      $values = array();
      while ($row = $stmt->fetch()) {
        $values[] = $row;
      }
      $this->cache_obj->set($key, $values, $timeout);
    }
    return $values;
  }

  /**
   * This is identical to queryBindOneValue but that it can
   * cache the results and return cached results if it's in the cache.
   *
   * @see queryBindOneValue
   *
   * This method executes a bind query, then returns the first
   * value of the result set.  It assumes you only wanted 1 column
   * back from the query.  If multiple columns are fetched from the
   * select, then only the first column's value will be returned.
   *
   * @param string the sql query with the bind vars
   * @param array the array of bind vars
   * @param int $timeout (in seconds, Default: 60)
   * @return mixed FALSE on error or 1 column value
   */
  public function queryBindOneValueCache($sql, $bind_vars=array(), $timeout=60) {
    if (is_null($this->cache_obj)) {
      throw new DataBaseException("No Cache object set",
      DataBaseException::QUERY_CACHE_MISSING,
      $sql, $bind_vars);
    }

    $key = $this->construct_cache_key($sql, $bind_vars);
    $value = $this->cache_obj->get($key);
    if (!$value) {
      $value = $this->queryBindOneValue($sql, $bind_vars);
      $this->cache_obj->set($key, $value, $timeout);
    }
    return $value;
  }

  /**
   * This method is used to contruct a cache key based on
   * $sql, bind vars
   *
   * @param string $sql
   * @param array $bind
   * @return string
   */
  protected function constructCacheKey($sql, $bind) {
    $key = $sql;
    foreach($bind as $name => $value) {
      $key .= $name.':'.$value;
    }

    return str_replace(' ', '', $key);
  }

  /**************************/
  /*  HELPER public methods */
  /**************************/

  /**
   * This is a short cut function that returns a row
   * as an array
   *
   * @param string $table
   * @param string $name
   * @param string $value
   *
   * @return array
   */
  public function getRowByField($table, $name, $value, $fields = '*') {
    $sql = 'select ' . $fields . ' from ' . $table . ' where ' . $name . '=?';
    $obj = $this->queryBindOneRow($sql, array($value));
    return $stmt->fetch(PDO::FETCH_ASSOC);
  }

  public function isRowExists($table, $name, $value) {
    $sql = 'select ' . $name . ' from ' . $table . ' where ' . $name. '=?';
    $stmt = $this->queryBind($sql, array($name=>$value));
    return $stmt->rowCount();
  }

  /************************/
  /*  MISC public methods */
  /************************/

  /**
   * Allow us to turn on/off the debug flag
   * for this object and/or adodb.
   *
   * @param mixed boolean TRUE/FALSE for on/off or
   *              an integer for the debug LEVEL
   * @param boolean Flag for adodb object.
   * @return none
   */
  public static function setDebugFlag($flag=TRUE) {
    self::$debug = $flag;
  }

  /**
   * This function is used to retrieve the PDO attributes.
   *
   * @return array
   */
  public function getAttributes() {
    $attributes = array("AUTOCOMMIT", "ERRMODE", "CASE", "CLIENT_VERSION", "CONNECTION_STATUS",
                        "DRIVER_NAME", "ORACLE_NULLS", "PERSISTENT", "PREFETCH", "SERVER_INFO",
                        "SERVER_VERSION", "TIMEOUT");
    $vals = array();
    foreach ($attributes as $val) {
      $key = "PDO::ATTR_" . $val;
      try {
        $vals[$key] = $this->db->getAttribute(constant($key));
      } catch (Exception $e) {
        $vals[$key] = 'NOT SUPPORTED';
      }
    }
    return $vals;
  }

  public function lastInsertId() {
    return $this->db->lastInsertId();
  }
  
  public function beginTransaction() {
    return $this->db->beginTransaction();
  }
  public function commit() {
    return $this->db->commit();
  }
  public function rollBack() {
    return $this->db->rollBack();
  }
  public function quote($str) {
    return $this->db->quote($str);
  }
}
?>
