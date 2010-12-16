<h2>Settings</h2>

<a href="/debug/settings?clear=1" onclick="return ajaxLink(ajaxlib, this);">Clear Debug Settings</a>

<form action="/debug/settings" method="post" onsubmit="return ajaxForm(ajaxlib, this);">
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