<?php
/**
 * class DiskCache
 * This class handles the disk cache.
 * @package Framework
 * @subpackage Cache
 */

class DiskCache extends Cache {

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
   * @return Memcache or NoCache
   */
  public static function singleton() {
    if (!Cache::$enabled) {
      return NoCache::singleton();
    }
    if (!self::$instance) {
      self::$instance = new DiskCache();
    }
    return self::$instance;
  }

  protected function init($cfg) {
    //Profiler::StartTimer("DiskCache::init()");
    $this->cfg = $cfg;
    //Profiler::StopTimer("DiskCache::init()");
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
    $diskcache = $this->getCachePaths($key);
    
    Logger::Info("Caching result for '%s' to file: '%s'", $key, $diskcache["fullpath"]);
          
    if (!file_exists($diskcache["basedir"]) && is_writable($diskcache["root"])) {
      mkdir($diskcache["basedir"], 0777, true);
    }
    if (file_exists($diskcache["basedir"]) && is_writable($diskcache["basedir"])) {
      $gzdata = gzencode(serialize($data));
      $fp = fopen($diskcache["fullpath"], "w");
      if (flock($fp, LOCK_EX)) {
        fwrite($fp, $gzdata);
        flock($fp, LOCK_UN);
      } else {
        Logger::Error("Failed to get lock for '%s' (%s)", $key, $diskcache["fullpath"]);
      }
      fclose($fp);
      $ret = true;
    } else {
      Logger::Warn("Could not write to disk cache location '" . $this->cfg["location"] . "', caching disabled");
      $ret = false;
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
    $diskcache = $this->getCachePaths($key);
    
    $ret = false;
    if (file_exists($diskcache["fullpath"])) {
      if (filemtime($diskcache["fullpath"]) < $this->lifetime) {
        Logger::Warn("Unlinking stale cachefile '" . $diskcache["fullpath"] . "'");
        unlink($diskcache["fullpath"]);
      } else {
        $fp = fopen($diskcache["fullpath"], "r");
        if (flock($fp, LOCK_SH)) {
          //$cachedresult = file_get_contents($diskcache["fullpath"]);
          $cachedresult = fread($fp, filesize($diskcache["fullpath"]));
          flock($fp, LOCK_UN);
          if (!empty($cachedresult)) {
            Profiler::StartTimer("DataManager::Query() - load from cachefile");
            Logger::Info("Loaded cached result for '%s' from file: '%s'", $key, $diskcache["fullpath"]);
            $result = unserialize(gzdecode($cachedresult));
            if ($result !== false) {
              $ret = $result;
            }
            Profiler::StopTimer("DataManager::Query() - load from cachefile");
          }
        } else {
          Logger::Error("Failed to get shared lock for '%s' (%s)", $key, $diskcache["fullpath"]);
        }
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
   ***** Helper methods that are diskcache specific *****
   *****************************************************/

  protected function getCachePaths($key) {
    $pathparts = explode(".", $key);
    $ret["root"] = $this->cfg["location"];
    $ret["fname"] = array_pop($pathparts) . ".gz";

    //$pathparts[] = substr(md5($ret["fname"]), 0, 1);
    $ret["path"] = implode("/", $pathparts);
    $ret["basedir"] = $ret["root"] . "/" . $ret["path"];
    $ret["fullpath"] = sprintf("%s/%s", $ret["basedir"], $ret["fname"]);
    
    return $ret;
  }

  public function Ping() {
    $ret = (file_exists($this->cfg["location"]) && is_writable($this->cfg["location"]));
    return $ret;
  }
}