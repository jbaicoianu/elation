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
}  
