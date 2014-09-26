<?php

include_once("include/base_class.php");

/**
 * class ConfigManager
 * Singleton for handling basic config functions
 * @package Framework
 * @subpackage Config
 */

/*
 * CREATE TABLE cobrand (
 *   cobrandid bigint(20) unsigned NOT NULL,
 *   name varchar(255) default NULL,
 *   PRIMARY KEY (cobrandid),
 *   UNIQUE KEY name (name)
 * );
 *
 * CREATE TABLE cobrand_config (
 *   ccid bigint(20) unsigned NOT NULL,
 *   cobrandid bigint(20) unsigned NOT NULL,
 *   name varchar(255) default NULL,
 *   value blob,
 *   type varchar(64) default 'text',
 *   role varchar(255) NOT NULL default 'live',
 *   modified_time bigint(20) unsigned default NULL,
 *   PRIMARY KEY  (ccid),
 *   KEY role_cobrand_name_unique (role,cobrandid,name)
 * );
 *
 * CREATE TABLE version (
 *   versionid int(11) NOT NULL auto_increment,
 *   cobrandid bigint(20) unsigned NOT NULL,
 *   role varchar(255) NOT NULL default 'live',
 *   revision int(12) default 1,
 *   added date default NULL,
 *   updated date default NULL,
 *   PRIMARY KEY (versionid),
 *   UNIQUE KEY cobrandid_role (cobrandid,role)
 * );
 *
 * CREATE FUNCTION config.hash_cobrand (name VARCHAR(255)) 
 *   RETURNS BIGINT UNSIGNED DETERMINISTIC 
 *   RETURN funcs.md5int64(name);
 * CREATE FUNCTION config.hash_cobrand_config (role VARCHAR(255), cobrandid BIGINT UNSIGNED, name VARCHAR(255)) 
 *   RETURNS BIGINT UNSIGNED DETERMINISTIC 
 *   RETURN funcs.md5int64(concat(role,'-',cobrandid,'-',name)); 
 *
 */

class ConfigManager extends Base {
  public $servers = array(); // server configs, from ini
  public $configs; // site configs, from db

  public $role;

  public $rootdir;
  public $locations;
  public $apcenabled;
  public $fullservers = array(); // merged but unprocessed server config

  public $servermapping;
  public $servergroups;

  //handles reading and writing local config changes
  public $localConfig;
  //array of roles that are allowed to use local config
  public $localConfig_allowedRoles = array(
    'elation'
  );

  /**
   * constructor
   */
  public function __construct($rootdir=null, $autoload=true) {
    Profiler::StartTimer("ConfigManager::constructor", 3);
    $this->rootdir = $rootdir;
    // init the locations
    $this->locations = $this->getLocations();
    $this->apcenabled = ini_get("apc.enabled");
    // load servers
    if ($autoload && $this->locations !== NULL && !empty($this->locations["config"])) {
      $this->LoadServers(true);
    }
    //load localconfig manager if enabled and role=elation
    if ($this->isLocalConfigEnabled() ) {
      $dir = $this->locations['config'] . '/' . $this->servers['config']['manager']['localconfigdir'];
      $filename = $this->servers['config']['manager']['localconfigfile'];
      $this->localConfig = new LocalConfigManager($dir, $filename, $this->apcenabled);
    }
    Profiler::StopTimer("ConfigManager::constructor");
  }

  //is local config enabled tests for a given role if localconfig is available
  //if role is not provided use ConfigManager::role instead
  public function isLocalConfigEnabled($role = false) {
    if(!$role) {
      $role = $this->role;
    }
    return in_array( $role, $this->localConfig_allowedRoles )
      && !empty( $this->servers['config']['manager']['localconfig'] );
  }

  //tests if a role is allowed to use the localconfig manager
  public function isRoleAllowedForLocalConfig($role) {
    //print_pre('isRole allowed called with: '.$role);
    $val = in_array($role, $this->localConfig_allowedRoles);
    //print_pre('returning: '.$val);
  }

  protected static $instance;
  public static function singleton($args=NULL) {
    $name = __CLASS__;
    if (!self::$instance) {
      if (! empty($args)) {
        self::$instance = new $name($args);
      } else {
        self::$instance = null;
      }
    }
    return self::$instance;
  }

  /**
   * Get the locations for the rest of the site to use.
   */
  public function getLocations($rootdir=NULL) {
    Profiler::StartTimer("ConfigManager::getLocations()", 3);
    if ($rootdir === NULL)
      $rootdir = $this->rootdir;
    if (empty($rootdir)) {
      return null;
    }

    $locations = array("root"       => $rootdir,
                       "htdocs"     => "$rootdir/htdocs",
                       "htdocswww"  => "",
                       "images"     => "$rootdir/htdocs/images",
                       "imageswww"  => "/images",
                       "scripts"    => "$rootdir/htdocs/scripts",
                       "scriptswww" => "/scripts",
                       "css"        => "$rootdir/htdocs/css",
                       "csswww"     => "/css",
                       "resources"  => "$rootdir/resources",
                       "config"     => "$rootdir/config",
                       "tmp"        => "$rootdir/tmp",
                       "templates"  => "$rootdir/templates");

    if ($this->servers["dependencies"]["cdn"]["enabled"] == 1 && $this->current["dependencies"]["cdn"]["enabled"] == 1) {
      $cdn_ini = $this->servers["dependencies"]["cdn"];
      $cdn_cobrand = $this->current["dependencies"]["cdn"];

      $cdnhost = any($cdn_cobrand["host"], $cdn_ini["host"], "");
      $cdnscheme = any($cdn_cobrand["scheme"], $cdn_ini["scheme"], "");
      //$cdnscheme = (!empty($cdnhost) ? $webapp->request["scheme"] . "://" : "");
      //$cdnpath = any($cdn_cobrand["path"], $cdn_ini["path"], "/images");
      $cdnprefix = (!empty($cdnscheme) ? $cdnscheme.":" : "") . "//" . $cdnhost;

      if (any($cdn_cobrand["images"], $cdn_ini["images"]) == 1)
        $locations["imageswww"] = $cdnprefix . $locations["imageswww"];
      if (any($cdn_cobrand["css"], $cdn_ini["css"]) == 1)
        $locations["csswww"] = $cdnprefix . $locations["csswww"];
      if (any($cdn_cobrand["scripts"], $cdn_ini["scripts"]) == 1)
        $locations["scriptswww"] = $cdnprefix . $locations["scriptswww"];
    }

    Profiler::StopTimer("ConfigManager::getLocations()");
    return $locations;
  }

  /**
   * Get the server->cluster mapping information from the config
   *
   * @return array server mappings
   */
  public function GetMappings() {
    $mappings = array();
    if (is_array($this->fullservers["mapping"])) {
      // Old servers.ini format used [mapping] which was a list of servers and the roles they map to
      $mappings = $this->fullservers["mapping"];
    } else if (is_array($this->fullservers["clusters"])) {
      // New format uses [clusters] which is a list of clusters, and the servers they contain
      $mappings = array();
      foreach ($this->fullservers["clusters"] as $groupname=>$serverstr) {
        $servers = explode(" ", $serverstr);
        foreach ($servers as $server) {
          if ($server[0] != "@") {
            $mappings[$server] = $groupname;
          }
        }
      }
    }
    return $mappings;
  }

  /**
   * Load settings from a specified config file
   *
   * @param string $cfgfile ini file to load from
   * @return array server mappings
   */
  public function LoadSettings($cfgfile) {
    $settings = array();
    Profiler::StartTimer("ConfigManager::LoadSettings()", 2);
    if (file_exists($cfgfile)) {
      $mtime = filemtime($cfgfile);
      if (!empty($mtime)) {
        // NOTE - This uses APC directly, since the datamanager object requires this function to execute before initializing
        $apckey = $cfgfile . ":" . $mtime;
        if ($this->apcenabled && ($apccontents = apc_fetch($apckey)) != false) {
          $settings = unserialize($apccontents);
        } else {
          $settings = parse_ini_file($cfgfile, true);
          if ($this->apcenabled && !empty($settings)) {
            apc_store($apckey, serialize($settings));
          }
        }
      }
    }
    Profiler::StopTimer("ConfigManager::LoadSettings()");
    $this->fullservers = array_merge_recursive_distinct($this->fullservers, $settings);
    if (!empty($settings["clusters"])) {
      $this->servergroups = $settings["clusters"];
    } else if (!empty($settings["groups"])) {
      $this->servergroups = $settings["groups"];
    }
    return $settings;
  }

