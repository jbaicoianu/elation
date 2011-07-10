{dependency type="component" name="html.dragdroptarget"}
{dependency type="component" name="html.flippable"}
{dependency type="component" name="utils.paneledit"}

<div id="dostuff" elation:component="utils.paneledit" elation:args.panel="{$panel}"></div>

<script type="text/javascript">
  elation.onloads.add(function() {ldelim}
setTimeout(function() {ldelim}
    elation.utils.paneledit('dostuff').setPanelConfig({jsonencode var=$panelcfg});
{rdelim}, 10);
  {rdelim});
</script>
