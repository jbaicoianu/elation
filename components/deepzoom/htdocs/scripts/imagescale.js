function ImageScale(container, options) {
  this.container = container;
  this.options = options;
  this.pos = [0, 0];
  this.lastpos = [0, 0];
  this.lastclick = false;
  this.scale = 1;
  this.maxscale = 10;
  this.dragging = false;
  this.gesturing = false;
  this.transform = "zoom";
  
  this.init = function() {
    elation.events.add(this.container, 'mousedown', this); 
    elation.events.add(this.container, 'dragstart', this); 
    elation.events.add(this.container, 'mousewheel', this); 
    elation.events.add(this.container, 'touchstart', this); 
    elation.events.add(this.container, 'gesturestart', this); 
    elation.events.add(this.container, 'dblclick', this); 
    elation.events.add(window, 'keydown', this); 
    elation.events.add(window, 'keypress', this); 
    elation.events.add(window, 'keyup', this); 
    elation.events.add(window, 'resize', this); 
    elation.events.add(window, 'scroll', this); 
    //elation.events.add(document.body, "touchmove", function(e) { e.preventDefault(); });

    // stupid iPhone/android hacks
    //document.body.addEventListener("touchmove", function(e) { e.preventDefault(); }, false);
    //document.onmousemove = function(e) { e.preventDefault(); return false;};

    this.zoomable = this.options['zoomable'] || container.getElementsByTagName('IMG')[0];
    this.getTransformProperty();
    if (this.transformtype != "zoom") {
      this.zoomable.style[this.transformtype+'Origin'] = '0 0';
    }
    this.zoomable.style.position = 'absolute';

    this.viewportsize = [this.container.offsetWidth, this.container.offsetHeight];
    this.viewportoffset = elation.html.position(this.container);
    console.log("viewport info: ", this.viewportsize, this.viewportoffset);

    this.initImage();
    this.fixViewport();
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
      this.newimg.style.webkitUserSelect = 'none';
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
    var ret = true;
    switch(ev.type) {
      case 'click':
        console.log('ee');
        break;
      case 'touchstart':
      case 'mousedown':
        var click = {timeStamp: ev.timeStamp, clientX: ev.clientX, clientY: ev.clientY };
        if (ev.touches && ev.touches.length == 1) {
          click.clientX = ev.touches[0].clientX;
          click.clientY = ev.touches[0].clientY;
        }
        if (this.lastclick) {
          var threshhold = this.options.touchthreshhold || 20;
          var sameclick = (Math.abs(click.clientX - this.lastclick.clientX) < threshhold && Math.abs(click.clientY - this.lastclick.clientY) < threshhold);
          if (!this.gesturing && click.timeStamp - this.lastclick.timeStamp < 200 && sameclick) {
            console.log('double click zoom it');
            this.zoomBy(10/8, [(click.clientX - this.viewportoffset[0]) / this.viewportsize[0], (click.clientY - this.viewportoffset[1]) / this.viewportsize[1]]);
            this.lastclick = false;
            ret = false;
            ev.stopPropagation();
            ev.preventDefault();
          } else {
            this.lastclick = click;
          }
        } else {
          this.lastclick = click;
        }
        // Don't break - continue with mouse handling
        //ev.preventDefault();
        //ev.stopPropagation();

        if (this.gesturing) {
          ret = false;
        } else {
          //console.log(ev.type);
          if (!this.dragging) {
            elation.events.add(this.options.eventparent, 'mousemove', this);
            elation.events.add(this.options.eventparent, 'mouseup', this);
            elation.events.add(this.options.eventparent, 'mouseleave', this);
            elation.events.add(this.options.eventparent, 'touchmove', this);
            elation.events.add(this.options.eventparent, 'touchend', this);
            this.dragging = true;
            ret = false;
          }
          this.lastpos = [click.clientX, click.clientY];
          //$(this.container).addClass("state_dragging");
        }
        break;
      case 'scroll':
        ev.preventDefault();
        ret = false;
        break;
      case 'dragstart':
        break;
      case 'mousemove':
      case 'touchmove':
        if (!this.gesturing) {
          if (ev.touches)
            this.handleMousemove(ev.touches[0]);
          else
            this.handleMousemove(ev);
        }
        ret = false;
        break;
      case 'touchend':
      case 'mouseup':
      case 'mouseout':
      case 'mouseleave':
        if (this.dragging) {
          elation.events.remove(this.options.eventparent, 'mousemove', this);
          elation.events.remove(this.options.eventparent, 'mouseup', this);
          elation.events.remove(this.options.eventparent, 'mouseleave', this);
          elation.events.remove(this.options.eventparent, 'touchmove', this);
          elation.events.remove(this.options.eventparent, 'touchend', this);
          //$(this.container).removeClass("state_dragging");
          this.dragging = false;
          if (this.options.onpanend)
            this.options.onpanend();
        }
        break;
      case 'mousewheel':
      case 'DOMMouseScroll':
        var zoom = ((ev.wheelDelta || (-1 * ev.detail)) > 0 ? 10/9 : 9/10);
        this.zoomBy(zoom, [(ev.clientX - this.viewportoffset[0]) / this.viewportsize[0], (ev.clientY - this.viewportoffset[1]) / this.viewportsize[1]]);
        ev.preventDefault();
        break;
      case 'gesturestart':
        if (!this.gesturing) {
          elation.events.add(ev.target, 'gesturechange', this);
          elation.events.add(ev.target, 'gestureend', this);
          this.gesturing = true;
          this.gesturescale = 1;
        }
        break;
      case 'gesturechange':
        //this.updateImage(this.scale * ev.scale);
        this.zoomBy(ev.scale, [.5,.5], false, this.scale * this.gesturescale);
        this.gesturescale = ev.scale;
        break;
      case 'gestureend':
        if (this.gesturing) {
          elation.events.remove(ev.target, 'gesturechange', this);
          elation.events.remove(ev.target, 'gestureend', this);
          this.gesturing = false;
        }
        this.zoomBy(ev.scale, [.5,.5], true, this.scale * this.gesturescale);
        this.gesturescale = 1;
        this.updateImage();
        break;
      case 'resize':
        this.viewportsize = [this.container.offsetWidth, this.container.offsetHeight];
        this.viewportoffset = elation.html.position(this.container);
        this.calculateMinScale();
        break;
      case 'keydown':
      case 'keypress':
      //case 'keyup':
        console.log(ev.type, ev);
        var panspeed = 20;
        switch (ev.keyCode) {
          case 37: // left
            this.panBy(panspeed, 0);
            break;
          case 38: // up
            this.panBy(0, panspeed);
            break;
          case 39: // right
            this.panBy(-panspeed, 0);
            break;
          case 40: // down
            this.panBy(0, -panspeed);
            break;
          case 43: // +
            this.zoomBy(10/9);
            break;
          case 45: // -
            this.zoomBy(9/10);
            break;
        }
        this.fixViewport();
        this.updateImage();
        break;
      case 'dblclick':
          //this.zoomBy(20/9, [(ev.clientX - this.viewportoffset[0]) / this.viewportsize[0], (ev.clientY - this.viewportoffset[1]) / this.viewportsize[1]]);
        break;
      case 'keyup':
        break;
      default:
          console.log('unhandled event:' + ev.type, ev);
    }
    if (ret == false) {
      ev.preventDefault();
    }
    return ret;
  }
  this.calculateMinScale = function() {
    if (this.options.minscale) {
      this.minscale = this.options.minscale;
    } else {
      var minscalex = this.viewportsize[0] / this.dimensions[0];
      var minscaley = this.viewportsize[1] / this.dimensions[1];
      this.minscale = Math.min(minscalex, minscaley);
    }
  }
  this.handleMousemove = function(ev) {
    var pos = [ev.clientX, ev.clientY];
    this.pos[0] += (pos[0] - this.lastpos[0]);
    this.pos[1] += (pos[1] - this.lastpos[1]);
    this.lastpos = pos;
    if (!this.redraw) {
      (function(self) {
        self.redraw = setTimeout(function() {
          self.redraw = false;
          self.fixViewport();
          self.updateImage();
        }, 10);
      })(this);
    }
    /*
    this.fixViewport();
    this.updateImage();
    */
  }
  this.fixViewport = function() {
    var scaledwidth = this.dimensions[0] * this.scale;
    var scaledheight = this.dimensions[1] * this.scale;
    
    //console.log([scaledwidth, scaledheight], this.viewportsize, [this.container.offsetWidth, this.container.offsetHeight]);
    if (scaledwidth < this.viewportsize[0]) {
      this.pos[0] = .5 * (this.viewportsize[0] - scaledwidth);
    } else {
      if (scaledwidth + this.pos[0] < this.viewportsize[0])
        this.pos[0] = -1 * scaledwidth + this.viewportsize[0];
      if (this.pos[0] > 0)
        this.pos[0] = 0;
    }

    if (scaledheight < this.viewportsize[1]) {
      this.pos[1] = .5 * (this.viewportsize[1] - scaledheight);
    } else {
      if (scaledheight + this.pos[1] < this.viewportsize[1]+1)
        this.pos[1] = -1 * scaledheight + this.viewportsize[1];
      if (this.pos[1] > 0)
        this.pos[1] = 0;
    }
  }
  this.panBy = function(panx, pany) {
    this.pos[0] += panx;
    this.pos[1] += pany;

    if (this.options.onpanend)
      this.options.onpanend();
  }
  this.zoomBy = function(zoom, zoompoint, sticky, oldscale) {
    //var scalediff = this.scale * -1 * zoom;
    //var newscale = this.scale - scalediff;
    if (typeof oldscale == 'undefined')
      oldscale = this.scale;
    var newscale = this.scale * zoom;
    if (newscale < this.minscale) {
      newscale = this.minscale;
    } else if (newscale > this.maxscale) {
      newscale = this.maxscale;
    }
    var bounds = this.getViewportBounds(oldscale);
    var newbounds = this.getViewportBounds(newscale);

    if (typeof zoompoint == 'undefined')
      zoompoint = [.5, .5];
    if (typeof sticky == 'undefined')
      sticky = true;

    var bpoint = [bounds[0][0] + ((bounds[1][0] - bounds[0][0]) * zoompoint[0]), bounds[0][1] + ((bounds[1][1] - bounds[0][1]) * zoompoint[1])];
    var npoint = [newbounds[0][0] + ((newbounds[1][0] - newbounds[0][0]) * zoompoint[0]), newbounds[0][1] + ((newbounds[1][1] - newbounds[0][1]) * zoompoint[1])];
    var diff = [bpoint[0] - npoint[0], bpoint[1] - npoint[1]];
    this.pos[0] -= (diff[0] * newscale);
    this.pos[1] -= (diff[1] * newscale);
    //console.log('bounds:',bounds,'newbounds:',newbounds,'bpoint:',bpoint,'difference:', diff);
    //console.log('bpoint:', bpoint);
    if (sticky) {
      this.scale = newscale;
      this.fixViewport();
      if (this.options.onzoomend)
        this.options.onzoomend();
    }
    this.updateImage(newscale);
  }
  this.zoomTo = function(scale, pos) {
    this.scale = Math.pow(2, this.level) / this.container.offsetWidth;
    this.updateImage();
  }
  this.getViewportBounds = function(scale) {
    if (typeof scale == 'undefined')
      scale = this.scale;
    //    alert(this.pos[0] + ", " + this.pos[1]);
    var tl = [(-1 * this.pos[0] / scale), (-1 * this.pos[1] / scale)];
    var br = [tl[0] + (this.viewportsize[0] / scale), tl[1] + (this.viewportsize[1] / scale)];
    return [tl, br];
  }
  this.updateImage = function(scale) {
    if (typeof scale == 'undefined')
      scale = this.scale;
    /*
    if (this.options.usetransforms) {
      this.zoomable.style.MozTransform = 'translate(' + this.pos[0] + 'px, ' + this.pos[1] + 'px) scale(' + scale + ')';
      this.zoomable.style.WebkitTransform = 'translate(' + this.pos[0] + 'px, ' + this.pos[1] + 'px) scale(' + scale + ')';
    } else {
    */
    if (this.transformtype == "zoom") {
      // FIXME - IE7 and IE8 just have to be different.  IE8 wants offset to be scaled, IE7 doesn't.
      this.zoomable.style.zoom = (scale * 100) + "%";
      if (this.options.offsetscale) {
        this.zoomable.style.left = (this.pos[0] / scale) + 'px';
        this.zoomable.style.top = (this.pos[1] / scale) + 'px';
      } else {
        this.zoomable.style.left = (this.pos[0]) + 'px';
        this.zoomable.style.top = (this.pos[1]) + 'px';
      }
    } else {
      this.zoomable.style[this.transformtype] = 'translate(' + this.pos[0] + 'px, ' + this.pos[1] + 'px) scale(' + scale + ')';
    }
  }
  this.getTransformProperty = function() {
      var properties = ['transform', 'WebkitTransform', 'MozTransform', 'zoom'];
    var p;
    while (p = properties.shift()) {
      if (typeof this.zoomable.style[p] != 'undefined') {
        this.transformtype = p;
        break;
      }
    }
    return this.transformtype;;
  }

  this.init();
}
