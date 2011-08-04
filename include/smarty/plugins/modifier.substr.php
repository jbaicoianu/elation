<?php
/**
 * Smarty plugin
 * @package Smarty
 * @subpackage plugins
 */


/**
 * Smarty string format modifier plugin
 *
 * Type:     modifier<br>
 * Name:     substr<br>
 * Purpose:  Returns the specified substring
 * @author   James Baicoianu
 * @param string
 * @param string
 * @return string
 */
function smarty_modifier_substr($string, $start, $length=NULL)
{
  return substr($string, $start, $length);
}

