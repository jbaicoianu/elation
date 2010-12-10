<?
/**
 * Smarty plugin
 * @package Smarty
 * @subpackage plugins
 */

/**
 * Smarty {coremetrics} plugin
 *
 * Type:     function<br>
 * Name:     coremetrics<br>
 * Purpose:  Execute and print the output of a named coremetrics
 *
 * @author Larry Kuang
 * @param array
 * @param Smarty
 * @return void (the arguments are assigned to the $coremetrics singleton object
 */
function smarty_function_coremetrics($args, &$smarty) {
  if (!empty($args)) {
    // get the instance from the singleton
    $coremetrics = CoreMetrics::singleton();
    if ($coremetrics !== NULL) {
      /**
       * Add to the list as you add more variables
       */
      $coremetrics->pageid = $args["pageid"];
      $coremetrics->categoryid = $args["categoryid"];
    }
  }
}
