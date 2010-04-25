{component name="html.header"}
<meta name="apple-mobile-web-app-capable" content="yes" />
{dependency type="javascript" url="/scripts/components/utils/sylvester.src.js"}
{dependency type="javascript" url="/scripts/components/utils/dynamics.js"}

{dependency type="css" url="/css/components/games/arkanoid.css"}
{dependency type="javascript" url="/scripts/components/games/common.js"}
{dependency type="javascript" url="/scripts/components/games/arkanoid.js"}

<div id="arkanoid_game"></div>

{literal}<script type="text/javascript">elation.games.arkanoid.init("arkanoid_game")</script>{/literal}
{component name="html.footer"}
