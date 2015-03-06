<?php

class Component_hack extends Component {
  public function init() {
    OrmManager::LoadModel("hack");
    ConfigManager::set("page.theme", false);
  }

  public function controller_hack($args) {
    $vars = array();
    return $this->GetComponentResponse("./hack.tpl", $vars);
  }
}  
