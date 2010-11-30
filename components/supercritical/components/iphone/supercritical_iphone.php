<?

class Component_supercritical_iphone extends Component {
  function init() {
  }

  function controller_iphone($args, $output="inline") {
    $vars["args"] = $args;
    return $this->GetTemplate("./iphone.tpl", $vars);
  }
  function controller_coverflow($args, $output="inline") {
    $vars["args"] = $args;
    return $this->GetTemplate("./coverflow.tpl", $vars);
  }
}  
