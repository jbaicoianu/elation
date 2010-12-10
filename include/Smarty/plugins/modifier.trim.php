<?php
/**
 * Smarty plugin
 *
 * Type:     modifier
 * Name:     trim
 * Date:     Oct 4, 2010
 * Purpose:  trim leading/trailing whitespace (same as trim($string)
 * Input:    contents = contents to trim
 * Example:  {$str|trim}
 * @package Smarty
 * @subpackage plugins
 * @version  1.0
 * @author   Lucian Hontau
 * @param string
 * @return string
 */
function smarty_modifier_trim($string)
{
  return trim($string);
}
