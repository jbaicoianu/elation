<?

class Component_page extends Component {
  function init() {
  }

  function controller_page($args) {
    $vars["args"] = $args;
    return $this->GetComponentResponse("./page.tpl", $vars);
  }
}  
