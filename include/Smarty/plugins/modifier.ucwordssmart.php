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
 * Name:     ucwordssmart<br>
 * Purpose:  Capitalize first letter in a string except and, to, etc. 
 * @author   James Baicoianu
 * @param string
 * @param string
 * @return string
 */
function smarty_modifier_ucwordssmart($string)
{
  return ucwordssmart($string);
}

