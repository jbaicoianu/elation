<?php

class Component_user extends Component {
  public function init() {
    OrmManager::LoadModel("user");
  }

  public function controller_user($args) {
    $vars = array();
    $vars["user"] = User::current();
    return $this->GetComponentResponse("./user.tpl", $vars);
  }
  public function controller_init($args) {
    $vars["user"] = User::current();
    return $this->GetComponentResponse("./init.tpl", $vars);
  }
  public function controller_create($args) {
    $vars = array();
    $vars["userid"] = any($args["userid"], "");
    $vars["credentials"] = any($args["credentials"], "");

    if (!empty($vars["userid"]) && !empty($vars["credentials"])) {
      $user = User::create("default", $vars["userid"], $vars["credentials"]);
    }
    return $this->GetComponentResponse("./create.tpl", $vars);
  }
  public function controller_auth($args) {
    $vars = array();
    $vars["userid"] = any($args["userid"], "");
    $vars["credentials"] = any($args["credentials"], "");
    $vars["success"] = false;
    if (!empty($vars["userid"]) && !empty($vars["credentials"])) {
      $vars["user"] = User::auth("default", $vars["userid"], $vars["credentials"]);
      if (!empty($vars["user"])) {
        $vars["success"] = true;
        $vars["newuser"] = false;
      } else if (!empty($args["create"])) {
        $vars["user"] = User::create("default", $vars["userid"], $vars["credentials"]);
        if (!empty($vars["user"])) {
          $vars["success"] = true;
          $vars["newuser"] = true;
        }
      }
    }
    return $this->GetComponentResponse("./auth.tpl", $vars);
  }
  public function controller_logout($args) {
    $vars = array();
    unset($_SESSION["user"]);
    return $this->GetComponentResponse("./logout.tpl", $vars);
  }
  public function controller_exists($args) {
    $vars["usertype"] = any($args["usertype"], "default");
    $vars["userid"] = $args["userid"];

    $user = false;
    if (!empty($vars["userid"])) {
      $user = User::get($vars["usertype"], $vars["userid"]);
    }
    $vars["success"] = !empty($user);
    return $this->GetComponentResponse("./exists.tpl", $vars);
  }
}  
