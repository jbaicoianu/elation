<?php
/**
 * Smarty plugin
 * @package Smarty
 * @subpackage plugins
 */

/**
 * Smarty {box}{/box} block plugin
 *
 * Type:     block function<br>
 * Name:     box<br>
 * Purpose:  Generate the HTML structure needed for boxes<br>
 *
 * @param array
 * <pre>
 * Params:   id: string
 *           tag: string (div)
 *           class: string
 * </pre>
 * @param string contents of the block
 * @param Smarty clever simulation of a method
 * @return string string $content re-formatted
 */

function smarty_block_box($params, $content, &$smarty) {
  $null = NULL;
  $placement = any($params["placement"],"default");
  $type = any($params["type"],getcfg("page.box.placements.{$placement}.type"),"default");
  $typecfg = any(getcfg("page.box.types.{$type}"),array());
  $placementcfg = any(getcfg("page.box.placements.{$placement}"),array());
  $typecfg["template"] = any($params["template"],$typecfg["template"],"box_default.tpl");
  $params = array_merge(any($params,array()), any($typecfg["params"],array()), any($placementcfg["params"],array()));

  $vars["box"] = new stdClass();
  $vars["box"]->content = (!empty($content) ? $content : "");
  $vars["box"]->tag = (!empty($params["tag"]) ? $params["tag"] : "div");
  $vars["box"]->id = (!empty($params["id"]) ? $params["id"] : NULL);
  $vars["box"]->class = (!empty($params["class"]) ? $params["class"] : NULL);
  $vars["box"]->onmouseover = (!empty($params["onmouseover"]) ? $params["onmouseover"] : NULL);
  $vars["box"]->onmouseout = (!empty($params["onmouseout"]) ? $params["onmouseout"] : NULL);
  $vars["box"]->onclick = (!empty($params["onclick"]) ? $params["onclick"] : NULL);

  return $smarty->GetTemplate("boxes/{$typecfg["template"]}", $null, $vars);
}
