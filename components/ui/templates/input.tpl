{if !empty($label)}<label for="{$id|escape:html}" title="{$label|escape:html}">{$label|escape:html}</label>{/if}
{strip} 
  <input
  {if !empty($type)} type="{$type|escape:html}"{/if}
  {if !empty($id)} id="{$id|escape:html}"{/if}
  {if !empty($inputname)} name="{$inputname|escape:html}"{/if}
  {if !empty($class)} class="{$class|escape:html}"{/if}
  {if !empty($value)} value="{$value|escape:html}"{/if}
  elation:component="ui.input"
  />
{/strip}

