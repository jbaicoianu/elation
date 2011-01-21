<?php
/**
 * class DependencyManager
 * Singleton class for managing dependencies as templates render
 * @package Framework
 * @subpackage Dependencies
 */
class DependencyManager {
  static private $dependencies = array();
  static public $locations = array();

  static function init($locations) {
    self::$locations = $locations;
  }
  static function add($args) {
    if (empty($args["type"])) {
      $args["type"] = "component";
    }
    $browser = any($args["browser"], "all");
    $priority = any($args["priority"], 2);
    if (!is_array(self::$dependencies[$priority]))
      self::$dependencies[$priority] = array();
    
    //self::$dependencies[$args["type"]][] = Dependency::create($args["type"], $args);
    $dep = Dependency::create($args["type"], $args);
    if (!isset(self::$dependencies[$priority][$browser][$args["type"]][$dep->id()])) {
      self::$dependencies[$priority][$browser][$args["type"]][$dep->id()] = $dep;
      if (Logger::$enabled && !$silent) {
        Logger::Notice("Added {$args["type"]} dependency ({$browser}): '{$dep->content()}'");
      }
    }
  }
  static function get() {
    return self::$dependencies;
  }
  static function display() {
    $ret = "";
    //print_pre(self::$dependencies);
    ksort(self::$dependencies);
    foreach (self::$dependencies as $priority=>$browsers) {
      foreach ($browsers as $browser=>$types) { 
        // FIXME - we're not actually wrapping the per-browser dependencies in their proper conditional comments yet
        foreach ($types as $type=>$deps) {
          foreach ($deps as $dep) {
            $ret .= $dep->display(self::$locations);
          }
        }
      }
    }
    return $ret;
  }
  static function contents($type, $args, $extra=NULL) {
    $ret = array("content" => "",
                 "lastmodified" => 0,
                 "loaded" => array());
    $url = '';
    $argsep = '/';
    $valsep = '-';
    $cfg = ConfigManager::singleton();
    $typemap = array("javascript" => array("dir" => $cfg->locations["scripts"], "extension" => "js"),
                     "css" => array("dir" => $cfg->locations["css"], "extension" => "css"));
    
    $extension = $typemap[$type]["extension"];
    $extensionlen = strlen($extension);
    foreach ($args as $k=>$v) {
      if ($k[0] != '_') {
        $componentdir = $typemap[$type]["dir"] . "/$k";
        $files = explode(" ", $v);
        foreach ($files as $file) {
          if (substr($file, -($extensionlen+1), $extensionlen+1) == ".$extension") {
            $file = substr($file, 0, -($extensionlen+1));
          }
          $fname = $componentdir . "/" . $file . "." . $extension;
          if (file_exists($fname)) {
            $modtime = filemtime($fname);
            if ($modtime > $ret["lastmodified"])
              $ret["lastmodified"] = $modtime;

            //$ret["content"] .= "\n/* ### File: " . $fname . " ### */\n";
            $ret["content"] .= file_get_contents($fname);

            $ret["loaded"][$k][] = $file;

            //$ret["content"] .= "\n/* ### This code has been appended via DependencyCombiner ### */\n";
            if (!empty($extra))
              $ret["content"] .= $extra;
          }
        }
      }
    }
    return $ret;
  }
}
/**
 * class Dependency
 * Abstract interface class representing any type of Dependency
 * @package Framework
 * @subpackage Dependencies
 */
abstract class Dependency {
  public $type;
  public $name;
  public $version;

  function Dependency($args, $silent=false) {
    $this->browser = any($args["browser"], "all");
    $this->type = $args["type"];

    $this->Init($args, DependencyManager::$locations);
  }
  function Init($args, $locations=NULL) {
    foreach ($args as $k=>$v) {
      $this->{$k} = $v;
    }
  }
  abstract function Display($locations, $extras=NULL);
  
  function id() {
    return md5($this->type . ":" . $this->content());
  }
  function content() {
    return any($this->name, $this->property, $this->code, $this->file, $this->url, "(unknown)");
  }
  function GetFilename($path, $fname) {
    $ret = NULL;
    $accept = explode(",", any($this->accept, $_SERVER["HTTP_ACCEPT_ENCODING"], ""));

    if (in_array("gzip", $accept) && file_exists($path . "/" . $fname . ".gz"))
      $ret .= $fname . ".gz";
    else if (file_exists($path . "/" . $fname))
      $ret = $fname;
    return $ret;
  }

