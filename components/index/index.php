<?

class Component_index extends Component {
  function init() {
  }

  function controller_index($args, $output="inline") {
    $vars["args"] = $args;
    $vars["contentcomponent"] = "elation";
    return $this->GetTemplate("./index.tpl", $vars);
  }
}  
