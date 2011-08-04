<?
/**
 * Smarty plugin
 * @package Smarty
 * @subpackage plugins
 */

/**
 * Smarty {get} plugin
 *
 * Type:     function<br>
 * Name:     get<br>
 * Purpose:  Returns the value of a specified object, or from the global replace vars list. 
 *           Optionally fall back on a given default, and optionally wrap in a given HTML tag
 *
 * @author James Baicoianu
 * @param array $args
 * @param Smarty $smarty
 * @return string
 */
function smarty_function_get($params, &$smarty) {
  if (!empty($params["from"]) && !empty($params["key"])) {
    // Usage: {get key="foo" from=$barray}
    // from can be an object or an array
    $ret = any($params["from"][$params["key"]], $params["from"]->{$params["key"]}, $params["default"], $params["key"]);
  } else if (!empty($params["var"])) {
    // Usage: {get var="search.title"} - returns the requested postprocess var if registered
    $ret = $smarty->varreplace[$params["var"]];
  }
  if (!empty($params["wrap"]) && !empty($ret)) {
    $ret = sprintf("<%s>%s</%s>", $params["wrap"], $ret, $params["wrap"]);
  }
  return $ret;
}