  /**
   * Get the server settings for a specific role
   *
   * @param string $role server role
   * @return array server config
   */
  public function GetRoleSettings($role, &$servercfg=null) {
    Profiler::StartTimer("ConfigManager::GetRoleSettings()", 3);
    $toplevel = ($servercfg === null);
    $rolecfgfile = $this->locations["config"] . "/clusters/{$role}.ini";
    if (empty($this->fullservers[$role]) && file_exists($rolecfgfile)) {
      $this->LoadSettings($rolecfgfile);
    }
    if (!empty($this->fullservers[$role])) {
      // Pull in all included configs
      $includes = array();
      if (!empty($this->fullservers[$role]["include"])) {
        $includes = explode(" ", $this->fullservers[$role]["include"]);
      }
      if (!empty($includes)) {
        Profiler::StartTimer("ConfigManager::GetRoleSettings() - includes", 3);
        foreach ($includes as $include) { 
          $this->GetRoleSettings($include, $servercfg);
        }
        Profiler::StopTimer("ConfigManager::GetRoleSettings() - includes");
      }

      //$servercfg["role"] = $role;
      // Apply role settings
      array_set_multi($servercfg, $this->fullservers[$role]);
    } else {
      Logger::Error("Could not find definition for role '$role'");
    }
    Profiler::StopTimer("ConfigManager::GetRoleSettings()");
    return $servercfg;
  }


  /**
   * Map a server's hostname to its role
   *
   * @param string $hostname hostname to look up, or fall back on /etc/hostname
   * @return array server config
   */
  public function GetRoleFromHostname($hostname=null) {
    if ($hostname === null) {
      $this->hostname = $hostname = php_uname("n");
    }
    $mapping = $this->GetMappings();
    return any($mapping[$hostname], "live"); // default to live so the site will work even if something is messed up
  }

  /**
   * Load server settings from specified ini file
   *
   * @param string $cfgfile ini file to load from
   * @return array server config block (also stored as $this->servers)
   */

  function LoadServers($assign=true) {
    //Profiler::StartTimer("ConfigManager::LoadServers()");
    $servers = array();

    // new method
    $this->LoadSettings($this->locations["config"] . "/servers.ini");
    $this->role = $this->GetRoleFromHostname();
    $servers = array_merge_recursive_distinct($servers, $this->GetRoleSettings("default"));
    $servers = array_merge_recursive_distinct($servers, $this->GetRoleSettings($this->role));
    $this->locations = $this->getlocations();

    // DISABLED - old method, had better caching of combined role config
    /*
    if (file_exists($cfgfile)) {
      $mtime = filemtime($cfgfile);
      if (!empty($mtime)) {
        // NOTE - This uses APC directly, since the datamanager object requires this function to execute before initializing
        $apckey = $cfgfile . "." . $mtime;
        //print "check apc for '$apckey'<br />";
        if ($this->apcenabled && ($apccontents = apc_fetch($apckey)) != false) {
          //print "found in apc, unserialize ($apccontents)<br />";
          $servers = unserialize($apccontents);
        } else {
          //print "not found in apc, parse it<br />";

          $settings = parse_ini_file($cfgfile, true);

          Logger::Info("Loading server config: $hostname");
          // First load the defaults
          if (!empty($settings["default"])) {
            array_set_multi($servers, $settings["default"]);
          }

          // set the role
          //$servers["role"] = ($settings["mapping"][$hostname]) ? $settings["mapping"][$hostname] : "live"; // default to live so the site will work if /etc/hostname is missing
          // If our host is part of a grouping, load those settings up
          if (!empty($settings["mapping"]) && !empty($settings["mapping"][$hostname]) && !empty($settings[$settings["mapping"][$hostname]])) {
            Logger::Info("$hostname is currently in the '" . $settings["mapping"][$hostname] . "' group");
            array_set_multi($servers, $settings[$settings["mapping"][$hostname]]);
          }

          // And finally, load any host-specific settings
          if (!empty($settings[$hostname])) {
            array_set_multi($servers, $settings[$hostname]);
          }

          if ($this->apcenabled) {
            apc_store($apckey, serialize($servers));
          }
        }
      }
    }
    */

    if ($assign) {
      $this->servers =& $servers;

      if (!empty($this->servers["role"])) { // ini file specified overridden role
        $this->role = $this->servers["role"];
      }
    }
    //Profiler::StopTimer("ConfigManager::LoadServers()");

    // set logger/profiler settings
    if (isset($this->servers["logger"]["enabled"]) && empty($this->servers["logger"]["enabled"]))
      Logger::$enabled = false;
    if (isset($this->servers["profiler"]["enabled"]) && empty($this->servers["profiler"]["enabled"]))
      Profiler::$enabled = false;

    // Update locations to reflect any new settings we got from the ini file
    $this->locations = $this->getLocations();

    // Merge any path settings from the config file into our environment
    if (!empty($this->servers["elation"]["path"])) {
      $elationpath = explode(":", $this->servers["elation"]["path"]);
      $oldincludepath = get_include_path();
      $includepath = explode(":", $oldincludepath);
      $newincludepath = implode(":", array_merge(array_diff($elationpath, $includepath), $includepath));
      if ($newincludepath != $oldincludepath) {
//        set_include_path($newincludepath);
      }
    }

    // Merge any settings which are overridden by a dev cookie
    if (!empty($_COOKIE["tf-dev"])) {
      $tfdev = json_decode($_COOKIE["tf-dev"], true);

      if (!empty($tfdev["serveroverrides"])) {
        $this->SetServerOverride($tfdev["serveroverrides"]);
      }
    }
    return $servers;
  }

  function SetServerOverride($settings) {
    if (is_array($settings)) {
      foreach ($settings as $k=>$v) {
        Logger::Warn("Using overridden setting: '%s' = '%s'", $k, $v);
        $this->AppendSetting($this->servers, $k, $v);
      }
    }
  }
  function GetSetting($string) {
    $ret = array_get($this->current,$string);
    // FIXME - quick hack for "true" and "False" values stored as strings.  This should look at type...
    if ($ret == "false") $ret = false;
    if ($ret == "true") $ret = true;
    return $ret;
  }
  /**
   * Parse a key string and place the value at the appropriate point in the settings array
   *
   * @param array &$settings array to place the value in
   * @param string $str key string (of the form blah.asdf.abcd)
   * @param string $val value to assign to the specified setting
   * @return bool whether or not the assignment succeeded
   */

  function AppendSetting(&$settings, $str, $val) {
    $ret = true;

    Profiler::StartTimer("ConfigManager::AppendSetting");
    array_set($settings, $str, $val);
    Profiler::StopTimer("ConfigManager::AppendSetting");

    return $ret;
  }
  /**
   * Merge two config arrays together
   * @param array &$cfg1 first config array
   * @param array &$cfg2 second config array
   *
   * @return array
   */
  function ConfigMerge(&$cfg1, &$cfg2, $updatelocations=true) {
    Profiler::StartTimer("ConfigManager::ConfigMerge()");
    foreach ($cfg2 as $k=>$v) {
      if (is_array($v)) {
        $this->ConfigMerge($cfg1[$k], $cfg2[$k], false);
      } else {
        $cfg1[$k] = $cfg2[$k];
      }
    }
    if ($updatelocations) {
      $this->locations = $this->getLocations();
    }
    Profiler::StopTimer("ConfigManager::ConfigMerge()");
  }
  /**
   * Take a multidimensional array representation of a config and flatten it into name/value pairs
   * @param array &$cfg config array
   *
   * @return array
   */
  function FlattenConfig(&$cfg, $prefix="") {
    $ret = array();
    if (empty($cfg)) {
      return $ret;
    }
    foreach ($cfg as $k=>$v) {
      $fullkeyname = (!empty($prefix) ? "$prefix." : "") . $k;
      if (is_array($v))
        $ret = array_merge($ret, $this->FlattenConfig($cfg[$k], $fullkeyname));
      else
        $ret[$fullkeyname] = $v;
    }
    return $ret;
  }

