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

class SessionManager
{
  public $cache_obj;                    // session memcache object
  public $cookiename = "flsid";         // session cookie name
  public $session_cache_expire = 3600;  // session memcache expiration in seconds
  public $crc;                          // crc value of the $_SESSION["persist"]
  public $fluid;                        // permenant session ID (done via cookie)
  public $has_db_record = false;        // flag on whether this user has an existing persist record
  public $flsid;                        // temporary session ID (actual session id)
  public $flssid;                       // unique ID for each script session
  public $counter = 0;                  // counter (should be a static publiciable)
  public $persist;                      // pointers to memory areas within $_SESSION
  public $temporary;
  public $is_new_user;                  // flag to indicate if this is a new user (no fl-uid)
  public $is_new_session = 0;           // determine if it is a new session

  public $sessionsource = "cassandra.userdata.usersession";
  public $sessiontable = "userdata.session";

  /**
   * List of domains for which we want to serve cookies at the top level for (ie, thefind.com)
   * Everything else uses the FQDN (ie, www.glimpse.com, shop.glimpse.com, etc)
   * @fixme - these should be specified in a config somewhere
   */
  public static $domains_toplevel = array("thefind.com",
                                          "thefind.co.uk",
                                          "fatlens.com",
                                          "im2-inc.com"
                                          );

  protected static $instance;

  protected function __construct()
  {
    global $webapp;
    /**
     * If this page is one of the pages to serve the widgets, do not start
     * a session.  Log the impression to the widget
      log.
     */
    $widget_pages = array("widget_findit.fhtml", "widget_marketplace.fhtml", "widget_search.fhtml", "widget_tickets.fhtml");
    $is_widget = false;

    for ($i=0; $i<count($widget_pages); $i++) {
      if ( (strpos($webapp->request["path"], $widget_pages[$i]) !== false) ) {
        /**
         * @todo:
         * Not an elegant solution, but it's the easier to implement for now.
         * For the widget preview mode, the information is passed in the session.
         * So, we must init the session if mode=preview.
         */
        if ($webapp->request["args"]["preview_mode"] != "yes") {
          $is_widget = true;
        }
        continue;
      }
    }
    if ($is_widget == false) {
      $this->init();
    }
  }

  /**
   * singleton function to return
   * the instance of the class
   *
   * @return SessionManager
   */
  public static function singleton()
  {
    if (!self::$instance) {
      self::$instance = new SessionManager();
    }
    return self::$instance;
  }

