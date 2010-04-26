<?
/**
 * Smarty plugin
 * @package Smarty
 * @subpackage plugins
 */

/**
 * Smarty {component} plugin
 *
 * Type:     function<br>
 * Name:     component<br>
 * Purpose:  Execute and print the output of a named component
 *
 * @author James Baicoianu
 * @param array
 * @param Smarty
 * @return string|null if the assign parameter is passed, Smarty assigns the
 *                     result to a template variable
 */
function smarty_function_component($args, &$smarty) {
  global $webapp;
  $ret = "";
  
  if (!empty($args["name"])) {
    if (!empty($args["componentargs"])) {
      $componentargs = array_merge($args, $args["componentargs"]);
      unset($componentargs["componentargs"]);
    } else {
      $componentargs = $args;
    }

    $componentmgr = ComponentDispatcher::singleton();
    $componentargs = $componentmgr->GetDispatchArgs($args["name"], $componentargs);
    $component = $componentmgr->Get($args["name"], $componentargs);

    if ($component !== NULL) {
      $ret = $component->HandlePayload(&$componentargs, "inline");
      if (is_array($ret)) {
        /*
        $webapp->response["type"] = "text/xml";
        $ret = $smarty->GenerateXML($ret);
        */
      } else if ($ret instanceOf ComponentResponse) {
        $response = $ret->getOutput("html");
        $ret = $response[1];
      } else {
        $escapes = array();
        if(!empty($args["escape"]))
          $escapes = explode("|",$args["escape"]);
        foreach($escapes as $escape){
          $ret = $escape($ret);
        }
      }
    } else {
      $ret = "[Unknown component: " . $args["name"] . "]";
    }
  
  }
  return $ret;
}

