<?php
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

include_once("autoload.php");
include_once("lib/logger.php");
include_once("common_funcs.php");
include_once("outlet/Outlet.php");
//include_once("config/outlet_conf.php");

include_once "lib/Zend/Loader/Autoloader.php";

class WebApp {
  public $orm;
  public $smarty;
  public $components;

  function WebApp($rootdir, $args) {
    $this->rootdir = $rootdir;
		$this->initAutoLoaders();
    //$this->cfg = new ConfigManager($rootdir);
    //$this->data = new DataManager($this->cfg);

    set_error_handler(array($this, "HandleError"), E_WARNING | E_ERROR | E_PARSE);

    if ($this->initialized()) {
      try {
        $this->smarty = SuperSmarty::singleton($this->rootdir);
        $this->smarty->assign_by_ref("webapp", $this);
        $this->components = new ComponentDispatcher($this);
        $this->orm = OrmManager::singleton();
        //$this->smarty->SetComponents($this->components);

        session_set_cookie_params(30*60*60*24);
        session_start();
      } catch (Exception $e) {
        $this->HandleException($e);
      }
    } else {
      print file_get_contents("./templates/uninitialized.tpl");
    }
  }
  function initialized() {
    return is_writable("./tmp");
  }

  function Display() {
    if (!empty($this->components)) {
      try {
        $output = $this->components->Dispatch();
      } catch (Exception $e) {
        //print_pre($e);
        $this->HandleException($e);
      }
      
      if ($output["type"] == "ajax") {
        header('Content-type: application/xml');
        print $this->smarty->GenerateXML($output["content"]);
      } else {
        header('Content-type: ' . any($output["responsetype"], "text/html"));
        print $this->smarty->PostProcess($output["content"]);
      }
    }
  }
  function HandleException($e) {
    $vars["exception"] = array("type" => "exception",
                               "message" => $e->getMessage(),
                               "file" => $e->getFile(),
                               "line" => $e->getLine(),
                               "trace" => $e->getTrace());
    print $this->smarty->GetTemplate("exception.tpl", $this, $vars);
  }
  function HandleError($errno, $errstr, $errfile, $errline, $errcontext) {
    if ($errno & E_ERROR)
      $type = "error";
    else if ($errno & E_WARNING)
      $type = "warning";
    else if ($errno & E_NOTICE)
      $type = "notice";
    else if ($errno & E_PARSE)
      $type = "parse error";

    $vars["exception"] = array("type" => $type,
                               "message" => $errstr,
                               "file" => $errfile,
                               "line" => $errline);
    print $this->smarty->GetTemplate("exception.tpl", $this, $vars);
  }
	
  protected function initAutoLoaders()
  {
    $zendAutoloader = Zend_Loader_Autoloader::getInstance(); //already registers Zend as an autoloader
    $zendAutoloader->unshiftAutoloader(array('WebApp', 'autoloadElation')); //add the Trimbo autoloader 
  }

  public static function autoloadElation($class) 
  {
    //print "$class**<br />";
  	
	  if (isset(ClassMapper::$classes[$class])) {
	    require_once(ClassMapper::$classes[$class]);
	  } else if (file_exists("include/" . strtolower($class) . "_class.php")) {
	    require_once("include/" . strtolower($class) . "_class.php");
	  } else if (file_exists("include/model/" . strtolower($class) . "_class.php")) {
	    require_once("include/model/" . strtolower($class) . "_class.php");
	  } 
		else {
      try {
        Zend_Loader::loadClass($class);
        return;
      }
      catch (Exception $e) {
        //var_dump($e);
        //throw new Exception("Class ($class) is not in the ClassMapper.");
      }	  	
	    //throw new Exception("Class ($class) is not in the ClassMapper.");
	  }
	}
}