  /**
   * Initialize the session.
   * Start the session.
   */
  protected function init()
  {
    //some al-qada shit here... 
    global $webapp;

    $this->data = DataManager::singleton();
    Profiler::StartTimer("SessionManager::Init()", 2);

    /*
    if ($this->data->caches["memcache"]["session"] !== NULL) {
      $this->cache_obj = $this->data->caches["memcache"]["session"];
      //$this->session_cache_expire = $this->data->caches["memcache"]["session"]->lifetime;
    } else {
      // Continue anyway even if cannot connect to memcache.
      // Point the cache_obj to NoCache object
      //print_pre($this->data);
      Logger::Error("SessionManager::init() - Cannot connect to session memcache - " . $this->data->sources);
      $this->cache_obj =& NoCache::singleton();
    }
    */

    // instantiate the pandora object
    $pandora = PandoraLog::singleton();

    // check to see if there is an existing cookie for flsid
    $has_flsid = (isset($_COOKIE['flsid']) || isset($_REQUEST['flsid']));
    $this->is_new_session = ($has_flsid == 1) ? 0 : 1;

    // if flsid was passed via the URL, set it as a cookie
    if (!empty($_GET['flsid'])) {
      setcookie("flsid", $_GET['flsid'], 0, '/');
      $this->flsid = $_COOKIE['flsid'] = $_GET['flsid'];
    }

    session_set_save_handler(
      array(&$this, 'open'),
      array(&$this, 'close'),
      array(&$this, 'read'),
      array(&$this, 'write'),
      array(&$this, 'destroy'),
      array(&$this, 'gc')
    );


    // register_shutdown_function('session_write_close');

    // figure out domain to set fl-uid cookie for (TLD for thefind/fatlens/im2-inc.com, FQDN for all others)
    // FIXME - this should use $this->getDomain()
    if ( (strpos($_SERVER['HTTP_HOST'], "thefind.com") === false) &&
         (strpos($_SERVER['HTTP_HOST'], "fatlens.com") === false) &&
         (strpos($_SERVER['HTTP_HOST'], "im2-inc.com") == false)) {
      $domain = $_SERVER['HTTP_HOST'];
    } else {
      $tmp = explode(".", $_SERVER['HTTP_HOST']);
      $tmp_size = count($tmp);
      $domain = "." . $tmp[$tmp_size-2] . "." . $tmp[$tmp_size-1];
    }
    //session_set_cookie_params(0, "/", $domain);
    session_set_cookie_params(0, "/"); // 10-30-08: switched session cookie to use fqdn rather than just top-level domain

    // set the garbage collection lifetime (on the DB persist data)
    ini_set('session.gc_maxlifetime', 31536000); // 31536000 = 60 * 60 * 24 * 365

    // set the session cookie name
    session_name($this->cookiename);

    // set the cache limiter to 'private' - keeps us from sending Pragma: no-cache
    session_cache_limiter('private');

    // initiate sessionization
    if (!headers_sent()) {
      session_start();
    }

    /**
     * Read the permanent session ID from cookie.
     * If there isn't one, create one.
     */

    // read the permanent cookie
    if (isset($_REQUEST['fluid']))
      $fluid_str = $_REQUEST['fluid'];
    else if (isset($_COOKIE['fl-uid']))
      $fluid_str = $_COOKIE['fl-uid'];
    else if (isset($_SESSION['fluid']))
      $fluid_str = $_SESSION['fluid'];

    $fluid_data = explode(",", $fluid_str);
    $this->fluid = $fluid_data[0];
    $this->session_count = $fluid_data[1]?$fluid_data[1]:0;
    $this->last_access = $fluid_data[2]?$fluid_data[2]:0;
    $this->first_session_for_day = 0;
    $this->days_since_last_session = 0;
    $this->is_new_user = 0;
    if (empty($this->fluid)) {
      // create new permanent cookie
      $this->is_new_user = 1;
      $this->fluid = $this->generate_fluid();
      $this->session_count = 0;
      $this->last_access = time();
      $this->first_session_for_day = 1;
      $this->days_since_last_session = 0;
      $fluid_data = $this->fluid.','.$this->session_count.','.$this->last_access;
      //setcookie('fl-uid', $fluid_data, time()+31536000, "/", $domain); // (1 year)
      $pdata_serialize = serialize($_SESSION["persist"]);
      $this->crc = strlen($pdata_serialize) . crc32($pdata_serialize);
    }
    if (!$has_flsid) {
      // new session -- update the permanent cookie

			// Deal with errant mis-named 'fl_uid' cookies...
			// (this code can safely be removed in a year or so, e.g. February 2010)
			// ^^^ perhaps not?
      if ($fluid_data_recover = explode(",", $_COOKIE['fl_uid'])) {
        $this->fluid = any($this->fluid, $fluid_data_recover[0]);
        $this->session_count = $fluid_data_recover[1];
        $this->last_access = $fluid_data_recover[2];
        //setcookie('fl_uid', '', 0, "/", $domain); // delete the errant cookie
      }

      $this->session_count++;
      if (time() > ($this->last_access+86400)) {
        $this->days_since_last_session = floor((time() - $this->last_access)/86400);
        $this->last_access = time();
        $this->first_session_for_day = 1;
      }
      $fluid_data = $this->fluid.','.$this->session_count.','.$this->last_access;
      if (!headers_sent()) {
        setcookie('fl-uid', $fluid_data, time()+31536000, "/", $domain); // (update the permanent cookie)
      }
    }



    // debugging
    // print "<hr>In SessionManager::init() - cache_obj extended stats = " . print_pre($this->cache_obj->GetExtendedStats());

    /**
     * First, check to see if there is an entry in the memcache for this fluid.
     * If so, use it.
     * If not, query the DB to get the persistent session data.
     * If not in the DB, create a new session.
     */
    $this->flsid = session_id();
    //$session_memcache = $this->cache_obj->get($this->flsid);
    $session_memcache = DataManager::fetch("memcache.session#{$this->flsid}", $this->flsid);
    //$tmpsession = unserialize($session_memcache);

    if (!empty($session_memcache["fluid"]))
      $this->fluid = $session_memcache["fluid"];

    if (empty($session_memcache) && !$this->is_new_user) {
      /*
      $result = $this->data->Query("db.userdata.usersession.{$this->flsid}:nocache",
                                   "SELECT data FROM usersession.usersession WHERE fl_uid=:fl_uid LIMIT 1",
                                   array(":fl_uid" => $this->fluid));
      */
      $result = DataManager::QueryFetch($this->sessionsource . "#{$this->fluid}",
                                   $this->sessiontable,
                                   array("fl_uid" => $this->fluid));
      if ($result && count($result) == 1) {
        $data = current($result);
        $_SESSION["persist"] = unserialize($data["data"]);
        $this->has_db_record = true;
        if (! $_SESSION["persist"]["has_db_record"]) {
          $_SESSION["persist"]["has_db_record"] = true;
        }
      }
    } else {
      $_SESSION = $session_memcache;
      //Logger::Error(print_r($_SESSION, true));
    }

    $this->has_db_record = ($_SESSION["persist"]["has_db_record"]) ? true : false;

    // Store permenant session id, actual (temporary) session id,
    // and create pointers to $_SESSION memory space
    $this->flsid = session_id();
    $this->persist =& $_SESSION["persist"];
    $this->temporary =& $_SESSION["temporary"];

    // get from the persist session data if this is a new or registered user
    $userid = $_SESSION["persist"]["user"]["userid"];
    $usertype = $_SESSION["persist"]["user"]["usertype"];

    $userTypeArray = User::$usertypes;
    $pandoraUserTypeNum = any($userTypeArray[$usertype], 0);

    // log this into Pandora
    $pandora_session = array(
      "timestamp"           => time(),
      "session_id"          => $this->flsid,
      "fluid"               => $this->fluid,
      "is_new_user"         => $this->is_new_user,
      "is_registered_user"  => ($userid) ? 1 : 0,
      "ip_addr"             => $_SERVER['REMOTE_ADDR'],
      "user_agent"          => $_SERVER['HTTP_USER_AGENT'],
      "referrer_url"        => $_SERVER['HTTP_REFERER'],
      "landing_page_url"    => "http://" . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'],
      "referrer_id"         => $webapp->request["args"]["rid"],
      "widget_id"           => $webapp->request["args"]["wid"],
      "user_registration_id"=> "$pandoraUserTypeNum.$userid",
      "version"             => 0,
      "cobrand"             => $this->root->cobrand,
      "first_session_for_day" => $this->first_session_for_day,
      "session_count"       => $this->session_count,
      "days_since_last_session" => $this->days_since_last_session
    );

    // log this session for data warehouse (once per session)
    if (!$has_flsid) {
      //store the session start time in session
      $_SESSION['session_start_time'] = time();

      $pandora->addData("session", $pandora_session);
    }
    else {
      Logger::Notice("Pandora: Session already has an flsid. Current start time from session is: " . var_export($_SESSION['session_start_time'], true));

      if(!array_key_exists('session_start_time', $_SESSION)) {
        $_SESSION['session_start_time'] = time();
        Logger::Warn("Pandora: Set or reset the session start time as one did not exist before. Time is: " . var_export($_SESSION['session_start_time'], true));
      }
      else {
        Logger::Notice("Pandora: Session start time was not reset. Time is: " . var_export($_SESSION['session_start_time'], true));
      }
    }

    //save session data once per session
//    if(!array_key_exists('pandora_session_data_added', $_SESSION)) {
//      $pandora->addData("session", $pandora_session);
//      $_SESSION['pandora_session_data_added'] = true;
//    }

    $_SESSION["fluid"] = $this->fluid;
    // set the script session ID
    $this->flssid = $this->generate_fluid();

    Profiler::StopTimer("SessionManager::Init()");
  }
  public function quit() {
    // instantiate the pandora object
//    Logger::Info("Writing Pandora Log");
//    $pandora = PandoraLog::singleton();
//    $pandora->writeLog();
    
    Logger::Info("Closing Session");
    session_write_close();
  }

