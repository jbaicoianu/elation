{component name="html.header"}
{set var="page.title"}Client-side bulk image resizer{/set}
<script type="text/javascript" src="/scripts/html/jszip.js"></script>

<div id="dragdrop"><div>drag ur imgz here</div></div>

{literal}
<style type="text/css">
#dragdrop {
  width: 20em;
  height: 20em;
  border: 2px solid blue;
  background: #ccccff;
  margin: 2em auto;
  text-align: center;
  font-family: courier, monospace;
  color: black;
  line-height: 20em;
  -moz-border-radius: 5px;  
  -moz-user-select: none;
  -moz-box-shadow: 0px 0px 8px 4px #333;
}
.imagescaler {
  border: 1px solid red;
  position: absolute;
  top: 0;
  left: 0;
  cursor: move;
  overflow: hidden;
  -moz-box-shadow: 8px 8px 8px #333;
  -webkit-user-select: none;
}
.imagescaler canvas {
  display: block;
  z-index: 1;
}
.imagescaler .resizehandle {
  width: 8px;
  height: 8px;
  cursor: se-resize;
  position: absolute;
  right: -1px;
  bottom: -1px;
  z-index: 2;
  opacity: .6;
  border-bottom: 5px solid red;
  border-right: 5px solid red;
}
</style>

