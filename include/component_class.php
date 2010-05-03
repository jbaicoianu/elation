<?
/*
  Copyright (c) 2005 James Baicoianu

  This library is free software; you can redistribute it and/or
  modify it under the terms of the GNU Lesser General Public
  License as published by the Free Software Foundation; either
  version 2.1 of the License, or (at your option) any later version.

  This library is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
  Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public
  License along with this library; if not, write to the Free Software
  Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

class Component extends Base {
  var $name;
  var $fullname;
  var $type;
  var $components;
  var $payload;

  function Component($name, &$parent) {
    $this->Base($parent);
    $this->name = $name;
    $this->fullname = $this->GetFullName();

    $this->smarty = SuperSmarty::singleton();
  }

  function HasComponent($name, $args=NULL) {
    //return (!empty($this->components[$name]));
    $ret = false;

    if (!empty($name) && is_string($name)) {
      if (!empty($this->components[$name])) {
        $ret = true;
      } else {
        //$componentName = "Component_" . $name;
        $thisname = $this->GetFullName(".");
        $componentname = (!empty($thisname) ? str_replace(".", "_", $thisname) . "_" : "") . $name;
        $componentclassname = "Component_" . str_replace(".", "_", $componentname);
        $componentdir = $this->GetComponentDirectory();

        $fname = sprintf("%s/components/%s/%s.php", $componentdir, $name, $componentname);
        if (file_exists($fname)) {
          try {
            include_once($fname);
            $ret = $this->CreateComponent($name, $componentclassname, NULL, &$args);
          } catch (Exception $e) {
            //print_pre($e);
            print "[Could not load component: $name]";
          }
        } else if (method_exists($this, "controller_" . $name)) {
          $ret = $this->CreateComponent($name, "ComponentFunction", array(&$this, "controller_" . $name), &$args);
        } else if ($this->HasTemplate("./" . $name . ".tpl")) {
          $ret = $this->CreateComponent($name, "ComponentTemplate", "." . $componentdir . "/templates/" . $name . ".tpl", &$args);
        } else {
          $ret = $this->CreateComponent($name, "ComponentMissing");
        }
      }
    }

    return $ret;
  }
  function CreateComponent($name, $type="ComponentStatic", $payload="", $args=NULL) {
    $ret = false;

    if (class_exists($type)) {
      //print_pre($this->components);
      if (empty($this->components[$name])) {
        //print_pre("CREATE $name");
        $this->components[$name] = new $type($name, $this, $payload);
        if (method_exists($this->components[$name], "Init"))
          $this->components[$name]->Init($args);
        
        $ret = true;
      }
    }
  
    return $ret;
  }


  function &GetComponent($name) {
    $ret = NULL;
    if (!empty($this->components[$name])) {
      $ret =& $this->components[$name];
    }
    return $this->components[$name];
  }
  
  function HandlePayload(&$args, $output="blank") {
    try {
      $ret = NULL;
      //$controllerfuncname = "controller_" . $this->GetFullName("_");
      $controllerfuncname = "controller_" . $this->name;
      if (method_exists($this, $controllerfuncname)) {
        $ret = call_user_func(array($this, $controllerfuncname), $args, $output);
      }
    } catch (Exception $e) {
      global $webapp;
      $ret = $webapp->DisplayException($e);
    }
    return $ret;
  }
  
  function GetFullName($separator=".") {
    $ret = $this->name;
    if (!empty($this->parent) && is_subclass_of($this->parent, "Component")) {
      $parentName = $this->parent->GetFullName($separator);
      if (!empty($parentName))
        $ret = $parentName . $separator . $this->name;
    }

    return $ret;
  }
  function GetComponentDirectory() {
    if (!empty($this->name)) {
      $ret = "/components" . (!empty($this->name) ? "/" . $this->name : "");
      if (!empty($this->parent) && is_subclass_of($this->parent, "Component")) {
        $parentdir = $this->parent->GetComponentDirectory();
        if (!empty($parentdir))
          $ret = $parentdir . $ret;
      }
    } else {
      $ret = ".";
    }
    return $ret;
  }
  function &Get($name, $args=NULL) {
    $ret = NULL;
    if (strpos($name, ".") !== false)
      list($componentname, $subcomponentname) = explode(".", $name, 2);
    else
      $componentname = $name;

    if ($this->HasComponent($componentname, &$args)) {
      $component =& $this->GetComponent($componentname);
      if ($component !== NULL) {
        if (!empty($subcomponentname)) {
          $ret =& $component->Get($subcomponentname);
        } else {
          $ret =& $component;
        }
      }
    }

    return $ret;
  }
  
  function GetTemplate($name, $args=NULL, $mode="html") {
    //Profiler::StartTimer("Component::GetTemplate($name)");
    $ret = NULL;
  
    if ($mode == "html") {
      $this->smarty->left_delimiter = '{';
      $this->smarty->right_delimiter = '}';
    } else if ($mode == "js" || $mode == "css") {
      $this->smarty->left_delimiter = '[[{';
      $this->smarty->right_delimiter = '}]]';
    }

    // Let's be smart about templates specified as "./blah.tpl"
    $ret = $this->smarty->GetTemplate($this->ExpandTemplatePath($name), $this, $args);

    // Always restore safe default
    $this->smarty->left_delimiter = '{';
    $this->smarty->right_delimiter = '}';

    //Profiler::StopTimer("Component::GetTemplate($name)");
    return $ret;
  }

  function ExpandTemplatePath($name) {
    $ret = $name;
    if ($name[0] == "." && $name[1] == "/") {
      $dir = $this->GetComponentDirectory();
      // dir should start with './' - prepend a . to go one level up
      $ret = "." . $dir . "/templates/" . substr($name, 2);
    }
    return $ret;
  }

  function HasTemplate($name) {
    if (substr($name, 0, 2) == "./") {
      $dir = $this->GetComponentDirectory();
      // dir should start with './' - prepend a . to go one level up
      $fname = "." . $dir . "/templates/" . substr($name, 2);
    } else
      $fname = $name;

    return $this->smarty->template_exists($fname);
  }

  function GetComponentResponse($template=NULL) {
    return new ComponentResponse($this->ExpandTemplatePath($template));
  }
}

class ComponentStatic extends Component {
  function ComponentStatic($name, &$parent, $payload) {
    $this->Component($name, $parent);
    $this->type = "static";

    $this->payload = $payload;
  }
  
  function HandlePayload(&$args, $output="text") {
    return $payload;
  }
}

class ComponentMissing extends Component {
  function ComponentMissing($name, &$parent, $payload) {
    $this->Component($name, $parent);
    $this->type = "missing";

    $this->payload = $payload;
  }
  
  function HandlePayload(&$args, $output="text") {
    return $this->GetTemplate("404.tpl", $this);
  }
}

class ComponentTemplate extends Component {
  function ComponentTemplate($name, &$parent, $payload) {
    $this->Component($name, $parent);
    $this->type = "missing";

    $this->payload = $payload;
  }
  
  function HandlePayload(&$args, $output="text") {
    return $this->GetTemplate($this->payload);
  }
}

class ComponentFunction extends Component {
  function ComponentFunction($name, &$parent, $payload) {
    $this->Component($name, $parent);
    $this->type = "function";
  
    $this->payload = $payload;
  }
  
  function HandlePayload(&$args, $output="text") {
    try {
      return call_user_func($this->payload, $args, $output);
    } catch (Exception $e) {
      global $webapp;
      return $webapp->DisplayException($e);
    }
  }
}

