<?
/**
 * Smarty plugin
 * @package Smarty
 * @subpackage plugins
 */

/**
 * Smarty {resource} plugin
 *
 * Type:     function<br>
 * Name:     resource<br>
 * Purpose:  Retrieve and print the appropriate resource given a name
 *
 * @author James Baicoianu
 * @param array
 * @param Smarty
 * @return string|null if the assign parameter is passed, Smarty assigns the
 *                     result to a template variable
 */
function smarty_function_resource($args, &$smarty) {
  global $webapp;
  $ret = "";
  
  if (!empty($args["name"])) {
    //$data = DataManager::singleton();
    //$ret = sprintf('<div id="tf_resource_%s" onclick="var blah = "/cms/edit?cms[resourcename]=%s; return ajaxLink(ajaxlib, this);" class="tf_resource_edit">jjjj</div>', str_replace(".", "_", $args["name"]), $args["name"]);

    $resourcename = $args["name"];

    $cfgmgr = ConfigManager::singleton();

    //print_pre($cfgmgr->current);
    $value = array_get($cfgmgr->current, $resourcename);
    if ($value === NULL) {
      $ret = sprintf('Resource "%s" not found', $resourcename);
    } else {
      $ret = $value;
    }
    if (!empty($webapp->edit)) {
      //$ret = sprintf('<div id="tf_resource_%s" class="tf_resource_edit" onclick="resourceeditor.Edit(\'%s\')">%s</div>', str_replace(".", "_", $resourcename), $resourcename, $ret);

      $vars["resource"]["name"] = $resourcename;
      $vars["resource"]["content"] = $ret;
      $ret = $smarty->GetTemplate("resource.tpl", $null, $vars);
    }
  } else {
    return $ret; 
  }
  return $ret;
}
