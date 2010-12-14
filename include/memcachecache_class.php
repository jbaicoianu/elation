<?php
/**
 * class MemcacheCache
 * This class handles memcache
 * @package Framework
 * @subpackage Cache
 */

class MemcacheCache extends Cache {

  // instance of the class
  static private $instance = null;

  // instance of PECL Memcache object
  protected $cache_obj;

  // list of memcache servers
  protected $servers = array();

  // lifetime and compression setings
  protected $lifetime = 0;
  protected $compressed = FALSE;

  // defaults
  const DEFAULT_LIFETIME   = 600;
  const DEFAULT_COMPRESSED = FALSE;

  /**
   * singleton function to return
   * the instance of the class
   *
   * @return Memcache or NoCache
   */
  public static function singleton() {
    if (!Cache::$enabled) {
      return NoCache::singleton();
    }
    if (!self::$instance) {
      self::$instance = new MemcacheCache();
    }
    return self::$instance;
  }

  /**
   * Checks the configuration and
   * set the appropriate flag on caching.
   */
  protected function init($cfg) {
    Profiler::StartTimer("MemcacheCache::init()");

    // instantiate the memcache object
    $this->cache_obj = new Memcache();

    /**
     * Set up the rootdir for the command line scripts from /util.
     * If the entry point is through webapp, the ConfigManager should
     * have already been instantiated.
     */    
    /*
    $root = preg_replace("|/util$|", "", getcwd());
    ini_set("include_path", ini_get('include_path') . ':' . $root);

    $this->cfg = ConfigManager::singleton($root);
    */

    $this->cfg = $cfg;

    $flag = (!empty($this->cfg) ? TRUE : FALSE);
    $this->enableCache($flag);
    // set the lifetime and compression flag here
    $this->setLifeTime($this->cfg["timeout"]);
    $this->setCompressed($this->cfg["compressed"]);

    // add servers
    $this->addServers();

    Profiler::StopTimer("MemcacheCache::init()");
  }
  /**
   * This method adds the memcache servers
   * child class.  It adds the list of memcache servers.
   *
   */
  protected function addServers() {
    // default if not set
    $timeout = ($this->cfg["timeout"] > 0) ? $this->cfg["timeout"] : 0;
    $persist = ($this->cfg["persist"]) ? true : false;

    // add to the list
    foreach ($this->cfg["servers"] as $server) {
      list($host, $port) = explode(":", $server);
      if (empty($port)) 
        $port = 11211; // default memcache port

      //Profiler::StartTimer("MemcacheCache::addServers()");
      $this->servers[$host] = $params = array("port"    => $port,
                                              "timeout" => $timeout,
                                              "persist" => $persist);
      //Logger::Info("Added memcache server - %s:%s (persist=%d)", $host, $params["port"], $params["persist"]);

      $this->cache_obj->addServer($host, $params["port"], $params["persist"]);
      //Profiler::StopTimer("MemcacheCache::addServers()");

    }
  }

  /**
   * This abstract class will be implemented by the
   * child class.  It connects the list of memcache
   * servers added.
   */
  protected function connectServers() {
    // if no servers, error out
    if (empty($this->servers)) {
      throw new Exception('No memcache servers to connect to.');
    }

    foreach($this->servers as $host => $params) {
      Logger::Info("Added memcache server - %s:%s (persist=%d)", $host, $params["port"], $params["persist"]);
      $this->cache_obj->addServer($host, $params["port"], $params["persist"]);
    }
  }

  /*****************************************************
   *** Implement the abstract classes of parent      ***
   *****************************************************/

  /**
   * Initialize the memcache.
   * Add the memcache servers to the list.
   * Adding the servers will be handled by
   * the child class.
   */
  public function initCache($cfg) {
    // call init to load the configurations
    $this->init($cfg);
  }

  /**
   * Sets (add or replace) a memcache key/value pair.
   *
   * @param string $key
   * @param mixed $data
   */
  protected function setData($key, $data, $args=NULL) {
    /**
     * $lifetime and $compressed can be overwritten if passed into the function.
     * Else, use the setting.
     */
    Profiler::StartTimer("MemcacheCache::setData()");
    Profiler::StartTimer("MemcacheCache::setData($key)", 4);
    //$lifetime = ( !empty($args["lifetime"]) ? $args["lifetime"] : (($this->lifetime > 0) ? $this->lifetime : self::DEFAULT_LIFETIME) );
    $lifetime = any($args["lifetime"], $this->lifetime, self::DEFAULT_LIFETIME);
    $compressed = (! isset($this->compressed)) ? $this->compressed : self::DEFAULT_COMPRESSED;
    $sdata = serialize($data);
    if ($this->cache_obj) {
      if (!$this->cache_obj->set($key, $sdata, $compressed, $lifetime)) {
        /**
         * @todo
         * Review to see if we should throw an exception here.
         * Throwing an exception here will cause the script to abort.
         * Since the memcache key can potentially be deleted from the admin interface,
         * we should just log this as an error instead.
         */
        // throw new Exception('Failed to set (' . $key . ') in Memcache::setData');
        Logger::Error('Failed to set (' . $key . ') in Memcache::setdata');
      }
    } else {
      Logger::Error("Could not access memcache object for '$key'");
    }
    Profiler::StopTimer("MemcacheCache::setData()");
    Profiler::StopTimer("MemcacheCache::setData($key)");
  }

  /**
   * Returns the memcache key value.
   *
   * @param string $key
   * @return mixed
   */
  protected function getData($key) {
    $ret = NULL;

    Profiler::StartTimer("MemcacheCache::getData()");
    Profiler::StartTimer("MemcacheCache::getData($key)", 4);
    $cachedresult = $this->cache_obj->get($key);
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
    Profiler::StopTimer("MemcacheCache::getData()");
    Profiler::StopTimer("MemcacheCache::getData($key)");

    return $ret;
  }

  /**
   * Deletes the memcache key.
   *
   * @param unknown_type $key
   */
  protected function deleteData($key) {
    if ($this->localcacheenabled && isset($this->localcache[$key]))
      unset($this->localcache[$key]);
    return $this->cache_obj->delete($key);
  }

  /**
   * This methods sets the cache key lifetime.
   * It implements the asbtract class of the parent class.
   *
   * @param int $time
   */
  protected function setLifeTime($time) {
    $this->lifetime = ($time >= 0) ? $time : 0;
  }

  /**
   * This methods sets the compressed flag for the memcache.
   * It implements the abstract method of the parent class.
   *
   * @param boolean $flag
   */
  protected function setCompressed($flag) {
    $this->compressed = ($flag) ? $flag : FALSE;
  }

  /*****************************************************
   ***** Helper methods that are memcache specific *****
   *****************************************************/

  /**
   * Deletes all the memcache keys.
   *
   * @return bool
   */
  public function flush() {
    return $this->cache_obj->flush();
  }

  /**
   * This method returns the memcache stat
   * (e.g. hits, misses, usages, etc.)
   *
   * @return array
   */
  public function getExtendedStats() {
    return $this->cache_obj->getExtendedStats();
  }

}
?>
