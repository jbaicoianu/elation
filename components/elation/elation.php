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
