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
 * Name:     round_down<br>
 * Purpose:  Round a number down to nearest 10th, 100th, 1000th
 * @author   James Baicoianu or google
 * @param string
 * @param string
 * @return string
 */
function smarty_modifier_round_down($number)
{
  return round_down($number);
}