  /**
   * Create a new persist record in the userdata.usersssion table
   */
  protected function create_new_persist_record($force=false)
  {
    // if bot, don't create a db record
    if (function_exists("isBot") && isBot()) {
      return;
    }
    // insert a record into userdata.usersession
    if ($force || !empty($_SESSION["persist"])) {
      $_SESSION["persist"]["has_db_record"] = true;
      $pdata_serialize = serialize($_SESSION["persist"]);
      $ip = $_SERVER['REMOTE_ADDR'];
      Logger::Notice("Creating session in database");
      $result = DataManager::QueryInsert($this->sessionsource . "#{$this->fluid}",
                                   $this->sessiontable,
                                   array($this->fluid => array("fl_uid"=>$this->fluid, "data"=>$pdata_serialize, "ip_addr"=>$ip)));
      // set the $_SESSION
      $this->has_db_record = true;
    }
  }

  /**
   * mysql session open handler
   * (no override)
   *
   * @param string file path (ignored)
   * @param string session name (ignored)
   */
  public function open($save_path, $session_name) {}

  /**
   * session close requirement
   * Persist the data warehouse log data.
   */
  public function close()
  {
    //$this->data->Quit();

    Profiler::StartTimer("Pandora", 1);
    $pandora = PandoraLog::singleton();
    if ($pandora->getFlag() == false) {
      // if pandora logging is not turned on, return
      return;
    }
    // exclude the internal server crawls and testings
    $exclude_user_agents = array("im2-");
    for ($i=0; $i<count($exclude_user_agents); $i++) {
      if ( (strpos($_SERVER['HTTP_USER_AGENT'], $exclude_user_agents[$i]) !== false) ) {
      	return;
      }
    }
    // process the pandora logging
    $pandora = PandoraLog::singleton();
    $pandora->writeLog();
    Profiler::StopTimer("Pandora");
  }

