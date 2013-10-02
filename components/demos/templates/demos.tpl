<h2>Demos - {$category}</h2>
<ul class="elation_demos">
{if !empty($demos)}
  {foreach from=$demos item=demo}
   <li>{component name="demos.view" demo=$demo}</li>
  {/foreach}
  </ul>
{else}
  <h4>No demos found</h4>
{/if}
{dependency name="demos"}
