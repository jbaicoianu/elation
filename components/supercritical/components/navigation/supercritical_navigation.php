<?
include_once("yelp_class.php");

class Component_supercritical_navigation extends Component {
  function init() {
    $this->conn = Outlet::getInstance();
    $orm = OrmManager::singleton();
    $orm->LoadModel("supercritical_navigation");
  }

  function controller_navigation($args, $output="inline") {
    $response = $this->GetComponentResponse("./navigation.tpl");
    $response["args"] = $args;
    $response["mapcenter"] = $this->conn->load("NavigationLocation", "mapcenter");

    return $response;
  }
  function controller_directions($args, $output="inline") {
    $vars["args"] = $args;
    $targetid = (!empty($args["targetid"]) ? $args["targetid"] : "index_content");
    $page = $this->GetTemplate("./directions.tpl", $vars);
    if ($output == "ajax")
      $ret[$targetid] = $page;
    else
      $ret = $page;
    return $ret;
  }
  function controller_waypoints($args, $output="inline") {
    $location["tr"] = explode(",", $args["tr"]);
    $location["bl"] = explode(",", $args["bl"]);
    $location["tl"] = array($location["tr"][0], $location["bl"][1]);
    $location["br"] = array($location["bl"][0], $location["tr"][1]);
    $location["center"] = array(($location["bl"][0] + (($location["tr"][0] - $location["bl"][0]) / 2)), ($location["bl"][1] + (($location["tr"][1] - $location["bl"][1]) / 2)));
    $zoom = any($args["zoom"], 1);

    $yelp = new Yelp();

    $wherestr = "WHERE {NavigationLocation.lat} <= " . mysql_escape_string($location["tr"][0]) . " AND {NavigationLocation.lat} >= " . mysql_escape_string($location["bl"][0]);
    $wherestr .= " AND {NavigationLocation.lon} <= " . mysql_escape_string($location["tr"][1]) . " AND {NavigationLocation.lon} >= " . mysql_escape_string($location["bl"][1]);
    $wherestr .= " AND {NavigationLocation.zoom_min} <= " . mysql_escape_string($zoom) . " AND {NavigationLocation.zoom_max} >= " . mysql_escape_string($zoom);
    $wherestr .= " AND {NavigationLocation.name} != 'mapcenter'";

    $locations_center = $this->conn->load("NavigationLocation", "mapcenter");
    if (empty($locations_center)) {
      $locations_center = new NavigationLocation();
      $locations_center->locationid = "mapcenter";
      $locations_center->name = "mapcenter";
      $locations_center->type = "hidden";
    }
    $locations_center->lat = $location["center"][0];
    $locations_center->lon = $location["center"][1];
    $locations_center->zoom_min = $zoom;
    $locations_center->zoom_max = $zoom;
    $this->conn->save($locations_center);

    $locations_db = $this->conn->select("NavigationLocation", $wherestr);
    $locations_yelp = $yelp->getReviews($location);

    if (is_array($locations_db) && is_array($locations_yelp))
      $locations = array_merge($locations_yelp, $locations_db);
    else 
      $locations = any($locations_db, $locations_yelp);

    $ret = json_encode($locations);
    return $ret;
  }
  function controller_location($args, $output="inline") {
    if (!empty($args["id"])) {
      list($provider, $id) = explode(":", $args["id"], 2);
      switch($provider) {
        case 'yelp':
          $yelp = new Yelp();
          $vars["location"] = $yelp->getLocationInfo($id);
      }
    }

    return $this->GetTemplate("./location.tpl", $vars);
  }
  function controller_location_categories($args, $output="inline") {
    $targetid = (!empty($args["targetid"]) ? $args["targetid"] : "index_content");
    if (isset($args["showcategory"])) {
      if (is_array($args["showcategory"])) {
        $_SESSION["navigation"]["location"]["categories"] = array();
        foreach ($args["showcategory"] as $cat=>$enabled) {
          if ($enabled) {
            $_SESSION["navigation"]["location"]["categories"][] = $cat;
          }
        }
      } else if (!empty($args["showcategory"])) {
        $_SESSION["navigation"]["location"]["categories"] = explode(" ", $args["showcategory"]);
      } else {
        unset($_SESSION["navigation"]["location"]["categories"]);
      }
    }
    if (!empty($args["root"])) {
      $vars["toplevel"] = false;
      $vars["root"] = $args["root"];
    } else {
      $outlet = Outlet::getInstance();
      $categories = $outlet->select("NavigationLocationCategory");
      $vars["toplevel"] = true;
      $vars["categories"] = NULL;
      $vars["root"]->children = array();
      
      for ($i = 0; $i < count($categories); $i++) {
        if (!isset($categories[$i]->children))
          $categories[$i]->children = array();
        $vars["categories"][$categories[$i]->categoryid] =& $categories[$i];
        if (!empty($categories[$i]->parent))
          $vars["categories"][$categories[$i]->parent]->children[] =& $categories[$i];
        else
          $vars["root"]->children[] =& $categories[$i];

        if (!empty($_SESSION["navigation"]["location"]["categories"]))
          $categories[$i]->enabled = (in_array($categories[$i]->categoryid, $_SESSION["navigation"]["location"]["categories"]));
      }
    }

    $page = $this->GetTemplate("./location_categories.tpl", $vars);
    if ($output == "ajax")
      $ret[$targetid] = $page;
    else
      $ret = $page;
    return $ret;
  }
  function controller_location_enablecategories($args, $output="inline") {
    return print_pre($_SESSION, true);;
  }

  function controller_yelpimport($args, $output="inline") {
    $yelp = new Yelp();
    header('Content-type: text/plain');
    $yelp->importCategories();
    return "";
  }
  function controller_augmentedreality($args) {
    return $this->GetComponentResponse("./augmentedreality.tpl", $vars);
  }
}  
