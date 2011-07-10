<select{if !empty($selectname)} name="{$selectname}"{/if}{if !empty($id)} id="{$id}"{/if}{if !empty($class)} class="{$class}"{/if}{if !empty($autosubmit)} onchange="this.form.submit()"{/if}>
 {foreach from=$items key=k item=v}
  <option value="{$k}"{if $k == $selected} selected{/if}>{$v}</option>
 {/foreach}
</select>

