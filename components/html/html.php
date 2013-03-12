<?php

class Component_html extends Component {

  protected $shown = array();

  public function init() {

  }

  public function controller_html($args, $output="inline") {
    $vars["args"] = $args;
    return $this->GetTemplate("./html.tpl", $vars);
  }

  public function controller_header($args) {
    if (empty($this->shown["header"])) { // Only allow header once per page
      $this->shown["header"] = true;
      $agents = array('mac', 'windows', 'linux', 'unix', 'android', 'ios',
                      'ipad', 'iphone', 'ipod', 'mobile', 'webkit', 
                      'chrome', 'firefox', 'msie', 'opera', 'safari');
      
      $useragent = strtolower($_SERVER['HTTP_USER_AGENT']);
      $classes = '';
      
      for ($i = 1; $i <= count($agents); $i++) {
        if (strpos($useragent, $agents[$i])) {
          $classes .= ' ' . $agents[$i];
        }
      }
      
      $args["classes"] = $classes;
      $args["agent"] = $useragent;
      $dependencies = ConfigManager::get("dependencies.load");
      foreach($dependencies as $dependency) {
        if(!empty($dependency["enabled"])) {
          $dependency_args = array(); 
          foreach($dependency["args"]as $dependency_name=>$dependency_arg) {
            $dependency_args[$dependency_name] = $dependency_arg;
          }
          DependencyManager::add($dependency_args);
        }
      }
      
      return $this->GetTemplate("./header.tpl", $args);
    }
    
    return "";
  }

  public function controller_footer($args) {
    // Assemble page-level args for Google Analytics --
    global $webapp;

    $analytics = Analytics::singleton();
    $componentmgr = ComponentManager::singleton();
    $args['cobrand'] = $webapp->cobrand;
    $args['store_name'] = $this->sanitizeStrForGA($analytics->store_name);

    if ($webapp->request['referer']['host'] && !stristr($webapp->request['referer']['host'], $webapp->request['host'])) {
      $args['query'] = $this->getQueryFromURL($webapp->request['referrer'], $args['store_name']);
    } else {
      $args['query'] = $this->sanitizeStrForGA(any($analytics->search["input"]["query"], $analytics->qpmreq->query, 'none'));
    }

    $args['bs'] = $componentmgr->pagecfg; //testing

    $args['pagegroup'] = $componentmgr->pagecfg['pagegroup'];
    $args['pagetype'] = $componentmgr->pagecfg['pagename'];

    $args['status'] = any($analytics->status, $webapp->response['http_status']);
    $args['total'] = $analytics->total;

    $args['GAenabled'] = $args['pagegroup'] ? any(ConfigManager::get("tracking.googleanalytics.enabled"),$webapp->cfg->servers['tracking']['googleanalytics']['enabled']) : 0;
    $args['GAalerts'] = $webapp->GAalerts;

    $args['trackingcode'] = $webapp->cfg->servers['tracking']['googleanalytics']['trackingcode'];
    $args['category'] = any($analytics->category, $analytics->pandora_result['top_category'], $analytics->item->category, $analytics->qpmquery['protocolheaders']['category'], 'none');
    $args['subcategory'] = preg_replace("#\s#", "_", any($analytics->subcategory, $analytics->pandora_result['top_subcategory'], 'none'));
    $args['city'] = "Mountain View";
    $args['state'] = "CA";
    $args['country'] = "USA";

    if ($analytics->city && $analytics->state) {
      $args['city'] = ucWords($analytics->city);
      $args['state'] = $analytics->state;
      $args['country'] = "USA";
    }

    if (in_array($args['cobrand'], array('paypaluk', 'thefinduk', 'paypalcanada'))) {
      $args['city'] = 'unknown';
      $args['state'] = 'unknown';
      $args['country'] = $args['cobrand'] == 'paypalcanada' ? "Canada" : "UK";
    }
    $args['pagenum'] = any($analytics->pandora_result['page_num'], 1);
    $args['version'] = any(ABTestManager::getVersion(), "unknown");
    $args['filters'] = $analytics->qpmreq->filter['brand'] ? '1' : '0';
    $args['filters'] .= $analytics->qpmreq->filter['color'] ? '1' : '0';
    $args['filters'] .= $analytics->qpmreq->filter['storeswithdeals'] ? '1' : '0'; //(coupons)
    $args['filters'] .= $analytics->qpmquery['headers']['localshopping'] ? '1' : '0'; //(local)
    $args['filters'] .= $analytics->qpmquery['headers']['market'] == 'green' ? '1' : '0'; //(green)
    $args['filters'] .= $analytics->qpmreq->filter['minimall'] ? '1' : '0'; //(marketplaces)
    $args['filters'] .= $analytics->qpmreq->filter['filter']['price'] ? '1' : '0';
    $args['filters'] .= $analytics->qpmreq->filter['sale'] ? '1' : '0';
    $args['filters'] .= $analytics->qpmreq->filter['store'] ? '1' : '0';
    $args['filters'] .= $analytics->qpmreq->filter['freeshipping'] ? '1' : '0';
    $args['alpha'] = $analytics->alpha;

    $args['browse'] = $analytics->browse;

    $session = SessionManager::singleton();
    $args['is_new_user'] = $session->is_new_user;
    $args['is_new_session'] = $session->is_new_session;

    $user = User::singleton();
    $args['is_logged_in'] = $user->isLoggedIn();
    $args['usertype'] = $user->usertype;
    $args['userid'] = $user->userid;
    $args['useremail'] = $user->email;

    //$args['GAenabled'] = 1; //testing only

    if (empty($this->shown["footer"])) { // Only allow footer once per page
      $this->shown["footer"] = true;
      return $this->GetComponentResponse("./footer.tpl", $args);
    }
    return "";
  }

