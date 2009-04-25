<?php
/**
 * Smarty plugin
 * @package Smarty
 * @subpackage plugins
 */


/**
 * Smarty plugin
 *
 * Type:     modifier<br>
 * Name:     nicetime<br>
 * Date:     Mar 27, 2009
 * Purpose:  pass through nicetime() function
 * Input:<br>
 *         - contents = contents to replace
 * Example:  {$date|nicetime}
 * @version  1.0
 * @author   James Baicoianu
 * @param string
 * @return string
 */
function smarty_modifier_nicetime($string)
{
    return nicetime($string);
}

/* vim: set expandtab: */

?>
