{component name="html.header"}
{dependency type="javascript" url="http://maps.google.com/maps?file=api&v=2&key=ABQIAAAAFXsdbqGFn4dgHhuKmhzLXRSbAmZjuZtdxuWBH-Uk_GrhiuOKERTNUoNYSNxCRRxo3ZVLY7HRLySR6A"}
{dependency type="javascript" url="/scripts/components/navigation/config.js"}
{dependency type="javascript" url="/scripts/components/navigation/carpc.js"}
{dependency type="css" url="/css/components/navigation/carpc.css"}
{dependency type="css" url="/css/components/audio/audio.css"}
<script src="/scripts/components/navigation/labeledmarker.js"></script>

  <div id="container">
    {* component name="utils.navigation" *}
    {component name="utils.status"}
    <div id="index_content">
      <div id="navigation_map"></div>
      <script type="text/javascript">
        elation.onloads.add(function() {ldelim} elation.navigation.carpc.initMap("navigation_map", {jsonencode var=$mapcenter}); {rdelim});
      </script>

    </div>
  </div>

{component name="html.footer"}
