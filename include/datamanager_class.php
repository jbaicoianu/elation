<?
/**
 * class DataManager
 * Abstraction object for any type of queryable data source.  
 * Anything which supports or can emulate the standard CRUD 
 * functions can be used here.  Implements caching layer.
 * @package Framework
 * @subpackage Utils
 */

include_once("include/ormmanager_class.php");

class DataManager {

  var $cfg;
  var $sources;
  public static $querylog = array();
  protected static $querylog_page;
  protected static $querylog_reqid;

  function DataManager($cfg=NULL) {
    $this->Init($cfg);
  }

  protected static $instance;
  public static function singleton($args=NULL) {
    $name = __CLASS__;
    if (!self::$instance) {
      if (! empty($args)) {
        self::$instance = new $name($args);
      } else {
        self::$instance = null;
      }
    }
    return self::$instance;
  }

  function Init(&$cfg) {
    $this->cfg =& $cfg;
    Logger::Info("DataManager initializing");
    Profiler::StartTimer("DataManager::Init()", 1);

    //Profiler::StartTimer("DataManager::Init() - caches");
    if (!empty($this->cfg->servers["caches"])) {
      foreach ($this->cfg->servers["caches"] as $cachename=>$cachecfg) {
        $this->AddCaches($cachename, $cachecfg);
      }
    }
    //Profiler::StopTimer("DataManager::Init() - caches");

    //Profiler::StartTimer("DataManager::Init() - sources");
    if (!empty($this->cfg->servers["sources"])) {
      foreach ($this->cfg->servers["sources"] as $sourcename=>$sourcecfg) {
        $this->AddSource($sourcename, $sourcecfg);
      }
    }
    //Profiler::StopTimer("DataManager::Init() - sources");

    //include_once("config/outlet-conf.php");

    //$this->outlet = Outlet::getInstance();
    //print_pre($this->sources);
    Profiler::StopTimer("DataManager::Init()");
  }

  function AddCaches($cachetype, $cfg) {
    $mapping = array("memcache" => "MemcacheCache",
                     "diskcache" => "DiskCache",
                     "apc" => "APCCache",
                     );
    if (!empty($mapping[$cachetype]) && class_exists($mapping[$cachetype])) {
      foreach ($cfg as $cachename=>$cachecfg) {
        //print_pre("add cache $cachename (" . $mapping[$cachetype] . ")");
        //$cachewrapper = call_user_func(array($mapping[$cachetype], "singleton"));

        $this->caches[$cachetype][$cachename] = new $mapping[$cachetype]();
        $this->caches[$cachetype][$cachename]->initCache($cachecfg);
        Logger::Notice("Added cache '$cachetype.$cachename'");
      }
    } else {
      Logger::Debug("Tried to instantiate cache '$cachetype', but couldn't find class");
    }
  }
  function AddSource($sourcetype, $cfg) {
    if (!empty($cfg)) {
      Profiler::StartTimer("DataManager::Init() - Add source: $sourcetype", 3);

      // Check to see if we have a wrapper for this sourcetype in include/datawrappers/*wrapper_class.php
      // If it exists, include the code for it and initialize
      $includefile = "include/datawrappers/" . strtolower($sourcetype) . "wrapper_class.php";
      if (file_exists_in_path($includefile)) {
        include_once($includefile);
        foreach ($cfg as $sourcename=>$sourcecfg) {
          Profiler::StartTimer(" - $sourcetype($sourcename)", 3);
          // Server groups get special handling at this level so they can be applied to all types
          if (!empty($sourcecfg["group"]) && ($group = $this->GetGroup($sourcecfg["group"])) !== NULL) {
            Logger::Notice("Merged source group '{$sourcecfg['group']}' into $sourcename");
            $sourcecfg = array_merge_recursive($sourcecfg, $group);
          }
          
          $classname = $sourcetype . "wrapper";
          $sourcewrapper = new $classname($sourcename, $sourcecfg, true);
          if (!empty($sourcecfg["cache"]) && $sourcecfg["cache"] != "none") {
            if ($cacheobj = array_get($this->caches, $sourcecfg["cache"]))
              $sourcewrapper->SetCacheServer($cacheobj, any($sourcecfg["cachepolicy"], true));
          }
          array_set($this->sources, $sourcetype.".".$sourcename, $sourcewrapper);
          Logger::Notice("Added source '$sourcetype.$sourcename': " . $sourcecfg["host"]);
          Profiler::StopTimer(" - $sourcetype($sourcename)");
        }
      } else {
        Logger::Debug("Tried to instantiate source '$sourcetype', but couldn't find class");
      }
      Profiler::StopTimer("DataManager::Init() - Add source: $sourcetype");
    }
  }