  /**
   * Load a specific config from the database, without walking the heirarchy
   *
   * @param string $name name of config to load
   * @return array
   */
  function Load($name, $role=NULL, $skipLocalConfig = false) {
    Profiler::StartTimer("ConfigManager::Load()");
    //print_pre("Load called with name=$name and role=$role");

    $config = new Config($name, $role);
    $this->configs[$name] = $ret = any($config->config, array());

    //if there are localconfig values stored, load them over the data already pulled out of the cache/db
    if( !$skipLocalConfig && $this->localConfig && $this->isLocalConfigEnabled($role) 
        && $this->localConfig->areThereLocalConfigFor($role, $name) ) {
      $this->configs[$name] = $ret = $this->localConfig->mergeLocalVals($role, $name, $ret);
    }

    Profiler::StopTimer("ConfigManager::Load()");
    return $ret;
  }

  /**
   * Update a specific config entry (diffs only)
   *
   * @param string $name name of config to update
   * @param array $newcfg new configuration object to compare with
   * @return array
   */
  function Update($name, $newcfg, $role="", $deletecfg=null, $skipLocalConfig = false, $addedcfg=null) {
    $ret = false;
    $updaterevision = false;

    $this->Load($name, $role, $skipLocalConfig);
    $oldcfg = $this->configs[$name];
    $cobrandid = $oldcfg["cobrandid"];
    $oldrevision = $oldcfg["revision"];

    //remove revision key / value pair. It should be auto incremented
    unset($oldcfg["revision"]);
    //unset($newcfg["revision"]);

    /*
    $diff = array_diff_assoc_recursive($newcfg, $oldcfg);
    $configupdates = $this->FlattenConfig($diff);
    */
    $configdeletes = $this->FlattenConfig($deletecfg);

    if (count($newcfg) > 0) {
      foreach ($newcfg as $k=>$v) {
        Logger::Debug('ConfigManager Update: [' . $name . ' ' . $cobrandid . ' ' . $role . '] ' . $k . ' = ' . $v["value"] . ' : ' . $v["type"]);
        $response = DataManager::Query("db.config.cobrand_config.{$name}-{$k}:nocache",
                                       "UPDATE config.cobrand_config SET value=:value, type=:type, modified_time=:timestamp WHERE name=:name AND cobrandid=:cobrandid AND role=:role",
                                       array(":value" => $v["value"], ":type" => $v["type"], ":name" => $k, ":cobrandid" => $cobrandid, ":role" => $role, ":timestamp" => unixtime_milli()));
        if (!empty($response) && $response->numrows > 0) {
          $ret = true;
        }
      }

      $updaterevision = true;
    }

    // process the inserts en-masse
    if (count($addedcfg) > 0) {
      $keyvalues = array();

      foreach ($addedcfg as $k=>$v) {
          $keyvalues[] = array("ccid" => md5int64($role.'-'.$cobrandid.'-'.$k) ,"cobrandid"=>$cobrandid,"name"=>$k,
            "value"=>$v["value"],"type"=>$v["type"],'role'=>$role);
       }

       if (!empty($keyvalues)) {
        $query = DataManager::insert("db.config.cobrand_config.{$name}-{$k}:nocache", "config.cobrand_config", $keyvalues);
        
         $ret |= true;
      } 

      $updaterevision = true;
    }

    // process the deletes
    if (count($configdeletes) > 0) {
      /*
      foreach ($configdeletes as $k=>$v) {
        if ($configdeletes[$k]) {
          $query = DataManager::query("db.config.cobrand_config.delete.{$name}-{$k}:nocache",
                                       "DELETE FROM config.cobrand_config WHERE name=:name AND cobrandid=:cobrandid and role=:role",
                                       array(":name" => $k, ":cobrandid" => $cobrandid, ":role" => $role));
          $ret |= true;
        }
      }
      */

      /* FIXME - code above deletes one-by-one, this code deletes en-masse.  Should we switch to this instead? */
      /* yes i believe so. -lazarus */
      $deletes = array();

      foreach ($configdeletes as $k=>$v) {
        if ($v == 1)
          $deletes[] = "'$k'";
      }

      if (!empty($deletes)) {
        $deletestr = implode(",", $deletes); // FIXME - doesn't PDO have a better way to handle "IN ('blah','asdf') type statements?
        $query = DataManager::query("db.config.cobrand_config.delete.{$name}-{$k}:nocache",
                                    "DELETE FROM config.cobrand_config WHERE cobrandid=:cobrandid AND role=:role AND name IN ($deletestr)",
                                    array(":cobrandid" => $cobrandid, ":role" => $role));
        $ret |= true;
      }

      $updaterevision = true;
    }

    if ($updaterevision) {
      $this->UpdateRevision($cobrandid, $role);
      DataManager::CacheClear("db.config.cobrand_config.{$name}.{$role}");
      DataManager::CacheClear("db.config.version.{$name}.{$role}");
    }

    if ($ret)
      DataManager::CacheClear("db.config.cobrand_config.{$name}.{$role}");

    return $ret;
  }

  /**
   * localconfig update a config array from ConfigManager::Load() with localconfig applied
   *
   * @param array $cmd the update command to run. Data: action, type, val, role, cobrand, ...
   * @param array $oldcfg config array to be modified
   * @return bool success
   */
  function localUpdate($cmd, &$oldcfg) {
    //walk the config array and make the update
    $arrayKeys = explode('.', $cmd['name']);
    $maxKeyLevel = count($arrayKeys);
    $currentKeyLevel = 1;
    $success = true;
    $configPtr =& $oldcfg;
    foreach($arrayKeys as $key) {
      if($currentKeyLevel == $maxKeyLevel) {
        //do the update, we're at the end of the walk
        if(is_array($configPtr[$key] || !isset($configPtr[$key]))) {
          $success = false;
          continue;
        } else {
          $configPtr[$key] = $cmd['val'];
        }
      } else {
        //middle of the walk, grab the next key and got
        if( isset($configPtr[$key]) ) {
          $configPtr =& $configPtr[$key];
        } else {
          $success = false;
          continue;
        }
      }
      $currentKeyLevel++;
    }
    unset($configPtr);

    if(!$success) {
      print_pre("Warning, localconfig updates could not be applied to ".
        "cobrand {$cmd['cobrand']} for config {$cmd['name']}");
    } else {
      //invalidate cache
      //unset($oldcfg["revision"]);
      //$cobrandid = $oldcfg["cobrandid"];
      //$this->UpdateRevision($cobrandid, $cmd['role']);
      //DataManager::CacheClear("db.config.version.{$name}.{$role}");
      //DataManager::CacheClear("db.config.cobrand_config.{$cmd['cobrand']}.{$cmd['role']}");
    }
    return $success;
  }

  /**
   * localconfig delete
   *
   * takes a stored delete command from localconfig and applied is to a config array from
   *  ConfigManager::Load
   * @param array $cmd the update command to run. Data: action, type, val, role, cobrand, ...
   * @param array $oldcfg config array to be modified
   * @return bool success
   */
  function localDelete($cmd, &$oldcfg) {
    //walk the config array and make the update
    $arrayKeys = explode('.', $cmd['name']);
    $maxKeyLevel = count($arrayKeys);
    $currentKeyLevel = 1;
    $success = true;
    $configPtr =& $oldcfg;
    foreach($arrayKeys as $key) {
      if($currentKeyLevel == $maxKeyLevel) {
        //do the update, we're at the end of the walk
        if(is_array($configPtr[$key] || !isset($configPtr[$key]))) {
          $success = false;
          continue;
        } else {
          unset($configPtr[$key]);
        }
      } else {
        //middle of the walk, grab the next key and go
        if( isset($configPtr[$key]) ) {
          $configPtr =& $configPtr[$key];
        } else {
          $success = false;
          continue;
        }
      }
      $currentKeyLevel++;
    }
    unset($configPtr);

    if(!$success) {
      print_pre("Warning, localconfig delete could not be applied to ".
        "cobrand {$cmd['cobrand']} for config {$cmd['name']}");
    } else {
      //invalidate cache
      //unset($oldcfg["revision"]);
      //$cobrandid = $oldcfg["cobrandid"];
      //$this->UpdateRevision($cobrandid, $cmd['role']);
      //DataManager::CacheClear("db.config.version.{$name}.{$role}");
      //DataManager::CacheClear("db.config.cobrand_config.{$cmd['cobrand']}.{$cmd['role']}");
    }
    return $success;
  }

