<?
/**
 * Smarty plugin
 * @package Smarty
 * @subpackage plugins
 */

/**
 * Smarty {printpre} plugin
 *
 * Type:     function<br>
 * Name:     printpre<br>
 * Purpose:  Print a dump of the requested variable
 *
 * @author James Baicoianu
 * @param array
 * @param Smarty
 * @return string|null if the assign parameter is passed, Smarty assigns the
 *                     result to a template variable
 */
function smarty_function_getcfg($args, &$smarty) {
  $ret = ConfigManager::get($args["config"]);
  return $ret;
}

