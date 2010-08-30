<?

class Component_demo extends Component {
  function init() {
  }

  function controller_demo($args, $output="inline") {
    $response = $this->GetComponentResponse("./demo.tpl");
    $response["args"] = $args;
    return $response;
  }
}  
