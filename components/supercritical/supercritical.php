<?
class Component_supercritical extends Component {
  function init() {
  }

  function controller_supercritical($args, $output="inline") {
    $vars["args"] = $args;
    $vars["maincontent"] = "supercritical.content.main";
    return $this->GetTemplate("./supercritical.tpl", $vars);
  }
  function controller_about($args, $output="inline") {
    $vars["args"] = $args;
    $vars["maincontent"] = "supercritical.content.aboutus";
    return $this->GetTemplate("./supercritical.tpl", $vars);
  }
  function controller_features($args, $output="inline") {
    $vars["args"] = $args;
    $vars["maincontent"] = "supercritical.content.features";
    return $this->GetTemplate("./supercritical.tpl", $vars);
  }
  function controller_specifications($args, $output="inline") {
    $vars["args"] = $args;
    $vars["maincontent"] = "supercritical.content.specifications";
    return $this->GetTemplate("./supercritical.tpl", $vars);
  }
  function controller_blog($args, $output="inline") {
    $vars["args"] = $args;
    $vars["maincontent"] = "supercritical.content.blog";
    return $this->GetTemplate("./supercritical.tpl", $vars);
  }
}  
