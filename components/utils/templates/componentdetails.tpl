{if $root}<div{if !empty($id)} id="{$id}"{/if} data-elation-component="utils.componentdetails">{/if}
 {if !empty($component)}
  <h2>{$component->name}</h2>

  <div>
    <h3>Properties</h3>
    <ul>
    {if !empty($component->args)}
      {foreach from=$component->args item=arg}
        <li>{component name="ui.input" label=$arg value=$componentargs.$arg inputname="args.`$arg`"}</li>
      {/foreach}
    {/if}
    </ul>
  <div>
    <h3>Events</h3>
    <ul>
    {if !empty($component->events)}
      {foreach from=$component->events item=event}
        <li>{component name="ui.input" label=$event value=$events.$event inputname="events.`$event`"}</li>
      {/foreach}
    {/if}
    </ul>
  </div>
 {/if}
{if $root}</div>{/if}
{dependency name="utils.componentdetails"}
