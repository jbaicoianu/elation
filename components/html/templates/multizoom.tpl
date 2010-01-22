<link rel="stylesheet" href="/css/components/html/imagescale.css" />
<link rel="stylesheet" href="/css/components/html/multizoom.css" />
<script type="text/javascript" src="/scripts/components/html/imagescale.js"></script>
<script type="text/javascript" src="/scripts/components/html/multizoom.js"></script>

<div id="multizoom">
</div>

<script type="text/javascript">
options = {jsonencode var=$img};
options.singlelevel = true;
options.defaultlevel = 10;
var frame = document.getElementById('multizoom');
var multi = new MultiZoom(frame, options);
</script>
