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
    return $this->GetComponentResponse("./debug.tpl", $vars);
  }
  function controller_logger($args) {
    return Logger::Display(E_ALL);
  }
  function controller_profiler($args) {
    return Profiler::Display(E_ALL);
  }
  function controller_settings(&$args) {
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
    $ret = $this->GetComponentResponse("./settings.tpl", $vars);

    //if ($this->root->request["ajax"]) {
    //  $ret = $responses;
    //} else {
    //  $ret = $responses["tf_debug_tab_settings"];
    //}
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
}  
