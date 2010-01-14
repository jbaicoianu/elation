{component name="html.header"}
<p id="instructions">Mousewheel to zoom, drag to pan</p>
<div id="imagescale_frame">
  {*<img id="imagescale_target" src="http://gasi.ch/examples/2009/04/08/inline-multiscale-image-replacement/nytimes/ridge-run/ridge-run-3627x2424.jpg" />*}
  <img id="imagescale_target" src="http://gasi.ch/examples/2009/04/08/inline-multiscale-image-replacement/ia/wtm/wtm-500x354.png" />
</div>

<link rel="stylesheet" href="/css/components/html/imagescale.css" />
<script type="text/javascript" src="/scripts/components/html/imagescale.js"></script>

<script type="text/javascript">
{literal}
var imgurls = [
  'http://gasi.ch/examples/2009/04/08/inline-multiscale-image-replacement/ia/wtm/wtm-500x354.png',
  //'http://gasi.ch/examples/2009/04/08/inline-multiscale-image-replacement/ia/wtm/wtm-1920x1358.png',
  'http://gasi.ch/examples/2009/04/08/inline-multiscale-image-replacement/ia/wtm/wtm-6740x4768.png'
];
var scaler = new ImageScale(document.getElementById('imagescale_frame'), {imageurls: imgurls});
{/literal}
</script>

{component name="html.footer"}
