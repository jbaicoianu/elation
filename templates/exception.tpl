{dependency type="css" url="/css/exception.css"}
<div class="exception">
 <img src="/images/stop.png" class="exception_icon" />
 <h2>
  Exception: {$exception.message}
  <address>{$exception.file}:{$exception.line}</address>
 </h2>
 <ol class="exception_trace">
  {foreach from=$exception.trace item=trace}
   <li>
    {$trace.class}{$trace.type}{$trace.function}(
     {foreach from=$trace.args item=arg name=trace}
       <code>{if is_string($arg)}'{$arg|escape:html}'{else}{$arg|escape:html}{/if}</code>{if !$smarty.foreach.trace.last},{/if}
     {/foreach}
    )
   </li>
  {/foreach}
 </ol>
</div>
