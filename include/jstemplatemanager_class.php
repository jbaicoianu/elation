<?php

class JSTemplateManager extends Base {
  protected static $instance;
  private $templates = array();

  public function __construct() {
  }
  function SetTemplate($tplname, $tplstr) {
    $this->templates[$tplname] = json_encode($tplstr);
  }
  function HasTemplate($tplname) {
    return isset($this->templates[$tplname]);
  }
  function GetTemplates() {
    return $this->templates;
  }

  public static function singleton($args=NULL) { 
    $name = __CLASS__; 
    if (!self::$instance) {
      if (! empty($args)) {
        self::$instance = new $name($args);
      } else {
        self::$instance = null;
      }
    } 
    return self::$instance; 
  }

}
