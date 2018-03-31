<?php

class Component_elements extends Component {
  public function init() {
    OrmManager::LoadModel("elements");
  }

  public function controller_elements($args) {
    $vars = array();
    return $this->GetComponentResponse("./elements.tpl", $vars);
  }
}  
