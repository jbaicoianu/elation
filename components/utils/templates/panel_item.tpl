{if !empty($panelitem.component)}
  {component name=$panelitem.component componentargs=$panelitem.componentargs top=false}
{else}
  {if !empty($panelitem.label) || !empty($panelitem.icon)}
    {if !empty($panelitem.link)}
      <a href="{$panelitem.link|escape:html}"{if $panelitem.nofollow} rel="nofollow"{/if}>
    {/if}
    {if !empty($panelitem.icon)}
      {img class="tf_utils_panel_icon" src=$panelitem.icon alt=`$panelitem.label|escape:html`}
    {/if}
    {$panelitem.label}
    {if !empty($panelitem.link)}
      </a>
    {/if}
    {if !empty($panelitem.count)}
      ({$panelitem.count})
    {/if}
  {/if}
{/if}

{if !empty($panelitem.cfg.inline)}
  {component name=$panelitem.contentcomponent componentargs=$panelitem.contentcomponentargs}
{/if}