<?php

class DeviceManager {
  protected static $instance;
  public static function singleton($args=NULL) { $name = __CLASS__; if (!self::$instance) { self::$instance = new $name($args); } return self::$instance;  }
  protected static $data = array();

  public static function init() {
    $cookieinfo = explode(",", $_COOKIE['fl-uid']);
    $fluid = $cookieinfo[0];
    $device = DataManager::fetch("db.session.{$deviceid}:nocache", "usersession.usersession", array("fl_uid" => $fluid));
    if (count($device) == 1) {
      self::set((preg_match("/^a:\d+:{/", $device[0]["data"]) ? unserialize($device[0]["data"]) : json_decode($device[0]["data"])));
    }
  }
  public static function set($data) {
    self::$data = array_merge(self::$data, $data);
  } 
}
