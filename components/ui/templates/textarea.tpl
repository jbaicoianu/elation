{if !empty($label)}<label for="{$id|escape:html}" title="{$label|escape:html}">{$label|escape:html}</label>{/if}
{strip}
<textarea 
  {if !empty($id)} id="{$id|escape:html}"{/if}
  {if !empty($class)} class="{$class|escape:html}"{/if}
  >
  {/strip}{if !empty($value)}{$value|escape:html}{/if}
</textarea>