  /**
   * function ConfigManager::localCreate
   *
   * for a localconfig create command apply it to a config array from ConfigManager::Load()
   * @param array $cmd the update command to run. Data: action, type, val, role, cobrand, ...
   * @param array $oldcfg config array to be modified
   * @return bool success
   */
  function localCreate($cmd, &$oldcfg) {
      //walk the config array and make the update
    $arrayKeys = explode('.', $cmd['name']);
    $maxKeyLevel = count($arrayKeys);
    $currentKeyLevel = 1;
    $success = true;
    $configPtr =& $oldcfg;
    foreach($arrayKeys as $key) {
      if($currentKeyLevel == $maxKeyLevel) {
        //do the create, we're at the end of the walk
        if(is_array($configPtr[$key] || !isset($configPtr[$key]))) {
          $success = false;
          continue;
        } else {
          $configPtr[$key] = $cmd['val'];
        }
      } else {
        //middle of the walk, grab the next key and got
        if( !isset($configPtr[$key]) ) {
          $configPtr[$key] = array();
        }
        $configPtr =& $configPtr[$key];
      }
      $currentKeyLevel++;
    }
    unset($configPtr);

    if(!$success) {
      print_pre("Warning, localconfig create could not be applied to ".
        "cobrand {$cmd['cobrand']} for config {$cmd['name']}");
    } else {
      //invalidate cache
      //unset($oldcfg["revision"]);
      //$cobrandid = $oldcfg["cobrandid"];
      //$this->UpdateRevision($cobrandid, $cmd['role']);
      //DataManager::CacheClear("db.config.version.{$name}.{$role}");
      //DataManager::CacheClear("db.config.cobrand_config.{$cmd['cobrand']}.{$cmd['role']}");
    }
    return $success;
  }

  /**
   * Add a key/value pair to the specified cobrand
   *
   * @param string $name name of config to add to
   * @param array $newcfg new key/value pair to add
   * @return array
   */
  function AddConfigValue($name, $newcfg, $role="", $skipLocalConfig = false) {
    $ret = false;
    if (!empty($newcfg["key"]) && isset($newcfg["value"])) {
      // check to see if there is a violation (single value vs. tree hiararchy)
      $wholecfg = $this->GetConfig($name, false, $role, $skipLocalConfig);
      $cobrandcfg = $this->Load($name, $role, $skipLocalConfig);
      $cobrandid = $cobrandcfg["cobrandid"];
      $keys = explode(".", $newcfg["key"]);
      $num_keys = count($keys);
      $valid = true;
      $i = 1;
      foreach ($keys as $key) {
        $wholecfg = ($wholecfg && is_array($wholecfg) && array_key_exists($key, $wholecfg)) ? $wholecfg[$key] : null;
        $cobrandcfg = ($cobrandcfg && is_array($cobrandcfg) && array_key_exists($key, $cobrandcfg)) ? $cobrandcfg[$key] : null;
        if ($i==$num_keys) {
          // can't add if the wholecfg is still an array or if the
          if (is_array($wholecfg)) {
            $valid = false;
            Logger::Warn("Cannot add '%s'='%s' configuration since the node below this is an array.", $newcfg["key"], $newcfg["value"]);
          } else if (!is_null($wholecfg) && !is_null($cobrandcfg)) {
            $valid = false;
            Logger::Warn("Cannot add '%s'='%s' configuration since there is already a value for it.", $newcfg["key"], $newcfg["value"]);
          }
        } else {
          if (!is_null($wholecfg) && !is_array($wholecfg)) {
            $valid = false;
            Logger::Warn("Cannot add '%s'='%s' configuration since the key is somewhere in the middle of the hierarchy.", $newcfg["key"], $newcfg["value"]);
            continue;
          }
        }
        $i++;
      }
      if ($valid) {
        $cobrandid = $this->GetCobrandId($name);

        $response = DataManager::query("db.config.cobrand_config.{$name}-{$newcfg['key']}:nocache",
                                       "INSERT INTO config.cobrand_config"
                                     . " SET ccid=config.hash_cobrand_config(:role, :cobrandid, :name),cobrandid=:cobrandid,name=:name,value=:value,role=:role,modified_time=:timestamp",
                                       array(":cobrandid" => $cobrandid, ":name" => $newcfg["key"], ":value" => $newcfg["value"], ":role" => $role, ":timestamp" => unixtime_milli()));
        if (!empty($response) && $response->numrows > 0) {
          $this->UpdateRevision($cobrandid, $role);
          //$this->data->caches["memcache"]["data"]->delete("db.config.cobrand_config.{$name}.{$role}");
          //$this->data->caches["memcache"]["data"]->delete("db.config.version.$name.$role");
          $ret = true;
          DataManager::CacheClear("db.config.cobrand_config.{$name}.{$role}");
          DataManager::CacheClear("db.config.version.$name.$role");
        }
      }
    }
    return $ret;
  }


    /**
     * Remove a key/value pair from the specified cobrand
     *
     * @param string $config_name name of config to delete item from, eg cobrand.shoptrue
     * @param array $oldcfg key/value pair to delete, eg array("key"=>ads.placements.right_bottom.enabled, "value"=>0)
     * @return boolean false on error
     */
    function DeleteConfigValue($config_name, $oldcfg, $role="") {
        $ret = false;
        if (!empty($oldcfg['key'])) {
            $response = DataManager::query("db.config.cobrand_config.{$config_name}-{$oldcfg['key']}:nocache",
                                       "DELETE FROM config.cobrand_config WHERE name=:key AND cobrandid=(SELECT cobrandid FROM config.cobrand WHERE name=:config_name) and role=:role",
                                       array(":key" => $oldcfg['key'], ":config_name" => $config_name, ":role" => $role));
            if (!empty($response)) {
                $ret = true;
                DataManager::CacheClear("db.config.cobrand_config.{$config_name}.{$role}");
            }
        }
        return $ret;
    }


  /**
   * Add a new cobrand to the config.cobrand table and set its version to 1 in config.version.
   *
   * @param array $cobrand
   * @return boolean
   */
  function AddCobrand($cobrandname) {
    $cobrandid = false;

    if (!empty($cobrandname)) {
      $query = DataManager::Query("db.config.cobrand.{$cobrandname}:nocache",
                            "INSERT INTO config.cobrand SET name=:name,cobrandid=config.hash_cobrand(name)",
                            array(":name" => $cobrandname));
      if (!empty($query) && $query->numrows > 0) {
        $cobrandid = $this->GetCobrandID($cobrandname);
        $query = DataManager::Query("db.config.cobrand.{$cobrandname}.version:nocache",
                              "INSERT INTO config.version (cobrandid, role, revision, added, updated) VALUES(:cobrandid, :role, 1, now(), now())",
                              array(":cobrandid" => $cobrandid,
                                    ":role" => $this->role)); // FIXME - should this add to all versions or just let the migrate script handle this?
        DataManager::CacheClear("db.config.version.ALL.{$this->role}");
        DataManager::CacheClear("db.config.version.$cobrandname.{$this->role}");
      }
    }
    return $cobrandid;
  }

  /**
   * Eradicate a cobrand from the config.cobrand, config.cobrand_config, and config.version tables.
   *
   * @param array $cobrandname
   * @return boolean
   */
  function DeleteCobrand($cobrandname) {
    $ret = false;

    if (!empty($cobrandname)) {
      $cobrandid = $this->GetCobrandId($cobrandname);
      if (!empty($cobrandid)) {
        Logger::Warn("Deleting cobrand '$cobrandname' (this is permanent across all roles)");
        $query = DataManager::Query("db.config.cobrand.{$cobrandname}:nocache",
                              "DELETE FROM config.cobrand WHERE cobrandid=:cobrandid",
                              array(":cobrandid" => $cobrandid));
        if (!empty($query) && $query->numrows == 1) {
          DataManager::query("db.config.cobrand.{$cobrandname}:nocache",
                       "DELETE FROM config.version WHERE cobrandid=:cobrandid",
                       array(":cobrandid" => $cobrandid));
          DataManager::query("db.config.cobrand.{$cobrandname}:nocache",
                       "DELETE FROM config.cobrand_config WHERE cobrandid=:cobrandid",
                       array(":cobrandid" => $cobrandid));
          $ret = true;
        }
      } else {
        Logger::Warn("Tried to delete cobrand '$cobrandname' which didn't exist");
      }
    }
    
    return $ret;
  }