  static function create($type, $args) {
    $ret = NULL;
    switch($type) {
      case 'javascript':
        $ret = new DependencyJavascript($args);
        break;
      case 'css':
        $ret = new DependencyCSS($args);
        break;
      case 'component':
        $ret = new DependencyComponent($args);
        break;
      case 'onload':
        $ret = new DependencyOnload($args);
        break;
      case 'placemark':
        $ret = new DependencyPlacemark($args);
        break;
      case 'meta':
        $ret = new DependencyMeta($args);
        break;
      case 'jstemplate':
        $ret = new DependencyJSTemplate($args);
        break;
      case 'rss':
        $ret = new DependencyRSS($args);
        break;
      default:
        throw new Exception("DependencyManager: unknown dependency type '$type'");
    }
    return $ret;
  }
}
/**
 * class DependencyCSS
 * CSS dependency
 * @package Framework
 * @subpackage Dependencies
 */
class DependencyCSS extends Dependency {
  public $file;
  public $url;

  private $format = '<link rel="stylesheet" type="text/css" href="%s" media="%s" />';
  //private $extraformat = '<script type="text/javascript">elation.dependencies.register("css", %s)</script>';
  private $extraformat = '';


  function Display($locations, $extras=NULL) {
    $url = "";
    if (empty($this->media)) $this->media = "all";
    if (!empty($this->file)) {
      $fname = $this->GetFilename($locations["css"], $this->file);
      if (!empty($fname))
        $url = sprintf("%s/%s%s", $locations["csswww"], $fname, (!empty($this->version) ? "?dv=" . $this->version : ""));
    } else if (!empty($this->url)) {
      $url = $this->url;
    }
    if (!empty($url))
      $ret = sprintf($this->format."\n", htmlspecialchars($url), $this->media);
    if ($extras !== NULL)
      $ret .= sprintf($this->extraformat, json_encode($extras));
    return $ret;
  }
}
/**
 * class DependencyJavascript
 * Javascript dependency
 * @package Framework
 * @subpackage Dependencies
 */
class DependencyJavascript extends Dependency {
  public $file;
  public $url;
  public $code;

  private $format = '<script type="text/javascript" src="%s"></script>';
  //private $extraformat = '<script type="text/javascript">elation.dependencies.register("javascript", %s)</script>';
  private $extraformat = '';

  function Display($locations, $extras=NULL) {
    if (empty($this->media)) $this->media = "all";
    if (!empty($this->file)) {
      $fname = $this->GetFilename($locations["scripts"], $this->file);
      if (!empty($fname))
        $url = sprintf("%s/%s%s", $locations["scriptswww"], $fname, (!empty($this->version) ? "?dv=" . $this->version : ""));
    } else if (!empty($this->url)) {
      $url = $this->url;
    }
    if (!empty($url))
      $ret = sprintf($this->format."\n", htmlspecialchars($url), $this->media);
    if ($extras !== NULL)
      $ret .= sprintf($this->extraformat, json_encode($extras));
    return $ret;
  }

  function GetContents($locations) {

  }
}
/** 
 * class DependencyComponent
 * Component dependency - checks for DependencyCSS and DependencyJS associated with specified component and includes either or both
 * @package Framework
 * @subpackage Dependencies
 */ 
class DependencyComponent extends Dependency {
  public $name;
  public $subtypes;
  protected $subdeps;
 