  /** 
   * Determine source for a given id, then pass on all arguments to wrapper
   *
   * @param string $id (query identifier)
   * @param any $query
   * @param any $args
   * @param any $extras
   * @return object resultset
   **/

  static function &Query($id, $query, $args=NULL, $extras=NULL) {
    global $webapp;
    
    Profiler::StartTimer("DataManager::Query()");
    Profiler::StartTimer("DataManager::Query($id)", 3);
    $result = NULL;
    $qstart = microtime(true);

    $queryid = new DatamanagerQueryID($id);

    $source = DataManager::PickSource($queryid);
    if (!$source) {
      Logger::Error("Unable to determine source to serve request: %s", $queryid->name);
    }

    // Pull default caching policy from connection object, then force enabled/disable as requested
    $cache = $source->cachepolicy;
    if (!empty($queryid->args["nocache"]))
      $cache = false;
    if (!empty($queryid->args["cache"])) {
      $cache = any($source->cachepolicy, true);
    }
    // If the query string contains nocache, force to no cache
    if (!empty($webapp->request["args"]["nocache"])) {
      $cache = false;
    }

    $foundincache = false;
    if ($cache) {
      //Profiler::StartTimer("DataManager::Query() - Check cache");
      if (($cacheresult = $source->CacheGet($queryid, $query, $args)) !== NULL) {
        if ($cacheresult && !$cacheresult->isExpired()) {
          $result = $cacheresult->getPayload(false);
          $foundincache = true;
        }
      }
      //Profiler::StopTimer("DataManager::Query() - Check cache");
    }

    //Logger::Error("cache for $id: $cache");
    //Logger::Error("is result false ? " . ($result === false));
    if ($result === NULL && empty($queryid->args["nosource"])) {
      //Profiler::StartTimer("DataManager::Query() - Check Original Source");

      // We failed to retrieve anything from the cache - perform the real query
      if ($source) {
        $result = $source->query($queryid, $query, $args, $extras);
        //print_pre("replace $resourcename ($foundincache)");
        if ($cache && !$foundincache) {
          if (!empty($result)) // Only cache "positive" responses (FIXME - maybe this should be an option?  We should observe and make sure this change doesn't hurt more than it helps)
            $source->CacheSet($queryid, $query, $args, $result);
          /*
          else
            Logger::Error("Tried to cache empty dataset for key '{$queryid->name}' (query: $query, args: " . print_ln($args, true) . ")");
          */
        }
      }

      //Profiler::StopTimer("DataManager::Query() - Check Original Source");
    }

    // If result is STILL null, and we're in soft-expire-cache mode, let's use the expired data and throw a warning
    if ($result === NULL) {
      if ($cache == 2 && $cacheresult instanceOf CacheEntry) {
        $result = $cacheresult->getPayload(true);
        Logger::Warn("Cache for '%s' was soft-expired but we couldn't refresh it (%d seconds stale)", $queryid->name, (time() - $cacheresult->timestamp) - $cacheresult->timeout);
      }

    }

    Profiler::StopTimer("DataManager::Query()");
    Profiler::StopTimer("DataManager::Query($id)");
    self::log("query", $id, $query, $qstart, microtime(true), $foundincache);

    return $result;
  }

  /**
   * This function perform an insert query into table.
   *
   * @param string $id (resource id)
   * @param string $table
   * @param array $values
   * @return int (last insert id)
   */
  static function &QueryInsert($id, $table, $values, $extra=NULL) {
    Profiler::StartTimer("DataManager::QueryInsert()");
    Profiler::StartTimer("DataManager::QueryInsert($id)", 3);
    $qstart = microtime(true);
    $insert_id = NULL;
    $queryid = new DatamanagerQueryID($id);
    if ($source =& DataManager::PickSource($queryid)) {
      $insert_id = $source->QueryInsert($queryid, $table, $values, $extra);
      if ($insertid) {
        DataManager::CacheClear($id);
      }
    }
    Profiler::StopTimer("DataManager::QueryInsert()");
    Profiler::StopTimer("DataManager::QueryInsert($id)");
    self::log("insert", $id, $table, $qstart, microtime(true));
    return $insert_id;
  }

