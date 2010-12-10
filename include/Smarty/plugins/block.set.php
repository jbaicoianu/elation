<?
function smarty_block_set($params, $content, &$smarty) {
  if (!empty($params["var"])) {
    $mode = any($params["mode"], "set");
    if ($mode == "set")
      $smarty->varreplace[$params["var"]] = $content;
    else if ($mode == "append")
      $smarty->varreplace[$params["var"]] .= $content;
  }
}
