{if $container}<div id="tf_debug_tab_settings">{/if}
<h2>Settings</h2>

<a href="/elation/settings?clear=1" onclick="return elation.ajax.link(this);">Clear Debug Settings</a>

<form action="/elation/settings" method="post" onsubmit="return elation.ajax.form(this);">
  <input type="hidden" name="adminaction" value="settings.edit" />
  <ul id="tf_debug_settings">
  {foreach name=admin_settings from=$settings key=k item=setting}
    <li{if $smarty.foreach.admin_settings.iteration is odd} class="tf_settings_odd"{/if}>
      <label for="settings_{$k}">{$k|escape:html}:</label>
      <input name="settings[{$k|escape:html}]" id="settings_{$k|escape:html}" value="{$setting|escape:html}" size="30" {if isset($tfdev.serveroverrides.$k)}class="overridden"{/if} />
    </li>
  {/foreach}
  </ul>
  <input type="submit" />
</form>
{if $container}</div>{/if}
{dependency type="component" name="elation.debug"}
{dependency type="component" name="admin"}
