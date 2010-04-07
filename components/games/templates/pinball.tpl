{component name="html.header"}
<meta name="apple-mobile-web-app-capable" content="yes" />
{dependency type="javascript" url="/scripts/components/utils/sylvester.src.js"}
{dependency type="javascript" url="/scripts/components/utils/dynamics.js"}

{dependency type="css" url="/css/components/games/pinball.css"}
{dependency type="javascript" url="/scripts/components/games/pinball.js"}

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
