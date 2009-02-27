<?php

class OutletProxyGenerator {
	private $config;

	function __construct (OutletConfig $config) {
		$this->config = $config;
	}

	function getPkProp($conf, $clazz) {
		foreach ($conf['classes'][$clazz]['props'] as $key=>$f) {
			if (@$f[2]['pk'] == true) {
				$pks[] = $key;
			}

			if (!count($pks)) throw new Exception('You must specified at least one primary key');

			if (count($pks) == 1) {
				return $pks[0];
			} else {
				return $pks;
			}
		}
	}

	function generate () {	
		$c = '';
		foreach ($this->config->getEntities() as $entity) {
			$clazz = $entity->getClass();

			$c .= "if (class_exists($clazz, false) && !class_exists($clazz.'_OutletProxy', false)) {";
			$c .= "  class {$clazz}_OutletProxy extends $clazz implements OutletProxy { \n";

			foreach ($entity->getAssociations() as $assoc) {
				switch ($assoc->getType()) {
					case 'one-to-many': $c .= $this->createOneToManyFunctions($assoc); break;
					case 'many-to-one': $c .= $this->createManyToOneFunctions($assoc); break;
					case 'one-to-one':	$c .= $this->createOneToOneFunctions($assoc); break;
					default: throw new Exception("invalid association type: {$assoc->getType()}");
				}
			}
			$c .= "  } \n";
			$c .= "} \n";
		}

		return $c;
	}

	function createOneToOneFunctions (OutletAssociationConfig $config) {
		$foreign	= $config->getForeign();
		$key 		= $config->getKey();
		$getter 	= $config->getGetter();
		$setter		= $config->getSetter();

		$c = '';
		$c .= "  function $getter() { \n";
		$c .= "    if (is_null(\$this->$key)) return parent::$getter(); \n";
		$c .= "    if (is_null(parent::$getter()) && \$this->$key) { \n";
		$c .= "      parent::$setter( Outlet::getInstance()->load('$foreign', \$this->$key) ); \n";
		$c .= "    } \n";
		$c .= "    return parent::$getter(); \n";
		$c .= "  } \n";

		return $c;
	}

	function createOneToManyFunctions (OutletAssociationConfig $config) {
		$foreign	= $config->getForeign();
		$key 		= $config->getKey();
		$pk_prop 	= $config->getRefKey();
		$getter		= $config->getGetter();
		$setter		= $config->getSetter();
	
		$c = '';	
		$c .= "  function {$getter}() { \n";
		$c .= "    \$args = func_get_args(); \n";
		$c .= "    if (count(\$args)) { \n";
		$c .= "      if (is_null(\$args[0])) return parent::{$getter}(); \n";
		$c .= "      \$q = \$args[0]; \n";
		$c .= "    } else { \n";
		$c .= "      \$q = ''; \n";
		$c .= "    } \n";
		$c .= "    if (isset(\$args[1])) \$params = \$args[1]; \n";
		$c .= "    else \$params = array(); \n";

		//$c .= "      if (\$q===false) return parent::get$prop(); \n";
		
		// if there's a where clause
		$c .= "    \$q = trim(\$q); \n";
		$c .= "    if (stripos(\$q, 'where') !== false) { \n";
		$c .= "      \$q = 'where {"."$foreign.$key} = \"'.\$this->$pk_prop.'\" and ' . substr(\$q, 5); \n";
		$c .= "    } else { \n";
		$c .= "      \$q = 'where {"."$foreign.$key} = \"'.\$this->$pk_prop. '\" ' . \$q; \n";
		$c .= "    }\n";
		//$c .= "    echo \$q; \n";
		$c .= "    parent::{$setter}( Outlet::getInstance()->select('$foreign', \$q, \$params) ); \n";
		/** not sure if i need this
		$c .= "    if (!count(parent::get{$entity}s())) { \n";
		$c .= "      \$this->$prop = Outlet::getInstance()->select('$entity', 'where $entity.$fk_foreign = '.\$this->$fk_local); \n";
		$c .= "    } \n";
		*/
		$c .= "    return parent::{$getter}(); \n";
		$c .= "  } \n";

		return $c;
	}

	function createManyToOneFunctions (OutletAssociationConfig $config) {
		$local		= $config->getLocal();
		$foreign	= $config->getForeign();
		$key 		= $config->getKey();
		$refKey		= $config->getRefKey();
		$getter 	= $config->getGetter();
		$setter		= $config->getSetter();

		$c = '';
		$c .= "  function $getter() { \n";
		$c .= "    if (is_null(\$this->$key)) return parent::$getter(); \n";
		$c .= "    if (is_null(parent::$getter()) && isset(\$this->$key)) { \n";
		$c .= "      parent::$setter( Outlet::getInstance()->load('$foreign', \$this->$key) ); \n";
		$c .= "    } \n";
		$c .= "    return parent::$getter(); \n";
		$c .= "  } \n";

		$c .= "  function $setter($foreign \$ref".($config->isOptional() ? '=null' : '').") { \n";
		$c .= "    if (is_null(\$ref)) { \n";

		if ($config->isOptional()) {
			$c .= "      \$this->$key = null; \n";
		} else {
			$c .= "      throw new OutletException(\"You can not set this to NULL since this relationship has not been marked as optional\"); \n";
		}

		$c .= "      return parent::$setter(null); \n";
		$c .= "    } \n";

		//$c .= "    \$mapped = new OutletMapper(\$ref); \n";
		//$c .= "    \$this->$key = \$mapped->getPK(); \n";
		$c .= "    \$this->$key = \$ref->{$refKey}; \n";
		$c .= "    return parent::$setter(\$ref); \n";
		$c .= "  } \n";

		return $c;
	}

}

