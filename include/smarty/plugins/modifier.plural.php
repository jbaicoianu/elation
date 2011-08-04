<?php
/**
 * Smarty plugin
 * @package Smarty
 * @subpackage plugins
 */


/**
 * Smarty truncate modifier plugin
 *
 * Type:     modifier<br>
 * Name:     plural<br>
 * Purpose:  Pluralize a string
 * @author   Ben 
 * @param string
 * @return string
 */
function smarty_modifier_plural($string) {
  $ret = (substr($string,strlen($string)-1) == "s"?$string:$string."s");
  return $ret;
}
?>
