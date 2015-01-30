<?php

class Component_window extends Component {
  public function init() {
    OrmManager::LoadModel("window");
  }

  public function controller_window($args) {
    $vars = array();
    return $this->GetComponentResponse("./window.tpl", $vars);
  }
}  