  /**
   * This function perform an update query on a row in the specified table.
   *
   * @param string $id (resource id)
   * @param string $table
   * @param array $values
   * @param array $where_condition
   * @return int (last insert id)
   */
  static function &QueryUpdate($id, $table, $values, $where_condition=NULL, $bind_vars=array()) {
    Profiler::StartTimer("DataManager::QueryUpdate()");
    Profiler::StartTimer("DataManager::QueryUpdate($id)", 3);
    $qstart = microtime(true);
    $rows_affected = NULL;
    $queryid = new DatamanagerQueryID($id);
    if ($source =& DataManager::PickSource($queryid)) {
      $rows_affected = $source->QueryUpdate($queryid, $table, $values, $where_condition, $bind_vars);
      if ($rows_affected > 0) {
        DataManager::CacheClear($id);
      }
    }
    Profiler::StopTimer("DataManager::QueryUpdate()");
    Profiler::StopTimer("DataManager::QueryUpdate($id)");
    self::log("update", $id, $table, $qstart, microtime(true));
    return $rows_affected;
  }

  /**
   * This function performs a delete query on a row in the specified table.
   *
   * @param string $id (resource id)
   * @param string $table
   * @param array $values
   * @param array $where_condition
   * @return int (last insert id)
   */
  static function &QueryDelete($id, $table, $where_condition=NULL, $bind_vars=array(), $extras=NULL) {
    Profiler::StartTimer("DataManager::QueryDelete()");
    Profiler::StartTimer("DataManager::QueryDelete($id)", 3);
    $qstart = microtime(true);
    $rows_affected = NULL;
    $queryid = new DatamanagerQueryID($id);
    if ($source =& DataManager::PickSource($queryid)) {
      $rows_affected = $source->QueryDelete($queryid, $table, $where_condition, $bind_vars, $extras);
    }
    Profiler::StopTimer("DataManager::QueryDelete()");
    Profiler::StopTimer("DataManager::QueryDelete($id)");
    self::log("delete", $id, $table, $qstart, microtime(true));
    return $rows_affected;
  }

  /**
   * This function perform a create query for the specified table.
   *
   * @param string $id (resource id)
   * @param string $table
   * @param array $values
   * @param array $where_condition
   * @return int (last insert id)
   */
  static function &QueryCreate($id, $table, $columns) {
    Profiler::StartTimer("DataManager::QueryCreate()", 1);
    Profiler::StartTimer("DataManager::QueryCreate($id)", 3);
    $qstart = microtime(true);
    $rows_affected = NULL;
    $queryid = new DatamanagerQueryID($id);
    if ($source =& DataManager::PickSource($queryid)) {
      $rows_affected = $source->QueryCreate($queryid, $table, $columns);
    }
    Profiler::StopTimer("DataManager::QueryCreate()");
    Profiler::StopTimer("DataManager::QueryCreate($id)");
    self::log("create", $id, $table, $qstart, microtime(true));
    return $rows_affected;
  }

  /**
   * This function performs a fetch query from the specified table
   *
   * @param string $id (resource id)
   * @param string $table
   * @param array $where
   * @return object $result
   */
  static function &QueryFetch($id, $table, $where=NULL, $extra=NULL) {
    Profiler::StartTimer("DataManager::QueryFetch()");
    Profiler::StartTimer("DataManager::QueryFetch($id)", 3);
    $qstart = microtime(true);
    $result = NULL;
    $queryid = new DatamanagerQueryID($id);
    if ($source =& DataManager::PickSource($queryid)) {
      // Pull default caching policy from connection object, then force enabled/disable as requested
      $cache = $source->cachepolicy;
      if (!empty($queryid->args["nocache"]))
        $cache = false;
      if (!empty($queryid->args["cache"])) {
        $cache = any($source->cachepolicy, true);
      }
      $query = "SELECT *"; // FIXME - quick hack to trick CacheSet into thinking this is a simple select

      $foundincache = false;
      if ($cache) {
        //Profiler::StartTimer("DataManager::Query() - Check cache");
        if (($cacheresult = $source->CacheGet($queryid, $query, $args)) !== NULL) {
          if ($cacheresult && !$cacheresult->isExpired()) {
            $result = $cacheresult->getPayload(false);
            $foundincache = true;
          }
        }
        //Profiler::StopTimer("DataManager::Query() - Check cache");
      }

      if ($result === NULL && empty($queryid->args["nosource"])) {
        $result = $source->QueryFetch($queryid, $table, $where, $extra);
        if ($cache && !$foundincache && !empty($result)) {
          $source->CacheSet($queryid, $query, $args, $result);
        }
      }
    }
    Profiler::StopTimer("DataManager::QueryFetch()");
    Profiler::StopTimer("DataManager::QueryFetch($id)");
    self::log("fetch", $id, $table, $qstart, microtime(true));
    return $result;
  }
  /**
   * This function performs a count query from the specified table
   *
   * @param string $id (resource id)
   * @param string $table
   * @param array $where
   * @return integer $count
   */
  static function &QueryCount($id, $table, $where, $extra=NULL) {
    Profiler::StartTimer("DataManager::QueryCount()");
    Profiler::StartTimer("DataManager::QueryCount($id)", 3);
    $qstart = microtime(true);
    $count = 0;
    $queryid = new DatamanagerQueryID($id);
    if ($source =& DataManager::PickSource($queryid)) {
      $count = $source->QueryCount($queryid, $table, $where, $extra);
    }
    Profiler::StopTimer("DataManager::QueryCount()");
    Profiler::StopTimer("DataManager::QueryCount($id)");
    self::log("count", $id, $table, $qstart, microtime(true));
    return $count;
  }
  
