<?php
/*
  Copyright (c) 2005 James Baicoianu

  This library is free software; you can redistribute it and/or
  modify it under the terms of the GNU Lesser General Public
  License as published by the Free Software Foundation; either
  version 2.1 of the License, or (at your option) any later version.

  This library is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
  Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public
  License along with this library; if not, write to the Free Software
  Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/


class Logger {
  static protected $msgs = array();
  static protected $log_files = array();
  static protected $log_emails = array();
  static public $enabled = true;

  const NEWLINE = "\r\n";
  
  public function __construct() {}

  /**
   * This function will get the default logger configuration.
   * This is needed for situations where the ConfigManager
   * or the DataManager has not been initialized 
   * (i.e. errors during those two).
   */
  protected function getDefaultLoggerConfig() {
    // email settings
    $sitecfg["logger"]["email"]["level"] = "";
    $sitecfg["logger"]["email"]["interval"] = 10;
    $sitecfg["logger"]["email"]["email_to"] = "ui@thefind.com";
    // log file settings
    $sitecfg["logger"]["file"]["level"] = "E_WARNING";
    $sitecfg["logger"]["file"]["path"] = "/data/logs/ui";
    return $sitecfg;
  }

  public static function Add($lvl, $msg, $args=NULL, $classname=NULL) {
    $skipclassnames = array(__CLASS__);
    if ($classname !== NULL)
      $skipclassnames[] = $classname;
    $bt = debug_backtrace();
    for ($i = 0; $i < count($bt); $i++) {
      if (!in_array($bt[$i]["class"], $skipclassnames))
        break;
    }

    $realclass = $bt[$i]["class"];

    if (!empty($args))
      $msg = vsprintf($msg, $args);

    //print $msg . "\n";
    self::$msgs[] = array("lvl"=>$lvl, "txt"=>$msg, "class"=>$realclass);
  }

  public static function Display($lvl) {
    $debugClasses = array(E_ERROR   => "logError",
                          E_WARNING => "logWarning",
                          E_USER_NOTICE  => "logNotice",
                          E_INFO    => "logInfo",
                          E_DEBUG   => "logDebug",
                          E_NOTICE   => "logDebug");

    $ret = "";
    if (count(self::$msgs) > 0) {
      $ret .= '<ul id="tf_debug_log">';
      foreach (self::$msgs as $msg) {
        if ($msg['lvl'] & $lvl)
          $msgtxt = $msg["txt"];
          if ($msg["txt"] instanceOf Exception)
            $msgtxt = $msg["txt"]->getMessage();
          else if (!is_string($msg["txt"]))
            $msgtxt = print_r($msg["txt"], true);
          $ret .= '<li class="' . $debugClasses[$msg['lvl']] . '"><address>' . $msg["class"] . "</address><code>" . htmlspecialchars($msgtxt) . '</code></li>';
      }
      $ret .= '</ul>';
    }

    return $ret;
  }

  public static function hasErrors() {
    foreach (self::$msgs as $msg) {
      if ($msg['lvl'] == E_ERROR) {
        return true;
      }
    }
    return false;
  }
  
  protected static function levelToString($lvl) {
    $lvl_map = array(E_ERROR=>"ERROR" , E_WARNING=>"WARNING", E_USER_NOTICE=>"NOTICE", E_INFO=>"INFO", E_DEBUG=>"DEBUG");
    return $lvl_map[$lvl];
  }

  protected static function convertLevelToNumeric($lvl) {
    $lvl_map = array("E_ERROR"=>E_ERROR , "E_WARNING"=>E_WARNING, "E_NOTICE"=>E_USER_NOTICE, "E_INFO"=>E_INFO, "E_DEBUG"=>E_DEBUG);
    return (isset($lvl_map[$lvl]) ? $lvl_map[$lvl] : NULL);
  }
  
  protected static function composeMessage($lvl, $msg, $args) {
    if (!empty($args)) {
      $msg = vsprintf($msg, $args);
    }
    $msg_body = "MESSAGE = ";
    $msg_body .= (is_object($msg) || is_array($msg)) ? print_ln($msg, true) : $msg;
    /*
    $msg_header = self::NEWLINE . "=== " . "Log[" . self::levelToString($lvl) . "] - " . date(DATE_RFC822);
    $backtrace = debug_backtrace();
    $msg_trace = self::NEWLINE . "HTTP_HOST = " . $_SERVER["HTTP_HOST"]
               . self::NEWLINE . "REQ = " . $_SERVER["REQUEST_URI"]
               . self::NEWLINE . "FILE = " . $backtrace[2]["file"]
               . self::NEWLINE . "LINE = " . $backtrace[2]["line"];
               //. self::NEWLINE . "ARGS = " . print_r($args, true);
    return($msg_header . self::NEWLINE . $msg_trace . self::NEWLINE . $msg_body);
    */

    $msg = date("M j G:i:s") . "\t" . self::levelToString($lvl) . "\t" . $_SERVER["HTTP_HOST"] . $_SERVER["REQUEST_URI"] . "\t" . $msg_body;

    return $msg;
  }

  protected static function addLog($lvl, $msg, $args) { 
    $backtrace = debug_backtrace();
    $content = self::composeMessage($lvl, $msg, $args);
    // save to email message buffer
    $email =& self::$log_emails[];
    $email["level"] = $lvl;
    $email["cache_key"] = $backtrace[1]["file"] . "|" . $backtrace[1]["line"];
    $email["content"] = $content;
    // save to file buffer
    $file =& self::$log_files[];
    $file["level"] = $lvl;
    $file["content"] = $content;
  }
  
  /**
   * This function will be called at script shutdown via PHP script shutdown.
   * It will loop through the errors and warning and send one email
   * and/or write the errors/warnings to the file IO.
   */
  public static function processShutdown() {
    global $webapp;
    // settings
    $sitecfg = array("logger" => Configmanager::get("logger"));
    $sitecfg = ($sitecfg["logger"]["email"] && $sitecfg["logger"]["file"]) ? $sitecfg : self::getDefaultLoggerConfig();
    
    // email section
    $level_setting = self::convertLevelToNumeric($sitecfg["logger"]["email"]["level"]);
    $interval = ($sitecfg["logger"]["email"]["interval"] > 0) ? $sitecfg["logger"]["email"]["interval"] : 10; // default to 10 minutes

    if ( ($level_setting > 0) && ($lvl <= $level_setting) && ($sitecfg["logger"]["email"]["email_to"]) ) {
      $data_mgr = DataManager::singleton();
      // loop through them and send the ones that should be sent
      $email_msg = "";
      foreach(self::$log_emails as $email) {
        if ($email["level"] <= $level_setting) {
          $cache_val = DataManager::Query("memcache.data", $email["cache_key"]);
          if ( (time() - $cache_val["sent_timestamp"]) >= ($interval * 60) ) {
            $num_times = $cache_val["count"] + 1;
            $header = "From: " . $_SERVER["SERVER_ADMIN"] . "\n";
            $subject = "Warning/Error message from " . $_SERVER["SERVER_ADMIN"];
            // append the # of times this warning/error has occurred 
            $email_msg .= self::NEWLINE
                        . self::NEWLINE
                        . self::NEWLINE . "Number of times happened since last email = " . $num_times
                        . self::NEWLINE . $email["content"]; 
            if ($data_mgr) {
              $cache_val["count"] = 0;
              $cache_val["sent_timestamp"] = time();
              DataManager::QueryInsert("memcache.data", $email["cache_key"], $cache_val);
            }
          } else {
            if ($data_mgr) {
              $cache_val["count"] += 1;
              DataManager::QueryInsert("memcache.data", $email["cache_key"], $cache_val);
            }
          }
        }
      }
      if ($email_msg) {
        mail($sitecfg["logger"]["email"]["email_to"], $subject, $email_msg, $header);
      }
    }

    // log file to IO
    $level_setting = self::convertLevelToNumeric($sitecfg["logger"]["file"]["level"]);
    if ( ($level_setting > 0) && ($sitecfg["logger"]["file"]["path"]) ) {
      $file_msg = "";
      foreach(self::$log_files as $file) {
        if ($file["level"] <= $level_setting) {
          $file_msg .= $file["content"] . self::NEWLINE;  
        }
      }
      $folder = rtrim($sitecfg["logger"]["file"]["path"],"/");
      $fname = $folder . "/uilogger." . date("YmdH") . "0000";
      // create folder if not already there
      if (file_exists($folder) == false && is_writable(dirname($folder))) {
        mkdir($folder, 0777, true);
      }
      $file_exist = false;
      if (file_exists($fname) == false) {
        $file_exist = is_writable($folder) && touch($fname);
      } else {
        $file_exist = true;
      }
      if ($file_exist && is_writable($fname)) {
        file_put_contents($fname, $file_msg, FILE_APPEND);
      }
    }

    $timestats = array("page" => any($webapp->components->pagecfg["pagename"], $webapp->request["path"]), "total" => Profiler::GetTime("WebApp"));
    if (($time = Profiler::GetTime("QPMWrapper:Query()")) != NULL) $timestats["qpm"] = $time;
    if (($time = Profiler::GetTime("QPMWrapper:Query() - first byte")) != NULL) $timestats["qpmfirstbyte"] = $time;
    if (($time = Profiler::GetTime("DBWrapper:Query()")) != NULL) $timestats["db"] = $time;
    if (($time = Profiler::GetTime("WebApp::TimeToDisplay")) != NULL) $timestats["firstbyte"] = $time;
    if (($time = Profiler::GetTime("WebApp::Display() - Conteg")) != NULL) $timestats["output"] = $time;
    if (($time = Profiler::GetTime("Conteg::compress")) != NULL) $timestats["compress"] = $time;
    if (($time = Profiler::GetTime("Postprocessing")) != NULL) $timestats["postprocessing"] = $time;

    DataManager::Query("stats.default.blah:nocache", "www.timing.total", $timestats);
    $data = DataManager::singleton();
    if ($data) {
      $data->Quit(); // shutdown to make sure sockets are flushed
    }

  }
  
  public static function Error() { 
    if (!self::$enabled) return;
    $args = func_get_args();
    $msg = array_shift($args);
    self::Add(E_ERROR, $msg, $args); 
    self::addLog(E_ERROR, $msg, $args); 
  }
  
  public static function Warn() { 
    if (!self::$enabled) return;
    $args = func_get_args(); 
    $msg = array_shift($args); 
    self::Add(E_WARNING, $msg, $args); 
    self::addLog(E_WARNING, $msg, $args); 
  }
  
  public static function Notice() { 
    if (!self::$enabled) return;
    $args = func_get_args(); 
    $msg = array_shift($args); 
    self::Add(E_USER_NOTICE, $msg, $args);
  }
  
  public static function Info() { 
    if (!self::$enabled) return;
    $args = func_get_args(); 
    $msg = array_shift($args); 
    self::Add(E_INFO, $msg, $args);
  }
  
  public static function Debug() { 
    if (!self::$enabled) return;
    $args = func_get_args(); 
    $msg = array_shift($args); 
    self::Add(E_DEBUG, $msg, $args);
  }

  public static function HandleError($errcode, $errstr, $errfile=NULL, $errline=NULL, $errcontext=NULL) {
    if (!self::$enabled) return;
    self::Add($errcode, $errstr);
    return true;
  }
}

define("E_DEBUG", 32767);
define("E_INFO", 512); // overriding E_USER_WARNING