  function invalidateConfigCache($cachekey) {
    $data = DataManager::singleton();
    $cachewrapper =& $data->caches["apc"]["default"];
    if( !empty($cachewrapper) && $cachewrapper->enabled ) {
      $cachewrapper->delete($cachekey);
    }
  }

  /**
   * Generate cachekey for storing configs
   * 
   * This functino generates cachekeys for storing config data. Cachekeys are generated differently
   * if localconfig is enabled.
   * @param $role string name of role key is being generated for. example: 'live'
   * @param $name string name of cobrand key is being generated for. example: 'thefind'
   * @return string cachekey
   **/
  function generateCacheKey($role, $name) {
    $cachekey = '';
    if($this->isLocalConfigEnabled()) {
      $cachekey = "localconfig.".md5($this->localConfig->directory).".$role.$name";
    } else {
      $cachekey = "config.$role.$name";
    }
    return $cachekey;
  }

  /**
   * Load a full configuration (walk the whole heirarchy)
   *
   * @param string $name Name of config to load
   * @return array
   */
  function &GetConfig($name, $setcurrent=true, $role="", $skipcache=false, $skipLocalConfig = false) {
    Profiler::StartTimer("ConfigManager::GetConfig()", 2);
    $ret = array();

    if ( ($name != "base") && (strpos($name, ".") === false) && (strpos($name, "abtest") === false)  ) {
      $name = "cobrand.$name";
    }

    $cachewrapper = null;
    $cachekey = $this->generateCacheKey($role, $name);
    $data = DataManager::singleton();
    $cachewrapper =& $data->caches["apc"]["default"];
    $allversions = $this->GetAllRevisions($role);
    if (!$skipcache && !empty($cachewrapper) && $cachewrapper->enabled) {
      if (($cachedresult = $cachewrapper->get($cachekey)) !== false ) {
        /*
        Logger::Info("Found '$cachekey' in apc cache (revision=" . $ret["revision"] . ")");
        $ret = unserialize($cachedresult);

        $versions = array();
        if (($cachedversions = $cachewrapper->get($cachekey . ".versions")) !== false ) {
          $versions = unserialize($cachedversions);
          $versionlog = "Found '$cachekey.versions' in apc cache (" . implode(", ", array_map(create_function('$a, $b', 'return "$a=$b";'), array_keys($versions), array_values($versions))) . ")";
          Logger::Info($versionlog);
        }
        $includes = $this->GetConfigHeirarchy($name, $role);
        */

        // New code transitioning to Config object
        // FIXME - this whole function should just be boiled down to a couple class functions

        $cachedcfg = unserialize($cachedresult);
        $ret = $cachedcfg->getConfig();
        $versions = $cachedcfg->getVersions();
        $includes = $cachedcfg->getHeirarchy();
        Logger::Info("Found '$cachekey' in apc cache (revision=" . $versions[$name] . " - " . implode(", ", array_map(create_function('$a, $b', 'return "$a=$b";'), array_keys($versions), array_values($versions))) . ")");

        // Check version numbers of all parents - if any have changed, invalidate the config and force a reload
        $allgood = true;
        foreach ($includes as $i=>$inc) {
          //$retinc = unserialize($cachewrapper->get("config.$role.$inc"));
          //$vinc = $this->GetCobrandidAndRevision($inc, $role);

          //if ($versions[$inc] < $vinc["revision"]){
          if ($versions[$inc] < $allversions[$inc]){
            Logger::Warn("Revision number for '$name' parent '$inc' is out of date (old revision=" . $versions[$inc] . " new revision=" . $allversions[$inc] . ")");
            $ret = array();
            $skipcache = true;
            $allgood = false;

            /*
            for ($j = $i; $j >= 0; $j--) { // Clear cache entries for anything above this one
              Logger::Info("Delete cache: {$includes[$j]}");
              $cachewrapper->delete("config.$role.{$includes[$j]}");
              $cachewrapper->delete("config.$role.{$includes[$j]}.heirarchy");
              $cachewrapper->delete("config.$role.{$includes[$j]}.versions");
            }
            */
          }
        }
        if ($allgood)
          Logger::Info("Cached config for '$name' is up-to-date");
      }
    }

    if (empty($ret)) {
      // Check to see if config exists in memory - if it doesn't, fetch it
      $config = null;
      $configversions = array();
      if (!empty($this->configs[$name])) {
        $config = $this->configs[$name];
      } else {
        $config = $this->Load($name, $role, $skipLocalConfig);
      }

      if (!empty($config)) {
        // Process includes first
        if (!empty($config["include"])) {
          $includes = explode(",", $config["include"]);

          foreach ($includes as $inc) {
            $included_config =& $this->GetConfig($inc, false, $role, $skipcache, $skipLocalConfig);
            if (!empty($included_config)) {
              $this->ConfigMerge($ret, $included_config);
            }
          }
        }

        // Merge in my own config...
        $this->ConfigMerge($ret, $config);

        // and then merge in any overrides
        if (!empty($config["override"])) {
          $includes = explode(",", $config["override"]);

          foreach ($includes as $inc) {
            $included_config =& $this->GetConfig($inc, false, $role, $skipcache, $skipLocalConfig);
            if (!empty($included_config)) {
              $this->ConfigMerge($ret, $included_config);
            }
          }
        }
      }

      if (!empty($ret) && !empty($cachewrapper) && $cachewrapper->enabled) {
        // Store merged config result in APC
        $configheirarchy = $this->GetConfigHeirarchy($name, $role, true);
        foreach ($configheirarchy as $inc) {
          $included_version = $this->GetCobrandidAndRevision($inc, $role);
          $configversions[$inc] = $allversions[$inc]; //$this->configs[$inc]["revision"];
        }
        /*
        Logger::Debug($configheirarchy);
        Logger::Debug($configversions);
        */

        $cachecfg = new Config();
        $cachecfg->setName($name);
        $cachecfg->setConfig($ret);
        $cachecfg->setHeirarchy($configheirarchy);
        $cachecfg->setVersions($configversions);
        $cachewrapper->set($cachekey, serialize($cachecfg));
        //$cachewrapper->set($cachekey . ".versions", serialize($configversions));
        Logger::Info("Set '$cachekey' in apc cache");
      }
    }

    if ($setcurrent) {
      $this->current =& $ret;
      // Update locations to reflect any new settings we got from the cobrand config
      $this->locations = $this->getLocations();
    }
    Profiler::StopTimer("ConfigManager::GetConfig()");
    return $ret;
  }

  function GetConfigHeirarchy($name, $role="", $skipcache=false) {
    Profiler::StartTimer("ConfigManager::GetConfigHeirarchy()");
    $thislevel = array($name);
    $underneath = array();
    $over = array();

    if (empty($role))
      $role = $this->role;

    if (!$skipcache && !empty($this->heirarchies[$role][$name])) {
      //print_pre("got it already");
      $ret = $this->heirarchies[$role][$name];
    }

    if (!$skipcache && empty($ret)) {
      $cachewrapper = null;
      $cachekey = $this->generateCacheKey($role, $name);

      $data = DataManager::singleton();
      if (!empty($data->caches["apc"]["default"]) && $data->caches["apc"]["default"]->enabled) {
        $cachewrapper =& $data->caches["apc"]["default"];

        if (($cachedresult = $cachewrapper->get($cachekey)) !== false) {
          Logger::Info("Found '$cachekey' in apc cache");
          $cachedcfg = unserialize($cachedresult);
          $ret = $cachedcfg->getHeirarchy();
        }
      }
    }

    // Check to see if the cache had what we needed
    if (empty($ret)) {
      $config = (!empty($this->configs[$name]) ? $this->configs[$name] : $this->Load($name, $role));
      if (!empty($config)) {
        if (!empty($config["include"])) {
          $includes = explode(",", $config["include"]);
          foreach ($includes as $inc) {
            $underneath = array_merge($this->GetConfigHeirarchy($inc, $role), $underneath);
          }
        }
        if (!empty($config["override"])) {
          $overrides = explode(",", $config["override"]);
          foreach ($overrides as $override)
            $over = array_merge($over, $this->GetConfigHeirarchy($override, $role));
        }
      }

      foreach ($underneath as $k)
        array_push($thislevel, $k);
      foreach ($over as $k)
        array_unshift($thislevel, $k);

      $ret = $thislevel;
    }

    if (!empty($ret)) {
      $this->heirarchies[$role][$name] = $ret;

      /* No longer needed now that we combine everything into one cache entry....I think....
      if (!empty($cachewrapper)) {
        $cachewrapper->set($cachekey, serialize($ret));
      }
      */
    }
    Profiler::StopTimer("ConfigManager::GetConfigHeirarchy()");
    return $ret;
  }

