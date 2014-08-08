{component name="elation.component" component="ui.list" tag=$tag id=$id classname=$class events=$events tagtype="open"}
  {if !empty($itemcomponent) && $itemcomponent != "ui.listitem"}<data class="elation-args" name="attrs.itemcomponent">{$itemcomponent}</data>{/if}
 {foreach from=$listitems item=itemchunk}
  <li class="ui_list_item">  
   {foreach from=$itemchunk key=k item=i}{component name=$itemcomponent item=$i itemname=$k}{/foreach}
  </li>
 {/foreach}
{component name="elation.component" component="ui.list" tag=$tag id=$id classname=$class events=$events tagtype="close"}
