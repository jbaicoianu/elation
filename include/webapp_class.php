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

include_once("lib/logger.php");
include_once("lib/profiler.php");
include_once("include/common_funcs.php");

if(file_exists_in_path('lib/Zend/Loader/Autoloader.php')) {
  include_once "lib/Zend/Loader/Autoloader.php";
}

class WebApp {
  public $orm;
  public $tplmgr;
  public $components;
  public $debug = false;

  function WebApp($rootdir, $args) {
    Profiler::StartTimer("WebApp", 1);
    Profiler::StartTimer("WebApp::Init", 1);
    Profiler::StartTimer("WebApp::TimeToDisplay", 1);

    $this->rootdir = $rootdir;
    $this->debug = !empty($args["debug"]);
    $this->getAppVersion();
    Logger::Info("WebApp Initializing (" . $this->appversion . ")");
		$this->initAutoLoaders();

    $this->request = $this->ParseRequest();
    $this->InitProfiler();

    $this->cfg = ConfigManager::singleton($rootdir);
    $this->data = DataManager::singleton($this->cfg);

    set_error_handler(array($this, "HandleError"), E_ALL);

    $this->locations = array("scripts" => "htdocs/scripts",
                             "scriptswww" => $this->request["basedir"] . "/scripts",
                             "css" => "htdocs/css",
                             "csswww" => $this->request["basedir"] . "/css",
                             "imageswww" => $this->request["basedir"] . "/images",
                             "tmp" => "tmp",
                             "config" => "config");
    DependencyManager::init($this->locations);

    if ($this->initialized()) {
      try {
        $this->session = SessionManager::singleton();
        $this->tplmgr = TemplateManager::singleton($this->rootdir);
        $this->tplmgr->assign_by_ref("webapp", $this);
        $this->components = ComponentManager::singleton($this);
        $this->orm = OrmManager::singleton();
        //$this->tplmgr->SetComponents($this->components);
      } catch (Exception $e) {
        print $this->HandleException($e);
      }
    } else {
      $fname = "./templates/uninitialized.tpl"; 
      if (($path = file_exists_in_path($fname, true)) !== false) {
        print file_get_contents($path . "/" . $fname);
      }
    }
    Profiler::StopTimer("WebApp::Init");
  }
  function initialized() {
    $ret = false;
    if (is_writable($this->locations["tmp"])) {
      if (!file_exists($this->locations["tmp"] . "/initialized.txt")) {
        umask(0002);
        Logger::notice("Webapp instance has not been initialized yet - doing so now");
        if (extension_loaded("apc")) {
          Logger::notice("Flushing APC cache");
          apc_clear_cache();
        }

        // Create required directories for program execution
        if (!file_exists($this->locations["tmp"] . "/compiled/"))
          mkdir($this->locations["tmp"] . "/compiled/", 02775);

        $ret = touch($this->locations["tmp"] . "/initialized.txt");
      } else {
        $ret = true;
      }
    }
    return $ret;
  }
  function GetAppVersion() {
    $this->appversion = "development";
    $verfile = "config/elation.appversion";
    if (file_exists($verfile)) {
      $appver = trim(file_get_contents($verfile));
      if (!empty($appver))
        $this->appversion = $appver;
    }
    return $this->appversion;
  }
  function ParseRequest($page=NULL, $post=NULL) {
    $webroot = "/";
    if ($page === NULL)
      $page = $_SERVER["SCRIPT_URL"];
    if ($page === NULL) {
      if (preg_match("/^(.*?)\/go\.php$/", $_SERVER["SCRIPT_NAME"], $m)) {
        $webroot = $m[1];
      }
      $page = preg_replace("/".preg_quote($webroot,"/")."(.*?)(\?.*)?$/", "$1", $_SERVER["REQUEST_URI"]);
    }
    if ($post === NULL)
      $post = &$_REQUEST;

    $req = @parse_url($page); // FIXME - PHP sucks and throws a warning here on malformed URLs, with no way to catch as an exception

    if (!empty($req["query"]))
      parse_str($req["query"], $req["args"]);
    else
      $req["args"] = array();

    if (!empty($post)) {
      if (get_magic_quotes_gpc()) {
        $post = array_map('stripslashes_deep', $post);
      }
      $req["args"] = array_merge($req["args"], $post);
    }

    $req["host"] = $_SERVER["HTTP_HOST"];
    $req["ssl"] = !empty($_SERVER["HTTPS"]);
    $req["scheme"] = "http" . ($req["ssl"] ? "s" : "");
    $req["ip"] = $_SERVER["REMOTE_ADDR"];
    $req["user_agent"] = $_SERVER['HTTP_USER_AGENT'];
    $req["referer"] = $_SERVER["HTTP_REFERER"];

    if (!empty($_SERVER["PHP_AUTH_USER"]))
      $req["user"] = $_SERVER["PHP_AUTH_USER"];
    if (!empty($_SERVER["PHP_AUTH_PW"]))
      $req["password"] = $_SERVER["PHP_AUTH_PW"];

    $req["basedir"] = $webroot;
    $req["baseurl"] = $req["scheme"] . "://" . $req["host"] . $req["basedir"];
    $req["url"] = $req["baseurl"] . $req["path"];
      
    if($req["basedir"] == '/') {
      $req["basedir"] = '';
    }
    // TODO - this is where any sort of URL argument remapping should happen, and there should be a corresponding function to build those URLs

    return $req;
  }

