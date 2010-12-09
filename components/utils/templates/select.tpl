<select{if !empty($selectname)} name="{$selectname}"{/if}{if !empty($id)} id="{$id}"{/if}{if !empty($class)} class="{$class}"{/if}>
 {foreach from=$items key=k item=v}
  <option value="{$k}"{if $k == $selected} selected{/if}>{$v}</option>
 {/foreach}
</select>

