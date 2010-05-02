<?
class OutletClassGenerator {
  private $config;

  function __construct (OutletConfig $config) {
    $this->config = $config;
  }

  function generate() {
    $c = "";
    foreach ($this->config->getEntities() as $entity) {
      $clazz = $entity->getClass();
      $c .= "if (!class_exists(\"$clazz\")) {\n";
      $c .= "  class $clazz {\n";
      foreach ($entity->GetProperties() as $k=>$v) {
        $c .= "    public \$$k";

        if (!empty($v["default"]))
          $c .= ' = "' . $v["default"] . '"';

        $c .= ";\n";
      }

      foreach ($entity->getAssociations() as $assoc) {
        switch ($assoc->getType()) {
          case 'one-to-many': $c .= $this->createOneToManyFunctions($assoc); break;
          case 'many-to-one': $c .= $this->createManyToOneFunctions($assoc); break;
          case 'one-to-one':  $c .= $this->createOneToOneFunctions($assoc); break;
          case 'many-to-many':  $c .= $this->createManyToManyFunctions($assoc); break;
          //default: throw new Exception("invalid association type: {$assoc->getType()}");
        }
      }
      $c .= "  }\n";
      $c .= "}\n";
    }

    return $c;
  }
  function createOneToManyFunctions (OutletAssociationConfig $config) {
    $foreign  = $config->getForeign();
    $foreignplural  = $config->getForeignPlural();
    $key     = $config->getKey();
    $pk_prop   = $config->getRefKey();
    $getter    = $config->getGetter();
    $setter    = $config->getSetter();
  
    $c = '';
    $c .= "  private \$" . strtolower($foreignplural) . ";\n";
    $c .= "  public function $getter() { \n";
    $c .= "    return \$this->" . strtolower($foreignplural) . "; \n";
    $c .= "  } \n";
    $c .= "  public function $setter(Collection \$ref".($config->isOptional() ? '=null' : '').") { \n";
    $c .= "    \$this->" . strtolower($foreignplural) . " = \$ref; \n";
    $c .= "  } \n";

    return $c;
  }

  function createManyToOneFunctions (OutletAssociationConfig $config) {
    $foreign  = $config->getForeign();
    $foreignplural  = $config->getForeignPlural();
    $key     = $config->getKey();
    $pk_prop   = $config->getRefKey();
    $getter    = $config->getGetter();
    $setter    = $config->getSetter();
  
    $c = '';
    $c .= "  private \$" . strtolower($foreign) . ";\n";
    $c .= "  public function $getter() { \n";
    $c .= "    return \$this->" . strtolower($foreign) . "; \n";
    $c .= "  } \n";
    $c .= "  public function $setter($foreign \$ref".($config->isOptional() ? '=null' : '').") { \n";
    $c .= "    \$this->" . strtolower($foreign) . " =& \$ref; \n";
    $c .= "  } \n";

    return $c;
  }
  function createOneToOneFunctions (OutletAssociationConfig $config) {
    $foreign  = $config->getForeign();
    $key     = $config->getKey();
    $getter   = $config->getGetter();
    $setter    = $config->getSetter();

    return '';
  }
  function createManyToManyFunctions (OutletManyToManyConfig $config) {
    $foreign  = $config->getForeign();
    $foreignplural  = $config->getForeignPlural();
    $key     = $config->getKey();
    $pk_prop   = $config->getRefKey();
    $getter    = $config->getGetter();
    $setter    = $config->getSetter();
    $table    = $config->getLinkingTable();
    $otherKey  = $config->getOtherKey();

    $c = '';
    $c .= "  private \$" . strtolower($foreignplural) . ";\n";
    $c .= "  public function $getter() { \n";
    $c .= "    return \$this->" . strtolower($foreignplural) . "; \n";
    $c .= "  } \n";
    $c .= "  public function $setter(Collection \$ref".($config->isOptional() ? '=null' : '').") { \n";
    $c .= "    \$this->" . strtolower($foreignplural) . " = \$ref; \n";
    $c .= "  } \n";

    return $c;
  }

}
