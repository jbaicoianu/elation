<?php
include_once("include/datawrappers/connectionwrapper_class.php");

class MemcacheWrapper extends ConnectionWrapper {
  public $cfg;
  protected $servers;
  public $cache;

  function __construct($name, $cfg, $lazy=false) {
    parent::__construct($name, $cfg, $lazy);

    // default if not set
    $timeout = ($this->cfg["timeout"] > 0 ? $this->cfg["timeout"] : 0);
    $persist = ($this->cfg["persist"] ? true : false);

    $this->cache = new Memcache();

    // add to the list
    if (!empty($this->cfg["servers"])) {
      // If it's a string, assume it's space-separated
      if (is_string($this->cfg["servers"])) {
        $this->cfg["servers"] = explode(" ", $this->cfg["servers"]);
      }
      foreach ($this->cfg["servers"] as $server) {
        list($host, $port) = explode(":", $server);
        if (empty($port)) 
          $port = 11211; // default memcache port

        //Profiler::StartTimer("MemcacheCache::addServers()");
        $this->servers[$host] = $params = array("port"    => $port,
                                                "timeout" => $timeout,
                                                "persist" => $persist);
        Logger::Info("Added memcache server - %s:%s (persist=%d)", $host, $params["port"], $params["persist"]);

        $this->cache->addServer($host, $params["port"], $params["persist"]);
        //Profiler::StopTimer("MemcacheCache::addServers()");

      }
    }
  }
  function Open() {
  }
  function Close($servernum=0) {
  }
  function Ping($servernum) {
    return ($this->conn[$servernum] !== NULL && $this->conn[$servernum]->isConnected());
  }
  function &Query($queryid, $query, $args=NULL) {
    return $this->QueryFetch($queryid, $query, $args);
  }
  function &QueryInsert($queryid, $table, $values, $extra=NULL) {
    $lifetime = any($args["lifetime"], $this->lifetime, 0);
    $compressed = any($this->compressed, MEMCACHE_COMPRESSED);
    $sdata = serialize($values);
    $key = $table;
    if ($queryid->hash !== NULL && $queryid->hash != $table) {
      $key .= "." . $queryid->hash;
    }
    if ($this->cache) {
      if (!$this->cache->set($key, $sdata, $compressed, $lifetime)) {
        Logger::Error('Failed to set (' . $key . ') in Memcache::setdata');
      } else {
        return true;
      }
    } else {
      Logger::Error("Could not access memcache object for '$key'");
    }
    return false;
  }
  function &QueryUpdate($queryid, $table, $values, $where_condition, $bind_vars=array()) {
    return $this->QueryInsert($queryid, $table, $values, $where_condition, $bind_vars);
  }
  function &QueryDelete($queryid, $table, $where_condition, $bind_vars=array()) {
    $key = $table;
    if ($where_condition !== NULL) {
      $key .= "." . $where_condition;
    }
    return $this->cache->delete($key);
  }
  function &QueryFetch($queryid, $table, $where=NULL, $extra=NULL) {
    $key = $table;
    if ($where !== NULL) {
      $key .= "." . $where;
    }
    $cachedresult = $this->cache->get($key);
    if ($cachedresult) {
      if (is_string($cachedresult))
        $ret = unserialize($cachedresult);
      else if (is_array($cachedresult)) {
        foreach ($cachedresult as $k=>$v) {
          $ret[$k] = unserialize($v);
        }
      }
      else
        Logger::Error("Invalid datatype for '%s' in memcache - expected serialized string, found %s", $key, gettype($cachedresult));
    }
    return $ret;
  }
}
