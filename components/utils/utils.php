<?

class Component_utils extends Component {
  function init() {
  }

  function controller_utils($args, $output="inline") {
    $vars["args"] = $args;
    return $this->GetTemplate("./utils.tpl", $vars);
  }
  function controller_status($args, $output="inline") {
    $vars["args"] = $args;
    return $this->GetTemplate("./status.tpl", $vars);
  }
  function controller_list($args) {
    $listitems = any($args["items"], array());
    if ($listitems instanceOf Collection) {
      $listitems = $listitems->toArray();
    }
    $vars["id"] = $args["id"];
    $vars["class"] = $args["class"];
    $vars["itemclass"] = $args["itemclass"];
    $vars["chunksize"] = any($args["chunksize"], 1);
    $vars["chunks"] = $args["chunks"];
    if (!empty($vars["chunks"])) {
      $vars["chunksize"] = ceil(count($listitems) / $vars["chunks"]);
    }
    $vars["itemcomponent"] = any($args["itemcomponent"], "utils.listitem");
    if (is_array($listitems)) {
      $vars["listitems"] = array_chunk($listitems, $vars["chunksize"], true);
    }
    $vars["hidecontainer"] = any($args["hidecontainer"], false);
    $vars["hideitemcontainer"] = any($args["hideitemcontainer"], false);
    return $this->GetComponentResponse("./list.tpl", $vars);
  }
  function controller_listitem($args) {
    $vars["item"] = $args["item"];
    $vars["itemname"] = $args["itemname"];
    return $this->GetComponentResponse("./listitem.tpl", $vars);
  }

