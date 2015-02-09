<?php

class Component_hack extends Component {
  public function init() {
    OrmManager::LoadModel("hack");
  }

  public function controller_hack($args) {
    $vars = array();
    return $this->GetComponentResponse("./hack.tpl", $vars);
  }
}  
