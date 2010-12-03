<?
/**
 * Smarty plugin
 * @package Smarty
 * @subpackage plugins
 */

/**
 * Smarty {img} plugin
 *
 * Type:     function<br>
 * Name:     img<br>
 * Purpose:  Get the correct image (cobranded, server, etc)
 *
 * @author Ben HOLLAND!!!
 * @param array
 * @param Smarty
 * @return string|null if the assign parameter is passed, Smarty assigns the
 *                     result to a template variable
 */
function smarty_function_img($args, &$smarty) {
  global $webapp;

  Profiler::StartTimer("smarty_function_img", 2);
  $cfgmgr = ConfigManager::singleton();
  $heirarchy = $cfgmgr->GetConfigHeirarchy("cobrand.".$webapp->cobrand);

  $imagedir = any($webapp->locations["images"], "htdocs/images");
  $imagedirwww = any($webapp->locations["imageswww"], "/images");
  if (!empty($args["src"]) && !preg_match("/http:/",$args["src"])) {
    if(!empty($webapp->sitecfg["page"]["imagedir"]) && file_exists($imagedir . "/" . $webapp->sitecfg["page"]["imagedir"] . "/" . $args["src"])) {
      $args["src"] = $imagedirwww . "/" . $webapp->sitecfg["page"]["imagedir"] . "/" . $args["src"];
    } else {
      $found = false;
      foreach ($heirarchy as $cfgname) {
        if (preg_match("/^cobrand\.(.*)$/", $cfgname, $m)) { // FIXME - most general-purpose would be to use the cobrand key as imagedir (s/\./\//g?)
          if(file_exists($imagedir . "/cobrands/{$m[1]}/{$args["src"]}")) {
            $args["src"] = $imagedirwww . "/cobrands/{$m[1]}/{$args["src"]}";
            $found = true;
            break;
          }
        }
      }

      if (!$found)
        $args["src"] = $imagedirwww . "/" . $args["src"];
    }
  }
  
  $ret = "<img ";
  foreach($args as $k=>$v) {
      $ret .= "$k=\"$v\" ";
  }
  $ret .= "/>";
  Profiler::StopTimer("smarty_function_img");
  if(!empty($args["src"]))
    return $ret;
}

