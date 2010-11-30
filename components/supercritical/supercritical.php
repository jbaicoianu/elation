<?

class Component_supercritical extends Component {
  function init() {
  }

  function controller_supercritical($args, $output="inline") {
    $response = $this->GetComponentResponse("./supercritical.tpl");
    $response["args"] = $args;
    return $response;
  }
}  