<script type="text/javascript">
scalerz = 100;
function DragTarget(container, options) {
  this.container = container;
  this.options = options;
  this.scalers = [];

  this.init = function() {
    elation.events.add(this.container, "dragenter", this);
    elation.events.add(this.container, "dragover", this);
    elation.events.add(this.container, "drop", this);

    this.savebutton = document.createElement('BUTTON');
    this.savebutton.innerHTML = 'Save';
    elation.events.add(this.savebutton, "click", this);
    this.container.appendChild(this.savebutton);
  }

  this.handleEvent = function(ev) {
    switch(ev.type) {
      case 'click':
        if (ev.target == this.savebutton)
          this.saveAll();
        break;
      case 'dragenter':
      case 'dragover':
        ev.preventDefault();
        break;
      case 'drop':
        ev.preventDefault();
        if (ev.dataTransfer.files.length > 0) {
          var files = ev.dataTransfer.files;
          for (var i = 0; i < files.length; i++) {
            var url = window.URL.createObjectURL(files[i]);
            console.log(files[i], url);
            this.scalers.push(new ImageScaler(this.container, {src: url, name: files[i].fileName, type: files[i].type}));
          }
        } else if (ev.dataTransfer.types.contains("text/uri-list")) {
          this.scalers.push(new ImageScaler(this.container, {src: ev.dataTransfer.getData("text/uri-list")}));

        }

        break;
    }
  }
  this.saveAll = function() {
    console.log('Generating zip');
    var zip = new JSZip();
    for (var i = 0; i < this.scalers.length; i++) {
      zip.file(this.scalers[i].name, this.scalers[i].canvas.toDataURL(this.scalers[i].type).replace("data:"+this.scalers[i].type+";base64,", ""), {base64: true});
    }
    var content = zip.generate();
    location.href = "data:application/zip;base64,"+content;
    
  }
  this.init();
}
function ImageScaler(container, options) {
  this.container = container;
  this.options = options;
  this.scale = 1;
  this.dragging = false;
  this.resizing = false;

  this.init = function() {
    this.size = this.options.size || [300, 300];
    this.name = this.options.name || 'untitled' + (Math.random() * 1000) + '.png';
    this.type = this.options.type || 'image/png';
    this.element = document.createElement('DIV');
    this.element.width = this.size[0];
    this.element.height = this.size[1];
    this.element.className = 'imagescaler';
    this.element.zIndex = scalerz++;

    this.canvas = document.createElement('CANVAS');
    this.canvas.style.MozTransformOrigin = '0 0';
    this.canvas.width = this.size[0];
    this.canvas.height = this.size[1];
    this.element.appendChild(this.canvas);

    this.resizehandle = document.createElement('DIV');
    this.resizehandle.className = 'resizehandle';
    this.resizehandle.draggable = false;
    this.resizehandle.style.MozUserSelect = 'none';
    elation.events.add(this.resizehandle, 'mousedown', this);
    this.element.appendChild(this.resizehandle);

    this.container.appendChild(this.element);

    if (typeof this.options.src != 'undefined')
      this.setSource(this.options.src);

    elation.events.add(this.element, "resize", this);    
    elation.events.add(this.element, "mousedown", this);

    this.ctx = this.canvas.getContext('2d');
  }
  this.setSource = function(src) {
    this.img = new Image();
    this.img.src = src;
    elation.events.add(this.img, "load", this);
  }

  this.handleEvent = function(ev) { 
    switch(ev.type) {
      case 'mousedown':
        this.dragoffset = [ev.clientX - this.element.offsetLeft, ev.clientY - this.element.offsetTop];
        this.element.style.zIndex = scalerz++;
        if (ev.target == this.resizehandle && !this.resizing) {
          console.log('resizing');
          this.resizing = true;
          elation.events.add(window, 'mousemove', this);
          elation.events.add(window, 'mouseup', this);
          ev.stopPropagation();
          ev.preventDefault();
        } else if (!this.dragging) {
          console.log('dragging');
          this.dragging = true;
          elation.events.add(window, 'mousemove', this);
          elation.events.add(window, 'mouseup', this);
          ev.preventDefault();
        }
        break;
      case 'mousemove':
        if (this.dragging) {
          this.element.style.left = (ev.clientX - this.dragoffset[0]) + 'px';
          this.element.style.top = (ev.clientY - this.dragoffset[1]) + 'px';
        } else if (this.resizing) {
          //var oldsize = [this.element.offsetWidth, this.element.offsetHeight];
          var offset = [this.element.offsetLeft, this.element.offsetTop];
          var newsize = [ev.clientX - offset[0], ev.clientY - offset[1]];
          var scale = this.getScale(this.size, newsize, true);
          this.element.style.width = (this.size[0] * scale) + 'px';
          this.element.style.height = (this.size[1] * scale) + 'px';
          this.canvas.style.MozTransform = 'scale(' + scale + ')';
        }
        break;
      case 'mouseup':
        if (this.dragging || this.resizing) {
          console.log('dropped');
          elation.events.remove(window, 'mousemove', this);
          elation.events.remove(window, 'mouseup', this);

          if (this.resizing) {
            this.setSize(this.element.offsetWidth, this.element.offsetHeight);
          }

          this.resizing = false;
          this.dragging = false;
          this.dragoffset = [0, 0];
        }
        break;

      case 'load':
        var canvassize = [this.canvas.width, this.canvas.height];
        var imgsize = [this.img.width, this.img.height];
        this.scale = this.getScale(imgsize, canvassize);
        var scaledsize = [imgsize[0] * this.scale, imgsize[1] * this.scale];
        this.setSize(scaledsize[0], scaledsize[1]);
        break;
    }
  }
  
  this.getScale = function(oldsize, newsize, max) {
    var scale = 1;
    if (typeof max == 'undefined') max = false;
    var dimension = (newsize[0] / oldsize[0] < newsize[1] / oldsize[1]);
    if ((!max && dimension) || (max && !dimension)) {
      scale = newsize[0] / oldsize[0];
    } else {
      scale = newsize[1] / oldsize[1];
    }
    if (scale < 0) scale = 0;
    return scale;
  }
  this.setSize = function(width, height) {
    this.size = [width, height];
    this.canvas.width = width;
    this.canvas.height = height;
    this.element.style.width = width + 'px';
    this.element.style.height = height + 'px';
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.scale(1, 1);
    this.ctx.drawImage(this.img, 0, 0, width, height);
    this.canvas.style.MozTransform = 'scale(1)';
    console.log('loaded');
  }
  this.init();
}

var foo = new DragTarget(document.getElementById('dragdrop'));
</script>
{/literal}

{component name="html.footer"}

