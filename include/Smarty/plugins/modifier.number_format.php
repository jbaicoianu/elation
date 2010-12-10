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
 * Name:     string_format<br>
 * Purpose:  Reformat a string to be displayed nicely
 * @author   James Baicoianu
 * @param string
 * @param string
 * @return string
 */
function smarty_modifier_number_format($string, $decimals=0)
{
  return number_format($string, $decimals);
}