  function controller_panel($args, $output="inline") {
    $ret = "";

    $vars["placementname"] = $args["placement"]; // FIXME - we currently don't do anything with placements
    $vars["panel"]["parent"] = any($args["parent"], "");
    if (!empty($vars["panel"]["parent"]) && !empty($args["panelname"]))
      $vars["panel"]["name"] = $vars["panel"]["parent"] . "." . $args["panelname"];
    else
      $vars["panel"]["name"] = $args["type"];
    $vars["panel"]["top"] = any($args["top"], true);
    $vars["panel"]["cfg"] = $this->PanelSort(any($args["panel"], ConfigManager::get("panels.types.{$vars["panel"]["name"]}")));
    $vars["panel"]["id"] = any($args["id"], $vars["panel"]["cfg"]["id"], "tf_utils_panel_" . str_replace(".", "_", $vars["panel"]["name"]));
    $vars["panel"]["type"] = any($args["type"], "panel");
    $vars["panel"]["enabled"] = any($args["enabled"], (isset($vars["panel"]["cfg"]["enabled"]) ? $vars["panel"]["cfg"]["enabled"] : true));
    $vars["panel"]["args"] = any($args["panelargs"], array());
    $vars["panel"]["info"] = array("type",$vars["panel"]["type"],"id"=>$vars["panel"]["id"],"name"=>$vars["panel"]["name"]);
    $vars["panel"]["json_include"] = any($vars["panel"]["cfg"]["json_include"], 0);
    $vars["panel"]["noclear"] = any($vars["panel"]["cfg"]["noclear"], 0);

    // If the apicomponent option is set for this panel, execute the specified component
    if (!empty($vars["panel"]["cfg"]["apicomponent"])) {
      $apicomponentargs = array_merge_recursive(any($vars["panel"]["cfg"]["apicomponentargs"], array()), $args);
      if ($output != "html" && $output != "inline" && $output != "popup" && $output != "snip") {
        $ret = ComponentManager::fetch($vars["panel"]["cfg"]["apicomponent"], $apicomponentargs, $output);
      } else {
        $vars["apicomponentoutput"] = ComponentManager::fetch($vars["panel"]["cfg"]["apicomponent"], $apicomponentargs, "data");
      }
    }

    if ($output == "ajax") {
      $ret = array();
      $ajaxpanels = self::PanelFilterAjax($vars["panel"]["cfg"]);
      foreach ($ajaxpanels as $k=>$p) {
        if ($p["component"] == "utils.panel") { // Execute subpanels as AJAX requests and merge their results in with ours
          $subret = ComponentManager::fetch($p["component"], $p["componentargs"], "ajax");
	        $ret = array_merge($ret, $subret);
        } else {
          $ret[$vars["panel"]["id"] . "_" . $k] = ComponentManager::fetch($p["component"], $p["componentargs"]);
        }
      }
    } else if (empty($ret)) {
      if (!empty($vars["panel"]["enabled"]))
        $ret = $this->GetTemplate("./panel.tpl", $vars);
    }
    return $ret;
  }
  function controller_panel_item($args) {
    $vars["panelitem"] = $args["panelitem"];
    if (!empty($args["panelargs"])) {
      if (!empty($vars["panelitem"]["componentargs"])) {
        $vars["panelitem"]["componentargs"] = array_merge($args["panelargs"], $vars["panelitem"]["componentargs"]);
      } else {
        $vars["panelitem"]["componentargs"] = $args["panelargs"];
      }
    }
    return $this->GetTemplate("./panel_item.tpl", $vars);
  }
  function controller_panellist($args) {
    $vars["panels"] = ConfigManager::get("panels.types");
    return $this->GetTemplate("./panellist.tpl", $vars);
  }
  function controller_componentlist($args) {
    $vars["components"] = json_decode(file_get_contents("config/components.json"));
    return $this->GetTemplate("./componentlist.tpl", $vars);
  }
  function controller_paneledit($args) {
    if (!empty($args["panel"])) {
      $vars["panel"] = $args["panel"];
      $vars["panelcfg"] = ConfigManager::get("panels.types.{$args["panel"]}");
    }
    return $this->GetTemplate("./paneledit.tpl", $vars);
  }
  function controller_link($args) {
    $vars["label"] = $args["label"];
    if (!empty($args["url"])) {
      $vars["url"] = $args["url"];
    } else if (!empty($args["component"])) {
      $vars["url"] = DependencyManager::$locations["basedir"] . "/" . str_replace(".", "/", $args["component"]);
    }
    return $this->GetComponentResponse("./link.tpl", $vars);
  }
  function controller_select($args) {
    $vars["id"] = $args["id"];
    $vars["selectname"] = $args["selectname"];
    $vars["class"] = $args["class"];
    $vars["items"] = any($args["items"], array());
    if (is_string($vars["items"])) {
      $tmp = explode(";", $vars["items"]);
      $vars["items"] = array_combine($tmp, $tmp);
    }
    $vars["selected"] = $args["selected"];
    if (!empty($vars["selected"]) && !isset($vars["items"][$vars["selected"]])) {
      $vars["items"][$vars["selected"]] = $vars["selected"];
    }
    $vars["autosubmit"] = !empty($args["autosubmit"]);
    return $this->GetComponentResponse("./select.tpl", $vars);
  }
  function controller_input($args) {
    $vars["inputname"] = $args["inputname"];
    $vars["class"] = any($args["class"], false);
    $vars["label"] = any($args["label"], false);
    $vars["id"] = any($args["id"], "tf_utils_input_" . $vars["inputname"]);
    $vars["value"] = any($args["value"], "");
    $vars["type"] = any($args["type"], "");
    return $this->GetComponentResponse("./input.tpl", $vars);
  }

  function PanelSort($arr) {
    if (!empty($arr["items"])) {
      uasort($arr["items"], _panelsort);
    }
    return $arr;
  }
  static function PanelFilterAjax($panel, $nameprefix=NULL) {
    $ret = array();
    if (!empty($panel["items"])) {
      foreach ($panel["items"] as $name=>$item) {
        $realname = ($nameprefix !== NULL ? $nameprefix . "_" : "") . $name . $item["enabled"];
        if (($item["ajax"] || $item["component"] == "utils.panel")) {
          $ret[$realname] = $item;
        } else if (!empty($item["items"])) {
          $ret = array_merge($ret, self::PanelFilterAjax($item, $realname));
        }
      }
    }
    return $ret;
  }
}  
function _panelsort($a, $b) {
  if ($a["order"] == $b["order"])
    return 0;
  return ($a["order"] < $b["order"] ? -1 : 1);
}
