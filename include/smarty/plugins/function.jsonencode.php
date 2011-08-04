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
    $ret = (!empty($args["indent"]) ? json_indent(json_encode($args["var"]), $args["indent"]) : json_encode($args["var"]));
  }
  switch ($args["escape"]) {
    case 'html':
      $ret = htmlspecialchars($ret);
      break;
    case 'js':
      $ret = addslashes($ret);
  }
  return $ret;
}
