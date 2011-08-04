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


// Defines a class which extends the base Smarty class.  This makes Smarty upgrades
// slightly easier to handle, and also provides an easy way to extend Smarty with
// custom functions/blocks/etc in a nice clean package.

if (file_exists_in_path("smarty/libs/Smarty.class.php")) {
  include_once("smarty/libs/Smarty.class.php");
} else if (file_exists_in_path("include/smarty/Smarty.class.php")) {
  include_once("include/smarty/Smarty.class.php");
} else {
  Logger::Error("Couldn't find Smarty include file");
  // Define a dummy Smarty class just so we don't die
  class Smarty {
    function assign() { }
    function assign_by_ref() { }
    function template_exists() { }
  };
}

// Form validation
if (file_exists_in_path("include/smarty/SmartyValidate.class.php")) {
  include_once("include/smarty/SmartyValidate.class.php");
}


class TemplateManager extends Smarty {
  private $_template_exists_cache = array();
  private $_is_combined_cache = array();
  protected static $instance;
  public static function singleton($args=NULL) { $name = __CLASS__; if (!self::$instance) { self::$instance = new $name($args); } return self::$instance;  }


  function TemplateManager($root=".") {
    if (!empty($root))
      $this->Init($root);
  }

  function Init($locations) {
    // Set up all Smarty default settings
    $root = any($locations["root"], ".");
    $tmpdir = any($locations["tmp"], "./tmp");

    $this->template_dir = $root . '/templates';
    $this->compile_dir  = $tmpdir . '/compiled';
    $this->cache_dir    = $tmpdir . '/cache';
    //$this->config_dir   = $root . '/text/'.LANGUAGE;
    $this->_file_perms  = 0664;

    //$this->plugins_dir[] = $root . '/include/smarty';
    $filepaths = file_find_paths("include/smarty/plugins");
    foreach ($filepaths as $fp) {
      $this->plugins_dir[] = $fp;
    }


    //$this->load_filter("output", "varreplace");
    if (class_exists("SmartyValidate")) {
      // Initialize SmartyValidate
      SmartyValidate::connect($this);
    }

    // Make global variables accessible from within smarty templates
    /*
    foreach ($GLOBALS as $k=>$v) {
      if ($k != "smarty")
        $this->_tpl_vars[$k] = $v;
    }
    */
  }

  function GetTemplate($resource_name, $object=NULL, $vars=NULL) {
    // Improve on the way Smarty handles template variables.  This allows multiple
    // concurrent objects to access the same Smarty object without stepping on
    // each other's toes.  Also implements transient variables (ie, variables which
    // are stored only for this template - not its children)

    // First we back up the old tpl variables, then
    // we parse our way through the object heirarchy to create our new temporary variable
    // array.
  
    $oldvars =& $this->_tpl_vars;

    $tmpobj =& $object;
    $newvars = $this->_tpl_vars; 
    if (!empty($vars)) {
      // FIXME - originally this used references, but that didn't work well for nonpersistant variables.  Does this work ok in all cases?
      foreach ($vars as $k=>$v) {
        $newvars[$k] = $v;
      }
    }
    
    /*
    if (!empty($tmpobj)) {
      do {
        foreach ($tmpobj as $k=>$v) {
          if (!isset($newvars[$k]) && $k[0] != "_") { // && !in_array($k, array("smarty", "parent", "modules"))) {
            $newvars["this"][$k] =& $tmpobj->{$k};
          }
        }
      } while ($tmpobj =& $tmpobj->parent);
    }
    */

    $newvars["this"] =& $object;
    
    // DEBUG: print tpl_vars
    /*
    print "<pre>";
    print_r($newvars);
    print "</pre>";
    */

    // Move the new variable array into place...
    $this->_tpl_vars =& $newvars;

    // Parse the template...
    if ($this->HasTemplate($resource_name)) {
      $return = $this->fetch($resource_name);
    } else {
      $return = "[Could not find template '$resource_name']";
    }

    // And put everything back where we found it.
    $this->_tpl_vars =& $oldvars;

    return $return;
  }
  function HasTemplate($resource_name) {
    if (!isset($this->_template_exists_cache[$resource_name])) {
      $this->_template_exists_cache[$resource_name] = $this->template_exists($resource_name);
    }
    return $this->_template_exists_cache[$resource_name];
  }

