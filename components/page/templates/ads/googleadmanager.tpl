{if $ad.type == "iframe"}
    {component name="ad.googleadmanager_iframe" ad=$ad}
{else}
  {if $ad.type == "init" || $ad.type == "combined"}
    {component name="ad.googleadmanager_init" ad=$ad}
  {/if}
  {if $ad.type == "placement" || $ad.type == "rectangle" || $ad.type == "combined"}
    {component name="ad.googleadmanager_placement" ad=$ad}
  {/if}
{/if}
