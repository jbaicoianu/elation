<?
class DependencyManager {
  static private $dependencies = array();

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
        $ret .= $dependency->display(array()); // FIXME - needs locations
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

    $this->Init($args);
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
    }
    return $ret;
  }
}
class DependencyCSS extends Dependency {
  public $file;
  public $url;

  private $format = '<link rel="stylesheet" type="text/css" href="%s" media="%s" />';
  private $extraformat = '<script type="text/javascript">elation.dependencies.register("css", %s)</script>';


  function Display($locations, $extras=NULL) {
    $url = "";
    if (!empty($this->file)) {
      $fname = $this->GetFilename($locations["css"], $this->file);
      if (!empty($fname))
        $url = sprintf("%s/%s%s", $locations["csswww"], $fname, (!empty($this->version) ? "?dv=" . $this->version : ""));
    } else if (!empty($this->url)) {
      $url = $this->url;
    }
    if (!empty($url))
      $ret = sprintf($this->format."\n", htmlspecialchars($url), any($this->media,"all"));
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
  private $extraformat = '<script type="text/javascript">elation.dependencies.register("javascript", %s)</script>';

  function Display($locations, $extras=NULL) {
    if (!empty($this->file)) {
      $fname = $this->GetFilename($locations["scripts"], $this->file);
      if (!empty($fname))
        $url = sprintf("%s/%s%s", $locations["scriptswww"], $fname, (!empty($this->version) ? "?dv=" . $this->version : "\
"));
    } else if (!empty($this->url)) {
      $url = $this->url;
    }
    if (!empty($url))
      $ret = sprintf($this->format."\n", htmlspecialchars($url), any($this->media,"all"));
    if ($extras !== NULL)
      $ret .= sprintf($this->extraformat, json_encode($extras));
    return $ret;
  }

  function GetContents($locations) {

  }
}
