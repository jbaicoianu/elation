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
    $vars["listitems"] = array_chunk($listitems, $vars["chunksize"], true);
    return $this->GetComponentResponse("./list.tpl", $vars);
  }
  function controller_listitem($args) {
    $vars["item"] = $args["item"];
    $vars["itemname"] = $args["itemname"];
    return $this->GetComponentResponse("./listitem.tpl", $vars);
  }

  function controller_panel($args) {
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

    if (!empty($vars["panel"]["enabled"]))
      $ret = $this->GetTemplate("./panel.tpl", $vars);
    return $ret;
  }
  function controller_panel_item($args) {
    $vars["panelitem"] = $args["panelitem"];
    if (!empty($args["panelargs"])) {
      if (!empty($vars["panelitem"]["componentargs"])) {
        $vars["panelitem"]["componentargs"] = array_merge($args["panelargs"], $vars["panelitem"]["componentargs"]);
      } else {
        $vars["panelitem"]["componentargs"] = $vars["panelargs"];
      }
    }
    return $this->GetTemplate("./panel_item.tpl", $vars);
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
    $vars["selected"] = $args["selected"];
    return $this->GetComponentResponse("./select.tpl", $vars);
  }

  function PanelSort($arr) {
    if (!empty($arr["items"])) {
      uasort($arr["items"], _panelsort);
    }
    return $arr;
  }
}  
function _panelsort($a, $b) {
  if ($a["order"] == $b["order"])
    return 0;
  return ($a["order"] < $b["order"] ? -1 : 1);
}
