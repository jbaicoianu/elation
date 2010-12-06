<?php
/**
 * class SessionManager
 * Implements MySQL-backed PHP session handling
 * for persist session data and with memcache
 * for the session data.
 * @package Framework
 * @subpackage Utils
 */
/*
 * Table creation code:
 * <code>
 * CREATE TABLE usersession (
 *   fl_uid      char(32)            PRIMARY KEY,
 *   data        blob,
 *   touched     timestamp,
 *   ip_addr     int(10)    unsigned NOT NULL,
 *   create_time int(10)    unsigned NOT NULL,
 *   KEY touched (touched)
 * );
 * </code>
 */

class SessionManager {
  var $cache_obj;                    // session memcache object
  var $cookiename = "flsid";         // session cookie name
  var $session_cache_expire = 3600;  // session memcache expiration in seconds
  var $crc;                          // crc value of the $_SESSION["persist"]
  var $fluid;                        // permenant session ID (done via cookie)
  var $has_db_record = false;        // flag on whether this user has an existing persist record
  var $flsid;                        // temporary session ID (actual session id)
  var $flssid;                       // unique ID for each script session
  var $counter = 0;                  // counter (should be a static variable) 
  var $persist;                      // pointers to memory areas within $_SESSION 
  var $temporary;
  var $is_new_user;                  // flag to indicate if this is a new user (no fl-uid) 
  var $is_new_session = 0;           // determine if it is a new session 

  protected static $instance;
  public static function singleton($args=NULL) { $name = __CLASS__; if (!self::$instance) { self::$instance = new $name($args); } return self::$instance;  }

  function __construct() {
    $this->init();
  }
  
  function init() {
    // TODO - this needs to implement custom session handler functions before we can go live
    /*
    session_set_save_handler(
      array(&$this, 'open'),
      array(&$this, 'close'),
      array(&$this, 'read'),
      array(&$this, 'write'),
      array(&$this, 'destroy'),
      array(&$this, 'gc')
    );
    */
    // set the session cookie name
    session_name($this->cookiename);

    // set the cache limiter to 'private' - keeps us from sending Pragma: no-cache
    session_cache_limiter('private');

    // initiate sessionization
    session_start();
  }
}
