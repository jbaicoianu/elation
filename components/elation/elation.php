<?

class Component_elation extends Component {
  function init() {
  }

  function controller_elation($args, $output="inline") {
    $vars["inspect"] = "demo.blog";
    if (!empty($args["inspect"]) && strpos($args["inspect"], "/..") === false) {
      $vars["inspect"] = $args["inspect"];
      $vars["file"] = any($args["file"], NULL);
    }
    return $this->GetComponentResponse("./elation.tpl", $vars);
  }
  function controller_debug($args) {
    $user = User::singleton();
    if ($user->isLoggedIn() && ($user->HasRole("ADMIN") || $user->HasRole("QA"))) {
      return $this->GetComponentResponse("./debug.tpl", $vars);
    }
    return "";
  }
  function controller_logger($args) {
    return Logger::Display(E_ALL);
  }
  function controller_profiler($args) {
    return Profiler::Display(E_ALL);
  }
  function controller_settings(&$args, $output="inline") {
    $cfg = $this->root->cfg->FlattenConfig($this->root->cfg->LoadServers($this->root->locations["config"] . "/servers.ini", false));
    
    $vars["tfdev"] = (!empty($_COOKIE["tf-dev"]) ? json_decode($_COOKIE["tf-dev"], true) : array());

    if (!empty($args["clear"])) {
      Logger::Info("Cleared dev settings");
      setcookie("tf-dev", NULL, 0, "/");
      $vars["tfdev"] = array();
      $this->root->cfg->servers = $cfg;
    }

    if (!empty($args["settings"])) {
      $diff_orig = array_diff_assoc_recursive($args["settings"], $cfg);
      $diff_curr = array_diff_assoc_recursive($args["settings"], $this->root->cfg->FlattenConfig($this->root->cfg->servers));

      $vars["tfdev"]["serveroverrides"] = $diff_orig;
      setcookie("tf-dev", json_encode($vars["tfdev"]), 0, "/");
      
      if (!empty($diff_curr)) {
        foreach ($diff_curr as $setting=>$value) {
          Logger::Info("Override setting: $setting = '$value'");
          $this->root->cfg->AppendSetting($this->root->cfg->servers, $setting, $value);
        }
      } else {
        Logger::Error("No config differences!");
      }

    }

    $vars["settings"] = $this->root->cfg->FlattenConfig($this->root->cfg->servers);
    $vars["container"] = ($output == "html");
    $ret = $this->GetComponentResponse("./settings.tpl", $vars);

    if ($output == "ajax") {
      $ret = array("tf_debug_tab_settings" => $ret);
    }
    return $ret;
  }
  function controller_inspect($args, $output="inline") {
    $vars["component"] = $args["component"];
    $vars["componentdir"] = "./components/" . implode("/components/", explode(".", $vars["component"]));
    $vars["file"] = $args["file"];
    if (!empty($vars["component"]) && dir_exists_in_path($vars["componentdir"])) {
      $vars["files"] = $this->getDirContents($vars["componentdir"]);
    }
    return $this->GetComponentResponse("./inspect.tpl", $vars);
  }
  function controller_inspect_directory($args) {
    $vars["dir"] = $args["dir"];
    $vars["fullname"] = any($args["parentdir"], ".") . (!empty($args["dirname"]) ? "/" . $args["dirname"] : "");
    return $this->GetComponentResponse("./inspect_directory.tpl", $vars);
  }
  function controller_inspect_file($args) {
    $vars["component"] = $args["component"];
    $vars["componentdir"] = "./components/" . implode("/components/", explode(".", $vars["component"]));
    $vars["file"] = $args["file"];
    $vars["filetype"] = "unknown";
    if (preg_match("/\.\/.*\.(.*?)$/", $vars["file"], $m)) {
      $vars["filetype"] = $m[1];
    }
    if (!empty($vars["file"]) && strpos($vars["file"], "/../") === false) {
      $vars["fullname"] = $vars["componentdir"] . "/" . $vars["file"];
      if (($path = file_exists_in_path($vars["fullname"])) !== false) {
        switch ($vars["filetype"]) {
          case 'php':
            $vars["contents"] = str_replace("\n", "", highlight_string(file_get_contents($path . "/" . $vars["fullname"]), true));
            break;
          default:
            $vars["contents"] = htmlspecialchars(file_get_contents($path . "/" . $vars["fullname"]));
        }
      }
    } else {
      $vars["contents"] = $args["defaultcontent"];
    }
    return $this->GetComponentResponse("./inspect_file.tpl", $vars);
  }
  function getDirContents($dir) {
    $ret = array();
    if (($path = dir_exists_in_path($dir)) !== false) {
      $dh = opendir($path . "/" . $dir);
      while (($file = readdir($dh)) !== false) {
        if ($file[0] != '.') {
          if (is_dir($path . "/" . $dir . "/" . $file)) {
            $ret[$file] = $this->getDirContents($dir . "/" . $file);
            //$ret[$file] = $dir . "/" . $file;
          } else {
            $ret[$file] = $file;
          }
        }
      }
    }
    ksort($ret);
    return $ret;
  }

