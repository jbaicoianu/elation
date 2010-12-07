<?
/**
 * class ConfigManager
 * Singleton for handling basic config functions
 * @package Framework
 * @subpackage Config
 */
class ConfigManager extends Base {
  var $parent;

  var $servers;
  var $configs;

  var $rootdir;
  var $locations;

  /**
   * constructor
   */
  public function __construct($rootdir=null, $autoload=true) {
    $this->rootdir = $rootdir;
    // init the locations
    $this->locations = $this->getLocations();
    // load servers
    if ($autoload && $this->locations !== NULL && !empty($this->locations["config"])) {
      $this->servers = $this->LoadServers($this->locations["config"] . "/servers.ini");
    }
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
   * Load server settings from specified ini file
   *
   * @param string $cfgfile ini file to load from
   * @return array server config block (also stored as $this->servers)
   */

  function LoadServers($cfgfile, $assign=true) {
    //Profiler::StartTimer("ConfigManager::LoadServers()");
    $servers = array();

    $this->hostname = $hostname = trim(implode("", file("/etc/hostname")));
    if (file_exists($cfgfile)) {
      $mtime = filemtime($cfgfile);
      if (!empty($mtime)) {
        // NOTE - This uses APC directly, since the datamanager object requires this function to execute before initializing
        $apcenabled = ini_get("apc.enabled");
        $apckey = "servers.ini.$mtime";
        //print "check apc for '$apckey'<br />";
        if ($apcenabled && ($apccontents = apc_fetch($apckey)) != false) {
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
          $servers["role"] = ($settings["mapping"][$hostname]) ? $settings["mapping"][$hostname] : "live"; // default to live so the site will work if /etc/hostname is missing
          // If our host is part of a grouping, load those settings up
          if (!empty($settings["mapping"]) && !empty($settings["mapping"][$hostname]) && !empty($settings[$settings["mapping"][$hostname]])) {
            Logger::Info("$hostname is currently in the '" . $settings["mapping"][$hostname] . "' group");
            array_set_multi($servers, $settings[$settings["mapping"][$hostname]]);
          }

          // And finally, load any host-specific settings
          if (!empty($settings[$hostname])) {
            array_set_multi($servers, $settings[$hostname]);
          }

          if ($apcenabled) {
            apc_store($apckey, serialize($servers));
          }
        }
      }

      if ($assign)
        $this->servers =& $servers;
      //Profiler::StopTimer("ConfigManager::LoadServers()");

      if (isset($this->servers["logger"]["enabled"]) && empty($this->servers["logger"]["enabled"]))
        Logger::$enabled = false;
      if (isset($this->servers["profiler"]["enabled"]) && empty($this->servers["profiler"]["enabled"]))
        Profiler::$enabled = false;
    }

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
  function ConfigMerge(&$cfg1, &$cfg2) {
    Profiler::StartTimer("ConfigManager::ConfigMerge()");
    foreach ($cfg2 as $k=>$v) {
      if (is_array($v)) {
        $this->ConfigMerge($cfg1[$k], $cfg2[$k]);
      } else {
        $cfg1[$k] = $cfg2[$k];
      }
    }
    //$this->locations = $this->getLocations();
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
  function Load($name, $role=NULL) {
    Profiler::StartTimer("ConfigManager::Load()");
/*
    $ret = array();
    $role = any($role, $this->servers["role"], "");
    $ret = $this->GetCobrandidAndRevision($name, $role);
    if (!empty($ret)) {
      $result_config = DataManager::Query("db.config.cobrand_config.{$name}.{$role}:nocache",
                                          "SELECT name,value FROM config.cobrand_config WHERE cobrandid=:cobrandid and role=:role ORDER BY name",
                                          array(":cobrandid" => $ret["cobrandid"], ":role" => $role));
      //print_pre($result_config);
      if ($result_config && count($result_config->rows) > 0) {
        $settings = array();
        foreach ($result_config->rows as $config_obj) {
          $settings[$config_obj->name] = $config_obj->value;
        }
        array_set_multi($ret, $settings);
        $this->configs[$name] = $ret;
      }
    } else {
      Logger::Error("Could not find config '$name'");
    }
*/
    //$this->configs[$name] = new Config($name, $role);
    $config = new Config($name, $role);
    $this->configs[$name] = $ret = any($config->config, array());

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
  function Update($name, $newcfg, $role="", $deletecfg=null) {
    $ret = false;
    $updaterevision = false;

    $this->Load($name, $role);
    $oldcfg = $this->configs[$name];
    $cobrandid = $oldcfg["cobrandid"];
    $oldrevision = $oldcfg["revision"];

    //remove revision key / value pair. It should be auto incremented
    unset($oldcfg["revision"]);
    unset($newcfg["revision"]);

    $diff = array_diff_assoc_recursive($newcfg, $oldcfg);

    $configupdates = $this->FlattenConfig($diff);
    $configdeletes = $this->FlattenConfig($deletecfg);
    if (count($configupdates) > 0) {
      foreach ($configupdates as $k=>$v) {
        $response = DataManager::query("db.config.cobrand_config.{$name}-{$k}:nocache",
                                       "UPDATE config.cobrand_config SET value=:value WHERE name=:name AND cobrandid=:cobrandid and role=:role",
                                       array(":value" => $v, ":name" => $k, ":cobrandid" => $cobrandid, ":role" => $role));
        if (!empty($response) && $response->numrows > 0) {
          $ret |= true;
        }
      }
      $updaterevision = true;
    }
    // process the deletes
    if (count($configdeletes) > 0) {
      foreach ($configdeletes as $k=>$v) {
        if ($configdeletes[$k]) {
          $query = DataManager::query("db.config.cobrand_config.delete.{$name}-{$k}:nocache",
                                       "DELETE FROM config.cobrand_config WHERE name=:name AND cobrandid=:cobrandid and role=:role",
                                       array(":name" => $k, ":cobrandid" => $cobrandid, ":role" => $role));
          $ret |= true;
        }
      }

      /* FIXME - code above deletes one-by-one, this code deletes en-masse.  Should we switch to this instead?
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
      */

      $updaterevision = true;
    }

    if ($updaterevision) {
      $this->UpdateRevision($cobrandid, $role);
      $this->data->caches["memcache"]["data"]->delete("db.config.cobrand_config.{$name}.{$role}");
      $this->data->caches["memcache"]["data"]->delete("db.config.version.$name.$role");
   }

    if ($ret)
      $this->data->CacheClear("db.config.cobrand_config.{$name}.{$role}");

    return $ret;
  }

  /**
   * Add a key/value pair to the specified cobrand
   *
   * @param string $name name of config to add to
   * @param array $newcfg new key/value pair to add
   * @return array
   */
  function AddConfigValue($name, $newcfg, $role="") {
    $ret = false;
    if (!empty($newcfg["key"]) && isset($newcfg["value"])) {
      // check to see if there is a violation (single value vs. tree hiararchy)
      $wholecfg = $this->GetConfig($name, false, $role);
      $cobrandcfg = $this->Load($name, $role);
      $cobrandid = $cobrandcfg["cobrandid"];
      $keys = explode(".", $newcfg["key"]);
      $num_keys = count($keys);
      $valid = true;
      $i = 1;
      foreach ($keys as $key) {
        $wholecfg = ($wholecfg && array_key_exists($key, $wholecfg)) ? $wholecfg[$key] : null;
        $cobrandcfg = ($cobrandcfg && array_key_exists($key, $cobrandcfg)) ? $cobrandcfg[$key] : null;
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
        $response = DataManager::query("db.config.cobrand_config.{$name}-{$newcfg['key']}:nocache",
                                       "INSERT INTO config.cobrand_config"
                                     . " SET cobrandid=(SELECT cobrandid FROM config.cobrand WHERE name=:name1),name=:name2,value=:value,role=:role",
                                       array(":name1" => $name, ":name2" => $newcfg["key"], ":value" => $newcfg["value"], ":role" => $role));
        if (!empty($response) && !empty($response->id)) {
          $this->UpdateRevision($cobrandid, $role);
          //$this->data->caches["memcache"]["data"]->delete("db.config.cobrand_config.{$name}.{$role}");
          //$this->data->caches["memcache"]["data"]->delete("db.config.version.$name.$role");
          $ret = true;
          $this->data->CacheClear("db.config.cobrand_config.{$name}.{$role}");
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
                $this->data->CacheClear("db.config.cobrand_config.{$config_name}.{$role}");
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
    $ret = false;

    if (!empty($cobrandname)) {
      $query = DataManager::Query("db.config.cobrand.{$cobrandname}:nocache",
                            "INSERT INTO config.cobrand SET name=:name",
                            array(":name" => $cobrandname));
      if (!empty($query) && !empty($query->id)) {
        $ret = $query->id;
        $query = DataManager::Query("db.config.cobrand.{$cobrandname}.version:nocache",
                              "INSERT INTO config.version (cobrandid, role, revision, added, updated) VALUES(:cobrandid, :role, 1, now(), now())",
                              array(":cobrandid" => $query->id,
                                    ":role" => "dev")); // FIXME - should this add to all versions or just let the migrate script handle this?
      }
    }
    return $ret;
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

  /**
   * Load a full configuration (walk the whole heirarchy)
   *
   * @param string $name Name of config to load
   * @return array
   */
  function &GetConfig($name, $setcurrent=true, $role="", $skipcache=false) {
    $ret = array();

    if ( ($name != "base") && (strpos($name, ".") === false) && (strpos($name, "abtest") === false)  ) {
      $name = "cobrand.$name";
    }

    $cachewrapper = null;
    $cachekey = "config.$role.$name";
    $cachewrapper =& $this->data->caches["apc"]["default"];
    $allversions = $this->GetAllRevisions($role);
    if (!$skipcache && !empty($this->data->caches["apc"]["default"])) {
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
        $config = $this->Load($name, $role);
      }

      if (!empty($config)) {
        // Process includes first
        if (!empty($config["include"])) {
          $includes = explode(",", $config["include"]);

          foreach ($includes as $inc) {
            $included_config =& $this->GetConfig($inc, false, $role, $skipcache);
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
            $included_config =& $this->GetConfig($inc, false, $role, $skipcache);
            if (!empty($included_config)) {
              $this->ConfigMerge($ret, $included_config);
            }
          }
        }
      }

      if (!empty($ret) && !empty($cachewrapper)) {
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
    return $ret;
  }

  function GetConfigHeirarchy($name, $role="", $skipcache=false) {
    Profiler::StartTimer("ConfigManager::GetConfigHeirarchy()");
    $thislevel = array($name);
    $underneath = array();
    $over = array();

    if (empty($role))
      $role = $this->servers["role"];

    if (!$skipcache && !empty($this->heirarchies[$role][$name])) {
      //print_pre("got it already");
      $ret = $this->heirarchies[$role][$name];
    }

    if (!$skipcache && empty($ret)) {
      $cachewrapper = null;
      //$cachekey = "config.$role.$name.heirarchy";
      $cachekey = "config.$role.$name";

      if (!empty($this->data->caches["apc"]["default"])) {
        $cachewrapper =& $this->data->caches["apc"]["default"];

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
      if (!empty($query) && !empty($query->id)) {
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
        if (!empty($query) && !empty($query->id)) {
           $ret = true;
        }
     }

     if ($ret)
       $this->data->caches["memcache"]["data"]->delete("db.config.version.{$name}.{$role}");

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
      $this->data->CacheClear("db.config.version.{$cobrandid}.{$role}");
      $this->data->CacheClear("db.config.version.ALL.$role");
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
    return self::$instance->GetSetting($key);
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
      $role = $cfg->servers["role"];
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
        "db.config.cobrand_config.{$name}.{$role}:nocache",
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
    $cachekey = "config.{$this->role}.{$this->name}";
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
