<?

class Component_performance extends Component {
  function init() {
  }

  function controller_performance($args, $output="inline") {
    $vars["args"] = $args;
    $page = $this->GetTemplate("./performance.tpl", $vars);

    if ($output == "ajax")
      $ret["index_content"] = $page;
    else
      $ret = $page;

    return $ret;
  }
}  
