  [[debug]]
GA enabled {$GAenabled}
  {dependency type="component" name="html.footer"}
  {dependency type="component" name="utils.panel"}
  {if $GAenabled}
  
    {if $universal_tracking eq true}
    {literal}
    <script>
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
     (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
     m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
     })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

      //ga('send', 'pageview');
                  
      </script>
      {/literal}


    {else}

    {literal}
    <script type="text/javascript">
    var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
    document.write(unescape("%3Cscript src='" + gaJsHost + "google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E"));
    </script>
    {/literal}

    {/if}


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
        {if $is_new_user}
          var datetime = new Date();
          var d = (datetime.getMonth() + 1) + '-' + datetime.getDate() + '-' + datetime.getFullYear();
          {if $universal_tracking eq true}
          //googleAnalytics.setCustomVar(1, "FirstVisitDate", d, 1);
          //First visit source is not used in universal analytics
          //ga('set', 'dimension1', d);
          //googleAnalytics.setCustomVar(5, "FirstVisitSource", "placeholder", 1);
          //googleAnalytics.setCustomVar(4, "FirstVisitCobrand", "{$cobrand|escape:javascript}", 1);
          ga('set', 'dimension10', "$cobrand|escape:javascript");
          ga('set', 'dimension11', "$cobrand|escape:javascript");
          {else}
          googleAnalytics.setCustomVar(1, "FirstVisitDate", d, 1);
          //googleAnalytics.setCustomVar(5, "FirstVisitSource", "placeholder", 1);
          googleAnalytics.setCustomVar(4, "FirstVisitCobrand", "{$cobrand|escape:javascript}", 1);
          {/if}
        {/if}
        {if $is_new_session}
          var landing_category = googleAnalytics.pagetype ? googleAnalytics.pagetype : "home page";
          // special handling for coupons since there coupons_index, coupons_browsemap, coupons_store, coupons_tag, etc
          if (googleAnalytics.pagetype.search(/coupon/i) != -1) landing_category = 'coupons';
           //special handling for product search
          {if !empty($category)}
            if (googleAnalytics.pagetype == 'search') landing_category = "{$category}";
            if (googleAnalytics.pagetype == 'browse_homepage') landing_category = "home page";
            if (googleAnalytics.pagetype == 'index') landing_category = "home page";
          {/if}
          {if $universal_tracking eq true}
            ga('set', 'dimension5', landing_category);
            //googleAnalytics.setCustomVar(2, "LandingCategory", landing_category, 2);
            ga('set', 'dimension12', "{$version}");
            //googleAnalytics.setCustomVar(3, "VersionNumber", "{$version}", 2);
            //googleAnalytics.trackEvent(["AB Test", "version", "{$version}"]) 
          {else}
            googleAnalytics.setCustomVar(2, "LandingCategory", landing_category, 2);
            googleAnalytics.setCustomVar(3, "VersionNumber", "{$version}", 2);
            //googleAnalytics.trackEvent(["AB Test", "version", "{$version}"]) 
          {/if}
        {/if}
        googleAnalytics.trackPageview();
        pandoraLog = new TFHtmlUtilsPandoraLog();
      {rdelim});
    </script>
  {/if}

  {component name="utils.panel" type="tracking"}

 </body>
</html>
