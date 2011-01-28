<?php
/**
 * class NoCache
 * No cache class
 * @package Framework
 * @subpackage Cache
 */

class NoCache extends Cache {

  // instance of the class
  static private $instance = null;

  /**
   * singleton function to return
   * the instance of the class
   *
   * @return NoCache
   */
  public static function singleton() {
    if (!self::$instance) {
      self::$instance = new NoCache();
    }
    return self::$instance;
  }

  /*****************************************************
   *** Implement the abstract classes of parent      ***
   *****************************************************/

  protected function initCache() {
    // do nothing
  }

  protected function setData($key, $data, $args=NULL) {
    // do nothing
  }

  protected function getData($key) {
    return false;
  }

  protected function deleteData($key) {
    // do nothing
  }

}

?>