  function GenerateHTML($responses) {
    return $this->PostProcess($responses);
  }
  function GenerateXML($responses) {
    $real = $this->ConvertOutputAjaxlib($responses);

    $output = "<responses>\n";
    foreach ($real as $r) {
      $output .= "\t<response ";
      foreach ($r as $k=>$v) {
        if ($k[0] != '_') {
          if (!is_array($v))  {
            $output .= $k . '="' . htmlspecialchars($v) . '" ';
          } else {
            $output .= $k . "=\"" . htmlspecialchars(json_encode($v)) . "\" ";
          }
        }
      }
      if (!empty($r["_content"])) {
        // FIXME - calling postprocess here can cause issues with jsonencoding and with other strings which contain [[ and ]], but it's somewhat necessary for some things...
        //$output .= '><![CDATA[' . $this->PostProcess($r["_content"]) . ']]></response>';
        $output .= '><![CDATA[' . $r["_content"] . ']]></response>';
      } else {
        $output .= '/>';
      }
      $output .= "\n";
    }
    $output .= "</responses>";
    return $output;
  }
  function GenerateJavascript($responses, $jsonp="elation.ajax.processResponse") {
    if (is_string($responses))
      $responses = array("data" => array("content" => $responses));
    $real = $this->ConvertOutputAjaxlib($responses);
    $output = $jsonp . "(" . json_encode($real) . ");";
    return $output;
  }
  function ConvertOutputAjaxlib($responses) {
    //$depmgr = DependencyManager::singleton();
    $ret = array();
    if (!empty($responses)) {
      foreach ($responses as $name=>$response) {
        if (is_array($response)) {
          foreach ($response as $respname=>$respval) {
            $responseobj = array("type" => "$name",
                                 "name" => $respname);
            switch ($name) {
            case "data":
              $responseobj["_content"] = json_encode($respval);
              break;
            default:
              $responseobj["_content"] = (string) $respval;
            }
            $ret[] = $responseobj;
          }
        } else {
          if ($response instanceOf AjaxlibResponse) {
            $responseobj = $response->flatten(array("target" => $name));
          } else {
            $responseobj = array("type" => "xhtml",
                                 "target" => $name);
            $responseobj["_content"] = (string) $response;
          }
          $ret[] = $responseobj;
        }
      }
    }
    $dependencies = DependencyManager::get();
    foreach ($dependencies as $prio=>$browsers) {
      foreach ($browsers as $browser=>$deptypes) {
        foreach ($deptypes as $deptype=>$deps) {
          if ($deptype != "jstemplate") { // FIXME - for some reason jstemplate dependencies in AJAX responses cause all hell to break loose...they're not used yet anyway
            foreach ($deps as $depid=>$dep) { // jesus
              $depobj = object_to_array($dep);
              $depobj["deptype"] = $depobj["type"];
              $depobj["type"] = "dependency";
              $ret[] = $depobj;
            }
          }
        }
      }
    }
    

    $user = User::singleton();
    global $webapp;
    if (!empty($webapp->debug) && ($user->HasRole("DEBUG") || $user->HasRole("ADMIN") || $user->HasRole("QA"))) {
      //$ret[] = array("type" => "debug", "_content" => Logger::Display(E_ALL));
      $ret[] = array("type" => "debug", "_content" => "\n[[debug]]\n");
    }
    return $ret;
  }

  function SetComponents(&$components) {
    $this->components =& $components;
  }

  function PostProcess(&$output, $simpledebug=false) {
    global $webapp;

    Profiler::StartTimer("TemplateManager::PostProcess()");

    if (!is_array($output)) { // FIXME - we should probably still postprocess if we're returning XML
      if (preg_match_all("/\[\[(\w[^\[\]{}:|]*)(?:[:|](.*?))?\]\]/", $output, $matches, PREG_SET_ORDER)) {
        $search = $replace = array();
        foreach ($matches as $m) {
          $search[] = $m[0];
          $replace[] = (!empty($this->varreplace[$m[1]]) ? htmlspecialchars($this->varreplace[$m[1]]) : (!empty($m[2]) ? $m[2] : ""));
        }
        
        $pos = array_search("[[debug]]", $search);
        if ($pos !== false) {
          // if there are errors, check for access and force debug
          $show_debug = $webapp->debug;
          /*
          if (Logger::hasErrors()) {
            $user = User::singleton();
            if ($user->HasRole("DEBUG") || $user->HasRole("ADMIN") || $user->HasRole("QA")) {
              $show_debug = true;
            }
          }
          */
          if ($show_debug) {
            //$replace[$pos] = $this->GetTemplate("debug.tpl");
            $replace[$pos] = ($simpledebug ? Logger::Display(E_ALL) : ComponentManager::fetch("elation.debug"));
          } else {
            $replace[$pos] = "";
          }
        }
						
        if (($pos = array_search("[[dependencies]]", $search)) !== false) {
          $replace[$pos] = DependencyManager::display();
        }
        $output = str_replace($search, $replace, $output);
      }
    }
    Profiler::StopTimer("TemplateManager::PostProcess()");
    return $output;
  }
  function _is_compiled($resource_name, $compile_path) {
    if (!isset($this->_is_compiled_cache[$resource_name])) {
      $this->_is_compiled_cache[$resource_name] = Smarty::_is_compiled($resource_name, $compile_path);
    }
    return $this->_is_compiled_cache[$resource_name];
  }
}

