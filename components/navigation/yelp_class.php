<?
class Yelp {
  private $host = "http://api.yelp.com/";
  private $ywsid = "Njbr4jHwZuzByvZmmAMv8g";

  function makeAPICall($resource, $args) {
    $url = sprintf("%s/%s?ywsid=%s", $this->host, $resource, $this->ywsid);
    foreach ($args as $k=>$v) {
      $url .= "&".$k."=" . urlencode($v);
    }
    
    $response = file_get_contents($url);
    $data = json_decode($response);
    /*
    print_pre($url);
    print_pre($data);
    */
    return $data;
  }

  function getReviews($location) {
    //$category = "restaurants";
    if (!empty($_SESSION["navigation"]["location"]["categories"])) {
      $category = implode(" ", $_SESSION["navigation"]["location"]["categories"]);
      $numresults = 20;
      
      $url = sprintf("http://api.yelp.com/business_review_search?term=%s&tl_lat=%s&tl_long=%s&br_lat=%s&br_long=%s&num_biz_requested=%s&ywsid=%s&output=json", $query, $location["tl"][0], $location["tl"][1], $location["br"][0], $location["br"][1], $numresults, $this->ywsid);
      $data = $this->makeAPICall("business_review_search", array(//"term" => $query,
                                                                 "category" => $category,
                                                                 "tl_lat"=>$location["tl"][0],
                                                                 "tl_long"=>$location["tl"][1],
                                                                 "br_lat"=>$location["br"][0],
                                                                 "br_long"=>$location["br"][1],
                                                                 "num_biz_requested"=>$numresults));
      
      
      foreach ($data->businesses as $k=>$v) {
        $obj = array();
        $obj["locationid"] = "yelp:" . $v->phone;
        $obj["name"] = $v->name;
        $obj["address"] = $v->address1 . (!empty($v->address2) ? ", ".$v->address2 : "") . ", " . $v->city . ", " . $v->state . " " . $v->zip;
        $obj["lat"] = $v->latitude;
        $obj["lon"] = $v->longitude;
        $obj["type"] = "yelp";
        $obj["zoom_min"] = -5;
        $obj["zoom_max"] = 24;
        $ret[] = $obj;
      }
    }
    return $ret;
  }
  function getLocationInfo($id) {
    $ret = null;
    if (!empty($id)) {
      $data = $this->makeAPICall("phone_search", array("phone" => $id));
      if (!empty($data->businesses[0]))
        $ret = $data->businesses[0];
    }
    return $ret;
  }
  function importCategories() {
    $catfile = file_get_contents("/home/bai/yelp-categories.txt");
    $catstruct = array('', 'what');
    $levels = array('0'=>0, '#'=>1, '*'=>2, 'o'=>3, '+'=>4);
    $lastsymbol = '#';

    foreach (explode("\n", $catfile) as $line) {
      if (preg_match("/^\s*?([#*o+])\s+(.*?)\s+\(([^)]*?)\)\s*$/", $line, $m)) {
        $diff = $levels[$m[1]] - $levels[$lastsymbol];
#print "(" . $1 . " vs " . $lastsymbol . ") " . $levels{$1} . " > " . $levels{$lastsymbol} ." ? $diff\n";
        if ($diff > 0) {
          array_push($catstruct, $m[3]);
#print "go down a level\n";
        } else if ($diff < 0) {
          for ($i = 0; $i > $diff; $i--) {
#print "POP ";
            array_pop($catstruct);
          }

#      print "go up a level\n";
          $catstruct[count($catstruct)-1] = $m[3];
        } else {
          $catstruct[count($catstruct)-1] = $m[3];
#      print "SET IT TO $3";
        }
        print "send $m[3] for '$m[2]' (parent is " . $catstruct[count($catstruct)-2] . ")\n";
        $category = new NavigationLocationCategory();
        $category->categoryid = $m[3];
        $category->name = $m[2];
        $category->parent = $catstruct[count($catstruct)-2];
        
        $outlet = Outlet::getInstance();
        $outlet->Save($category);

        $lastsymbol = $m[1];
      }
    } 
  }
}