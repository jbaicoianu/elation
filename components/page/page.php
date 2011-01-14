<?php
class Component_page extends Component
{
  public function init() {}

  public function controller_page($args)
  {
    $vars["args"] = $args;
    return $this->GetComponentResponse("./page.tpl", $vars);
  }

  public function controller_sizelog($args)
  {
    $pandora = PandoraLog::singleton();
    $session = SessionManager::singleton();
    
    $size = array();
    $size["timestamp"]            = time();
    $size["session_id"]           = $session->flsid;
    $size["fluid"]                = $session->fluid;
    $size["version"]              = $this->root->version;
    $size["width"]                = $args["width"];
    $size["height"]               = $args["height"];
    $size["result_view_id"]       = $args["result_view_id"];

    // add data
    $pandora->addData("sizes", $size);
    unset($size);
    return '';
  }
}  
