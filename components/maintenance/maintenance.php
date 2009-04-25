<?

class Component_maintenance extends Component {
  function init() {
  }

  function controller_maintenance($args, $output="inline") {
    $vars["args"] = $args;
    $page = $this->GetTemplate("./maintenance.tpl", $vars);

    if ($output == "ajax")
      $ret["index_content"] = $page;
    else
      $ret = $page;

    return $ret;
  }
}  
