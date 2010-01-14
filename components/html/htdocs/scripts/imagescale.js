function ImageScale(container, options) {
  this.container = container;
  this.options = options;
  this.pos = [0, 0];
  this.lastpos = [0, 0];
  this.scale = 1;
  this.maxscale = 10;
  
  this.init = function() {
    addEvent(this.container, 'mousedown', this); 
    addEvent(this.container, 'mousewheel', this); 

    this.zoomable = this.options['zoomable'] || container.getElementsByTagName('IMG')[0];
    this.initImage();
    this.updateImage();
    if (this.zoomable.tagName == "IMG") {
      (function(self) {
        self.img.onload = function() { self.initImage(); };
      })(this);
    }

    console.log('yeah');
    this.startSwap(1);
  }
  this.initImage = function() {
    this.dimensions = [this.zoomable.offsetWidth, this.zoomable.offsetHeight];
    console.log(this.dimensions);
    this.minscale = this.options.minscale || (this.container.offsetWidth / this.dimensions[0]);
    if (this.scale <= this.maxscale)
      this.scale = this.scale * this.minscale;
    else
      this.scale = this.minscale;
    //this.pos = [(this.dimensions[0] / -2) + (this.dimensions[0] * this.scale / 2), (this.dimensions[1] / -2) + (this.dimensions[1] * this.scale / 2)];
    //this.pos = [(this.dimensions[0] / -2), (this.dimensions[1] / -2)];
    //this.pos = [0, 0];
    console.log(this.pos, this.scale);
  }
  this.startSwap = function(num) {
    if (this.options['imageurls'] && typeof this.options['imageurls'][num] != 'undefined') {
      this.newimg = document.createElement("IMG");
      (function(self) {
        self.newimg.onload = function() { self.swapImage(this); };
      })(this);
      this.newimg.style.visibility = 'hidden';
      this.newimg.src = this.options['imageurls'][num];
      this.container.appendChild(this.newimg);
      console.log('preloading high-res image');
    }
  }
  this.swapImage = function(img) {
    if (typeof img != 'undefined' && img != this.zoomable) {
      this.container.removeChild(this.zoomable);
      this.zoomable = this.newimg;
      this.zoomable.style.visibility = 'visible';
    }
    this.initImage();
    this.updateImage();
  }
  this.handleEvent = function(ev) {
    //console.log(ev);
    switch(ev.type) {
      case 'mousedown':
        addEvent(window, 'mousemove', this);
        addEvent(window, 'mouseup', this);
        addEvent(window, 'mouseleave', this);
        this.lastpos = [ev.clientX, ev.clientY];
        $(this.container).addClass("state_dragging");
        ev.preventDefault();
        break;
      case 'mousemove':
        this.handleMousemove(ev);
        break;
      case 'mouseup':
      case 'mouseout':
      case 'mouseleave':
          removeEvent(window, 'mousemove', this);
          removeEvent(window, 'mouseup', this);
          removeEvent(window, 'mouseleave', this);
          $(this.container).removeClass("state_dragging");
          console.log('removed');
        return false;
        break;
      case 'DOMMouseScroll':
        this.handleMousewheel(ev);
    }
  }
  this.handleMousemove = function(ev) {
    var pos = [ev.clientX, ev.clientY];
    this.pos[0] += (pos[0] - this.lastpos[0]);
    this.pos[1] += (pos[1] - this.lastpos[1]);
    this.lastpos = pos;
    this.fixViewport();
    this.updateImage();
  }
  this.fixViewport = function() {
    var scaledwidth = this.dimensions[0] * this.scale;
    var scaledheight = this.dimensions[1] * this.scale;
    if (scaledwidth + this.pos[0] < this.container.offsetWidth)
      this.pos[0] = -1 * scaledwidth + this.container.offsetWidth;
    if (this.pos[0] > 0)
      this.pos[0] = 0;

    if (scaledheight + this.pos[1] < this.container.offsetHeight)
      this.pos[1] = -1 * scaledheight + this.container.offsetHeight;
    if (this.pos[1] > 0)
      this.pos[1] = 0;

  }
  this.handleMousewheel = function(ev) {
    ev.preventDefault();
    var scalediff = this.scale * (ev.detail / 20);
    var oldcenter = [.5 * this.dimensions[0] * (1 - this.scale), .5 * this.dimensions[1] * (1 - this.scale)];
    this.scale -= scalediff;
    if (this.scale < this.minscale) {
      this.scale = this.minscale;
    } else if (this.scale > this.maxscale) {
      this.scale = this.maxscale;
    }
    this.fixViewport();
    this.updateImage();
  }
  this.updateImage = function() {
//console.log("frame offsetLeft: ", this.container.offsetLeft, "img offsetLeft: ", this.zoomable.offsetLeft, "pos: ", this.pos[0], "scaled offset: ", this.pos[0] * this.scale, "scaled width: ", this.zoomable.offsetWidth * this.scale);
//console.log(this.pos, this.scale);
    this.zoomable.style.MozTransformOrigin = '0 0';
    this.zoomable.style.MozTransform = 'translate(' + this.pos[0] + 'px, ' + this.pos[1] + 'px) scale(' + this.scale + ')';
    //this.zoomable.style.MozTransform = 'scale(' + this.scale + ')';
    //this.zoomable.style.webkitTransform = 'scale(' + this.scale + ')';
    //this.zoomable.style.width = (this.dimensions[0] * this.scale) + "px";
    //this.zoomable.style.height = (this.dimensions[1] * this.scale) + "px";
    //this.zoomable.style.left = this.pos[0] + 'px';
    //this.zoomable.style.top = this.pos[1] + 'px';
  }

  this.init();
}
