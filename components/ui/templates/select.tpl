{if !empty($label)}<label for="{$id|escape:html}">{$label|escape:html}</label>{/if} 
<select{if !empty($selectname)} name="{$selectname}"{/if}{if !empty($id)} id="{$id}"{/if}{if !empty($class)} class="{$class}"{/if}{if !empty($autosubmit)} onchange="this.form.submit()"{/if} elation:component="ui.select">
 {foreach from=$items key=k item=v}
  <option value="{$k}"{if $k == $selected} selected{/if}>{$v}</option>
 {/foreach}
 {if !empty($events)}<elation:events>{jsonencode var=$events}</elation:events>{/if}
</select>
{dependency name="ui.select"}
