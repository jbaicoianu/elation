<?

class Component_boxeebox extends Component {
  function init() {
  }

  function controller_boxeebox($args, $output="inline") {
    $vars["args"] = $args;
    return $this->GetTemplate("./boxeebox.tpl", $vars);
  }
}  
