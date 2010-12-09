<?php

class Component_%COMPONENTCLASSNAME% extends Component {
  public function init() {
    OrmManager::LoadModel("%SUBCOMPONENTNAME%");
  }

  public function controller_%SUBCOMPONENTNAME%($args) {
    $vars = array();
    return $this->GetComponentResponse("./%SUBCOMPONENTNAME%.tpl", $vars);
  }
}  
