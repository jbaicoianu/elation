<?

/**
 * class ConnectionWrapper
 * Generic connection wrapper object
 * @package Framework
 * @subpackage Datasources
 */
class ConnectionWrapper {
  var $name = "(unnamed)";
  var $conn = NULL;
  var $cache = NULL;
  var $cachepolicy = false;
  var $cachetimeout = NULL;
  var $cfg = NULL;
  var $lazy = false;
  var $blacklisted = array(false);

  function ConnectionWrapper($name, $cfg, $lazy=false) {
    $this->name = $name;
    $this->cfg = $cfg;
    $this->lazy = $lazy;

    if (!$this->lazy)
      $this->Open();
  }

  function Open($queryid=NULL) { return false; }
  function Close() { return false; }
  function &Query($queryid, $query, $args=NULL) { return false; }
  function &QueryInsert($queryid, $table, $values) { return false; }
  function &QueryUpdate($queryid, $table, $values, $where_condition, $bind_vars=array()) { return false; }
  function &QueryDelete($queryid, $table, $where_condition, $bind_vars=array()) { return false; }
  function &QueryCreate($queryid, $table, $values) { return false; }
  function &QueryFetch($queryid, $table, $where=NULL, $extras=NULL) { return false; }
  function &QueryCount($queryid, $table, $where=NULL, $extras=NULL) { return false; }
  function GenerateIndex($indexby, $item, $separator=".") {
   $idxby = explode(",", $indexby);
    foreach ($idxby as $k) {
      $key[] = $item[$k];
    }
    return implode($separator,$key);
  }
  function SetCacheServer($cache, $cacheByDefault=NULL) { 
    $this->cache = $cache;
    $this->cachepolicy = any($cacheByDefault, $this->cfg["cachepolicy"], false);
    $this->cachetimeout = any($this->cfg["cachetimeout"], $cache->timeout, 0);
  }
  function &CacheGet($queryid, $query, $args=NULL) { 
    $ret = false; 
    if ($this->cache) {
      $resource = $this->cache->get($queryid->id); 
      if ($resource !== NULL) {
        switch ($this->cachepolicy) {
        case 1:
          $ret = new CacheEntry($queryid->id, $resource);
          break;
        case 2:
          $ret = $resource; // Already a CacheEntry object
          break;
        }
      }
    } else {
      Logger::Warn("Cannot get '{$queryid->id}' from cache - no cache associated with this connection");
    }
    return $ret;
  }
  function &CacheSet($queryid, $query, $args=NULL, $result) { 
    if ($this->cache) {
      switch ($this->cachepolicy) {
      case 1:
        $this->cache->set($queryid->id, $result);
        break;
      case 2:
        $this->cache->set($queryid->id, new CacheEntry($queryid->id, $result, true, $this->cachetimeout));
        break;
      }
    } else {
      Logger::Warn("Cannot set '{$queryid->id}' in cache - no cache associated with this connection");
    }
  }
  function CacheClear($queryid, $query=NULL, $args=NULL) { 
    if ($this->cache) {
      $this->cache->delete($queryid->id);
      Logger::Notice("Forcing deletion of cache item '{$queryid->id}' for connection '{$this->name}'");
    }
  }
  function Ping($queryid) { return !($this->conn === NULL || (is_resource($this->conn) && get_resource_type($this->conn) == "socket" && feof($this->conn))); }

  function LazyOpen($num=0) {
    if ($this->lazy && empty($this->blacklisted[$num])) {
      $pingstatus = $this->Ping($num);
      if ($pingstatus) {
        $ret = true;
      } else {
        // Not connected, let's see what we can do
        Logger::Notice("Establishing connection: $this->name");
        if ($this->Open($num)) {
          $ret = true;
        } else {
          $this->blacklisted[$num] = true;
          $ret = false;
        }
      }
    } else {
      $ret = false;
    }
    return $ret;
  }
}
