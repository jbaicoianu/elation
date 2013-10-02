<?
class Component_stats extends Component {
  function controller_graph($args) {
    $vars["graphdata"] = $args["graphdata"];
    $vars["graphcfg"] = $args["graphcfg"];
    $vars["legend"] = $args["legend"];
    return $this->GetComponentResponse("./graph.tpl", $vars);
  }

  function controller_queries($args) {
    $vars["sortby"] = any($args["sortby"], "time");
    $vars["showids"] = any($args["showids"], false);
    $vars["queries"] = array();

    $cfg = ConfigManager::singleton();
    $qlogcfg = any(array_get($cfg->servers, "querylog"));

    $tag = "";
    if (!empty($qlogcfg["tag"])) {
      $tag = "-" . date($qlogcfg["tag"]);
    } 

    $querydir = any($qlogcfg["path"], "tmp/queries");
    $vars["file"] = any($args["file"], any($qlogcfg["file"], "querylog") . $tag);
    $fname = $querydir . "/" . $vars["file"];

    $querylogs = array();
    if (file_exists($querydir)) {
      if (($dirh = opendir($querydir)) !== false) {
        while (($f = readdir($dirh)) !== false) {
          if (strpos($f, ".") === false) {
            $querylogs[] = $f;
          }
        }
      }
    }
    sort($querylogs);
    
    $vars["querylogs"] = implode(";", $querylogs);
    $vars["time_start"] = 0;
    $vars["time_end"] = 0;

    if (!empty($fname) && file_exists($fname)) {
      $fd = fopen($fname, "r");

      $colors = array(
        "qpm" => "#0f0",
        "qpmthrift" => "#090",
        "db" => "#00f",
        "cassandra" => "#900",
        "memcache" => "#909",
        "suggest" => "#ff0",
        "facebook" => "#006",
      );

      $cfg = ConfigManager::singleton();
      $cachefilename = $cfg->locations["tmp"] . "/stats-" . $vars["file"] . "-" . $vars["sortby"] . ".txt";
      $vars["cached"] = false;
      if (file_exists($cachefilename) && filemtime($cachefilename) >= filemtime($fname)) {
        $vars["cached"] = true;
        $cachecontents = file_get_contents($cachefilename);
        if (!empty($cachecontents)) {
          $cacheobj = json_decode($cachecontents, true);
          $vars["queries"] = any($cacheobj["queries"], $cacheobj);
          if (!empty($cacheobj["timerange"])) {
            $vars["time_start"] = $cacheobj["timerange"][0];
            $vars["time_end"] = $cacheobj["timerange"][1];
          }
        }
      } else {
        while (!feof($fd) && ($line = fgets($fd)) !== false) {
          $q = json_decode($line);
          if (!empty($q)) {
            list($id, $qargs) = explode(":", $q->id, 2);
            list($key, $id) = explode("#", $id, 2);

            if (!empty($q->ts)) {
              if ($vars["time_start"] == 0 || $q->ts < $vars["time_start"]) {
                $vars["time_start"] = $q->ts;
              }
              if ($vars["time_end"] == 0 || $q->ts > $vars["time_end"]) {
                $vars["time_end"] = $q->ts;
              }
            }

            if (empty($id) && (preg_match("/\.([0-9a-f]+)$/", $key, $m) || preg_match("/^suggest\.(.*)$/", $key, $m))) {
              $id = $m[1];
              $key = substr($key, 0, strlen($key) - (strlen($m[1]) + 1));
            }

            $ptr =& $vars;
            $keyparts = explode(".", $key);
            // prepend "queries" and append the query type (fetch, insert, update, delete, count, query, etc)
            array_unshift($keyparts, "queries");
            if (!empty($q->type)) {
              array_push($keyparts, $q->type);
            }
            if (!empty($vars["showids"]) && !empty($id)) {
              array_push($keyparts, $id);
            }
            // Keep a cumulative total for each part of the key heirarchy
            for ($i = 0; $i < count($keyparts); $i++) {
              $keypart = $keyparts[$i];
              if (empty($keypart)) {
                continue;
              }
              if (!isset($ptr[$keypart])) {
                $ptr[$keypart] = array("data" => array("count" => 0, "time" => 0, "cached" => 0));
              }
              $ptr[$keypart]["id"] = implode(".", array_slice($keyparts, 0, $i+1));;
              $ptr[$keypart]["name"] = $keypart;
              $ptr[$keypart]["data"]["count"]++;
              $ptr[$keypart]["data"]["time"] += $q->time;
              $ptr[$keypart]["data"]["time-per-query"] = $ptr[$keypart]["data"]["time"] / $ptr[$keypart]["data"]["count"];

              $ptr[$keypart]["data"]['$angularWidth'] = $ptr[$keypart]["data"][$vars["sortby"]];

              if ($keypart != $keyparts[0] && isset($colors[$keyparts[1]])) {
                $ptr[$keypart]["data"]['$color'] = $colors[$keyparts[1]];
              }

              if ($q->cached) {
                $ptr[$keypart]["data"]["cached"]++;
              }
              if ($i < count($keyparts)-1) {
                // Add the "children" element if it doesn't exist, and if we're not at the last keypart
                if (!isset($ptr[$keypart]["children"])) {
                  $ptr[$keypart]["children"] = array();
                }
                $ptr =& $ptr[$keypart]["children"];
              }
            }
          } else {
            //print_pre($allqueries[$i]);
          }
        }
      }
      if (!empty($vars["queries"])) {
        $this->sortTree($vars["queries"], $vars["sortby"]);
        file_put_contents($cachefilename, json_encode(array("timerange" => array($vars["time_start"], $vars["time_end"]), "queries" => $vars["queries"])));
      }
    }
    //unset($vars["queries"]["children"]["qpm"]);
    return $this->GetComponentResponse("./queries.tpl", $vars);
  }

  function sortTree(&$root, $sortby) {
    $this->sortby = $sortby; // FIXME - hack for comparator
    if (is_array($root["children"])) {
      uasort($root["children"], array($this, "sortTreeComparator"));
      foreach ($root["children"] as $k=>$v) {
        $this->sortTree($root["children"][$k], $sortby);
      }
    }    
  }
  function sortTreeComparator(&$a, &$b) {
//print_pre($this->sortby . ": " . $a["data"][$this->sortby] . " - " . $b["data"][$this->sortby]);
    return ($b["data"][$this->sortby] - $a["data"][$this->sortby]);
  }
}
