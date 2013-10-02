<?php

class Component_demos extends Component {
  public function init() {
    OrmManager::LoadModel("demos");
  }

  public function controller_demos($args) {
    $vars = array();
    if (!empty($args["demoname"])) {
      $vars["demoname"] = $args["demoname"];
      $vars["demos"] = DataManager::fetch("db.demos.{$args['demoname']}", "demos", array("demoname" => $args["demoname"]));
    } else if (!empty($args["category"])) {
      $vars["category"] = $args["category"];
      $vars["demos"] = DataManager::fetch("db.demos.{$args['demoname']}", "demos", array("category" => $args["category"]));
    } else {
      $vars["category"] = "All";
      $vars["demos"] = DataManager::fetch("db.demos.all", "demos");
    }
    return $this->GetComponentResponse("./demos.tpl", $vars);
  }
  public function controller_view($args) {
    if (is_string($args["demo"])) {
      $demo = DataManager::fetch("db.demos.{$args['demo']}", "demos", array("demoname" => $args["demo"]));
      $vars["demo"] = $demo[0];
    } else {
      $vars["demo"] = $args["demo"];
    }

    return $this->GetComponentResponse("./view.tpl", $vars);
  }
  public function controller_create($args) {
    $vars["success"] = null;
    $vars["varname"] = "newdemo";
    $tablename = "demos";
    $objkey = "demoname";
    if (!empty($args["category"]) || !empty($args["newcategory"])) {
      $vars["varname"] = "newcategory";
      $tablename = "demo_categories";
      $objkey = "category";
    }

    if (!empty($args[$vars["varname"]])) {
      $newobj = $args[$vars["varname"]];
      $newobjid = $newobj[$objkey];
      if (!empty($newobj[$objkey]) && !empty($newobj["title"])) {
        $vars["success"] = DataManager::insert("db.demos.{$newobjid}", $tablename, $newobj);
        if (!$vars["success"]) {
          // insert failed, try an update
          $vars["success"] = DataManager::update("db.demos.{$newobjid}", $tablename, $newobj, array($objkey => $newobjid));
        }
      }
      $vars["demo"] = $newobj;
    } else if (!empty($args["category"])) {
      $vars["varname"] = "newcategory";

      $demos = DataManager::fetch("db.demos.{$args['category']}", "demo_categories", array($objkey => $args["category"]));
      $vars["demo"] = $demos[0];
    } else if (!empty($args["demoname"])) {
      $demos = DataManager::fetch("db.demos.{$args['demoname']}", "demos", array("demoname" => $args["demoname"]));
      $vars["demo"] = $demos[0];
    }
    return $this->GetComponentResponse("./create.tpl", $vars);
  }
  public function controller_categories($args) {
    $vars["categories"] = DataManager::fetch("db.demos.categories.all", "demo_categories");
    return $this->GetComponentResponse("./categories.tpl", $vars);
  }
  public function controller_category($args) {
    $vars["category"] = $args["category"];
    if (is_string($vars["category"])) {
      $categories = DataManager::fetch("db.demos.{$vars['category']}", "demo_categories", array("category" => $vars["category"]));
      $vars["category"] = $categories[0];
    }
    return $this->GetComponentResponse("./category.tpl", $vars);
  }
}  
