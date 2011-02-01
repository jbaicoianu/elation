<?
include_once("include/outlet/Outlet.php");
/**
 * class OrmManager
 * Singleton object for fetching ORM model information
 * @package Framework
 * @subpackage ORM
 */
class OrmManager {
  protected static $instance;
  public static function singleton($args=NULL) { $name = __CLASS__; if (!self::$instance) { self::$instance = new $name($args); } return self::$instance; }
  public $outlet;

  function __construct($locations=NULL) {
    $dbdir = any($locations['tmp'], 'tmp');
    Outlet::init(array(
      'connection' => array(
        'dsn' => 'sqlite:' . $dbdir . '/elation.sqlite',
        'dialect' => 'sqlite'
/*
        'dsn' => 'mysql:host=localhost',
        'dialect' => 'mysql',
        'username' => 'elation',
        'password' => ''
*/
      ),
      'classes' => array(
      ),
    ));
    $this->outlet =& Outlet::getInstance();
  }

  function GetModels() {
    $models = array();
    //$cfg = ConfigManager::singleton();
    //if ($modeldir = opendir($cfg->locations["config"] . "/model")) {
    if ($modeldir = opendir("./config/model")) {
      while ($file = readdir($modeldir)) {
        if (preg_match("/(.*?)\.model$/", $file, $m)) {
          $models[] = $m[1];
        }
      }
    }
    sort($models);
    return $models;
  }
  static function LoadModel($model) {
    if ($this instanceOf OrmManager)
      $me = $this;
    else
      $me = self::singleton();
    $models = explode(",", $model);
    //print_pre($models);
    foreach ($models as $model) {
      $ormmodel = new OrmModel($model);
      $ormmodel->LoadModel();
      if (!empty($ormmodel->classes)) {
        $foo = object_to_array($ormmodel->classes);
        try {
          $me->outlet->getConfig()->addEntities($foo);
        } catch (Exception $e) {
          Logger::Error("OrmManager: " . $e->GetMessage());
        }
      }
    }
    $me->outlet->createClasses();
    $me->outlet->createProxies();
  }
  function Select($type, $where=NULL) {
    if ($this instanceOf OrmManager)
      return $this->outlet->select($type, $where);
    else
      return self::singleton()->select($type, $where);
  }
  function Load($type, $id) {
    if ($this instanceOf OrmManager)
      return $this->outlet->load($type, $id);
    else
      return self::singleton()->load($type, $id);
  }
  function Save($obj) {
    if ($this instanceOf OrmManager)
      return $this->outlet->save($obj);
    else
      return self::singleton()->save($obj);
  }
}
/**
 * class OrmMaster
 * Represents a master config as defined in config/models/*.master
 * @package Framework
 * @subpackage ORM
 */
class OrmMaster {
  public $name;
  public $classes;

  function __construct($name) {
    $this->name = $name;
    $this->LoadMaster();
  }
  function LoadMaster() {
    //$cfg = ConfigManager::singleton();
    //$fname = $cfg->locations["config"] . "/model/" . $this->name . ".master";
    $fname = "./config/model/" . $this->name . ".model";
    if (file_exists($fname)) {
      $ormfile = file_get_contents($fname);
      $modelcfg = json_decode($ormfile);

    if (function_exists("json_last_error")) {
      switch(json_last_error())
      {
          case JSON_ERROR_DEPTH:
              echo ' - Maximum stack depth exceeded';
          break;
          case JSON_ERROR_CTRL_CHAR:
              echo ' - Unexpected control character found';
          break;
          case JSON_ERROR_SYNTAX:
              echo ' - Syntax error, malformed JSON';
          break;
      }
    }

      if (!empty($modelcfg->classes))
        $this->classes = $modelcfg->classes;
    }
  }
}
/**
 * class OrmModel
 * Represents a model as defined in config/models/*.model
 * @package Framework
 * @subpackage ORM
 */
class OrmModel extends OrmMaster {

