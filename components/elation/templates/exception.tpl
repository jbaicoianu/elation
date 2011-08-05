{dependency type="component" name="elation.exception"}
<div class="exception exception_{$exception.type}">
 {img src="elation/stop.png" class="exception_icon"}
 <h2>
  {$exception.type}: {$exception.message}
  {if $debug}<address>{$exception.file}:{$exception.line}</address>{/if}
 </h2>
{if !empty($exception.trace)}
 <ol class="exception_trace">
  {foreach from=$exception.trace item=trace}
   <li>
    {$trace.class}{$trace.type}{$trace.function}(
     {foreach from=$trace.args item=arg name=trace}
       <code>{if is_string($arg)}'{$arg|escape:html}'{elseif is_scalar($arg)}{$arg}{else}{gettype var=$arg}{/if}</code>{if !$smarty.foreach.trace.last},{/if}
     {/foreach}
    )
    <address>{$trace.file}:{$trace.line}</address>
   </li>
  {/foreach}
 </ol>
{/if}
</div>
