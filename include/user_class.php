<?
class User {
  protected static $instance = NULL;
  public static function authorized($to) {
    if ($this) {
      
    } else {
      //return self::getInstance()->authorized($to);
    }
    return true;
  }
  public static function getInstance() {
    if (self::$instance === NULL) {
      self::$instance = new User();
    }
    return self::$instance;
  }
}
