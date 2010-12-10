<?php
function smarty_block_config($params, $content, &$smarty) {
  global $webapp;

  if (empty($params->skipcobrand)) { // FIXME - this should also apply to page_component's getCobrandContent() somehow...
    $cfgmgr = ConfigManager::singleton();

    $heirarchy = $cfgmgr->GetConfigHeirarchy("cobrand.".$webapp->cobrand);

    foreach (array_reverse($heirarchy) as $cfgname) { // Walk heirarchy from bottom up
      if (preg_match("/^cobrand\.(.*)$/", $cfgname, $m) || $cfgname == "base") { // FIXME - most general-purpose would be to use the cobrand key as imagedir (s/\./\//g?)
        $cobrandname = ($cfgname == "base" ? $cfgname : $m[1]);
        if (file_exists($webapp->locations["css"] . "/cobrands/$cobrandname.css"))
          DependencyManager::add(array("type"=>"css", "file"=>"cobrands/$cobrandname.css", "priority"=>4));
        if (file_exists($webapp->locations["css"] . "/cobrands/{$cobrandname}-fixes.css"))
          DependencyManager::add(array("type"=>"css", "file"=>"cobrands/{$cobrandname}-fixes.css", "priority"=>4));
        if (file_exists($webapp->locations["scripts"] . "/cobrands/$cobrandname.js"))
          DependencyManager::add(array("type"=>"javascript", "file"=>"cobrands/$cobrandname.js", "priority"=>4));
      }
    }
  }    

  return trim($content);
}
