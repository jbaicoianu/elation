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
}  
