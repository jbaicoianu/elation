<?php
/**
 * Smarty plugin
 * @package Smarty
 * @subpackage plugins
 */

/**
 * Smarty {dependency} plugin
 *
 * Type:     function<br>
 * Name:     dependency<br>
 * Purpose:  Register a dependency to be printed in the header
 *
 * @author James Baicoianu
 * @param array
 * @param Smarty
 * @return string|null if the assign parameter is passed, Smarty assigns the
 *                     result to a template variable
 */
function smarty_function_dependency($args, &$smarty) {
  DependencyManager::add($args);
}