  function controller_memcache(&$args, $output="inline") {
    $vars["admin"] = false;
    $user = User::singleton();
    if ($user->isLoggedIn() && ($user->HasRole("ADMIN"))) {
      if (!empty($args["memcacheaction"])) {
        if ($args["memcacheaction"] == "delete" && !empty($args["memcachekey"])) {
          $this->data->caches["memcache"]["data"]->delete($args["memcachekey"]);
          $vars["tf_debug_memcache_status"] = "Deleted key '{$args['memcachekey']}'";
        } else if ($args["memcacheaction"] == "flush" && !empty($args["memcachetype"])) {
          if (!empty($this->data->caches["memcache"][$args["memcachetype"]])) {
            if ($this->data->caches["memcache"][$args["memcachetype"]]->flush()) {
              $vars["tf_debug_memcache_status"] = "Cache flushed successfully (" . $args["memcachetype"] . ")";
            } else {
              $vars["tf_debug_memcache_status"] = "FAILED TO FLUSH CACHE: " . $args["memcachetype"];
            }
          } else {
            $vars["tf_debug_memcache_status"] = "ERROR: Unknown memcache type '" . $args["memcachetype"] . "'";
          }
        }
      }
      $vars["admin"] = true;
    }

    if (!empty($this->data->caches["memcache"]["session"])) {
      $vars["stats"]["session"] = $this->data->caches["memcache"]["session"]->getExtendedStats();
    }
    if (!empty($this->data->caches["memcache"]["data"])) {
      $vars["stats"]["data"] = $this->data->caches["memcache"]["data"]->getExtendedStats();
    }

    if ($output == "ajax") {
      $vars = array("tf_debug_tab_memcache" => $this->GetTemplate("./memcache.tpl", $vars));
    }
    return $this->GetComponentResponse("./memcache.tpl", $vars);
  }
  function controller_apc(&$args, $output="inline") {
    $user = User::Singleton();
    if (!($user->isLoggedIn() && ($user->HasRole("ADMIN")))) 
      return;

    $vars["args"] = $args;

    if (!empty($args["flush"])) {
      apc_clear_cache();
      $vars["message"] = "APC cache cleared";
    }

    $vars["apc"]["smainfo"] = apc_sma_info();
    $vars["apc"]["cacheinfo"] = apc_cache_info();
    $vars["time"] = time();

    $nseg = $freeseg = $fragsize = $freetotal = 0;
    for($i=0; $i<$vars["apc"]["smainfo"]['num_seg']; $i++) {
      $ptr = 0;
      foreach($vars["apc"]["smainfo"]['block_lists'][$i] as $block) {
        if ($block['offset'] != $ptr) {
          ++$nseg;
        }
        $ptr = $block['offset'] + $block['size'];
        /* Only consider blocks <5M for the fragmentation % */
        if($block['size']<(5*1024*1024)) $fragsize+=$block['size'];
        $freetotal+=$block['size'];
      }
      $freeseg += count($vars["apc"]["smainfo"]['block_lists'][$i]);
    }

    if ($freeseg > 1) {
      $vars["frag"] = sprintf("%.2f%% (%s out of %s in %d fragments)", ($fragsize/$freetotal)*100,bsize($fragsize),bsize($freetotal),$freeseg);
    } else {
      $vars["frag"] = "0%";
    }


    if ($output == "ajax") {
      $vars = array("tf_debug_tab_apc" => $this->GetTemplate("./apc.tpl", $vars));
    }
    return $this->GetComponentResponse("./apc.tpl", $vars);
  }

  public function controller_ping($args) {
    return $this->GetComponentResponse("./ping.tpl");
  }
}  
