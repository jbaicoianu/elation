<?
class Component_html extends Component {
  function init() {
  }

  function controller_html($args, $output="inline") {
    $vars["args"] = $args;
    return $this->GetTemplate("./html.tpl", $vars);
  }
  function controller_imagescale($args, $output="inline") {
    $vars["args"] = $args;
    return $this->GetTemplate("./imagescale.tpl", $vars);
  }
  function controller_multizoom($args, $output="inline") {
    $vars["args"] = $args;
    return $this->GetTemplate("./multizoom.tpl", $vars);
  }
}  
