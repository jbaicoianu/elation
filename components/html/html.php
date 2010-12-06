<?
class Component_html extends Component {
  protected $shown = array();

  function init() {
  }

  function controller_html($args, $output="inline") {
    $vars["args"] = $args;
    return $this->GetTemplate("./html.tpl", $vars);
  }
  function controller_header($args) {
    if (empty($this->shown["header"])) { // Only allow header once per page
      $this->shown["header"] = true;
      return $this->GetTemplate("./header.tpl", $args);
    }
    return "";
  }
  function controller_footer($args) {
    if (empty($this->shown["footer"])) { // Only allow footer once per page
      $this->shown["footer"] = true;
      return $this->GetComponentResponse("./footer.tpl", $args);
    }
    return "";
  }
  function controller_page($args) {
    return $this->GetComponentResponse("./page.tpl", $args);
  }
  function controller_content($args) {
    $tplfile = "./content.tpl";
    if ($args["content"] instanceOf ComponentResponse) {
      $vars = $args["content"]->data;
      $tplfile = $args["content"]->getTemplate();
    } else if (!empty($args["content"]["component"])) {
      $vars["component"] = $args["content"]["component"];
      $vars["componentargs"] = any($args["content"]["args"], array());
    } else if (!empty($args["content"]["template"])) {
      $vars = any($args["content"]["data"], array());
      $tplfile = $args["content"]["template"];
    } else {
      $vars["content"] = $content;
    }
    return $this->GetTemplate($tplfile, $vars);
  }

  function controller_dragdropimage($args) {
    return $this->GetTemplate("./dragdropimage.tpl", $vars);
  }
}  
