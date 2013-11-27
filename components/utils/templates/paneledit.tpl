{dependency type="component" name="html.dragdroptarget"}
{dependency type="component" name="html.flippable"}
{dependency type="component" name="ui.button"}
{dependency type="component" name="ui.select"}
{dependency type="component" name="ui.input"}
{dependency type="component" name="ui.list"}
{dependency type="component" name="notes.notes"}
{dependency type="component" name="utils.paneledit"}

<div id="tf_utils_toolkit">
  {component name="utils.componentlist" id="toolbox_list"}
  {component name="utils.componentdetails" id="toolbox_detail"}
</div>

<div id="dostuff" data-elation-component="utils.paneledit" data-elation-args.panel="{$panel}"></div>

<script type="text/javascript">
  elation.onloads.add(function() {ldelim}
setTimeout(function() {ldelim}
    elation.utils.paneledit('dostuff').setPanelConfig({jsonencode var=$panelcfg});
{rdelim}, 10);
  {rdelim});
</script>
