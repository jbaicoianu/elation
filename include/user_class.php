<?
// FIXME/TODO - this is a dummy class, and does not actually implement any of 
//              the methods necessary to represent a logged-in user.

class User {
  protected static $instance = NULL;
  public static $usertypes = array("anonymous");

  public function InitActiveUser($req) {
  }
  public function IsLoggedIn() {
    return false;
  }
  public function HasRole($role) {
    return true; // FIXME - hardcoded to true, since this is just a dummy class right now...
    $roles = $this->GetRoles();
    return (!empty($roles) && isset($roles[$role]));
  } 
  public function GetRoles() {
    return array();
  }
  public function save() {
  }

  public static function authorized($role) {
    $user = self::singleton();
    return $user->HasRole($role);
  }

  public static function singleton() {
    if (self::$instance === NULL) {
      self::$instance = new User();
    }
    return self::$instance;
  }
}
