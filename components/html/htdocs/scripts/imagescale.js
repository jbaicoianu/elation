function ImageScale(container, options) {
  this.container = container;
  this.options = options;
  this.pos = [0, 0];
  this.lastpos = [0, 0];
  this.scale = 1;
  this.maxscale = 10;
  
  this.init = function() {
    addEvent(this.container, 'mousedown', this); 
    addEvent(this.container, 'touchstart', this); 
    addEvent(this.container, 'mousewheel', this); 
    addEvent(window, 'resize', this); 

    this.viewportsize = [this.container.offsetWidth, this.container.offsetHeight];
    this.zoomable = this.options['zoomable'] || container.getElementsByTagName('IMG')[0];
    this.zoomable.style.MozTransformOrigin = '0 0';
    this.zoomable.style.WebkitTransformOrigin = '0 0';
    this.initImage();
    this.updateImage();
    if (this.zoomable.tagName == "IMG") {
      (function(self) {
        self.img.onload = function() { self.initImage(); };
      })(this);
    }

    this.startSwap(1);
  }
  this.initImage = function() {
    this.dimensions = [this.zoomable.offsetWidth, this.zoomable.offsetHeight];
    //console.log(this.dimensions);
    //this.minscale = this.options.minscale || (this.container.offsetWidth / this.dimensions[0]);
    this.calculateMinScale();
    if (this.scale <= this.maxscale)
      this.scale = this.scale * this.minscale;
    else
      this.scale = this.minscale;
    //this.pos = [(this.dimensions[0] / -2) + (this.dimensions[0] * this.scale / 2), (this.dimensions[1] / -2) + (this.dimensions[1] * this.scale / 2)];
    //this.pos = [(this.dimensions[0] / -2), (this.dimensions[1] / -2)];
    //this.pos = [0, 0];
    //console.log(this.pos, this.scale);
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
      case 'touchstart':
      case 'mousedown':
        //console.log(ev.type);
        addEvent(window, 'mousemove', this);
        addEvent(window, 'mouseup', this);
        addEvent(window, 'mouseleave', this);
        addEvent(window, 'touchmove', this);
        addEvent(window, 'touchend', this);
        if (ev.touches) {
          this.lastpos = [ev.touches[0].clientX, ev.touches[0].clientY];
        } else {
          this.lastpos = [ev.clientX, ev.clientY];
        }
        $(this.container).addClass("state_dragging");
        ev.preventDefault();
        break;
      case 'mousemove':
      case 'touchmove':
        if (ev.touches)
          this.handleMousemove(ev.touches[0]);
        else
          this.handleMousemove(ev);
        break;
      case 'touchend':
      case 'mouseup':
      case 'mouseout':
      case 'mouseleave':
          removeEvent(window, 'mousemove', this);
          removeEvent(window, 'mouseup', this);
          removeEvent(window, 'mouseleave', this);
          removeEvent(window, 'touchmove', this);
          removeEvent(window, 'touchend', this);
          $(this.container).removeClass("state_dragging");
        return false;
        break;
      case 'mousewheel':
      case 'DOMMouseScroll':
        var zoom =  (typeof ev.wheelDeltaY != 'undefined' ? ev.wheelDeltaY / 750 : ev.detail / -30);
        this.zoomBy(zoom);
        ev.preventDefault();
        break;
    case 'resize':
      this.viewportsize = [this.container.offsetWidth, this.container.offsetHeight];
      this.calculateMinScale();
      break;
    default:
      alert('dunno:' + ev.type);
    }
  }
  this.calculateMinScale = function() {
    if (this.options.minscale) {
      this.minscale = this.options.minscale;
    } else {
      if (this.dimensions[1] > this.dimensions[0]) {
        this.minscale = this.viewportsize[0] / this.dimensions[0];
      } else {
        this.minscale = this.viewportsize[1] / this.dimensions[1];
      }
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
    if (scaledwidth + this.pos[0] < this.viewportsize[0])
      this.pos[0] = -1 * scaledwidth + this.viewportsize[0];
    if (this.pos[0] > 0)
      this.pos[0] = 0;

    if (scaledheight + this.pos[1] < this.viewportsize[1])
        this.pos[1] = -1 * scaledheight + this.viewportsize[1];
    if (this.pos[1] > 0)
      this.pos[1] = 0;

  }
  this.zoomBy = function(zoom, zoompoint) {
    var scalediff = this.scale * -1 * zoom;
    var newscale = this.scale - scalediff;
    if (newscale < this.minscale) {
      newscale = this.minscale;
    } else if (newscale > this.maxscale) {
      newscale = this.maxscale;
    }
    var bounds = this.getViewportBounds();
    var newbounds = this.getViewportBounds(newscale);

    if (typeof zoompoint == 'undefined') {
      zoompoint = [(bounds[1][0] - bounds[0][0]) / 2, (bounds[1][1] - bounds[0][1]) / 2];
      zoompoint = [(bounds[1][0] - bounds[0][0]) / 2, (bounds[1][1] - bounds[0][1]) / 2];
    }

    if (0) {
      var bpoint = [bounds[0][0] + zoompoint[0], bounds[0][1] + zoompoint[1]];
    var npoint = [newbounds[0][0] + ((newbounds[1][0] - newbounds[0][0]) / 2), newbounds[0][1] + ((newbounds[1][1] - newbounds[0][1]) / 2)];
    //var diff = [bounds[0][0] - newbounds[0][0], bounds[0][1] - newbounds[0][1]];
    var diff = [bpoint[0] - npoint[0], bpoint[1] - npoint[1]];
  } else {
    var bpoint = [bounds[0][0] + ((bounds[1][0] - bounds[0][0]) / 2), bounds[0][1] + ((bounds[1][1] - bounds[0][1]) / 2)];
    var npoint = [newbounds[0][0] + ((newbounds[1][0] - newbounds[0][0]) / 2), newbounds[0][1] + ((newbounds[1][1] - newbounds[0][1]) / 2)];
    var diff = [bpoint[0] - npoint[0], bpoint[1] - npoint[1]];
  }
    this.pos[0] -= (diff[0] * newscale);
    this.pos[1] -= (diff[1] * newscale);
    //console.log('bounds:',bounds,'newbounds:',newbounds,'bpoint:',bpoint,'difference:', diff);
    //console.log('bpoint:', bpoint);
    this.scale = newscale;
    this.fixViewport();
    this.updateImage();
  }
  this.getViewportBounds = function(scale) {
      if (typeof scale == 'undefined')
        scale = this.scale;
    var tl = [-1 * this.pos[0] / scale, -1 * this.pos[1] / scale];
    var br = [tl[0] + (this.viewportsize[0] / scale), tl[1] + (this.container.offsetHeight / scale)];
    return [tl, br];
  }
  this.updateImage = function() {
    this.zoomable.style.MozTransform = 'translate(' + this.pos[0] + 'px, ' + this.pos[1] + 'px) scale(' + this.scale + ')';
    this.zoomable.style.WebkitTransform = 'translate(' + this.pos[0] + 'px, ' + this.pos[1] + 'px) scale(' + this.scale + ')';
    //this.zoomable.style.width = (this.dimensions[0] * this.scale) + "px";
    //this.zoomable.style.height = (this.dimensions[1] * this.scale) + "px";
    //this.zoomable.style.left = this.pos[0] + 'px';
    //this.zoomable.style.top = this.pos[1] + 'px';
  }

  this.init();
}
