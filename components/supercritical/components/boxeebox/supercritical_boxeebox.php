<?
class Component_supercritical_boxeebox extends Component {
  function init() {
  }

  function controller_boxeebox($args, $output="inline") {
    $vars["args"] = $args;
    $vars["maincontent"] = "supercritical.boxeebox.content.main";
    return $this->GetTemplate("./boxeebox.tpl", $vars);
  }
  function controller_about($args, $output="inline") {
    $vars["args"] = $args;
    $vars["maincontent"] = "supercritical.boxeebox.content.about";
    return $this->GetTemplate("./boxeebox.tpl", $vars);
  }
  function controller_features($args, $output="inline") {
    $vars["args"] = $args;
    $vars["maincontent"] = "supercritical.boxeebox.content.features";
    return $this->GetTemplate("./boxeebox.tpl", $vars);
  }
  function controller_specifications($args, $output="inline") {
    $vars["args"] = $args;
    $vars["maincontent"] = "supercritical.boxeebox.content.specifications";
    return $this->GetTemplate("./boxeebox.tpl", $vars);
  }
  function controller_blog($args, $output="inline") {
    $vars["args"] = $args;
    $vars["maincontent"] = "supercritical.boxeebox.content.blog";
    return $this->GetTemplate("./boxeebox.tpl", $vars);
  }
  function controller_menu($args, $output="inline") {
    $vars["args"] = $args;
    return $this->GetTemplate("./menu.tpl", $vars);
  }
}  
