<?

class Component_%COMPONENTCLASSNAME% extends Component {
  function init() {
    OrmManager::LoadModel("%SUBCOMPONENTNAME%");
  }

  function controller_%SUBCOMPONENTNAME%($args) {
    return $this->GetComponentResponse("./%SUBCOMPONENTNAME%.tpl", $vars);
  }
}  
