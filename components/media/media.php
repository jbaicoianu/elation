<?

class Component_media extends Component {
  function init() {
  }

  function controller_media($args, $output="inline") {
    $vars["args"] = $args;
    return $this->GetTemplate("./media.tpl", $vars);
  }
}  
