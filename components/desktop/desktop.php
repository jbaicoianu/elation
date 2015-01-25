<?php

class Component_desktop extends Component {
  public function init() {
    OrmManager::LoadModel("desktop");
  }

  public function controller_desktop($args) {
    $vars = array();
    return $this->GetComponentResponse("./desktop.tpl", $vars);
  }
}  
