<?php
include_once("include/component_class.php");
include_once("include/ormmanager_class.php");

class Component_elation_orm extends Component {
  function controller_orm($args) {
/*
    if (!User::authorized("orm"))
      throw new Exception("not allowed");
*/
    /*
    $user = User::singleton();
    if (!($user->isLoggedIn() && $user->HasRole("ORM"))) // display the access violation message
      $vars->SetTemplate("access_violation.tpl");
    */

    if (!empty($args["ormaction"]) && !empty($args["model"])) {
      $vars["model"] = $args["model"];
      $vars["ormcfg"] = new OrmModel($args["model"]);
      if ($args["ormaction"] == "create" && !empty($args["classname"])) {
        $ormclass = new OrmClass($vars["ormcfg"]->classes->{$args["classname"]});
        //$sql = $ormclass->getCreateSql();

        $sqlkey = "db." . $args["model"] . "." . $ormclass->table . ".create:nocache";
        /*
        $outlet = Outlet::getInstance();
        $pdo = $outlet->getConnection()->getPDO();
        if ($pdo) {
          $vars["sql"] = $ormclass->getCreateSQL();
          try {
            $pdo->query($vars["sql"]);
            $vars["success"] = "Table '{$ormclass->table}' created successfully";
          } catch(Exception $e) {
            $vars["error"] = $e->getMessage();
          }
        }
        */
        try {
          if (DataManager::create($sqlkey, $ormclass->table, $ormclass->getColumns())) {
            $ret["success"] = "Table '{$ormclass->table}' created successfully";
          }
        } catch(Exception $e) {
          $ret["error"] = $e->getMessage();
        }
      }
    }

    return $this->GetComponentResponse("./orm.tpl", $vars);
  }
  function controller_models($args) {
/*
    $user = User::singleton();
    if (!($user->isLoggedIn() && $user->HasRole("ORM"))) // display the access violation message
      $ret->SetTemplate("access_violation.tpl");
*/
    $orm = OrmManager::singleton();
    $vars["models"] = $orm->getModels();
    $vars["model"] = $args["model"];

    return $this->GetComponentResponse("./orm_models.tpl", $vars);
  }
  function controller_view($args) {
    $vars["ormcfg"] = $args["ormcfg"];
    $vars["model"] = any($args["model"], "");

    return $this->GetComponentResponse("./orm_view.tpl", $vars);
  }
  function controller_view_class($args) {
    $vars["ormclass"] = new OrmClass($args["ormcfg"]);
    $vars["classname"] = $args["classname"];
    $vars["model"] = any($args["model"], "");
    $vars["classname"] = any($args["classname"], "");
    $vars["sql"] = $vars["ormclass"]->getCreateSQL();
    return $this->GetComponentResponse("./orm_view_class.tpl", $vars);
  }
  function controller_generate($args, $output="text") {
    // Only return this data when run from the commandline
    if ($output == "commandline") {
      $ret = "[not found]";
      if (!empty($args["model"])) {
        $data = DataManager::singleton();
        $model = new ORMModel($args["model"]);
        $ret = $model->Generate();
      }
    } else {
      $ret = "";
    }
    return $ret;
  }
  function controller_thrift($args) {
    $vars["objects"] = array(
      "product" => array(
        array("type" => "i64", "name" => "ddkey"),
        array("type" => "string", "name" => ""),
        array("type" => "string", "name" => "ddkey"),
        array("type" => "string", "name" => "ddkey"),
        array("type" => "i64", "name" => "ddkey"),
      )
    );
    return $this->GetComponentResponse("./thrift.tpl", $vars);
  }
  function controller_model($args) {
    $vars["model"] = any($args["model"], "space");
    $models = explode(",", $vars["model"]);
    $vars["classes"] = array();
    foreach ($models as $i=>$model) {
      $foo = OrmManager::LoadModel($model);
      foreach ($foo[$model]->classes as $k=>$v) {
        $vars["classes"][$k] = $v;
      }
    }
    return $this->GetComponentResponse("./model.tpl", $vars);
  }
  function controller_class($args) {
    $vars["classname"] = any($args["classname"], "unnamed");
    $vars["classdef"] = any($args["classdef"], array());
    return $this->GetComponentResponse("./class.tpl", $vars);
  }
  function controller_test($args) {
    $foo = OrmManager::create();
  }
}
