{component name="html.header"}
<meta name="apple-mobile-web-app-capable" content="yes" />

{dependency type="component" name="utils.sylvester"}
{dependency type="component" name="utils.dynamics"}
{dependency type="component" name="games.airhockey"}

<div id="testtable" class="airhockey_table">
 <div class="airhockey_table_top">
  <div class="airhockey_table_goal"></div>
 </div>
 <div class="airhockey_table_bottom">
  <div class="airhockey_table_goal"></div>
 </div>
 <div class="airhockey_table_neutral">
  <div class="airhockey_table_center"></div>
 </div>
</div>
{literal}<script type="text/javascript">elation.games.airhockey.init("testtable", {maxspeed: 1000})</script>{/literal}
{component name="html.footer"}