  /**
   * Get list of all cobrands in config database
   *
   * @return array
   */
  function GetCobrandList($orderby="name") {
    $ret = NULL;

    $result = DataManager::Query("db.config.cobrand.list:nocache",
                                 "SELECT * FROM config.cobrand ORDER BY $orderby");
    if ($result && count($result->rows) > 0) {
      $configs = $result->rows;

      foreach ($configs as $config) {
        list($confgroup,$confname) = explode(".", $config->name, 2);

        if (!empty($confgroup) && $confgroup != "base") {
          $ret[$confgroup][] = $config;
        } else {
          $ret[] = $config;
        }
      }

    }
    return $ret;
  }

  /**
   * Add the revision information to a new cobrand to the config.version table.
   *
   * @param array $cobrandid, $role
   * @return boolean
   */
  function AddRevision($cobrandid, $role) {
    $ret = false;

    if ($cobrandid && $role) {
      $query = DataManager::Query("db.config.version.{$cobrandid}.{$role}",
                                  "INSERT INTO config.version SET cobrandid=:cobrandid, role=:role, revision=1, added=now(), updated=now()",
                                  array(":cobrandid" => $cobrandid, ":role" => $role));
      if (!empty($query) && $query->numrows > 0) {
        $ret = true;
      }
    }

    if ($ret)
      $this->data->caches["memcache"]["data"]->delete("db.config.version.{$cobrandid}.{$role}");

    return $ret;
  }

  /**
   * Add the revision information to a new cobrand to the config.version table.
   *
   * @param array $name, $role
   * @return boolean
   */
   function AddRevisionByName($name, $role) {
     $ret = false;

     if ($name && $role) {
        $query = DataManager::Query("db.config.version.{$name}.{$role}:nocache",
                                    "INSERT INTO config.version SET cobrandid=(SELECT cobrandid FROM config.cobrand WHERE name=:name), role=:role, revision=1, added=now(), updated=now()",
                                    array(":name" => $name, ":role" => $role));
        if (!empty($query) && $query->numrows > 0) {
           $ret = true;
        }
     }

     if ($ret) {
       DataManager::CacheClear("db.config.version.{$name}.{$role}");
     }

     return $ret;
   }


  /**
   * get the revision information of a cobrand from the config.version table.
   *
   * @param array $cobrandid, $role, $nocache
   * @return $revision
   */
  function GetRevision($cobrandid, $role, $nocache=false) {
    $revision = 0;

    if ($cobrandid && $role) {
      $query = DataManager::Query("db.config.version.{$cobrandid}.{$role}".($nocache?":nocache":""),
                                  "SELECT revision FROM config.version WHERE cobrandid=:cobrandid and role=:role",
                                  array(":cobrandid" => $cobrandid, ":role" => $role));
      if (!empty($query) && $query->NumResults() > 0) {
        $version_info = $query->GetResult(0);
        $revision = $version_info->revision;
      }else{
        if ($this->AddRevision($cobrandid, $role)) {
          $revision = 1;
        }
      }

    }

    return $revision;
  }
  /**
   * get the revision information of all cobrands from the config.version table.
   *
   * @param array $role, $nocache
   * @return $revision
   */
  function GetAllRevisions($role, $nocache=false) {
    if (empty($this->allrevisions) || $nocache) {
      $data = DataManager::singleton();
      $query = DataManager::Query("db.config.version.ALL.$role" . ($nocache ? ":nocache" : ""),
                                  "SELECT cobrand.cobrandid,name,revision FROM config.cobrand LEFT JOIN config.version USING(cobrandid) WHERE role=:role",
                                  array(":role" => $role));
      if (!empty($query->rows)) {
        foreach ($query->rows as $row) {
          $ret[$row->name] = $row->revision;
        }
      }
      if (!$nocache)
        $this->allrevisions = $ret;
    } else if (!$nocache) { // FIXME - surely this logic makes more sense another way...
      $ret = $this->allrevisions;
    }
    return $ret;
  }

  /**
   * Update the revision information of a cobrand  from the config.version table.
   *
   * @param array $cobrandid, $role
   * @return boolean
   */
  function UpdateRevision($cobrandid, $role) {
    $ret = false;
    if ($cobrandid && $role) {
      if ($this->GetRevision($cobrandid, $role, true)) {
        $query = DataManager::Query("db.config.version.{$cobrandid}.{$role}:nocache",
                                  "UPDATE config.version SET revision=revision+1, updated=now() WHERE cobrandid=:cobrandid and role=:role",
                                  array(":cobrandid" => $cobrandid, ":role" => $role));
        if (!empty($query) && $query->numrows > 0) {
          $ret = true;
        }
      }
    }
    if ($ret) {
      DataManager::CacheClear("db.config.version.{$cobrandid}.{$role}");
      DataManager::CacheClear("db.config.version.ALL.$role");
    }

    return $ret;
  }


  /**
   * get the cobrandid for a specified cobrand name
   *
   * @param $name
   * @return integer
   */
  function GetCobrandId($name) {
    $ret = NULL;
    
    if (!empty($name)) {
      $data = DataManager::singleton();
      $query = DataManager::Query("db.config.version.$name.$role:nocache",
                            "SELECT cobrandid FROM config.cobrand WHERE name=:name",
                            array(":name" => $name));
      if (!empty($query->rows) && count($query->rows) == 1) {
        $ret = $query->rows[0]->cobrandid;
      }
    }
    return $ret;
  }

  /**
   * get the cobrandid and revision information
   *
   * @param $name, $role, $nocache
   * @return array
   */
  function GetCobrandidAndRevision($name, $role, $nocache=false) {
    $ret = array();
 
    if ($name && $role) {
      $query = DataManager::Query("db.config.version.$name.$role".($nocache?":nocache":""),
                                  "SELECT config.version.cobrandid, config.version.revision FROM config.version INNER JOIN config.cobrand on config.version.cobrandid=config.cobrand.cobrandid WHERE config.cobrand.name=:name and config.version.role=:role",
                                  array(":name" => $name, ":role" => $role));
      
      if ($query && $query->NumResults() == 1) {
        $version_info = $query->GetResult(0);
        $ret["cobrandid"] = $version_info->cobrandid;
        $ret["revision"] = $version_info->revision;
      } elseif($nocache==true) {
        if($this->AddRevisionByName($name, $role)) {
          $this->GetCobrandidAndRevision($name, $role);
        }
      }
    }
 
    return $ret;
  }

  public static function get($key) {
    return self::singleton()->GetSetting($key);
  }
  public static function merge(&$newcfg) {
    return self::singleton()->ConfigMerge(self::$instance->current, $newcfg);
  }
}

/**
 * class Config
 * Represents a single cobrand config
 * @package Framework
 * @subpackage Config
 */
class Config {
  protected $cobrandid;
  public $name;
  protected $role;
  protected $revision;
  public $versions;
  public $heirarchy;
  public $config;

  public function __construct($name=NULL, $role=NULL) {
    if ($role === NULL) {
      $cfg = ConfigManager::singleton();
      $role = $cfg->role;
    }
    if ($name !== NULL) {
      $this->Load($name, $role);
    }
  }

  public function setName($name) {
    $this->name = $name;
    $this->cobrandid = NULL;
  }
  // FIXME - Getters/setters here are mainly just for munging into legacy stuff.  These should be filled in to do what ConfigManager currently does manually.
  public function setVersions($versions) {
    $this->versions = $versions;
  }
  public function getVersions() {
    return $this->versions;
  }
  public function setHeirarchy($heirarchy) {
    $this->heirarchy = $heirarchy;
  }
  public function getHeirarchy() {
    return $this->heirarchy;
  }