  function Init($args, $locations=NULL) {
    $this->name = $args["name"];
 
    if (strpos($this->name, ".") !== false)
      $filebase = str_replace(".", "/", $this->name);
    else
      $filebase = $this->name . "/" . $this->name;

    $css_path = "{$locations["css"]}/{$filebase}.css";
    $javascript_path = "{$locations["scripts"]}/{$filebase}.js";

    if (file_exists($css_path)) {
      $this->subdeps['css'] = new DependencyCSS(array("type" => "css", "file" => "{$filebase}.css"), true);
      $this->subtypes .= (!empty($this->subtypes) ? "," : "") . 'css';
    }
    if (file_exists($javascript_path)) {
      $this->subdeps['javascript'] = new DependencyJavascript(array("type" => "javascript", "file" => "{$filebase}.js"), true);
      $this->subtypes .= (!empty($this->subtypes) ? "," : "") . 'javascript';
    }
  }
  function Display($locations, $extras=NULL) {
    $ret = "";
    $tmp = explode(".", $this->name);
    $extras[$tmp[0]][] = any($tmp[1], $tmp[0]);
    if (!empty($this->subdeps)) {
      foreach ($this->subdeps as $dep) {
        $ret .= $dep->Display($locations, $extras);
      }
    }
    return $ret;
  }
}

/**
 * class DependencyOnload
 * Onload dependency - fires ondomready
 * @package Framework
 * @subpackage Dependencies
 */
class DependencyOnload extends Dependency {
  public $code;

  function Display($locations, $extras=NULL) {
    if (!empty($this->code))
      $ret = sprintf('<script type="text/javascript">elation.onloads.add(%s);</script>'."\n", json_encode($this->code));
    return $ret;
  }
}

/**
 * class DependencyPlacemark
 * Print debug info in an HTML comment
 * @package Framework
 * @subpackage Dependencies
 */
class DependencyPlacemark extends Dependency {
  function Display($locations, $extras=NULL) {
    return sprintf("<!-- %s: %s -->\n", $this->name, $this->value);
  }
}

/**
 * class DependencyMeta
 * Custom META tag
 * @package Framework
 * @subpackage Dependencies
 */
class DependencyMeta extends Dependency {
  public $meta;

  function Init($args, $locations) {
    $this->meta = array("property"=>$args["property"], "name"=>$args["name"], "content"=>$args["content"]);
  }

  function Display($locations, $extras=NULL) {
    if (!empty($this->meta["name"]) && !empty($this->meta["content"]))
      $ret .= sprintf('<meta name="%s" content="%s" />'."\n", $this->meta["name"], $this->meta["content"]);
    else if (!empty($this->meta["property"]) && !empty($this->meta["content"]))
      $ret .= sprintf('<meta property="%s" content="%s" />'."\n", $this->meta["property"], $this->meta["content"]);
    return $ret;
  }
}

/**
 * class DependencyRSS
 * Generate a <link /> tag for related RSS
 * @package Framework
 * @subpackage Dependencies
 */
class DependencyRSS extends Dependency {
  public $url;
  public $title;
  public $id;

  function Display($locations, $extras=NULL) {
    $ret = sprintf('<link rel="alternate" href="%s" type="application/rss+xml" title="%s" id="%s" />', htmlspecialchars($this->url), $this->title, $this->id);
    return $ret;
  }
}

/**
 * class DependencyJSTemplate
 * Generate a JavaScript template dependency
 * @package Framework
 * @subpackage Dependencies
 */
class DependencyJSTemplate extends Dependency {
  public $name;
  public $component;
  public $componentvars;
  static private $templates = array();
  static private $rendered = false;

  function Init($args, $locations) {
    foreach ($args as $k=>$v) {
      $this->{$k} = $v;
    }
    if (!empty($args["name"]) && !empty($args["component"]) && !isset(self::$templates[$args["name"]])) {
      self::$templates[$args["name"]] = ComponentManager::fetch($args["component"], $args["componentargs"]);
      DependencyManager::add(array("type" => "component", "name" => "tplmgr.tplmgr", "priority" => 2));
    }
  }

  function Display($locations, $extras=NULL) {
    if (!self::$rendered) { // We render all our jstemplates in one pass, this prevents it from being duplicated.  It could be more efficient...
      $ret = '<script type="text/javascript">';
      $ret .= "\n//<![CDATA[\n";
      foreach (self::$templates as $tplname=>$tplstr) {
        $ret .= sprintf("elation.tplmgr.Create('%s', %s);\n", $tplname, json_encode($tplstr));
      }
      $ret .= "//]]>\n</script>\n";
      self::$rendered = true;
      return $ret;
    }
    return '';
  }
}
