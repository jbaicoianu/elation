{component name="html.header"}
{dependency type="javascript" url="http://maps.google.com/maps?file=api&v=2&key=ABQIAAAAFXsdbqGFn4dgHhuKmhzLXRSbAmZjuZtdxuWBH-Uk_GrhiuOKERTNUoNYSNxCRRxo3ZVLY7HRLySR6A"}
{dependency type="component" name="supercritical.navigation.config"}
{dependency type="component" name="supercritical.navigation.carpc"}
{dependency type="component" name="supercritical.audio"}
{dependency type="component" name="supercritical.navigation.labeledmarker"}

  <div id="container">
    {* component name="utils.navigation" *}
    {component name="supercritical.utils.status"}
    <div id="index_content">
      <div id="navigation_map"></div>
      <script type="text/javascript">
        elation.onloads.add(function() {ldelim} elation.navigation.carpc.initMap("navigation_map", {jsonencode var=$mapcenter}); {rdelim});
      </script>

    </div>
  </div>

{component name="html.footer"}
