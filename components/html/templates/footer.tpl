  [[debug]]
  {dependency type="component" name="html.footer"}
  {dependency type="component" name="utils.panel"}

  {if $GAenabled}
    <script type="text/javascript">
    var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
    document.write(unescape("%3Cscript src='" + gaJsHost + "google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E"));
    </script>

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
          'alpha':        '{$alpha|escape:javascript}'
        {rdelim});
        {if $is_new_user}
           var date = new Date();
           googleAnalytics.setCustomVar(1, "FirstVisitDate", date, 1);
        {/if}
        {if $is_new_session}
           var landing_category = googleAnalytics.pagetype ? googleAnalytics.pagetype : "home";
           // special handling for coupons since there coupons_index, coupons_browsemap, coupons_store, coupons_tag, etc
                 if (googleAnalytics.pagetype.search(/coupon/i) != -1) landing_category = 'coupons';
           //special handling for product search
           {if !empty($category)}
            if (googleAnalytics.pagetype == 'search') landing_category = "{$category}";
           {/if}
           googleAnalytics.setCustomVar(2, "LandingCategory", landing_category, 2);
                 googleAnalytics.setCustomVar(3, "VersionNumber", "{$version}", 2);
           {if $is_logged_in}
              {if $usertype eq 'facebook'}
                googleAnalytics.setCustomVar(4, "UserID", "{$userid}", 2);
              {else}
                googleAnalytics.setCustomVar(4, "UserID", "{$useremail}", 2);
              {/if}
           {else}
              googleAnalytics.setCustomVar(4, "UserID", "notLoggedin", 2);
           {/if}
           googleAnalytics.trackEvent(["AB Test", "version", "{$version}"]) 
        {/if}
        googleAnalytics.trackPageview();
        pandoraLog = new TFHtmlUtilsPandoraLog();
      {rdelim});
    </script>
  {/if}

  {component name="utils.panel" type="tracking"}

 </body>
</html>
