<?

class Component_%COMPONENTCLASSNAME% extends Component {
  function init() {
  }

  function controller_%SUBCOMPONENTNAME%($args, $output="inline") {
    $response = $this->GetComponentResponse("./%SUBCOMPONENTNAME%.tpl");
    $response["args"] = $args;
    return $response;
  }
}  