  /**
   * Load a specific config from the database, without walking the heirarchy
   *
   * @param string $name name of config to load
   * @return array
   */
  public function Load($name, $role) {
    Profiler::StartTimer("Config::Load()");
    $data = DataManager::singleton();
    $ret = array();

    $this->name = $name;
    $this->role = $role;

    $ret = $this->GetCobrandidAndRevision();
    if (!empty($ret)) {
      $result_config = DataManager::Query(
        "db.config.cobrand_config.{$name}.{$role}",
        "SELECT name,value FROM config.cobrand_config WHERE cobrandid=:cobrandid and role=:role ORDER BY name",
        array(":cobrandid" => $ret["cobrandid"], ":role" => $role)
      );
      if ($result_config && count($result_config->rows) > 0) {
        $settings = array();
        foreach ($result_config->rows as $config_obj) {
          $settings[$config_obj->name] = $config_obj->value;
        }
        array_set_multi($ret, $settings);
        $this->config = $ret;
      }
    } else {
      Logger::Error("Could not find config '$name'");
    }

    Profiler::StopTimer("Config::Load()");
    //print_pre($ret);
    return $ret;
  }

  /**
   * get the cobrandid and revision information
   *
   * @param $name, $role, $nocache
   * @return array
   */
  function GetCobrandidAndRevision($nocache=false) {
    $ret = array();

    if ($this->name && $this->role) {
      $query = DataManager::Query(
        "db.config.version.{$this->name}.{$this->role}".($nocache?":nocache":""),
        "SELECT config.version.cobrandid, config.version.revision FROM config.version INNER JOIN config.cobrand on config.version.cobrandid=config.cobrand.cobrandid WHERE config.cobrand.name=:name and config.version.role=:role",
        array(":name" => $this->name, ":role" => $this->role)
      );
      if ($query && $query->NumResults() == 1) {
        $version_info = $query->GetResult(0);
        $this->cobrandid = $version_info->cobrandid;
        $this->revision = $version_info->revision;
      } elseif($nocache==true) {
        if($this->AddRevisionByName($name, $role)) {
          $this->GetCobrandidAndRevision($name, $role);
        }
      }
    }
    return array("cobrandid" => $this->cobrandid, "revision" => $this->revision);
  }

  public function isValid() {
    return !empty($this->configs);
  }

  public function getConfig() {
    return $this->config;
  }
  public function setConfig($config) {
    $this->config = $config;
  }

  public function setOptions($options) {
    $ret = false;
    if (!is_array($this->config))
      $this->config = array();
    if (is_array($options)) {
      array_set_multi($newcfg, $options);
      $this->config = array_merge_recursive($this->config, $newcfg);
      $ret = true;
    }
    return $ret;
  }

  public function Save() {
    if (empty($this->cobrandid)) {
      $cobrandinfo = $this->GetCobrandidAndRevision();
      //print_pre($cobrandinfo);
    }
  }
}

/**
 * class ConfigMerged
 * Represents a cobrand config after being merged with its includes/overrides
 * @package Framework
 * @subpackage Config
 */
class ConfigMerged extends Config {
  public $heirarchy;
  public $versions;
  public $options;

  public function loadFromCache() {
    $cachekey = $this->generateCacheKey($this->role, $this->name);
    $data = DataManager::singleton();
    $cachewrapper =& $data->caches["apc"]["default"];
    if (($cachedresult = $cachewrapper->get($cachekey)) !== false ) {
      $configobj = unserialize($cachedresult);
      Logger::Info("Found '$cachekey' in apc cache (revision=" . $cacheobj->revision . ")");

      $allversions = $this->GetAllRevisions($role);
      Logger::Debug($allversions);
      foreach ($cacheobj->heirarchy as $i=>$inc) {
        if ($cacheobj->versions[$inc] < $allversions[$inc]){
          Logger::Warn("Revision number for '$name' parent '$inc' is out of date (old revision=" . $cacheobj->versions[$inc] . " new revision=" . $allversions[$inc] . ")");
          $ret = array();
          $skipcache = true;

          for ($j = $i; $j >= 0; $j--) { // Clear cache entries for anything above this one
            Logger::Info("Delete cache: {$includes[$j]}");
            /*
             // FIXME - need to invalidate instead of deleting
              $cachewrapper->delete("config.$role.{$includes[$j]}");
              $cachewrapper->delete("config.$role.{$includes[$j]}.heirarchy");
              $cachewrapper->delete("config.$role.{$includes[$j]}.versions");
            */
          }
        }
      }
    }
  }
}

/**
 * Class LocalConfigManager
 * When enabled all config modifications to allowed roles (ConfigManager::$localConfig_allowedRoles) 
 * are stored in a local file until committed using the localConfig admin tool
 * config file settings used by ConfigManager class and passed into this constructor:
 *   config.manager.localconfig 1 or 0 enables or disables the localconfig. Even if localConfig
 *     is enabled, the current server mapped role must still be on the allowed roles list
 *   config.manager.localconfigfile The file to store/retrieve stored config changes
 *   config.manager.localconfigdir The directory to look in: config/<localconfigdir>
 **/
class LocalConfigManager {
  public $directory; //directory to look for localconfig file
  public $filename; //name of localconfig file to store updates
  public $apcenabled;
  public $storedCommands; //array of commands to run on the config, ordered from 1st to last
  public $allowedCommands = array(
    'create',
    'update',
    'delete'
  );

  /**
   * LocalConfigManager::constructor
   * Initialize LocalConfigManager object for use with the 
   * @param $directory string path to look for localconfig file
   * @param $filename string the filename of the file to store/read updates to the config
   * @param $apcenabled bool
   */
  public function __construct($directory, $filename, $apcenabled = false) {
    $this->apcenabled = $apcenabled;
    $this->directory = $directory;
    $this->filename = $filename;
    $this->storedCommands = array();

    //check if path exists in filename
    if(!file_exists($this->directory)) {
      //unfortunately php doesn't seem to have permission on newdev to create directories
      //so probably not needed to be able to dynamically change the directory
      //that local config uses. Better to make it hard coded and check that directory into 
      //svn. or just dump the file in the component/config dir? Ask james which for pref
      print_pre('localconfig directory does not exist: '.$this->directory);
    }
    $this->load_commands();
  }

  /**
   * LocalConfigManager::getLocalConfigFileName
   *
   * returns the path/filename of the file used to store localconfig serialized values
   * @return string
   **/
  public function getLocalConfigFileName() {
    return $this->directory . DIRECTORY_SEPARATOR . $this->filename;
  }

  /**
   * LocalConfigManager::load_commands
   *
   * fetch any json data stored in the localconfig file, unserialize it, and
   * stores the array of commands in this->storedCommands
   * @return void
   **/
  public function load_commands() {
    $encodedData = false;
  
    //before loading the file see if it's stored in apc
    $name = $this->getLocalConfigFileName();
    if (file_exists($name)) {
      $mtime = filemtime($name);
      if (!empty($mtime)) {
        $apckey = $name . ':' . $mtime;
        if ($this->apcenabled && ($apccontents = apc_fetch($apckey)) != false) {
          $encodedData = $apccontents;
        }
        //if not in the apc retrieve from file
        if(!$encodedData) {
          $encodedData = file_get_contents($name);
          if ($this->apcenabled && !empty($encodedData)) {
            apc_store($apckey, $encodedData);
          } 
        }
        if($encodedData) {
          $this->storedCommands = json_decode($encodedData, true);
        }
      }
    }
    if(!is_array($this->storedCommands)) {
      $this->storedCommands = array();
      //print_pre('setting stored commands to empty array');
    }
  }

  /**
   * LocalConfigManager::store_commands
   *
   * json encode this->storedCommands and writes them to the localconfig file (overwrites any content)
   * @return void //todo return status of the write to enable better error handling
   **/
  public function store_commands() {
    $name = $this->directory . '/' . $this->filename;
    $encodedData = json_encode($this->storedCommands);
    if(!file_exists($name)) {
      touch($name);
    }
    
    $mtime = filemtime($name);
    if (!empty($mtime)) {
      $apckey = $name . ":" . $mtime;
      apc_store($apckey, $encodedData);
    }
    $status = @file_put_contents($name, $encodedData);
    if($status === false) {
      //handle failure to write to file better
      //print_pre('failed to write data to ' . $name);
    }
  }

  /**
   * LocalConfigManager::isValidAction
   *
   * determines if an action is valid by comparing to an array of valid actions in this->allowedCommands
   * @param $action string action for/from a command to test
   * @return bool
   * TODO: use this function more, I think I skipped this test a few too many times
   **/
  public function isValidAction($action) {
    return in_array($action, $this->allowedCommands);
  }

