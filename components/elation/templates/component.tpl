{if $tagtype == "open" || $tagtype == "both"}
  {dependency name=$component}
  <{$tag}{if !empty($id)} id="{$id}"{/if}{if !empty($classname)} class="{$classname}"{/if}{if !empty($component)} data-elation-component="{$component}"{/if}>{$content}{if !empty($args)}<data class="elation-args">{jsonencode var=$args}</data>{/if}{if !empty($events)}<data class="elation-events">{jsonencode var=$events}</data>{/if}{/if}{if $tagtype == "close" || $tagtype == "both"}</{$tag}>{/if}

