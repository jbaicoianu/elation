<?php
/**
 * class Cache
 * Parent abstract class object for caching.
 * @package Framework
 * @subpackage Cache
 */

abstract class Cache {

  // global flag on whether cache is enabled
  public static $enabled = TRUE;
  public $localcacheenabled = true;

  // instance of the configuration object
  protected $cfg = null;
  protected $localcache = array();

  /**
   * Constructor.
   * Inits the cache.
   * Implemented by the child class.
   */
  public function __construct() {
    //$this->initCache();
  }

  /**
   * Sets the cache key.
   *
   * @param string $key
   * @param mixed $data
   */
  public final function set($key, $data, $args=NULL) {
    if (!empty($this->cfg["prefix"]))
      $key = $this->cfg["prefix"] . "." . $key;

      $this->setData($key, $data, $args);
      if ($this->localcacheenabled && isset($this->localcache[$key]))
        unset($this->localcache[$key]);
  }
  
  /**
   * Gets the cache value by key.
   *
   * @param string $key
   * @return mixed
   */
  public final function get($key) {
    if (!empty($this->cfg["prefix"]))
      $key = $this->cfg["prefix"] . "." . $key;
    if ($this->localcacheenabled && isset($this->localcache[$key])) {
      //Logger::Debug("Found cache entry '$key' in local cache, skipping lookup");
      $ret = $this->localcache[$key];
    } else {
      $ret = $this->getData($key);
      if ($this->localcacheenabled)
        $this->localcache[$key] = $ret;
    }
    return $ret;
  }

  /**
   * Deletes the cache key.
   *
   * @param string $key
   */
  public final function delete($key) {
    if (!empty($this->cfg["prefix"]))
      $key = $this->cfg["prefix"] . "." . $key;
    $this->deleteData($key);
    if ($this->localcacheenabled && isset($this->localcache[$key]))
      unset($this->localcache[$key]);
  }

  /**
   * Set cache setting flag
   *
   * @param unknown_type $flag
   */
  public static function enableCache($flag) {
    self::$enabled = ($flag == true) ? true : false;
  }

  /**
   * Return the cache enabled flag.
   *
   * @return boolean
   */
  public static function isCacheEnabled() {
    return self::$enabled;
  }

  /**
   * Sets config for this cache object
   *
   * @param array $cfg
   */
  public final function setConfig($cfg) {
    $this->cfg = $cfg;
  }
  /*****************************************************
   *** Abstract functions implemented by child class ***
   *****************************************************/

  abstract public function initCache($cfg);

  abstract protected function setData($key, $data);

  abstract protected function getData($key);

  abstract protected function deleteData($key);
  
  abstract protected function setLifeTime($time);

  abstract protected function setCompressed($flag);

}

/**
 * class CacheEntry
 * Represents a cached item with softexpiry support
 * @package Framework
 * @subpackage Cache
 */
class CacheEntry {
  public $id;
  public $payload;
  public $soft;
  public $timeout;
  public $timestamp;
  
  function __construct($id, $payload, $soft=false, $timeout=NULL) {
    $this->id = $id;
    $this->payload = $payload;
    $this->soft = $soft;
    $this->timeout = any($timeout, 0);
    $this->timestamp = time();
  }

  function getPayload($force) {
    $ret = NULL;
    if (!$this->soft || $force || !$this->isExpired())
      $ret = $this->payload;

    //print_pre($ret);
    return $ret;
  }

  function isExpired() {
    if ($this->soft) {
      $now = time();
      $ret = ($this->timestamp + $this->timeout < $now);
      //print_pre("isExpired ? " . sprintf("%d + %d < %d (%d)", $this->timestamp, $this->timeout, $now, $ret));
      //$this->getProbability(20);
      if ($ret)
        Logger::Info("Soft-expiring '{$this->id}'");
    } else {
      $ret = ($this->payload === NULL);
      //print_pre("isExpired ? $ret");
    }
    return $ret;
  }

  function getProbability($factor) {
    $now = time();
    $exp = ($this->timeout - ($now - $this->timestamp)) / $this->timeout;
    $blah = pow(2, $factor * $exp);
    print_pre($blah . ", " . ($this->timeout - ($now - $this->timestamp)) . " to go");
  }
}
