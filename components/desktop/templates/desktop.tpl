{set var="page.pretitle"}Elation - {/set}
{set var="page.title"}Window Manager{/set}
{dependency name="ui.input"}
{dependency name="ui.toggle"}
{dependency name="ui.slider"}
{dependency name="ui.window"}
{dependency name="window.window"}
{dependency name="hack"}
{dependency name="desktop"}
<div data-elation-component="desktop.DesktopManager"
		 data-elation-name="main">
</div>
<li data-elation-component="desktop.Icon"
		data-elation-args.type="APP"
		data-elation-args.name="zuul"
		data-elation-args.title="Picture Viewer - Zuul"
		data-elation-args.windowtype="window.dialog"
		data-elation-args.windowname="zuulpics"
	  data-elation-args.content="hack.zuulpics">
</li>
