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
    $content = $args["content"];
    if ($content instanceOf ComponentResponse) {
      if (($content->data instanceOf Component)) {
        Logger::Error("html.content - unexpected Component in content argument");
        $content = array();
      } else if (!empty($content->data["content"])) {
        $content = $content->data["content"];
      } else {
        $vars = $content->data;
        $tplfile = $content->getTemplate();
        $content = NULL;
      }
    }
    if (!empty($content)) {
      if (is_array($content)) {
        if (!empty($content["component"])) {
          $vars["contentcomponent"] = $content["component"];
          $vars["contentargs"] = any($content["args"], array());
        } else if (!empty($content["template"])) {
          $vars = any($content["data"], array());
          $tplfile = $content["template"];
        }
      } else {
        $vars["content"] = $content;
      }
    }
    return $this->GetTemplate($tplfile, $vars);
  }
  function controller_static(&$args) {
    $ret = $args["content"];
    return $ret;
  }

  function controller_dragdropimage($args) {
    return $this->GetTemplate("./dragdropimage.tpl", $vars);
  }
}  
