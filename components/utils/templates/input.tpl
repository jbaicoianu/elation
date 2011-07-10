{if !empty($label)}<label for="{$id|escape:html}">{$label|escape:html}</label>{/if}
{if $type == "textarea"}
{strip}
  <textarea 
  {if !empty($id)} id="{$id|escape:html}"{/if}
  {if !empty($class)} class="{$class|escape:html}"{/if}
  >
  {/strip}{if !empty($value)}{$value|escape:html}{/if}
  </textarea>
{else}  
{strip} 
  <input
  {if !empty($type)} type="{$type|escape:html}"{/if}
  {if !empty($id)} id="{$id|escape:html}"{/if}
  {if !empty($class)} class="{$class|escape:html}"{/if}
  {if !empty($value)} value="{$value|escape:html}"{/if}
  />
{/strip}
{/if} 

