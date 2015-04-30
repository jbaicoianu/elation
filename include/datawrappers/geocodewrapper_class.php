<?php
include_once("include/common_funcs.php");
include_once("include/datawrappers/connectionwrapper_class.php");

/**
 * class GeocodeWrapper
 * Geocode connection wrapper object.  Wraps Yahoo! geolocate service
 * @package Framework
 * @subpackage Datasources
 */
class GeocodeWrapper extends ConnectionWrapper {
  function Open() {
    return true;
  }

  function Close() {
    return true;
  }
  
  function Query($queryid, $query, $args=NULL) {
    $ret = array();
    foreach ($query as $k=>$v) {
      if (in_array($k, array("streetaddr", "city", "state", "zip", "lat", "lon", "location", "range"))) {
        $ret[$k] = $v;
      }
    }
    $url = $this->cfg["server"];

    $url .= "?appid=" . urlencode($this->cfg["appid"]);
    $url .= "&output=php";
    $urlargs = "";
    $logaddr = "";
    if (!empty($ret["streetaddr"])) {
      $urlextra .= "&street=" . urlencode($ret["streetaddr"]);
      $logaddr .= $ret["streetaddr"];
    }
    if (!empty($ret["city"])) {
      $urlextra .= "&city=" . urlencode($ret["city"]);
      $logaddr .= (!empty($logaddr) ? ", " : "") . $ret["city"];
    }
    if (!empty($ret["state"])) {
      $urlextra .= "&state=" . urlencode($ret["state"]);
      $logaddr .= (!empty($logaddr) ? ", " : "") . $ret["state"];
    }
    if (!empty($ret["zip"])) {
      $urlextra .= "&zip=" . urlencode($ret["zip"]);
      $logaddr .= (!empty($logaddr) ? ", " : "") . $ret["zip"];
    }
    if (!empty($ret["location"])) {
      $urlextra .= "&location=" . urlencode($ret["location"]);
      $logaddr .= (!empty($logaddr) ? ", " : "") . $ret["location"];
    }

    if (!empty($urlextra) && $response = file_get_contents($url . $urlextra)) {
      $logstr = "Geocoding address: $logaddr";
      $responseobj = unserialize($response);
      if (!empty($responseobj["ResultSet"])) {
        $resultset = $responseobj["ResultSet"];
          
        if (!empty($resultset["Result"])) {
          //$ret = array($resultset["Result"]["Latitude"], $resultset["Result"]["Longitude"]);
          
          if (empty($ret["city"]) && !empty($resultset["Result"]["City"]))
            $ret["city"] = $resultset["Result"]["City"];
          if (empty($ret["state"]) && !empty($resultset["Result"]["State"]))
            $ret["state"] = $resultset["Result"]["State"];
          if (empty($ret["zip"]) && !empty($resultset["Result"]["Zip"]))
            $ret["zip"] = $resultset["Result"]["Zip"];
          
          $ret["lat"] = $resultset["Result"]["Latitude"];
          $ret["lon"] = $resultset["Result"]["Longitude"];
          
          $logstr .= " (" . $ret["lat"] . ", " . $ret["lon"] . ")";
        } else {
          $logstr .= " (FAILED)";
        }
      }
      Logger::Info($logstr);
    }
    return $ret;
  }

}




