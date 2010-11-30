<?
include_once("include/connectionwrapper_class.php");
include_once("include/userauthprovider_class.php");

/**
 * class FacebookWrapper
 * Connection wrapper for Facebook's new Graph API
 * @package Framework
 * @subpackage Datasources
 */
class FacebookWrapper extends ConnectionWrapper {
  function FacebookWrapper($name, $cfg, $lazy=false) {
    $this->ConnectionWrapper($name, $cfg, $lazy);
    //$this->facebook = new Facebook($cfg);
    $authprovider = UserAuthProvider::get("facebook");
    $this->facebook =& $authprovider->facebook;
  }
  
  function Query($queryid, $query, $args=array()) {
    Profiler::StartTimer("FacebookWrapper::Query()", 1);
    Profiler::StartTimer("FacebookWrapper::Query($query)", 2);
    try {
      $response = $this->facebook->api($query, "GET", $args);
    } catch(Exception $e) {
      Logger::Error($e->getMessage());
    }
    Profiler::StopTimer("FacebookWrapper::Query()");
    Profiler::StopTimer("FacebookWrapper::Query($query)");
    return $response;
  }
}
