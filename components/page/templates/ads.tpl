{dependency type="component" name="page.useless"}

{if !empty($ad.enabled)}
  {if $ad.options.hidediv != 1}<div class="tf_page_ad_{$ad.type}{if $ad.options.seeit.enabled} tf_seeit{/if}{if $ad.options.class} {$ad.options.class}{/if}"{if !empty($ad.placement)} id="tf_page_ad_{$ad.placement}"{/if}>{/if}
    {if !empty($ad.code)}
      {$ad.code}
    {else}
      {component name="page.ads" ad=$ad result_impression_id=$result_impression_id}
    {/if}
  {if $ad.options.hidediv != 1}</div>{/if}
{/if}