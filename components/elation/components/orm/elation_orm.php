<?
include_once("include/component_class.php");
include_once("include/ormmanager_class.php");

class Component_elation_orm extends Component {
  function controller_orm($args) {
    $ret = $this->GetComponentResponse("./orm.tpl");
    /*
    $user = User::singleton();
    if (!($user->isLoggedIn() && $user->HasRole("ORM"))) // display the access violation message
      $ret->SetTemplate("access_violation.tpl");
    */

    if (!empty($args["ormaction"]) && !empty($args["model"])) {
      $ret["model"] = $args["model"];
      $ret["ormcfg"] = new OrmModel($args["model"]);
      if ($args["ormaction"] == "create" && !empty($args["classname"])) {
        $ormclass = new OrmClass($ret["ormcfg"]->classes->{$args["classname"]});
        //$sql = $ormclass->getCreateSql();

        $sqlkey = "db." . $ormclass->table . ".create:nocache";
/*
        print_pre($ormclass->table);
        print_pre($ormclass->getColumns());
*/
        $outlet = Outlet::getInstance();
        $pdo = $outlet->getConnection()->getPDO();
        if ($pdo) {
          $ret["sql"] = $ormclass->getCreateSQL();
          try {
            $pdo->query($ret["sql"]);
            $ret["success"] = "Table '{$ormclass->table}' created successfully";
          } catch(Exception $e) {
            $ret["error"] = $e->getMessage();
          }
        }
        /*
        $data = DataManager::singleton();
        $data->QueryCreate($sqlkey, $ormclass->table, $ormclass->getColumns($sql));
        */
      }
    }

    return $ret;
  }
  function controller_models($args) {
    $ret = $this->GetComponentResponse("./orm_models.tpl");
/*
    $user = User::singleton();
    if (!($user->isLoggedIn() && $user->HasRole("ORM"))) // display the access violation message
      $ret->SetTemplate("access_violation.tpl");
*/
    $orm = OrmManager::singleton();
    $ret["models"] = $orm->getModels();
    $ret["model"] = $args["model"];

    return $ret;
  }
  function controller_view($args) {
    $ret = $this->GetComponentResponse("./orm_view.tpl");
    $ret["ormcfg"] = $args["ormcfg"];

    return $ret;
  }
  function controller_view_class($args) {
    $ret = $this->GetComponentResponse("./orm_view_class.tpl");
    $ret["ormclass"] = new OrmClass($args["ormcfg"]);
    $ret["sql"] = $ret["ormclass"]->getCreateSQL();
    return $ret;
  }
  function component_generate($args, $output="text") {
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
}
