   {if $ad.format == "afs"}
    {if $ad.method == "divreplace"} {* Only the last AFS ad element on the page should be marked with method=divname - all others should be "inline" *}
     {dependency type="component" name="utils.googleafs"}
     <script type="text/javascript">googleafs.PrepareQuery('{if !empty($webapp->request.args.query)}{$webapp->request.args.query}{elseif !empty($webapp->request.args.info)}{$webapp->request.args.info}{elseif !empty($webapp->request.args.browse)}{$webapp->request.args.browse}{elseif !empty($webapp->request.args.qq)}{$webapp->request.args.qq}{/if}', '{$ad.clientid}', '{$ad.channelid}', '{$ad.dimensionid}');</script>
     <script type="text/javascript" src="http://www.google.com/afsonline/show_afs_ads.js"></script> {* Ideally we could load this via googleafs.Query() but google sucks and uses document.write *}
    {/if}
   {else}
    <img id="tf_cpmad_label" src="{$webapp->locations.imageswww}/misc/adlabel.gif" alt="" />
    <script type="text/javascript"><!--
      google_ad_client = "{$ad.clientid}";
      google_ad_width = "{$ad.width}";
      google_ad_height = "{$ad.height}";
      google_ad_format = "{$ad.dimensionid}";
      google_ad_type = "{$ad.format}";
      google_ad_channel = "{if !empty($ad.channelid)}{$ad.channelid}{/if}";
      //-->
    </script>
    <script type="text/javascript" src="http://pagead2.googlesyndication.com/pagead/show_ads.js"></script> 
   {/if}
