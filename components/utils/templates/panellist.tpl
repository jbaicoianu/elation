<ul>
 {foreach from=$panels key=panel item=panelcfg}
  <li><a href="/utils/paneledit.popup?panel={$panel}">{$panel}</a></li>
 {/foreach}
</ul>
