{if !empty($label)}<label for="{$id|escape:html}">{$label|escape:html}</label>{/if} 
<select{if !empty($selectname)} name="{$selectname}"{/if}{if !empty($id)} id="{$id}"{/if}{if !empty($class)} class="{$class}"{/if}{if !empty($autosubmit)} onchange="this.form.submit()"{/if} data-elation-component="ui.select"{if isset($tabindex)} tabindex="{$tabindex}"{/if}>
 {foreach from=$items key=k item=v}
  <option value="{$k}"{if $k == $selected} selected{/if}>{$v}</option>
 {/foreach}
 {if !empty($events)}<data class="elation-events">{jsonencode var=$events}</data>{/if}
</select>
{dependency name="ui.select"}
