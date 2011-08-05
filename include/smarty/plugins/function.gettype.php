<?
/**
 * Smarty plugin
 * @package Smarty
 * @subpackage plugins
 */

/**
 * Smarty {gettype} plugin
 *
 * Type:     function<br>
 * Name:     component<br>
 * Purpose:  Return the type of the passed-in variable
 *
 * @author James Baicoianu
 * @param array
 * @param Smarty
 * @return string|type of the variable
 */
function smarty_function_gettype($args, &$smarty) {
  if (is_object($args["var"])) {
    return get_class($args["var"]);
  }
  return gettype($args["var"]);
}