  function LoadModel() {
    //$cfg = ConfigManager::singleton();
    //$fname = $cfg->locations["config"] . "/model/" . $this->name . ".model";
    $fname = "./config/model/" . $this->name . ".model";
    if (file_exists($fname)) {
      $ormfile = file_get_contents($fname);
      $filesize = strlen($ormfile);
      $modelcfg = json_decode($ormfile);
      if (!empty($modelcfg->classes))
        $this->classes = $modelcfg->classes;
    } else {
      Logger::Error("OrmModel: Couldn't find model config '$fname'");
    }
  }

  function Generate() {
    if (!empty($this->classes)) {
      $data = DataManager::singleton();
      foreach ($this->classes as $cls=>$classcfg) {
        $primary = array();
        $keys = array();
        if (!empty($classcfg->keys)) {
          foreach ($classcfg->keys as $k=>$v) {
            $columns = explode(",", $v);
            foreach ($columns as $c) {
              if ($k == "primary")
                $primary[] = trim($c);
              else
                $keys[trim($c)][] = $k;
            }
          }
        }
        $result = $data->Query("db." . $classcfg->table . ".schema:nocache", "show columns from " . $classcfg->table);
        
        foreach ($result->rows as $row) {
          $rowargs = array();
          if ($row->key == "PRI" || in_array($row->field, $primary))
            $rowargs["pk"] = true;
          if ($row->null == "NO")
            $rowargs["notnull"] = true;
          if (preg_match("/^(.*?)\(([\d\.,]+)\)(?:\s+(.*))?$/", $row->type, $m)) {
            $rowtype = $m[1];
            $rowargs["length"] = $m[2];
            if (!empty($m[3]))
              $rowargs[$m[3]] = true;
          } else {
            $rowtype = $row->type;
          }
          if (isset($row->default) && $row->default !== "") {
            $rowargs["default"] = $row->default;
          }
          if (isset($keys[$row->field])) {
            $rowargs["keys"] = implode(",", $keys[$row->field]);
          }

          $this->classes->{$cls}->props[$row->field] = array($row->field, $rowtype);
          if (!empty($rowargs))
            $this->classes->{$cls}->props[$row->field][] = $rowargs;
          
        }
      }
    }
    return json_indent(json_encode($this), 5);
    //return json_encode($this);
  }

}
/**
 * class OrmClass
 * Represents a class defined within an OrmModel
 * @package Framework
 * @subpackage ORM
 */
class OrmClass {
  public $table;
  public $associations;
  public $props;

  function __construct($cfg=NULL) {
    if ($cfg !== NULL) {
      $this->table = $cfg->table;
      $this->associations = $cfg->associations;
      $this->props = $cfg->props;
    }
  }
  function getColumns() {
    $columns = array();
    $indexes = array();
    foreach ($this->props as $k=>$v) {
      $column = $v[0] . " " . $v[1];
      if (!empty($v[2]->length))
        $column .= "(" . $v["2"]->length . ")";
      if (!empty($v[2]->unsigned))
        $column .= " UNSIGNED";
      if (!empty($v[2]->notnull))
        $column .= " NOT NULL";
      if (!empty($v[2]->autoincrement))
        $column .= " AUTO_INCREMENT";

      if (!empty($v[2]->defaultExpr))
        $column .= " DEFAULT " . $v["2"]->defaultExpr;
      else if (isset($v[2]->default))
        $column .= " DEFAULT '" . $v["2"]->default . "'";
      $columns[] = $column;

      if ($v[2]->pk)
        $indexes["primary"][] = $v[0];
      if (!empty($v[2]->keys)) {
        foreach (explode(",", $v["2"]->keys) as $key) {
          $indexes[$key][] = $v[0];
        }
      }
    }

    foreach ($indexes as $k=>$v) {
      if ($k == "primary") {
        $columns[] = "PRIMARY KEY (" . implode(",", $v) . ")";
      } else {
        $columns[] = "KEY $k (" . implode(",", $v) . ")";
      }
    }
    return $columns;
  }
  function getCreateSQL() {
    $sql = "";
/*
    if (strpos($this->table, ".") !== false) {
      list($db, $table) = explode(".", $this->table);
      $sql .= "CREATE DATABASE IF NOT EXISTS $db;";
    }
*/
    $sql .= "\nCREATE TABLE " . $this->table . " (\n\t";
    $columns = $this->getColumns();
    $sql .= implode(",\n\t", $columns);
    $sql .= "\n);";
    return $sql;
  }
}