  public function controller_page($args) {
    return $this->GetComponentResponse("./page.tpl", $args);
  }

  public function controller_content($args) {
    $tplfile = "./content.tpl";
    $content = $args["content"];
    if ($content instanceOf ComponentResponse) {
      if (($content->data instanceOf Component)) {
        Logger::Error("html.content - unexpected Component in content argument");
        $content = array();
      } else if (!empty($content->data["content"])) {
        $content = $content->data["content"];
      } else {
        $vars = $content->data;
        $tplfile = $content->getTemplate();
        $content = NULL;
      }
    }
    if (!empty($content)) {
      if (is_array($content)) {
        if (!empty($content["component"])) {
          $vars["contentcomponent"] = $content["component"];
          $vars["contentargs"] = any($content["args"], array());
        } else if (!empty($content["template"])) {
          $vars = any($content["data"], array());
          $tplfile = $content["template"];
        }
      } else {
        $vars["content"] = $content;
      }
    }
    return $this->GetTemplate($tplfile, $vars);
  }

  public function controller_static(&$args) {
    $ret = $args["content"];
    return $ret;
  }

  public function controller_dragdropimage($args) {
    return $this->GetTemplate("./dragdropimage.tpl", $vars);
  }

  /**
   * handle GA data encoding bug ... whatever the fuck that is ...
   * @param $str the string to convert
   */
  public function sanitizeStrForGA($str) {
    $str = html_entity_decode($str);
    $str = htmlentities($str);
    return $str;
  }

  /**
   *
   * find query string from url
   * this function is able to handle cases like the following
   *   url= "http://www.google.com/search?q=the+macy%27s+coupons+thefind&ie=utf-8&oe=utf-8&aq=t&rls=org.mozilla:en-US:official&client=firefox-a"; //test
   *   url = "http://jessie.dev.thefind.com/coupons?query=shoes&GAalerts=1"; // test
   *   url = "http://www.google.com/coupons/store/sierratradingpost/"; //test
   *
   */
  public function getQueryFromURL($url, $needle) {
    $needle = urldecode($needle);

    if (!preg_match("/=/i", $url)) {
      $url = preg_replace("/(http(s{0,1}):\/\/([^\/]+)\/)/", "", $url);
      $values_array = preg_split("/\//", $url);
    } else {
      $url = preg_replace("/(.+)[?]/", "", $url);
      $url = preg_replace("/(^|&)([^=]+)=/i", "&", $url);
      $values_array = preg_split("/&/", $url);
    }

    $needles_array = preg_split("/\s/", $needle);
    $query_array = array();
    foreach ($values_array as $v) {
      foreach ($needles_array as $n) {
        if (preg_match("/" . $n . "/i", $v)) {
          $query_array[$v] = strlen($v);
        }
      }
    }

    // the longest element is the query string (best match)
    $query = 0;
    $querylength = 0;
    foreach ($query_array as $q => $l) {
      if ($l > $querylength) {
        $querylength = $l;
        $query = $q;
      }
    }

    return $this->sanitizeStrForGA(urldecode($query));
  }

}