  static function CacheClear($id) {
    $queryid = new DatamanagerQueryID($id);
    if ($source =& DataManager::PickSource($queryid)) {
      $source->CacheClear($queryid);
    } else if ($this->caches["memcache"]["data"] !== NULL) {
      Logger::Notice("Forcing deletion of memcache item '%s'", $queryid->name);
      $this->caches["memcache"]["data"]->delete($queryid->name);
    }
  }
  function CacheFlush() {
    if ($this->caches["memcache"]["data"]) {
      Logger::Error("Flushing all memcache data");
      $this->caches["memcache"]["data"]->flush();
      return true;
    }
    return false;
  }
  static function &PickSource($queryid) {
    //Profiler::StartTimer("DataManager::PickSource()");

    $chosensource = NULL;

    $parts = explode(".", $queryid->name);
    $data = self::singleton();
    $sources =& $data->sources;
    foreach ($parts as $num=>$part) {
      if (!empty($sources[$part])) {
        if (is_array($sources[$part])) {
          $sources =& $sources[$part];
        } else if (is_subclass_of($sources[$part], "connectionwrapper")) {
          $chosensource =& $sources[$part];
          break;
        }
      } else {
          break;
      }
    }

    if ($chosensource === NULL && !empty($data->sources[$parts[0]]) && !empty($data->sources[$parts[0]]["default"]))
      $chosensource =& $data->sources[$parts[0]]["default"];

    //Profiler::StopTimer("DataManager::PickSource()");
    return $chosensource;
  }

  function GetGroup($groupname) {
    //Profiler::StartTimer("GetGroup($groupname)");
    $ret = NULL;
    if (!empty($this->cfg->servers["groups"][$groupname])) {
      $ret = $this->cfg->servers["groups"][$groupname];
      if (is_string($ret["servers"])) { // If 'servers' is a string, assume it's a space-separated list
        $servers = explode(" ", $ret["servers"]);
        $ret["servers"] = array();
        for ($i = 0; $i < count($servers); $i++) {
          $ret["servers"][$i] = array("host" => $servers[$i]);
        }
      }
      if (!empty($ret["bucketcfg"])) {
        $fname = $this->cfg->locations["config"] . '/' . $ret["bucketcfg"];
        if (file_exists($fname)) {
          $lines = file($fname);
          $bucketnum = 0;
          $filever = (strpos($lines[0], "bucket:") ? 1 : 2);
          foreach ($lines as $line) {
            if ($filever == 1) {
              $parts = explode(": ", trim($line));
              if ($parts[0] == "servers") {
                $servers = explode(", ", $parts[1]);
                for ($i = 0; $i < count($servers); $i++) {
                  $ret["servers"][$i]["host"] = $servers[$i];
                }
              } else if ($parts[0] == "bucket") {
                $bucketinfo = explode(", ", $parts[1]);
                $bucketname = array_shift($bucketinfo);
                $ret["buckets"][$bucketnum++] = array("name" => $bucketname, "servers" => $bucketinfo);
              }
            } else {
              $foo = sscanf($line, "%s %d %d\n");
              $ret["buckets"][$bucketnum++] = array("name" => $foo[0], "servers" => array($foo[1], $foo[2]));
            }
          }
        }
      }
    }
    //Profiler::StopTimer("GetGroup($groupname)");
    //print_pre($ret);
    return $ret;
  }

  function Quit() {
    if (!empty(self::$querylog)) {
      foreach (self::$querylog as $q) {
        $id = explode(".", $q["id"]);
        if ($id[0] != "stats") {
          self::Query("stats.default.querylog", "www.querylog.{$q["type"]}", json_encode($q));
        }
      }
    }
    $this->CloseAll($this->sources);
  }
  function CloseAll(&$sources) {
    foreach ($sources as $source) {
      if (is_array($source)) {
        $this->CloseAll($source);
      } else if (is_subclass_of($source, "connectionwrapper")) {
        $source->Close();
      }
    }

  }

