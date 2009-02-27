<?
class Component_html extends Component {
  function init() {
  }

  function controller_html($args, $output="inline") {
    $vars["args"] = $args;
    return $this->GetTemplate("./html.tpl", $vars);
  }
}  
