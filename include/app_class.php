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
include_once("lib/Conteg_class.php");

if (file_exists_in_path('Zend/Loader/Autoloader.php')) {
  include_once "Zend/Loader/Autoloader.php";
}


class App {

  function App($rootdir, $args) {
    Profiler::StartTimer("WebApp", 1);
    Profiler::StartTimer("WebApp::Init", 1);
    Profiler::StartTimer("WebApp::TimeToDisplay", 1);

    register_shutdown_function(array('Logger','processShutdown'));

    ob_start();
    $this->rootdir = $rootdir;
    $this->debug = !empty($args["debug"]);
    $this->getAppVersion();
    Logger::Info("WebApp Initializing (" . $this->appversion . ")");
    Logger::Info("Path: " . get_include_path());
    $this->initAutoLoaders();

    Logger::Info("Turning Pandora flag on");
    if (class_exists("PandoraLog")) {
      $pandora = PandoraLog::singleton();
      $pandora->setFlag(true);
    }


    $this->locations = array("scripts" => "htdocs/scripts",
        "css" => "htdocs/css",
        "tmp" => "tmp",
        "config" => "config");
    $this->request = $this->ParseRequest(NULL, $args);
    $this->locations["basedir"] = $this->request["basedir"];
    $this->locations["scriptswww"] = $this->request["basedir"] . "/scripts";
    $this->locations["csswww"] = $this->request["basedir"] . "/css";
    $this->locations["imageswww"] = $this->request["basedir"] . "/images";

    $this->InitProfiler();
    $this->cfg = ConfigManager::singleton($rootdir);
    $this->InitProfiler(); // reinitialize after loading the config
    $this->locations = array_merge($this->locations, $this->cfg->locations);
    $this->data = DataManager::singleton($this->cfg);

    set_error_handler(array($this, "HandleError"), error_reporting());

    DependencyManager::init($this->locations);

    if ($this->initialized()) {
      try {
        $this->session = SessionManager::singleton();
        // Set sticky debug flag
        if (isset($this->request["args"]["debug"])) {
          $this->debug = $_SESSION["debug"] = ($this->request["args"]["debug"] == 1);
        } else if (!empty($_SESSION["debug"])) {
          $this->debug = $_SESSION["debug"];
        }
        $this->cobrand = $this->GetRequestedConfigName($this->request);
        $this->cfg->GetConfig($this->cobrand, true, $this->cfg->servers["role"]);
        $this->ApplyConfigOverrides();
        $this->locations = DependencyManager::$locations = $this->cfg->locations;

        // And the google analytics flag
        if (isset($this->request["args"]["GAalerts"])) {
          $this->GAalerts = $this->session->temporary["GAalerts"] = ($this->request["args"]["GAalerts"] == 1) ? 1 : 0;
        } else if (!empty($this->session->temporary["GAalerts"])) {
          $this->GAalerts = $this->session->temporary["GAalerts"];
        } else {
          $this->GAalerts = 0;
        }

        $this->apiversion = any($this->request["args"]["apiversion"], ConfigManager::get("api.version.default"), 0);
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
    $this->user = User::singleton();
    $this->user->InitActiveUser($this->request);

    // Merge permanent user settings from the URL
    if (!empty($this->request["args"]["settings"])) {
      foreach ($this->request["args"]["settings"] as $k=>$v) {
        $this->user->SetPreference($k, $v, "user");
      }
    }
    // ...and then do the same for session settings
    if (!empty($this->request["args"]["sess"])) {
      foreach ($this->request["args"]["sess"] as $k=>$v) {
        $this->user->SetPreference($k, $v, "temporary");
      }
    }

    // And finally, initialize abtests
    if (class_exists(ABTestManager)) {
      Profiler::StartTimer("WebApp::Init - abtests", 2);
      $this->abtests = ABTestmanager::singleton(array("cobrand" => $this->cobrand, "v" => $this->request["args"]["v"]));
      Profiler::StopTimer("WebApp::Init - abtests");
    }

    Profiler::StopTimer("WebApp::Init");
  }

  function Display($path=NULL, $args=NULL) {
    $path = any($path, $this->request["path"], "/");
    $args = any($args, $this->request["args"], array());

    if (!empty($this->components)) {
      try {
        $output = $this->components->Dispatch($path, $args, $this->request["type"]);
      } catch (Exception $e) {
        //print_pre($e);
        $output["content"] = $this->HandleException($e);
      }

      $this->session->quit();

      $contegargs = any($this->cfg->servers["conteg"], array());
      $sitecfg = ConfigManager::get("conteg");
      if (is_array($sitecfg))
        $contegargs = array_merge($contegargs, $sitecfg);
      if (is_array($this->sitecfg["conteg"]))
        $contegargs = array_merge($contegargs, $this->sitecfg["conteg"]);
      if (empty($contegargs["type"]))
        $contegargs["type"] = any($this->request["contenttype"], $output["responsetype"]);
      if (is_array($contegargs["policy"][$contegargs["type"]])) {
        $contegargs = array_merge($contegargs, $contegargs["policy"][$contegargs["type"]]);
      }

      if (empty($contegargs["modified"])) // Set modified time to mtime of base directory if not set
        $contegargs["modified"] = filemtime($this->rootdir);

      //header('Content-type: ' . any($output["type"], "text/html"));
      if ($output["type"] == "ajax" || $output["type"] == "jsonp") {
        print $this->tplmgr->PostProcess($output["content"], true);
      } else {
        print $this->tplmgr->PostProcess($output["content"]);
        $showprofiler = !empty($this->request["args"]["timing"]) || ($output["type"] == "text/html" && array_get($this->cfg->servers, "profiler.display"));
        if ($showprofiler)
          print Profiler::Display();
      }
      Profiler::StopTimer("WebApp::TimeToDisplay");
      Profiler::StartTimer("WebApp::Display() - Conteg", 1);
      new Conteg($contegargs);
      Profiler::StopTimer("WebApp::Display() - Conteg");
      if (Profiler::$log) {
        Profiler::Log(DependencyManager::$locations["tmp"], $this->components->pagecfg["pagename"]);
      }
    }
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

  function initialized() {
    $ret = false;
    if (is_writable($this->locations["tmp"])) {
      if (!file_exists($this->locations["tmp"] . "/initialized.txt")) {
        umask(0002);
        Logger::notice("App instance has not been initialized yet - doing so now");
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

  function ParseRequest($page=NULL, $args=NULL) {
    $ret = array();
    //$scriptname = array_shift($req);
    //$component = array_shift($req);
    //$ret["path"] = "/" . str_replace(".", "/", $component);
    if ($page === NULL)
      $page = $_SERVER["SCRIPT_URL"];
    $ret["path"] = "/";
    $ret["type"] = "commandline";
    $ret["user_agent"] = "commandline";

    if (!empty($args)) {
      $ret["args"] = $args;
    }
    return $ret;
  }

  function HandleException($e) {
    $vars["exception"] = array("type" => "exception",
        "message" => $e->getMessage(),
        "file" => $e->getFile(),
        "line" => $e->getLine(),
        "trace" => $e->getTrace());
    $user = User::singleton();
    $vars["debug"] = ($this->debug || $user->HasRole("ADMIN"));
    if ($this->tplmgr && ($path = file_exists_in_path("templates/exception.tpl", true)) !== false) {
      return $this->tplmgr->GetTemplate($path . "/templates/exception.tpl", $this, $vars);
    }
    return sprintf("Unhandled Exception: '%s' at %s:%s\n", $vars["exception"]["message"], $vars["exception"]["file"], $vars["exception"]["line"]);
  }

  function HandleError($errno, $errstr, $errfile, $errline, $errcontext) {
    $visible = (!isset($this->cfg->servers["logger"]["visible"]) || $this->cfg->servers["logger"]["visible"] == true);
    if ($visible) {
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

      $user = User::singleton();
      $vars["debug"] = ($this->debug || $user->HasRole("ADMIN"));
      if ($vars["debug"]) {
        $vars["exception"]["trace"] = debug_backtrace();
        array_shift($vars["exception"]["trace"]);
      }

      //$vars['dumpedException'] = var_export($vars['exception'], true);

      if (isset($this->tplmgr) && ($path = file_exists_in_path("templates/exception.tpl", true)) !== false) {
        print $this->tplmgr->GetTemplate($path . "/templates/exception.tpl", $this, $vars);
      } else {
        print "<blockquote><strong>" . $type . ":</strong> " . $errstr . " at $errfile:$errline</blockquote>";
      }
    }
  }

  protected function initAutoLoaders() {
    if (class_exists('Zend_Loader_Autoloader', false)) {
      $zendAutoloader = Zend_Loader_Autoloader::getInstance(); //already registers Zend as an autoloader
      $zendAutoloader->unshiftAutoloader(array('App', 'autoloadElation')); //add the Elation autoloader
    } else {
      spl_autoload_register('App::autoloadElation');
    }
  }

  public static function autoloadElation($class) {
//    print "$class <br />";

    if (file_exists_in_path("include/" . strtolower($class) . "_class.php")) {
      require_once("include/" . strtolower($class) . "_class.php");
    } else if (file_exists_in_path("include/model/" . strtolower($class) . "_class.php")) {
      require_once("include/model/" . strtolower($class) . "_class.php");
    } else if (file_exists_in_path("include/Smarty/{$class}.class.php")) {
      require_once("include/Smarty/{$class}.class.php");
    } else {
      try {
        if (class_exists('Zend_Loader', false)) {
          @Zend_Loader::loadClass($class); //TODO: for fucks sake remove the @ ... just a tmp measure while porting ... do it or i will chum kiu you!
        }
        return;
      } catch (Exception $e) {
        
      }
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

  function GetRequestedConfigName($req=NULL) {
    $ret = any($this->cfg->servers["cobrand"], "thefind");

    if (empty($req))
      $req = $this->request;

    if (!empty($req["args"]["cobrand"]) && is_string($req["args"]["cobrand"])) {
      $ret = $req["args"]["cobrand"];
      $_SESSION["temporary"]["cobrand"] = $ret;
    } else if (!empty($_SESSION["temporary"]["cobrand"])) {
      $ret = $_SESSION["temporary"]["cobrand"];
    }

    Logger::Info("Requested config is '$ret'");
    return $ret;
  }


  function ApplyConfigOverrides() {
    if(!empty($this->request["args"]["sitecfg"])) {
      $tmpcfg = array();
      array_set_multi($tmpcfg, $this->request["args"]["sitecfg"]); // FIXME - can't we just array_set_multi() on $this->sitecfg directly?
      ConfigManager::merge($tmpcfg);
    }

    if(!empty($this->request["args"]["cobrandoverride"])) {
      $included_config =& $this->cfg->GetConfig($this->request["args"]["cobrandoverride"], false, $this->cfg->servers["role"]);
      if (!empty($included_config))
        ConfigManager::merge($included_config);
    }
    $rolename = any($this->request["args"]["_role"], $this->cfg->servers['role']);
    $rolecfg = ConfigManager::get("roles.{$rolename}.options");
    if (!empty($rolecfg)) {
      Logger::Info("Using overridden role cfg 'roles.{$rolename}'");
      ConfigManager::merge($rolecfg);
    }

    if ($this->request["ssl"]) {
      $included_config = $this->cfg->GetConfig("classes.secure", false, $this->cfg->servers["role"]);
      if (!empty($included_config))
        ConfigManager::merge($included_config);
    }


    $browseroverride = any($this->request["args"]["sess"]["browser.override"], $_SESSION["temporary"]["user"]["preferences"]["browser"]["override"], NULL);
    if ($browseroverride !== NULL)
      $this->request["browser"] = $browseroverride;

    if(!empty($this->request["browser"])) {
      $included_config =& ConfigManager::get("browsers.{$this->request['browser']}.options");
      if (!empty($included_config["include"])) { // These includes sure do get hairy.  This allows for browsers.*.options.include to call in different classes
        $includes = explode(",", $included_config["include"]);
        foreach ($includes as $include) {
          $subincluded_config =& $this->cfg->GetConfig($include, false, $this->cfg->servers["role"]);
          if (!empty($subincluded_config))
            ConfigManager::merge($subincluded_config);
        }
        unset($included_config["include"]);    
      }

      if ($this->debug) {
        $subincluded_config =& $this->cfg->GetConfig("classes.debug", false, $this->cfg->servers["role"]);
        if (!empty($subincluded_config))
          ConfigManager::merge($subincluded_config);
      }

      if (!empty($included_config))
        ConfigManager::merge($included_config);
    }
  }
}
