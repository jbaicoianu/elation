{*
<ul>
 {foreach from=$queries key=id item=q}
  <li>
    <h2>{$id}</h2>
    <ul>
    {foreach from=$q key=qtype item=qt}
      <li><h3>{$qtype}</h3>
{printpre var=$qt}
      </li>
    {/foreach}
    </ul>
  </li>
 {/foreach}
</ul>
*}

<div id="queries" elation:component="stats.queries">
  <div class="queries_legend">
   <h2>Live site queries</h2>
   {if !empty($time_start) && !empty($time_end)}
     <h6><em>{$time_start|date_format:'%Y-%m-%d %H:%M'}</em> to <em>{$time_end|date_format:'%Y-%m-%d %H:%M'}</em></h6>
   {/if}
   <form action="queries" method="get">
    <label for="query_legend_file">file</label> {component name="ui.select" id="query_legend_file" selectname="file" items=$querylogs selected=$file autosubmit=true}<br />
    <label for="query_legend_sortby">sorted by</label> {component name="ui.select" id="query_legend_sortby" selectname="sortby" items="count;time;time-per-query" selected=$sortby autosubmit=true}<br />
    <input id="query_legend_showids" type="checkbox" name="showids" value="1"{if $showids} checked{/if} onclick="this.form.submit()" /> <label for="query_legend_showids">Show IDs</label>
   </form>
  </div>
 <elation:args>
  {jsonencode var=$queries}
 </elation:args>
  
</div>

{dependency name="utils.jit"}
{dependency name="stats.queries"}
