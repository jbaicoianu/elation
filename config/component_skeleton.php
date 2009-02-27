<?

class Component_%COMPONENTCLASSNAME% extends Component {
  function init() {
  }

  function controller_%SUBCOMPONENTNAME%($args, $output="inline") {
    $vars["args"] = $args;
    return $this->GetTemplate("./%SUBCOMPONENTNAME%.tpl", $vars);
  }
}  
