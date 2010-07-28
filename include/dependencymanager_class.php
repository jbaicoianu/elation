<?
class DependencyManager {
  static private $dependencies = array();
  static $locations = array(
                            "css"     => "htdocs/css",
                            "csswww" => "/~bai/elation/css",
                            "scripts"     => "htdocs/scripts",
                            "scriptswww" => "/~bai/elation/scripts",
                           );
  

  static function add($args) {
    if (!empty($args["type"])) {
      if (!is_array(self::$dependencies[$args["type"]]))
        self::$dependencies[$args["type"]] = array();
      
      self::$dependencies[$args["type"]][] = Dependency::create($args["type"], $args);
    }
  }
  static function display() {
    $ret = "";
    foreach (self::$dependencies as $type=>$dependencies) {
      foreach ($dependencies as $dependency) {
        $ret .= $dependency->display(self::$locations); // FIXME - needs locations
      }
    }
    return $ret;
  }
}
abstract class Dependency {
  public $type;
  public $name;
  public $version;

  function Dependency($args, $silent=false) {
    $this->browser = any($args["browser"], "all");
    $this->type = $args["type"];

    $this->Init($args, DependencyManager::$locations);
    if (Logger::$enabled && !$silent) {
      $content = any($this->code, $this->file, $this->url, $this->name, "(unknown)");
      Logger::Notice("Added {$this->type} dependency ({$this->browser}): '{$content}'");
      //Logger::Notice("Added dependency");
    }
  }
  function Init($args, $locations=NULL) {
    foreach ($args as $k=>$v) {
      $this->{$k} = $v;
    }
  }
  abstract function Display($locations, $extras=NULL);
  
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
      default:
        throw new Exception("DependencyManager: unknown dependency type '$type'");
    }
    return $ret;
  }
}
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
  private $subdeps;
 
  function Init($args, $locations=NULL) {
    $this->name = $args["name"];
 
    if (strpos($this->name, ".") !== false)
      $filebase = "components/" . str_replace(".", "/", $this->name);
    else
      $filebase = "components/" . $this->name . "/" . $this->name;

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

