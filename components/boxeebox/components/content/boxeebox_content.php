<?
class Component_boxeebox_content extends Component {
  function init() {
  }

  function controller_content($args, $output="inline") {
    $vars["args"] = $args;
    return $this->GetTemplate("./content.tpl", $vars);
  }

}  