  function LoadModel($model) {
    $ormmgr = OrmManager::singleton();
    $ormmgr->LoadModel($model);
  }

  static function BeginTransaction($id) {
    Profiler::StartTimer("DataManager::BeginTransaction()");
    $queryid = new DatamanagerQueryID($id);
    if ($source =& DataManager::PickSource($queryid)) {
      $ret = $source->BeginTransaction($queryid);
    }
    Profiler::StopTimer("DataManager::BeginTransaction()");
    Logger::Notice("Beginning transaction for queryid {$queryid->id}");
    return $ret;
  }

  static function Commit($id) {
    Profiler::StartTimer("DataManager::Commit()");
    $queryid = new DatamanagerQueryID($id);
    if ($source =& DataManager::PickSource($queryid)) {
      $ret = $source->Commit($queryid);
    }
    Profiler::StopTimer("DataManager::Commit()");
    Logger::Notice("Committed transaction for queryid {$queryid->id}");
    return $ret;
  }

  static function Rollback($id) {
    Profiler::StartTimer("DataManager::Rollback()");
    $queryid = new DatamanagerQueryID($id);
    if ($source =& DataManager::PickSource($queryid)) {
      $ret = $source->Rollback($queryid);
    }
    Profiler::StopTimer("DataManager::Rollback()");
    Logger::Notice("Rolled back transaction for queryid {$queryid->id}");
    return $ret;
  }
  static function Quote($id, $str) {
    Profiler::StartTimer("DataManager::Quote()");
    $queryid = new DatamanagerQueryID($id);
    if ($source =& DataManager::PickSource($queryid)) {
      $ret = $source->Quote($queryid, $str);
    }
    Profiler::StopTimer("DataManager::Quote()");
    return $ret;
  }
  static function sanitize($id) {
    return preg_replace("/[^a-zA-Z0-9_\-.\/ ]/", "_", (is_array($id) ? implode("_", $id) : $id));
  }


  // Simple remappings
  static function &insert($id, $table, $values, $extra=NULL) {
    return self::QueryInsert($id, $table, $values, $extra);
  }
  static function &update($id, $table, $values, $where_condition=NULL, $bind_vars=array()) {
    return self::QueryUpdate($id, $table, $values, $where_condition, $bind_vars);
  }
  static function &delete($id, $table, $where_condition=NULL, $bind_vars=array(), $extras=NULL) {
    return self::QueryDelete($id, $table, $where_condition, $bind_vars, $extras=NULL);
  }
  static function &create($id, $table, $columns) {
    return self::QueryCreate($id, $table, $columns);
  }
  static function &fetch($id, $table, $where=NULL, $extra=NULL) {
    return self::QueryFetch($id, $table, $where, $extra);
  }
  static function &count($id, $table, $where, $extra=NULL) {
    return self::QueryCount($id, $table, $where, $extra);
  }

  static private function log($type, $id, $table, $start, $end, $cached=false) {
    if (empty(self::$querylog_reqid)) {
      self::$querylog_reqid = rand();
    }
    self::$querylog[] = array("reqid" => self::$querylog_reqid, "id" => $id, "type" => $type, "time" => ($end - $start), "cached" => $cached); 
  }
}

/**
 * class DataManagerQueryID
 * Query identifier, including name, hash, and args
 * @package Framework
 * @subpackage Utils
 */
class DataManagerQueryID {
  public $id;
  public $name;
  public $hash;
  public $args;

  function __construct($idstr=NULL) {
    if ($idstr !== NULL)
      $this->parse($idstr);
  }
  function parse($id) {
    $this->id = $id;
    if (preg_match("/^((.*?)(?:\#(.*?))?)(?:\:(.*?))?$/", $id, $m)) {
      $this->id = $m[1];
      if (!empty($m[2]))
        $this->name = $m[2];
      if (!empty($m[3]))
        $this->hash = $m[3];
      if (!empty($m[4])) {
        $rargs = explode(";", $m[4]);
        $this->args = array();
        foreach ($rargs as $rarg) {
          if (strpos($rarg, "=") !== false) {
            list($k, $v) = explode("=", $rarg, 2);
            $this->args[$k] = $v;
          } else {
            $this->args[$rarg] = true;
          }
        }
      }
    }
  }
}
