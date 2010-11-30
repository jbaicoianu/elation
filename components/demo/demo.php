<?

class Component_demo extends Component {
  function init() {
  }

  function controller_demo($args, $output="inline") {
    $response = $this->GetComponentResponse("./demo.tpl");
    $response["args"] = $args;
    return $response;
  }
  function controller_xmlns($args) {
    return $this->GetComponentResponse("./xmlns.tpl", $vars);
  }
}  
