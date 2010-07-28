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

    $vars["imgname"] = any($args["img"], "webtrends");
    $vars["img"] = any($args["imgdata"], $vars["imgs"][$vars["imgname"]]);
    return $this->GetTemplate("./multizoom.tpl", $vars);
  }

  function controller_dragdropimage($args) {
    return $this->GetTemplate("./dragdropimage.tpl", $vars);
  }
  function controller_palmpre($args) {
    return $this->GetTemplate("./palmpre.tpl", $vars);
  }
  function controller_airhockey($args) {
    header("Location: /games/airhockey");
    return "";
  }
}  
