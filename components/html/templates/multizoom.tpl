{component name="html.header"}
<div id="multizoom">
</div>

<link rel="stylesheet" href="/css/components/html/imagescale.css" />
<script type="text/javascript" src="/scripts/components/html/imagescale.js"></script>

{literal}
<style type="text/css">
#multizoom {
  display: block;
  width: 40em;
  height: 30em;
  margin: 2em auto;
  border: 2px solid black;
  overflow: hidden;
  position: relative;
  cursor:-moz-grab;
}
.multizoom_tilelayer {
  border: 2px solid blue;
  position: absolute;
}
.multizoom_tile {
  display: block;
  margin: -1px;
  xborder: 1px solid white;
  position: absolute;
}
.multizoom_tilelayer.layer1 .multizoom_tile { border-color: red; opacity: 1; }
.multizoom_tilelayer.layer2 .multizoom_tile { border-color: orange; opacity: .9; }
.multizoom_tilelayer.layer3 .multizoom_tile { border-color: yellow; opacity: .8; }
.multizoom_tilelayer.layer4 .multizoom_tile { border-color: green; opacity: .7; }
.multizoom_tilelayer.layer5 .multizoom_tile { border-color: blue; opacity: .6; }
.multizoom_tilelayer.layer6 .multizoom_tile { border-color: indigo; opacity: .5; }
.multizoom_tilelayer.layer7 .multizoom_tile { border-color: violet; opacity: .4; }
</style>
<script type="text/javascript">
function MultiZoom(container, options) {
  this.container = container;
  this.options = options;
  this.tilelayers = [];
  this.tiles = [];
  
  this.init = function() {
    this.zoomable = document.createElement("DIV");
    this.zoomable.style.width = this.options.size[0] + 'px';
    this.zoomable.style.height = this.options.size[1] + 'px';
    this.container.appendChild(this.zoomable);

    this.level = this.options.defaultlevel || (Math.floor(this.options.size[0] / this.container.offsetWidth) - 1);
    console.log('selected level:', this.level);

    this.createLevel(this.level);
    //this.computeLevels(this.options.size[0], this.options.size[1], this.options.tilesize);
    this.scaler = new ImageScale(this.container, {zoomable: this.zoomable});

  }
  this.getMaximumLevel = function(width, height) {
    return Math.ceil(Math.log(Math.max(width, height)) / Math.LN2)
  }
  this.computeLevels = function(width, height, tilesize) {
    var maxlevel = this.getMaximumLevel(width, height);
    var columns, rows;
    for (var level = maxlevel; level >= 0; level--) {
/*
      columns = Math.ceil(width / tilesize);
      rows = Math.ceil(height / tilesize);


      width = Math.ceil(width / 2);
      height = Math.ceil(height / 2);
*/
       this.createLevel(level);
     }
  }
  this.createLevel = function(level) {
    var maxlevel = this.getMaximumLevel(this.options.size[0], this.options.size[1]);
    var lwidth = Math.ceil(this.options.size[0] / Math.pow(2, maxlevel - level));
    var lheight = Math.ceil(this.options.size[1] / Math.pow(2, maxlevel - level));
    var columns = Math.ceil(lwidth / this.options.tilesize);
    var rows = Math.ceil(lheight / this.options.tilesize);
    this.tilelayers[level] = new MultiZoomTileLayer(this.zoomable, {size: this.options.size, rows: rows, columns: columns, tilesize: this.options.tilesize, level: level, visible: (level == this.level)});
    console.log('level ' + level + ' is ' + lwidth + ' x ' + lheight + ' (' + columns + ' columns, ' + rows + ' rows)');
  }
  this.init();
}
function MultiZoomTileLayer(container, options) {
  this.container = container;
  this.options = options || [];
  this.tiles = [];

  this.init = function() {
    this.visible = this.options.visible || false;
    this.element = document.createElement("DIV");
    this.element.className = "multizoom_tilelayer layer" + this.options.level;
    this.element.style.display = (this.visible ? 'block' : 'none');
    this.element.style.width = ((this.options.size[0] / this.container.offsetWidth) * Math.pow(2, this.options.level)) + 'px';
    this.element.style.height = ((this.options.size[1] / this.container.offsetWidth) * Math.pow(2, this.options.level)) + 'px';
    this.element.style.MozTransformOrigin = '0 0';
    //this.element.style.MozTransform = 'scale(' + (1 / Math.pow(2, this.options.level)) + ')';
    this.container.appendChild(this.element);
    var numtiles = [Math.ceil(this.options.size[0] / this.options.tilesize), Math.ceil(this.options.size[1] / this.options.tilesize)];
    var urlbase = "http://gasi.ch/examples/2009/04/08/inline-multiscale-image-replacement/ia/wtm/image_files";
    var urlext = "png";
    
    console.log(this.options);
    for (var j = 0; j < this.options.rows; j++) {
      this.tiles[j] = [];
      for (var k = 0; k < this.options.columns; k++) {
        var imgurl = urlbase + '/' + this.options.level + '/' + k + '_' + j + '.' + urlext;
        this.tiles[j].push(new MultiZoomTile(this.element, {size: this.options.tilesize, pos: [k, j], elementargs: {innerHTML: '<img src="' + imgurl + '" />'}}));
      }
    }
  }
  this.init();
}
function MultiZoomTile(container, options) {
  this.container = container;
  this.options = options || [];

  this.init = function() {
    this.elementtype = this.options.elementtype || 'DIV';
    this.element = document.createElement(this.elementtype);
    if (this.options.elementargs) {
      for (var k in this.options.elementargs) {
        if (this.options.elementargs.hasOwnProperty(k)) {
          this.element[k] = this.options.elementargs[k];
        }
      }
    }
    this.element.className = "multizoom_tile";
    this.element.style.width = this.options.size + "px";
    this.element.style.height = this.options.size + "px";
    this.element.style.left = (this.options.pos[0] * this.options.size) + "px";
    this.element.style.top = (this.options.pos[1] * this.options.size) + "px";
    this.container.appendChild(this.element);
  }

  this.init();
}
var options = {
  tilesize: 256,
  overlap: 1,
  maxlevel: 2,
  size: [6740, 4768],
};
var frame = document.getElementById('multizoom');
var multi = new MultiZoom(frame, options);
</script>
{/literal}
{component name="html.footer"}