  /**
   * mysql session read handler.
   * (no override)
   *
   * @param  string id to read data for
   * @return string data for session
   */
  public function read($id)
  {
    // calculate the crc value of this for comparison later
    //$cacheentry = $this->cache_obj->get($id);
    $cacheentry = DataManager::fetch("memcache.session#{$id}", $id);
    if ($cacheentry instanceOf CacheEntry)
      $data = $cacheentry->getPayload();
    else
      $data = $cacheentry;
    //$data_unserialize = unserialize($data);
    $pdata_serialize = serialize($data['persist']);
    if (empty($data['persist']) || is_null($data['persist'])) {
      $this->crc = 0;
    } else {
      $this->crc = strlen($pdata_serialize) . crc32($pdata_serialize);
    }
    return $data;
  }

  /**
   * mysql session write handler.
   * Persist the entire portion of $_SESSION["persist"] to DB.
   * Refresh memcache with $_SESSION.
   *
   * @param string session id
   * @param string data to write
   */
  public function write($id, $data)
  {
    Profiler::StartTimer("SessionManager::write", 1);
    // Save user, and all associated lists, settings, etc.
    Profiler::StartTimer("SessionManager::write - save user");
    $user = User::singleton();
    $user->save();
    Profiler::StopTimer("SessionManager::write - save user");
    $pdata = $_SESSION["persist"];
    strip_nulls($pdata);
    // compare the persist data before and after for changes
    $pdata_serialize = serialize($pdata);

    //Logger::Warn($pdata_serialize);
    //$data = $this->cache_obj->get($id);
    $data = DataManager::fetch("memcache.session#{$id}", $id);
    $pdata_before = $data["persist"];
    $pdata_before_serialize = serialize($pdata_before);

    // update the memcache with the entire $_SESSION
    //$session_serialize = serialize($_SESSION);
    //$this->cache_obj->set($id, $_SESSION, 0);
    $data = DataManager::update("memcache.session#{$id}", $id, $_SESSION);

    if (empty($pdata) || is_null($pdata)) {
      $new_crc = 0;
    } else {
      $new_crc = strlen($pdata_serialize) . crc32($pdata_serialize);
    }

    if ($this->crc != $new_crc) {
      // if the user does not have a record already, create one first
      // NOTE from James - removed  '&& (! $pdata["user"]["userid"]' from below, didn't seem to make sense...
      if ($this->has_db_record == false) {
        $this->create_new_persist_record();
        // need to set the session cache again with we set the has_db_record param
        //$session_serialize = serialize($_SESSION);
        //$this->cache_obj->set($id, $_SESSION, 0, $this->session_cache_expire);
        DataManager::update("memcache.session#{$id}", $id, $_SESSION);
      } else {
        /*
        $result = $this->data->Query("db.userdata.usersession.{$id}:nocache",
                                     "UPDATE usersession.usersession SET data=:data WHERE fl_uid=:fl_uid",
                                     array(":data" => $pdata_serialize, ":fl_uid"  => $this->fluid)
                                     );
        */
        $result = $this->data->QueryUpdate($this->sessionsource . "#{$this->fluid}",
                                     $this->sessiontable,
                                     array($this->fluid => array("data" => $pdata_serialize)), 
                                     array("fl_uid"  => $this->fluid)
                                     );
        Logger::Info("Updating userdata.usersession record for $this->fluid");
      }
    }
    Profiler::StopTimer("SessionManager::write");
  }

