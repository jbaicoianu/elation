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

require("include/Smarty/Smarty.class.php");

// Form validation
//include_once("Smarty/SmartyValidate.class.php");


class TemplateManager extends Smarty {
  function TemplateManager($root=".") {
    if (!empty($root))
      $this->Init($root);
  }

  protected static $instance;
  public static function singleton($args=NULL) { $name = __CLASS__; if (!self::$instance) { self::$instance = new $name($args); } return self::$instance;  }

  function Init($root) {
    // Set up all Smarty default settings
    $this->template_dir = $root . '/templates';
    $this->compile_dir  = $root . '/tmp/compiled';
    $this->cache_dir    = $root . '/tmp/cache';
    //$this->config_dir   = $root . '/text/'.LANGUAGE;
    $this->_file_perms  = 0664;

    $this->plugins_dir[] = $root . '/include/smarty';

    //$this->load_filter("output", "varreplace");
    // Initialize SmartyValidate
    //SmartyValidate::connect($this);

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
    if ($this->template_exists($resource_name))
      $return = $this->fetch($resource_name);
    else
      $return = "[Could not find template '$resource_name']";

    // And put everything back where we found it.
    $this->_tpl_vars =& $oldvars;

    return $return;
  }

  function GenerateHTML($responses) {
    return $this->PostProcess($responses);
  }
  function GenerateXML($responses) {
    global $webapp;

    $output = '<responses>';
    foreach ($responses as $k=>$v) {
      if ($k == "javascript") {
        if (is_array($v)) {
          foreach ($v as $js)
            $output .= '  <response type="javascript"><![CDATA[' . $js . ']]></response>' . "\n";
        } else {
          $output .= '  <response type="javascript"><![CDATA[' . $v . ']]></response>' . "\n";
        }
      } else {
        $output .= '  <response target="' . $k . '"><![CDATA[' . $v . ']]></response>' . "\n";
      }
    }
    if ($webapp->debug) {
      $output .= '  <response type="debug"><![CDATA[' . Logger::Display(E_ALL) . ']]></response>' . "\n";
    }
    $output .= '</responses>';

    return $output;
  }

  function SetComponents(&$components) {
    $this->components =& $components;
  }

  function PostProcess(&$output) {
    global $webapp;

    Profiler::StartTimer("TemplateManager::PostProcess()");

    if (!is_array($output)) { // FIXME - we should probably still postprocess if we're returning XML
      if (preg_match_all("/\[\[([^\]:]+)(:(.*?))?\]\]/", $output, $matches, PREG_SET_ORDER)) {
        $search = $replace = array();
        foreach ($matches as $m) {
          $search[] = $m[0];
          $replace[] = (!empty($this->varreplace[$m[1]]) ? htmlspecialchars($this->varreplace[$m[1]]) : (!empty($m[3]) ? $m[3] : ""));
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
            $replace[$pos] = ComponentManager::fetch("elation.debug"); //Logger::display(E_ALL);
          } else {
            $replace[$pos] = "";
          }
        }

        $pos = array_search("[[dependencies]]", $search);
        $replace[$pos] = DependencyManager::display();

        $output = str_replace($search, $replace, $output);
      }
    }
    Profiler::StopTimer("TemplateManager::PostProcess()");
    return $output;
  }
}

