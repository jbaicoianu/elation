<?php

class Component_user extends Component {
  public function init() {
    OrmManager::LoadModel("user");
  }

  public function controller_user($args) {
    $vars = array();
    $vars["user"] = User::singleton();
    return $this->GetComponentResponse("./user.tpl", $vars);
  }
  public function controller_create($args) {
    $vars = array();
    $vars["userid"] = any($args["userid"], "");
    $vars["credentials"] = any($args["credentials"], "");

    if (!empty($vars["userid"]) && !empty($vars["credentials"])) {
      $user = User::create("default", $vars["userid"], $vars["credentials"]);
print_pre($user);
    }
    return $this->GetComponentResponse("./create.tpl", $vars);
  }
  public function controller_auth($args) {
    $vars = array();
    $vars["userid"] = any($args["userid"], "");
    $vars["credentials"] = any($args["credentials"], "");
    if (!empty($vars["userid"]) && !empty($vars["credentials"])) {
      $vars["user"] = User::auth("default", $vars["userid"], $vars["credentials"]);
      if (!empty($vars["user"])) {
        $vars["success"] = true;
      } else {
        $vars["failed"] = true;
      }
    }
    
    return $this->GetComponentResponse("./auth.tpl", $vars);
  }
  public function controller_logout($args) {
    $vars = array();
    unset($_SESSION["user"]);
    return $this->GetComponentResponse("./logout.tpl", $vars);
  }
}  
