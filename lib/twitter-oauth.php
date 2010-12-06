<?php
/**
 * Twitter class to do oAuth and many common twitter calls. 
 * Based on oauth-tiwtter by basilbthoppil
 * @link        http://github.com/basilbthoppil/oauth_twitter
 * @author      Lucian Hontau
 * @package     Trimbo-Lib
 * @subpackage  Twitter
 */
class OAuth_Twitter 
{
  public $config;
	
	protected $apiUrl     = 'https://twitter.com/';
  //protected $searchApiUrl  = 'http://search.twitter.com/'; //not yet implemented
	
  protected $methods = array(
    'statuses/public_timeline'    => array('http' => 'get', 'auth' => FALSE),
    'statuses/friends_timeline'   => array('http' => 'get', 'auth' => TRUE),
    'statuses/user_timeline'    => array('http' => 'get', 'auth' => FALSE),
    'statuses/mentions'       => array('http' => 'get', 'auth' => TRUE),
    'statuses/show'         => array('http' => 'get', 'auth' => FALSE),
    'statuses/update'       => array('http' => 'post',  'auth' => TRUE),
    'statuses/destroy'        => array('http' => 'post',  'auth' => TRUE),
    'users/show'          => array('http' => 'get', 'auth' => FALSE),
    'statuses/friends'        => array('http' => 'get', 'auth' => FALSE),
    'statuses/followers'      => array('http' => 'get', 'auth' => TRUE),
    'direct_messages'       => array('http' => 'get', 'auth' => TRUE),
    'direct_messages/sent'      => array('http' => 'get', 'auth' => TRUE),
    'direct_messages/new'     => array('http' => 'post',  'auth' => TRUE),
    'direct_messages/destroy'   => array('http' => 'post',  'auth' => TRUE),
    'friendships/create'      => array('http' => 'post',  'auth' => TRUE),
    'friendships/destroy'     => array('http' => 'post',  'auth' => TRUE),
    'friendships/exists'      => array('http' => 'get', 'auth' => TRUE),
    'account/verify_credentials'  => array('http' => 'get', 'auth' => TRUE),
    'account/rate_limit_status'   => array('http' => 'get', 'auth' => FALSE),
    'account/end_session'     => array('http' => 'post',  'auth' => TRUE),
    'account/update_delivery_device'=> array('http' => 'post',  'auth' => TRUE),
    'account/update_profile_colors' => array('http' => 'post',  'auth' => TRUE),
    'account/update_profile'    => array('http' => 'post',  'auth' => TRUE),
    'favorites'           => array('http' => 'get', 'auth' => TRUE),
    'favorites/create'        => array('http' => 'post',  'auth' => TRUE),
    'notifications/follow'      => array('http' => 'post',  'auth' => TRUE),
    'notifications/leave'     => array('http' => 'post',  'auth' => TRUE),
    'blocks/create'         => array('http' => 'post',  'auth' => TRUE),
    'blocks/destroy'        => array('http' => 'post',  'auth' => TRUE),
    'help/test'           => array('http' => 'get', 'auth' => FALSE),

    //'account/update_profile_image'  => array('http' => 'post',  'auth' => TRUE),
    //'account/account/update_profile_background_image' => array('http' => 'post',  'auth' => TRUE),
  );	
	
	protected $accessToken;
  
  public function __construct($configuration) 
  {
    $this->config = $configuration;
  }
  
  /*
   * Redirects app to the twitter App authentication page
   * Once authenticated successfully, Redirects back to the callback URL registerd with Twitter
   * If Already authenticated, Returns true to the calling function
   */
  public function requestAuth()
  {
  	if($this->getLocalAccessToken()) {
			return true;
  	}
		
    //Check if already authenticated and app has TWITTER ACCESS TOKEN
    if (!isset($_SESSION['TWITTER_ACCESS_TOKEN'])) {
    	 try {
    	 	 $consumer = new Zend_Oauth_Consumer($this->config);
				 //Redirect to twitter API with REQUEST TOKEN
				 $token = $consumer->getRequestToken();
				 $_SESSION['TWITTER_REQUEST_TOKEN'] = serialize($token);
	       $consumer->redirect();
			 }
			 catch (Exception $e) {
			   Logger::Error('Twitter: requestAuth failed: ' . $e->getMessage());
				 return false;
			 }
    }
		else {
      return true;
    }
  }
  
  public function handleCallback()
  {
  	if($this->getLocalAccessToken()) {
			return true;
    }
		
    if (!empty($_GET) && isset($_SESSION['TWITTER_REQUEST_TOKEN'])) {
      try {   
			  $consumer = new Zend_Oauth_Consumer($this->config);
	      $token = $consumer->getAccessToken($_GET, unserialize($_SESSION['TWITTER_REQUEST_TOKEN']));
				
				$this->accessToken = serialize($token);
				
	      $_SESSION['TWITTER_ACCESS_TOKEN'] = $this->accessToken;
	      unset($_SESSION['TWITTER_REQUEST_TOKEN']);
				return true;
			}
			catch (Exception $e) {
				Logger::Error('Twitter: handleCallback failed: ' . $e->getMessage());
				return false;
			}
    }
		
		return false;
  }
	
	public function getLocalAccessToken()
	{
		if(array_key_exists('TWITTER_ACCESS_TOKEN', $_SESSION)) {
			return $_SESSION['TWITTER_ACCESS_TOKEN'];
		}
		
		try {
	    $user = User::singleton();
	    $authToken = $user->getUserSetting('authtoken.twitter');
			$token = unserialize($authToken);

			if($token instanceof Zend_Oauth_Token_Access) {
				$this->accessToken = $authToken;
				$_SESSION['TWITTER_ACCESS_TOKEN'] = $this->accessToken;
				$response = json_decode($this->api('statuses/user_timeline', array('count' => '1'), 'json'), true);
        //var_dump($response); die;
				if(!array_key_exists('error', $response)) {
				  return $authToken;
				}
				else {
					unset($_SESSION['TWITTER_ACCESS_TOKEN']);
					$this->accessToken = NULL;
					return false;
				}
			}
			else {
				return false;
			}
		}
		catch (Exception $e) {
			return false;
		}
	}
	
	public function getAccessToken()
	{
		if(!empty($this->accessToken)) {
			return $this->accessToken;
		}
		
		return false;
	}
	
  public function api($query, $args = array(), $responseType = 'json', $authNeeded = false, $method = 'get')
  {
		if(array_key_exists($query, $this->methods)) {
		  $method = $this->methods[$query]['http'];
			$authNeeded = $this->methods[$query]['auth'];
		}

    if(!isset($_SESSION['TWITTER_ACCESS_TOKEN']) && $authNeeded){
      $this->requestAuth(); 
    }
				
		$token = unserialize($_SESSION['TWITTER_ACCESS_TOKEN']);
    $token = (object)$token;
    
		$uri = $this->apiUrl . $query . ".$responseType";
		
		$client = $token->getHttpClient($this->config);
    $client->setUri($uri);
    $client->setMethod($method);
		
		$setParameterMethod = 'setParameterGet';
		if(strtolower($method) == 'post') {
		  $setParameterMethod = 'setParameterPost';
			$client->setEncType();	
		}
		
		foreach($args as $key => $val) {
      $client->$setParameterMethod($key, $val);
		}
		
    $response = $client->request();
		
		if(isset($response)){
      return $response->getBody();
    }

    return false;
  }
	
	public static function trimTweet($tweet)
	{
		return mb_substr($tweet, 0, 140, 'UTF-8');
	}

  //TODO: implement this function
  //public function apiSearch($method, $params = array()) {}
}