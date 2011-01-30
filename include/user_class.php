<?
class User {
  protected static $instance = NULL;
  public static $usertypes = array();

  public function InitActiveUser($req) {
  }
  public function IsLoggedIn() {
    return false;
  }
  public function HasRole($role) {
    $roles = $this->GetRoles();
    return (!empty($roles) && isset($roles[$role]));
  } 
  public function GetRoles() {
    return array();
  }

  public function save() {
  }

  public static function singleton() {
    if (self::$instance === NULL) {
      self::$instance = new User();
    }
    return self::$instance;
  }
}
