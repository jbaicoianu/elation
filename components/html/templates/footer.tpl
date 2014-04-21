  [[debug]]
  {dependency type="component" name="html.footer"}
  {dependency type="component" name="utils.panel"}
  {if $GAenabled}
  
    {literal}
      <script>
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
         (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
         m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
         })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
      </script>
    {/literal}

    <script type="text/javascript">
      $TF(document).ready(function() {ldelim}
        googleAnalytics = new TFHtmlUtilsGoogleAnalytics({ldelim}
          'trackingcode':	'{$trackingcode}',
          'GAalerts':			'{$GAalerts}',
          'cobrand':			'{$cobrand|escape:javascript}',
          'query':				'{$query|escape:javascript|escape:html}',
          'pagenum':			'{$pagenum|escape:javascript}',
          'pagegroup':		'{$pagegroup|escape:javascript}',
          'pagetype':			'{$pagetype|escape:javascript}',
          'status':       '{$status|escape:javascript}',
          'total':        '{$total|escape:javascript}',
          'category':			'{$category|escape:javascript}',
          'subcategory':	'{$subcategory|escape:javascript}',
          'city':					'{$city}',
          'state':				'{$state}',
          'country':			'{$country}',
          'filters':			'{$filters|escape:javascript}',
          'version':			'{$version|escape:javascript}',
          'store_name':   '{$store_name|escape:javascript}',
          'alpha':        '{$alpha|escape:javascript}',
          'browse_nodename':     '{$browse->nodename|escape:javascript}',
          'browse_nodetype':     '{$browse->nodetype|escape:javascript}'
        {rdelim});
        //Set result category
        {if !empty($category)}
          if (googleAnalytics.pagetype == 'search') {ldelim}
            var landing_category = "{$category}";
            googleAnalytics.setCustomDim(9, landing_category);
          {rdelim}
        {/if}
        {if $is_new_user}
          var datetime = new Date();
          var d = (datetime.getMonth() + 1) + '-' + datetime.getDate() + '-' + datetime.getFullYear();
          googleAnalytics.setCustomDim(10, "{$cobrand|escape:javascript}");
        {/if}
        {if $is_new_user && !$is_logged_in}
          googleAnalytics.setCustomDim(6, "false");
        {/if}
        {if $is_new_session}
           //special handling for product search
          {if !empty($category)}
            if (googleAnalytics.pagetype == 'search') {ldelim}
              var landing_category = "{$category}";
              //ga('set', 'dimension5', landing_category);
              googleAnalytics.setCustomDim(5, landing_category);
            {rdelim}
          {/if}
            //ga('set', 'dimension12', "{$version}");
            googleAnalytics.setCustomDim(12, "{$version}");
          var args = {ldelim}{rdelim};
          args.metric = [{ldelim}'key':'metric2','value':1{rdelim}],
          //args['metric'] = metric;
          googleAnalytics.trackPageview(args);
        {else}
          googleAnalytics.trackPageview();
        {/if}
        //googleAnalytics.trackPageview();
        pandoraLog = new TFHtmlUtilsPandoraLog();
      {rdelim});
    </script>
  {/if}

  {component name="utils.panel" type="tracking"}

 </body>
</html>
