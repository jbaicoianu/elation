<?
// FIXME/TODO - this is a dummy class, and does not actually implement any of 
//              the methods necessary to represent a logged-in user.

OrmManager::LoadModel("user");

class User extends UserModel {
  protected static $instance = NULL;
  public static $usertypes = array("anonymous");
  public $loggedin = false;

  public function __construct($user=null) {
    if ($user instanceof UserModel) {
      $this->copy($user);
    }
  }
  public function InitActiveUser($req) {
    if (!empty($_SESSION["user"])) {
      $usertype = $_SESSION["user"]["usertype"];
      $userid = $_SESSION["user"]["userid"];
      $user = OrmManager::load("UserModel", array($usertype, $userid));
      if (!empty($user)) {
        $this->copy($user);
        $this->credentials = false; // strip out credentials
        $this->loggedin = true;
        return true;
      }
    }
    return false;
  }
  public function IsLoggedIn() {
    return $this->loggedin;
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
  public function copy($other) {
    foreach ($other as $k=>$v) {
      $this->{$k} = $v;
    }
  }
  public function equals($other) {
    return ($this->usertype == $other->usertype && $this->userid == $other->userid);
  }

  public static function create($usertype, $userid, $credentials) {
    $user = new User();
    $user->usertype = $usertype;
    $user->userid = $userid;
    $user->credentials = crypt($credentials, '$6$rounds=5000$' . substr(md5(mt_rand()), rand(0,8), rand(16,24))); // just bein' random!
    OrmManager::save($user);

    return self::auth($usertype, $userid, $credentials);
  }
  public static function auth($usertype, $userid, $credentials) {
    $user = OrmManager::load("UserModel", array($usertype, $userid));
    $credentialsHash = crypt($credentials, $user->credentials);
    if ($user->credentials == $credentialsHash) {
      $_SESSION["user"] = array("usertype" => $usertype, "userid" => $userid);
      $user->loggedin = true;
      return $user;
    }
    return false;
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
  public static function current() {
    return self::singleton();
  }
  public static function get($usertype, $userid) {
    $user = OrmManager::load("UserModel", array($usertype, $userid));
    if (!empty($user)) {
      $user->credentials = false; // strip out credentials
      return new User($user);
    } 
    return false;
  }
}
class ElationUserAuthException extends Exception { }
