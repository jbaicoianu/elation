{dependency type="component" name="utils.jit"}
{dependency type="component" name="stats.graph"}
<div id="infovis"></div>    
<div id="legend"></div>
<script type="text/javascript">
var graph = new elation.stats.graph('infovis', {jsonencode var=$graphdata}, {jsonencode var=$graphcfg});
</script>
