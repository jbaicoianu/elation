<?

class Component_navigation extends Component {
  function init() {
  }

  function controller_navigation($args, $output="inline") {
    $vars["args"] = $args;
    if ($output == "ajax")
      $ret["index_content"] = $this->GetTemplate("./navigation.tpl", $vars);
    else
      $ret = $this->GetTemplate("./navigation.tpl", $vars);
    return $ret;
  }
  function controller_directions($args, $output="inline") {
    $vars["args"] = $args;
    $targetid = (!empty($args["targetid"]) ? $args["targetid"] : "index_content");
    $page = $this->GetTemplate("./directions.tpl", $vars);
    if ($output == "ajax")
      $ret[$targetid] = $page;
    else
      $ret = $page;
    return $ret;
  }
}  
