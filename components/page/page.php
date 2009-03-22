<?

class Component_page extends Component {
  function init() {
  }

  function controller_page($args, $output="inline") {
    $vars["args"] = $args;
    return $this->GetTemplate("./page.tpl", $vars);
  }
}  