  /**
   * mysql session destroy handler.
   * Remove the session from the memcache.
   *
   * @param string $id - session id
   */
  public function destroy($id)
  {
    $this->cache_obj->delete($id);
  }

  /**
   * mysql session garbage collection handler
   *
   * @param integer how many seconds-old sessions to keep
   */
  public function gc($maxlifetime)
  {
    $touched_limit = time() - $maxlifetime;
    $result = $this->data->Query($this->sessionsource . ".userdata.usersession:nocache",
                                 "DELETE FROM usersession.usersession WHERE touched < :touched",
                                 array(":touched" => $touched_limit));
  }

  /**
   * Create a unique fluid
   * to save as a cookie to store permenant
   * session data.
   *
   */
  protected function generate_fluid()
  {
    return md5(uniqid($_SERVER['SERVER_NAME'] . mt_rand(), true));
  }

  /**
   * Generate GUID based on the counter and the script session ID
   */
  public function generate_guid()
  {
    return $this->flssid . ":" . str_pad($this->counter++, 4, "0", STR_PAD_LEFT);
  }

  /**
   * Get domain name formated like ".thefind.com", ".thefind.co.uk"
   * @return string
   */
  public function getDomain()
  {
    global $webapp;
    $host = any($webapp->request["host"], $_SERVER['HTTP_HOST']);
    foreach (self::$domains_toplevel as $tld) {
      $regex = "/(?:^|\.)" . preg_quote($tld) . "$/";
      if (preg_match($regex, $host, $domain)) {
        return "." . $tld;
      }
    }
    return $host;
  }
}
