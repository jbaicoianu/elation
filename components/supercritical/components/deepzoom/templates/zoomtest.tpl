{component name="html.header"}
<link rel="stylesheet" href="/css/components/html/imagescale.css" />
<script type="text/javascript" src="/scripts/components/html/imagescale.js"></script>

<style type="text/css">
{literal}
#multizoom {
  overflow: hidden;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 100%;
}
.container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  border: 2px solid blue;
  zoom: 150%;
}
.layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
}
.row {
  width: 514px;
  height: 257px;
  white-space: nowrap;
  position: relative;
}
.row img {
}
</style>
{/literal}

<div id="multizoom">
 <div class="container" id="foo">
  <div class="layer">
   <div class="row">
    <img src="http://workhorse.supcrit.net/images/components/deepzoom/orionnebula_files/10/0_0.png" style="top: 0; left: 0; z-index: 50"/><img src="http://workhorse.supcrit.net/images/components/deepzoom/orionnebula_files/10/1_0.png" style="top: 0; left: 256px;"/></div>
   <div class="row">
    <img src="http://workhorse.supcrit.net/images/components/deepzoom/orionnebula_files/10/0_1.png" style="top: 0; left: 0;"/><img src="http://workhorse.supcrit.net/images/components/deepzoom/orionnebula_files/10/1_1.png" style="top: 0; left: 256px;"/></div>
  </div>
 </div>
</div>

{literal}
<script>
var f = document.getElementById('foo');
function fuck(ev) {
  //ev.preventDefault(); ev.stopPropagation(); return false; 
}
/*
addEvent(f, "mouseover", fuck);
addEvent(f, "mouseenter", fuck);
addEvent(f, "mousedown", fuck);
addEvent(f, "click", fuck);
addEvent(f, "mousemove", fuck);
*/
addEvent(f, "mouseout", fuck);
addEvent(f, "mouseup", fuck);
addEvent(f, "DOMFocusIn", fuck);
addEvent(f, "DOMFocusOut", fuck);
addEvent(f, "DOMActivate", fuck);
</script>
{/literal}

{component name="html.footer"}
