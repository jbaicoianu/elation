<?
function smarty_block_set($params, $content, &$smarty) {
  if (!empty($params["var"])) {
    $mode = any($params["mode"], "set");
    $realsmarty = $smarty;
    if (isset($smarty->parent) && $smarty->parent instanceof TemplateManager) {
      $realsmarty = $smarty->parent;
    }
    if ($mode == "set")
      $realsmarty->SetVarReplace($params["var"], $content, false);
    else if ($mode == "append")
      $realsmarty->SetVarReplace($params["var"], $content, true);
  }
}
