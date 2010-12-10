<?php
/**
 * Smarty truncate modifier plugin
 *
 * Type:     modifier<br>
 * Name:     truncate<br>
 * Purpose:  Truncate a string to a certain length if necessary,
 *           optionally splitting in the middle of a word, and
 *           appending the $etc string or inserting $etc into the middle.
 * @package Smarty
 * @subpackage plugins
 * @link http://smarty.php.net/manual/en/language.modifier.truncate.php
 *          truncate (Smarty online manual)
 * @author   Monte Ohrt <monte at ohrt dot com>
 * @param string
 * @param integer
 * @param string
 * @param boolean
 * @param boolean
 * @return string
 */
function smarty_modifier_utf8($str, $mode="decode") {
  $ret = $str;
  if ($mode == "encode") 
    $ret = utf8_encode($str);
  else if ($mode == "decode") 
    $ret = utf8_decode($str);
  return $ret;
}
?>
