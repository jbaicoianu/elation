{component name="desktop"}
{assign var="distinct_numbers" value=array_fill(1,15,'x')}
{assign var="distinct_numbers" value=array_keys($distinct_numbers)}
{assign var="x" value=shuffle($distinct_numbers)}
<script src="http://cdn.peerjs.com/0.3/peer.min.js"></script>
<li data-elation-component="desktop.Icon" 
		data-elation-args.type="WWW"
		data-elation-args.name="Resume"
		data-elation-args.title="Jamey Lazarus Resume"
		data-elation-args.windowtype="window.iframe"
		data-elation-args.content="http://meobets.com/~lazarus/Jamey-Lazarus-Resume-sm.pdf">
</li>
<li data-elation-component="desktop.Icon" 
		data-elation-args.type="SYS"
		data-elation-args.name="Modal Test"
		data-elation-args.title="Modal Dialog"
		data-elation-args.windowid="application_login"
		data-elation-args.windowtype="window.modal"
		data-elation-args.content="hack.login">
</li>
<li data-elation-component="desktop.Icon" 
		data-elation-args.type="SYS"
		data-elation-args.name="Dialog Test"
		data-elation-args.title="Some Dialog Window"
		data-elation-args.windowid="application_admin"
		data-elation-args.windowtype="window.dialog"
		data-elation-args.content="hack.admin">
</li>
<li data-elation-component="desktop.Icon" 
		data-elation-args.type="API"
		data-elation-args.name="Data API Collections"
		data-elation-args.title="APICollection Explorer"
		data-elation-args.windowname="application_explorer"
		data-elation-args.windowtype="window.window"
		data-elation-args.content="hack.explorer">
</li>
<li data-elation-component="desktop.Icon" 
		data-elation-args.type="APP"
		data-elation-args.name="WebSocket Client"
		data-elation-args.title="WebSocket Test Client"
		data-elation-args.windowid="application_terminal"
		data-elation-args.windowtype="window.window"
		data-elation-args.content="hack.terminal">
</li>
<li data-elation-component="desktop.Icon" 
		data-elation-args.type="APP"
		data-elation-args.name="WebRTC Client"
		data-elation-args.title="Connecting..."
		data-elation-args.windowname="application_peer"
		data-elation-args.windowtype="window.window"
		data-elation-args.content="hack.WebRTC_Client">
</li>
<li data-elation-component="desktop.Icon" 
		data-elation-args.type="WWW"
		data-elation-args.name="WebGL Demo"
		data-elation-args.title="Stella Imperia: a WebGL/Three.js Demo by Jamey Lazarus [WIP]"
		data-elation-args.windowid="simperia"
		data-elation-args.windowtype="window.iframe"
		data-elation-args.content="http://www.meobets.com/~lazarus/elation/index.php/space/imperium.popup">
</li>
<li data-elation-component="desktop.Icon" 
		data-elation-args.type="WWW"
		data-elation-args.name="Inception"
		data-elation-args.title="IncognitOS - Desktop"
		data-elation-args.windowtype="window.iframe"
		data-elation-args.content="/hack?{foreach from=$distinct_numbers item="value"}{$value}{/foreach}">
</li>
{*
<li data-elation-component="desktop.Icon" 
		data-elation-args.type="WWW"
		data-elation-args.name="Windows 3.11"
		data-elation-args.title="Windows 3.11 Emulation"
		data-elation-args.windowtype="window.iframe"
		data-elation-args.content="http://www.vrcade.io/win311?noheader=1">
</li>
<li data-elation-component="desktop.Icon" 
		data-elation-args.type="HTML"
		data-elation-args.name="Telnet"
		data-elation-args.title="Telnet by bioid"
		data-elation-args.windowid="application_telnet"
		data-elation-args.windowtype="window.window"
		data-elation-args.content="<telnet-element wsurl='ws://meobets.com:12355'></telnet-element>">
</li>
<li data-elation-component="desktop.Icon" 
		data-elation-args.type="APP"
		data-elation-args.name="IRC"
		data-elation-args.title=""
		data-elation-args.windowname="application_network"
		data-elation-args.content="ui.example_infobox">
</li>
*}
<script src="/scripts/hack/bower/bower_components/webcomponentsjs/webcomponents.min.js"></script>
<link rel="import" href="/scripts/hack/bower/telnet-element.html">