  function Display() {
    if (!empty($this->components)) {
      try {
        $output = $this->components->Dispatch($this->request["path"], $this->request["args"]);
      } catch (Exception $e) {
        //print_pre($e);
        $output["content"] = $this->HandleException($e);
      }
      
      Profiler::StopTimer("WebApp::TimeToDisplay");
      if ($output["type"] == "ajax") {
        header('Content-type: application/xml');
        print $this->tplmgr->GenerateXML($output["content"]);
      } else {
        header('Content-type: ' . any($output["responsetype"], "text/html"));
        print $this->tplmgr->PostProcess($output["content"]);
        if (!empty($this->request["args"]["timing"]))
          print Profiler::Display();
      }
    }
  }
  function HandleException($e) {
    $vars["exception"] = array("type" => "exception",
                               "message" => $e->getMessage(),
                               "file" => $e->getFile(),
                               "line" => $e->getLine(),
                               "trace" => $e->getTrace());
    $vars["debug"] = $this->debug; //User::authorized("debug");
    if (($path = file_exists_in_path("templates/exception.tpl", true)) !== false) {
      return $this->tplmgr->GetTemplate($path . "/templates/exception.tpl", $this, $vars);
    }
    return "Unhandled Exception (and couldn't find exception template!)";
  }
  function HandleError($errno, $errstr, $errfile, $errline, $errcontext) {
    if ($errno & error_reporting()) {
      if ($errno & E_ERROR || $errno & E_USER_ERROR)
        $type = "error";
      else if ($errno & E_WARNING || $errno & E_USER_WARNING)
        $type = "warning";
      else if ($errno & E_NOTICE || $errno & E_USER_NOTICE)
        $type = "notice";
      else if ($errno & E_PARSE)
        $type = "parse error";

      $vars["exception"] = array("type" => $type,
                                 "message" => $errstr,
                                 "file" => $errfile,
                                 "line" => $errline);
      if (isset($this->tplmgr) && ($path = file_exists_in_path("templates/exception.tpl", true)) !== false) {
        print $this->tplmgr->GetTemplate($path . "/templates/exception.tpl", $this, $vars);
      } else {
        print "<blockquote><strong>" . $type . ":</strong> " . $errstr . "</blockquote>";
      }
    }
  }
	
  protected function initAutoLoaders()
  {
  	if(class_exists('Zend_Loader_Autoloader', false)) {
	    $zendAutoloader = Zend_Loader_Autoloader::getInstance(); //already registers Zend as an autoloader
	    $zendAutoloader->unshiftAutoloader(array('WebApp', 'autoloadElation')); //add the Trimbo autoloader
		} else {
			spl_autoload_register('WebApp::autoloadElation');
		}
  }

  public static function autoloadElation($class) 
  {
    //print "$class**<br />";
  	
	  if (file_exists_in_path("include/" . strtolower($class) . "_class.php")) {
	    require_once("include/" . strtolower($class) . "_class.php");
	  } else if (file_exists_in_path("include/model/" . strtolower($class) . "_class.php")) {
	    require_once("include/model/" . strtolower($class) . "_class.php");
	  }	else {
      try {
      	if(class_exists('Zend_Loader', false)) {
          Zend_Loader::loadClass($class);
				}
        return;
      }
      catch (Exception $e) {
        //var_dump($e);
        //throw new Exception("Class ($class) is not in the ClassMapper.");
      }	  	
	    //throw new Exception("Class ($class) is not in the ClassMapper.");
	  }
	}
  public function InitProfiler() {
    // If timing parameter is set, force the profiler to be on
    $timing = any($this->request["args"]["timing"], $this->cfg->servers["profiler"]["level"], 0);

    if (!empty($this->cfg->servers["profiler"]["percent"])) {
      if (rand() % 100 < $this->cfg->servers["profiler"]["percent"]) {
        $timing = 4;
        Profiler::$log = true;
      }
    }

    if (!empty($timing)) {
      Profiler::$enabled = true;
      Profiler::setLevel($timing);
    }
  }
}
