<?
function smarty_block_set($params, $content, &$smarty) {
  if (!empty($params["var"])) {
    $mode = any($params["mode"], "set");

    $realsmarty = ($smarty instanceof Smarty_Internal_Template ? $smarty->parent : $smarty);

    if ($mode == "set")
      $realsmarty->varreplace[$params["var"]] = $content;
    else if ($mode == "append")
      $realsmarty->varreplace[$params["var"]] .= $content;
  }
}
