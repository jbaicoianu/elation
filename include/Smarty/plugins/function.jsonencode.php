<?php
  /**
   * Smarty plugin
   * @package Smarty
   * @subpackage plugins
   */


  /**
   * Smarty encode modifier plugin
   *
   * Type:     function<br>
   * Name:     jsonencode<br>
   * Purpose:  Encode a variable with the specified encoding format
   * @author   James Baicoianu
   * @param var
   * @return string
   */
function smarty_function_jsonencode($args, $smarty) {
  $ret = "null";

  if (isset($args["var"])) {
    $ret = json_encode($args["var"]);
  }
  return $ret;
}
