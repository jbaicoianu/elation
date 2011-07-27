{if $tagtype == "open" || $tagtype == "both"}
  {dependency name=$component}
  <{$tag}{if !empty($id)} id="{$id}"{/if}{if !empty($classname)} class="{$classname}"{/if}{if !empty($component)} elation:component="{$component}"{/if}>{$content}{if !empty($args)}<elation:args>{jsonencode var=$args}</elation:args>{/if}{if !empty($events)}<elation:events>{jsonencode var=$events}</elation:events>{/if}{/if}{if $tagtype == "close" || $tagtype == "both"}</{$tag}>{/if}

