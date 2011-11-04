{if !$hidecontainer}<ul{if !empty($id)} id="{$id}"{/if}{if !empty($class)} class="{$class}"{/if}>{/if}
 {foreach from=$listitems item=itemchunk}
  <li{if !empty($itemclass)} class="{$itemclass}"{/if}>  
   {foreach from=$itemchunk key=k item=i}{component name=$itemcomponent item=$i itemname=$k}{/foreach}
  </li>
 {/foreach}
{if !$hidecontainer}</ul>{/if}

