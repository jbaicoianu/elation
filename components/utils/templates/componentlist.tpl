<ul{if !empty($id)} id="{$id}"{/if}{if !empty($classname)} class="{$classname}"{/if}{if $root} elation:component="utils.componentlist"{/if}>
  <elation:args>
    {ldelim}"components":{jsonencode var=$components}{rdelim}
  </elation:args>

  {foreach from=$components key=name item=component}
    <li draggable="true" class="tf_utils_button_draggable">
      {$name}
      {if is_array($component) && !empty($component.components)}{component name="utils.componentlist" components=$component.components classname="tf_toolkit_contextmenu" root=false}{/if}
    </li>
  {/foreach}
</ul>
{dependency name="utils.componentlist"}
