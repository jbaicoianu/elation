<?php
include_once("include/datawrappers/connectionwrapper_class.php");
include_once("include/userauthprovider_class.php");

/**
 * class TwitterWrapper
 * Connection wrapper for Twitter's API
 * @package Framework
 * @subpackage Datasources
 */
class TwitterWrapper extends ConnectionWrapper 
{
	public $twitter;
	public $authprovider;
	
  public function __construct($name, $cfg, $lazy = false, $twitterConfig = array()) 
	{
    parent::__construct($name, $cfg, $lazy);

    $this->authprovider = UserAuthProvider::get("twitter");
		$this->authprovider->build($twitterConfig);
    $this->twitter = &$this->authprovider->twitter;
  }
  
  public function Query($queryid, $query, $args = array()) 
	{
  	
    Profiler::StartTimer("TwitterWrapper::Query()", 1);
    Profiler::StartTimer("TwitterWrapper::Query($query)", 2);
		
		$method = $responseType = $authNeeded = $twitterCallback = null;

		if(array_key_exists('method', $args)) {
			$method = $args['method'];
			unset($args['method']);
		}
		
    if(array_key_exists('responseType', $args)) {
      $responseType = $args['responseType'];
      unset($args['responseType']);
    }		
		
    if(array_key_exists('authNeeded', $args)) {
      $responseType = $args['authNeeded'];
      unset($args['authNeeded']);
    } 		

    try {
    	if($responseType && $authNeeded && $method) {
			  $response = $this->twitter->api($query, $args, $responseType, $authNeeded, $method);
			}
			else if($responseType && $authNeeded) {
        $response = $this->twitter->api($query, $args, $responseType, $authNeeded);
			} else if($responseType) {
        $response = $this->twitter->api($query, $args, $responseType);
			}
			else {
				$response = $this->twitter->api($query, $args);
			}
    } catch(Exception $e) {
      Logger::Error($e->getMessage());
    }
		
    Profiler::StopTimer("TwitterWrapper::Query()");
    Profiler::StopTimer("TwitterWrapper::Query($query)");
    return $response;
  }
}
