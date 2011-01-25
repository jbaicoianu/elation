<?php
class Component_page extends Component
{
  public function init() {}

  public function controller_page($args)
  {
    $vars["args"] = $args;
    return $this->GetComponentResponse("./page.tpl", $vars);
  }

  public function controller_sizelog($args)
  {
    $pandora = PandoraLog::singleton();
    $session = SessionManager::singleton();
    
    $size = array();
    $size["timestamp"]            = time();
    $size["session_id"]           = $session->flsid;
    $size["fluid"]                = $session->fluid;
    $size["version"]              = $this->root->version;
    $size["width"]                = $args["width"];
    $size["height"]               = $args["height"];
    $size["result_view_id"]       = $args["result_view_id"];

    // add data
    $pandora->addData("sizes", $size);
    unset($size);
    return '';
  }

  /**
   * Component: page.ads
   * Args     : none
   *
   * Insert ad column
   *
   * @return string
   */
  function controller_ads(&$args, $output="inline") {
    $ret = $content = "";
    $vars["args"] =& $args;
    $cfg = ConfigManager::singleton();
    $vars["sitecfg"] =& $cfg->current;
    $pagecfg = $this->root->components->pagecfg;

    if (!empty($args["ad"])) {
      $vars["ad"] = $args["ad"];

      if (!empty($vars["ad"]["method"]) && $vars["ad"]["method"] == "iframe") 
        $content = $this->GetTemplate("./ads/iframe.tpl", $vars);
      else if (!empty($vars["ad"]["source"])) 
        $content = $this->GetTemplate("./ads/" . $vars["ad"]["source"] . ".tpl", $vars);
    } else { 
      $placement = NULL;

      Profiler::StartTimer("Ads: merge placements");
      if (!empty($args["placement"])) {
        $vars["ad"]["placement"] = $args["placement"];
        $placement = $vars["sitecfg"]["ads"]["placements"][$args["placement"]];

        // Merge per-page placement settings on top
        if (!empty($pagecfg["ads"]["placements"][$args["placement"]])) {
          $placement = array_merge($placement, $pagecfg["ads"]["placements"][$args["placement"]]);
        }
      }
      Profiler::StopTimer("Ads: merge placements");

      if (empty($placement) || !empty($placement["enabled"])) {
        Profiler::StartTimer("Ads: process placements");
        $vars["ad"]["source"] = any($args["source"], $placement["source"], $vars["sitecfg"]["page"]["ads"]["source"]);
        $vars["ad"]["type"] = any($args["type"], $placement["type"], "text");
        $vars["ad"]["code"] = any($args["code"], $placement["code"], $vars["sitecfg"]["ads"]["sources"][$vars["ad"]["source"]]["types"][$vars["ad"]["type"]]["code"]);
        $vars["ad"]["format"] = any($vars["sitecfg"]["ads"]["sources"][$vars["ad"]["source"]]["types"][$vars["ad"]["type"]]["format"], "image");
        $vars["ad"]["method"] = any($vars["sitecfg"]["ads"]["sources"][$vars["ad"]["source"]]["types"][$vars["ad"]["type"]]["method"], $vars["sitecfg"]["ads"]["sources"][$vars["ad"]["source"]]["method"], "inline");
        $vars["ad"]["enabled"] = any($args["enabled"], $placement["enabled"], true);

        if (!empty($vars["ad"]["enabled"])) {
          // merge options together
          $vars["ad"]["options"] = any($args["options"], array());
          if (!empty($vars["sitecfg"]["ads"]["sources"][$vars["ad"]["source"]]["types"][$vars["ad"]["type"]]["options"]))
            $vars["ad"]["options"] = array_merge($vars["ad"]["options"], $vars["sitecfg"]["ads"]["sources"][$vars["ad"]["source"]]["types"][$vars["ad"]["type"]]["options"]);
          if (!empty($placement["options"]))
            $vars["ad"]["options"] = array_merge($vars["ad"]["options"], $placement["options"]);

          // Combine all the known channel IDs into one
          if (empty($vars["ad"]["clientid"]) && !empty($vars["sitecfg"]["ads"]["sources"][$vars["ad"]["source"]]["clientid"]))
            $vars["ad"]["clientid"] = $vars["sitecfg"]["ads"]["sources"][$vars["ad"]["source"]]["clientid"];

          if (!empty($vars["sitecfg"]["ads"]["sources"][$vars["ad"]["source"]]["types"][$vars["ad"]["type"]])) {
            if (!empty($vars["sitecfg"]["ads"]["sources"][$vars["ad"]["source"]]["types"][$vars["ad"]["type"]]["channelid"]))
              $vars["ad"]["channelid"] .= (!empty($vars["ad"]["channelid"]) ? "+" : "") . $vars["sitecfg"]["ads"]["sources"][$vars["ad"]["source"]]["types"][$vars["ad"]["type"]]["channelid"]; // FIXME - delimiter should be configurable
            if (!empty($vars["sitecfg"]["page"]["ads"][$vars["ad"]["source"]]["channelid"])) // FIXME - this still uses page.ads.source
              $vars["ad"]["channelid"] .= (!empty($vars["ad"]["channelid"]) ? "+" : "") . $vars["sitecfg"]["page"]["ads"][$vars["ad"]["source"]]["channelid"];
            if (!empty($placement["options"]["channelid"]))
              $vars["ad"]["channelid"] .= (!empty($vars["ad"]["channelid"]) ? "+" : "") . $placement["options"]["channelid"];
            if (!empty($vars["sitecfg"]["page"]["ads"][$vars["ad"]["source"]]["publisherid"]))
              $vars["ad"]["publisherid"] = $vars["sitecfg"]["page"]["ads"][$vars["ad"]["source"]]["publisherid"];

            // Ad widths
            if (!empty($vars["sitecfg"]["ads"]["sources"][$vars["ad"]["source"]]["types"][$vars["ad"]["type"]]["width"]))
              $vars["ad"]["width"] = $vars["sitecfg"]["ads"]["sources"][$vars["ad"]["source"]]["types"][$vars["ad"]["type"]]["width"];
            if (!empty($vars["sitecfg"]["ads"]["sources"][$vars["ad"]["source"]]["types"][$vars["ad"]["type"]]["height"]))
              $vars["ad"]["height"] = $vars["sitecfg"]["ads"]["sources"][$vars["ad"]["source"]]["types"][$vars["ad"]["type"]]["height"];
            if (!empty($vars["sitecfg"]["ads"]["sources"][$vars["ad"]["source"]]["types"][$vars["ad"]["type"]]["dimensionid"]))
              $vars["ad"]["dimensionid"] = $vars["sitecfg"]["ads"]["sources"][$vars["ad"]["source"]]["types"][$vars["ad"]["type"]]["dimensionid"];

            $vars["ad"]["impression_type"] = any($vars["sitecfg"]["ads"]["sources"][$vars["ad"]["source"]]["types"][$vars["ad"]["type"]]["impression_type"], CPM);
            $vars["ad"]["revenue"] = any($vars["sitecfg"]["ads"]["sources"][$vars["ad"]["source"]]["types"][$vars["ad"]["type"]]["revenue"], 0);
          } else {
            $vars["ad"] = null; // Selected ad source does not support this type of ad
          }
        }
        Profiler::StopTimer("Ads: process placements");
      }

      if (!empty($vars["ad"]["enabled"]) && !empty($vars["ad"]["type"])) {
        Profiler::StartTimer("Ads: logging");
        // if popup, the channelid is passed from the backend
        if ($vars["ad"]["type"] == "popup") {
          $vars["ad"]["channelid"] = any($args["channelid"], $vars["ad"]["channelid"]);
        }

        // Add the Pandora ad impression log here.  For text ads, the position within the block will be updated later.
        $pandora = PandoraLog::singleton();
        $session = SessionManager::singleton(true);
        $abs_position = 1; // default to 1, will update later if there are multiple ads within the block (e.g. 3 text ads for skyscraper_right)
        $result_impression_id = $session->generate_guid();
        $pandora_impressions = array(
                                     "result_impression_id"  => $result_impression_id,
                                     "position"              => $abs_position,
                                     "impression_type"       => $vars["ad"]["impression_type"],
                                     "ad_partner"            => $vars["ad"]["source"],
                                     "ad_revenue"            => $vars["ad"]["revenue"],
                                     "version"               => $this->root->version,
                                     "ad_type"               => $vars["ad"]["type"],
                                     "ad_clientid"           => $vars["ad"]["clientid"],
                                     "ad_channelid"          => $vars["ad"]["channelid"],
                                     "ad_placement"          => $vars["ad"]["placement"] 
                                     );
        $pandora->addData("impressions", $pandora_impressions);
        $vars["result_impression_id"] = $result_impression_id;
        unset($pandora_impressions);
        Profiler::StopTimer("Ads: logging");
        Profiler::StartTimer("Ads: stupid template");
        $content = $this->GetTemplate("./ads.tpl", $vars);
        Profiler::StopTimer("Ads: stupid template");
      }
    }
    if ($output == "ajax") {
      $ret["tf_page_ad_" . $args["placement"]] = $content;
    } else {
      $ret = $content;
    }
    return $ret;
  }
}  
