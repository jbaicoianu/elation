<?

class Component_elation extends Component {
  function init() {
  }

  function controller_elation($args, $output="inline") {
    $vars["inspect"] = "blog";
    if (!empty($args["inspect"]) && strpos($args["inspect"], "/..") === false) {
      $vars["inspect"] = $args["inspect"];
      $vars["file"] = any($args["file"], NULL);
    }
    return $this->GetComponentResponse("./elation.tpl", $vars);
  }
  function controller_inspect($args, $output="inline") {
    $vars["component"] = $args["component"];
    $vars["file"] = $args["file"];
    if (!empty($vars["component"]) && file_exists("./components/" . $vars["component"])) {
      $vars["files"] = $this->getDirContents("./components/" . $vars["component"]);
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
    $vars["file"] = $args["file"];
    $vars["filetype"] = "unknown";
    if (preg_match("/\.\/.*\.(.*?)$/", $vars["file"], $m)) {
      $vars["filetype"] = $m[1];
    }
    if (!empty($vars["file"]) && strpos($vars["file"], "/../") === false) {
      $vars["fullname"] = "./components/" . $vars["component"] . "/" . $vars["file"];
      switch ($vars["filetype"]) {
      case 'php':
        $vars["contents"] = highlight_string(file_get_contents($vars["fullname"]), true);
        break;
      default:
        $vars["contents"] = htmlspecialchars(file_get_contents($vars["fullname"]));
      }
    } else {
      $vars["contents"] = $args["defaultcontent"];
    }
    return $this->GetComponentResponse("./inspect_file.tpl", $vars);
  }
  function getDirContents($dir) {
    $ret = array();
    $dh = opendir($dir);
    while (($file = readdir($dh)) !== false) {
      if ($file[0] != '.') {
        if (is_dir($dir . "/" . $file)) {
          $ret[$file] = $this->getDirContents($dir . "/" . $file);
          //$ret[$file] = $dir . "/" . $file;
        } else {
          $ret[$file] = $file;
        }
      }
    }
    ksort($ret);
    return $ret;
  }
}  
