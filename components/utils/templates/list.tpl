<ul{if !empty($id)} id="{$id}"{/if}{if !empty($class)} class="{$class}"{/if}>
 {foreach from=$listitems item=itemchunk}
  <li>  
   {foreach from=$itemchunk key=k item=i}{component name=$itemcomponent item=$i itemname=$k}{/foreach}
  </li>
 {/foreach}
</ul>

