<?php
/**
 * class APCCache
 * This class handles the APC cache.
 * @package Framework
 * @subpackage Cache
 */

class APCCache extends Cache {

  // instance of the class
  static private $instance = null;

  // lifetime and compression setings
  protected $lifetime = 0;
  protected $compressed = FALSE;

  // defaults
  const DEFAULT_LIFETIME   = 60;
  const DEFAULT_COMPRESSED = FALSE;

  /**
   * singleton function to return
   * the instance of the class
   *
   * @return APCCache or NoCache
   */
  public static function singleton() {
    if (!Cache::$enabled) {
      return NoCache::singleton();
    }
    if (!self::$instance) {
      self::$instance = new APCCache();
    }
    return self::$instance;
  }

  protected function init($cfg) {
    //Profiler::StartTimer("APCCache::init()");
    $this->enabled = (ini_get("apc.enabled") == 1) && $cfg["enabled"];
    $this->cfg = $cfg;
    $this->setLifeTime($this->cfg["timeout"]);
    //Profiler::StopTimer("APCCache::init()");
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
    $ret = false;

    if (!$this->enabled) return;

    $sdata = serialize($data);
    $lifetime = ( !empty($args["lifetime"]) ? $args["lifetime"] : (($this->lifetime > 0) ? $this->lifetime : self::DEFAULT_LIFETIME) );
    if (!apc_store($key, $sdata, $lifetime)) {
      Logger::error("Failed to set '$key' in APC cache");
    }

    return $ret;
  }
  
  /**
   * Returns the memcache key value.
   *
   * @param string $key
   * @return mixed
   */
  protected function getData($key) {
    $ret = false;

    if (!$this->enabled) return;

    $cachedresult = apc_fetch($key);
    if ($cachedresult !== false) {
      if (is_string($cachedresult))
        $ret = unserialize($cachedresult);
      else if (is_array($cachedresult)) {
        foreach ($cachedresult as $k=>$v) {
          $ret[$k] = unserialize($v);
        }
      } else {
        Logger::Error("Invalid datatype for '%s' in APC - expected serialized string, found %s", $key, gettype($cachedresult));
      }
    }
    return $ret;
  }

  /**
   * Deletes the memcache key.
   *
   * @param unknown_type $key
   */
  protected function deleteData($key) {
    if (!$this->enabled) return;
    return apc_delete($key);
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
}