  /**
   * LocalConfigManager::add_command
   * add a new command to the array of stored commands
   * @param $role string must be in the list of allowed roles
   * @param $action string must be in the list of allowed commands
   * @param $cobrand string cobrand string example: thefind
   * @param $details array config array of command's information (key, val, type)
   * @return bool success of adding command
   **/
  public function add_command($role, $action, $cobrand, $details){
    //ensure params are not empty, exluding val
    //check that action is valid
    $success = true;
    if( !empty($action) && !empty($cobrand) && !empty($details) && $this->isValidAction($action) ) {
      foreach($details as $cfg) {
        array_push($this->storedCommands, array(
          'role' => $role,
          'action' => $action,
          'cobrand' => $cobrand,
          'name' => $cfg['key'],
          'val' => $cfg['val'],
          'type' => $cfg['type']
        ));
      }
      $this->store_commands();
    }
    return $success;
  }

  /**
   * LocalConfigManager::getCommandsByRoleCobrand
   *
   * returns only the stored commands that match given a role and a cobrand name.
   * This is used by configManager::Load a specific cobrand/role
   * @param $role string Role name example: 'elation'
   * @param $cobrand mixed array for multiple or string. Cobrand name example: 'thefind'
   * @return array of commands that matched
   **/
  public function getCommandsByRoleCobrand($role, $cobrand) {
    $ret = array();
    if(!is_array($cobrand)) {
      $cobrand = array($cobrand);
    }
    foreach($this->storedCommands as $command) {
      if($command['role'] == $role && in_array($command['cobrand'], $cobrand) ) {
        array_push($ret, $command);
      }
    }
    return $ret;
  }

  /**
   * LocalConfigManager::areThereLocalConfigFor
   *
   * Test if there are modifications for a role/cobarnd stored
   * @param $role string Role name example: 'elation'
   * @param $cobrand mixed array for multiple or string Cobrand name example: 'thefind'
   * @return bool
   **/
  public function areThereLocalConfigFor($role, $cobrand) {
    $ret = false;
    if(!is_array($cobrand)) {
      $cobrand = array($cobrand);
    }
    foreach($this->storedCommands as $command) {
      if($command['role'] == $role && in_array($command['cobrand'], $cobrand) ) {
        $ret = true;
        continue;
      }
    }
    return $ret;
  }  

  /**
   * LocalConfigManager::applyCommand
   *
   * given a command, inspect the action and call the appropriate handler function to apply
   * locally stored localconfig values to the config array passed in.
   * @param $cmd array command, should probably be an object and not an array, lazy for now
   * @param &$oldcfg array config array (not flattened). changes are applied to this parameter
   * @return void
   **/
  public function applyCommand($cmd, &$oldcfg) {
    $cfg = ConfigManager::singleton();
    switch($cmd['action']) {
      case 'create':
          $cfg->localCreate($cmd, $oldcfg);
        break;

      case 'update':
          $cfg->localUpdate($cmd, $oldcfg);
        break;

      case 'delete':
          $cfg->localDelete($cmd, $oldcfg);
        break;
    }
  }

  /**
   * LocalConfigManager::mergeLocalVals
   *
   * Given a config array apply any localconfig values and returned the merged array
   * @param $role string
   * @param $cobrand mixed array or string of cobrandname(s)
   * @param $oldcfg array config array (not flattened)
   * @return array merge of $oldcfg passed in and any localconfig values that match role/cobrand and action
   **/
  public function mergeLocalVals($role, $cobrand, $oldcfg) {
    $localCommands = $this->getCommandsByRoleCobrand($role, $cobrand);
    foreach($localCommands as $command) {
      $this->applyCommand($command, $oldcfg);
    }
    return $oldcfg;
  }

  /**
   * LocalConfigManager::mergeAdminSelectResults
   * 
   * Used by the admin select controller when searching for cobrand configs.
   * This function applies local config stored mofidications on the results set
   * NOTE: this function skips over configs that have been created using localconfig because it's
   *  currently not possible to know if the created config would have been in the result set
   *  adding this feature would require a rewrite of how the select functionality works
   * @param &$results array the result set to modify
   * @param $role string
   * @param $cobrand array of cobrandnames in the resultset
   * @return bool success
   **/
  public function mergeAdminSelectResults(&$results, $role, $cobrand) {
    $localCommands = $this->getCommandsByRoleCobrand($role, $cobrand);
    //order of the commands matter, use for outer loop
    foreach($localCommands as $command) {  
      foreach($results as $key => &$result) {  
        if($command['name'] == $result->name && $command['cobrand'] == $result->cobrandname) {
          //apply command
          switch($command['action']) {
            case 'update':
              $result->value = $command['val'];
              $result->type = $command['type'];
              break;
            case 'delete':
              unset($results[$key]);
              break;
            //case 'create':
              //break;
            //ignore create case, no current way to know if a localconfig created config
              //would have matched the search
              //limitation of how the admin search is done, needs a redesign to work
              //properly with localconfig. Too much effort for this stage of development.
          }
        }
      }
    }
    //if there were any deletes reindex the array, otherwise breaks in js
    $results = array_values($results);
  }

  /**
   * LocalConfigManager::commitCommands
   * 
   * Given a set of indexes to commit, commit them using ConfigManager then delete them from the stored commands
   * @param $indexes array [1,4,5]
   * @return bool success
   **/
  public function commitCommands($indexes) {
    $cfg = ConfigManager::singleton();
    $status = true;
    $commandsToRun = array();
    if(!empty($indexes)) {
      foreach($this->storedCommands as $key => $value) {
        if(in_array($key, $indexes)) {
          $commandsToRun[] = $this->storedCommands[$key];
        }
      }
      foreach($commandsToRun as $cmd) {
        $setcurrent = true;
        $skipcache = true;
        $skipLocalConfig = true;
        //load an unmodified version of the cobrand, otherwise the localconfig changes will have already been applied
        //and committing the commands won't work outside of this session, as they'll already have been
        //temporarily applied by the localconfig calls in getConfig()/Load(). To make the commits
        //be applied to the db pass the $skipLocalConfig flag
        $cfg->GetConfig($cmd['cobrand'], $setcurrent, $cmd['role'], $skipcache, $skipLocalConfig);
        switch($cmd['action']) {
          case 'update':
            $skipLocalConfig = true;
            $newcfg = array(
              $cmd['name'] => array(
                'value' => $cmd['val'],
                'type' => $cmd['type']
              )
            );
            $status = $cfg->Update($cmd['cobrand'], $newcfg, $cmd['role'], null, $skipLocalConfig);
            if(!$status) print_pre('Update failed for '.print_r($cmd, true));
            break;
          case 'delete':
            $keys = explode('.', $cmd['name']);
            $depth = count($keys);
            $currentDepth = 1;
            $deleteConfig = array();
            $arrayPtr =& $deleteConfig;
            foreach($keys as $key) {
              if($currentDepth == $depth) {
                $arrayPtr[$key] = 1;
              } else {
                $arrayPtr[$key] = array();
              }
              $arrayPtr =& $arrayPtr[$key];
              $currentDepth++;
            }
            unset($arrayPtr);
            $status = $cfg->Update($cmd['cobrand'], array(), $cmd['role'], $deleteConfig, $skipLocalConfig);
            if(!$status) print_pre('Delete failed for '.print_r($cmd, true));
            break;
          case 'create':
            $skipLocalConfig = true;
            $status = $cfg->AddConfigValue($cmd['cobrand'], array(
              'key' => $cmd['name'], 
              'value' => $cmd['val'], 
              'type' => $cmd['type']
            ), $cmd['role'], $skipLocalConfig);
            if(!$status) print_pre('create failed for '.print_r($cmd, true));
            break;
        }
      }
      $this->deleteCommands($indexes);
    } else {
      $status = false;
    }

    return $status;
  }

  /**
   * LocalConfigManager::deleteCommands
   * 
   * Given a set of indexes to remove, deletes them from the set of stored commands
   * @param $indexes array [1,4,5]
   * @return bool success
   **/
  public function deleteCommands($indexes) {
    $status = true;
    if(!empty($indexes)) {
      foreach($this->storedCommands as $key => $value) {
        if(in_array($key, $indexes)) {
          unset($this->storedCommands[$key]);
        }
      }
      $this->storedCommands = array_values($this->storedCommands);
      $this->store_commands();
    } else {
      $status = false;
    }
    return $status;
  }

}

