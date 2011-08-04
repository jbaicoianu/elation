elation.component.add("ui.scrollable", {
  timeinfo: {buckets: [], counter: 0, num: 20},

  init: function(name, parent, args) {
    if (typeof args.element == 'string')
      this.element = document.getElementById(args.element);
    else if (elation.utils.iselement(args.element))
      this.element = args.element;
    else if (elation.utils.iselement(parent))
      this.element = parent;
    
    this.orientation = args.orientation || 'vertical';
    if (this.element) {
      $(this.element).addClass("ui_scrollable").addClass("orientation_"+this.orientation);
      this.element.scrollTop = 0;
      this.element.scrollLeft = 0;

      elation.events.add(this.element, 'mousedown', this);
      elation.events.add(this.element, 'touchstart', this);
    } else {
      console.log('ui.scrollable: Failed to initialize, no element passed');
    }
  },

  handleEvent: function(ev) {
    switch(ev.type) {
      case 'mousedown':
      case 'touchstart':
        this.handleMouseDown(ev);
        break;
      case 'mousemove':
      case 'touchmove':
        this.handleMouseMove(ev);
        break;
      case 'mouseup':
      case 'mouseleave':
      case 'touchend':
        this.handleMouseUp(ev);
        break;
      case 'click':
        this.handleClick(ev);
        break;
    }
  },

  handleMouseDown: function(ev) {
    elation.events.add(document, "mousemove", this);
    elation.events.add(document, "mouseleave", this);
    elation.events.add(document, "mouseup", this);
    elation.events.add(document, "touchmove", this);
    elation.events.add(document, "touchend", this);

    var xy = this.getEventXY(ev);
    this.startx = xy[0];
    this.starty = xy[1];
    this.startscrollx = this.element.scrollLeft;
    this.startscrolly = this.element.scrollTop;
    this.cancelclick  = false;
    this.timeinfo.buckets = [];
    this.timeinfo.counter = 0;
    this.timeinfo.buckets[this.timeinfo.counter++ % this.timeinfo.num] = {time: ev.timeStamp, x: xy[0], y: xy[1]};

    ev.preventDefault();
  },
  handleMouseMove: function(ev) {
    var xy = this.getEventXY(ev);
    var movedx = this.startx - xy[0];
    var movedy = this.startx - xy[1];
    this.element.scrollLeft = this.startscrollx + movedx;
    this.element.scrollTop = this.startscrolly + movedy;

    this.timeinfo.buckets[this.timeinfo.counter++ % this.timeinfo.num] = {time: ev.timeStamp, x: xy[0], y: xy[1]};

    if (!this.cancelclick) {
      this.cancelclick = true;
      elation.events.add(this.element, 'click', this);
    }
    ev.preventDefault();
  },
  handleMouseUp: function(ev) {
    elation.events.remove(document, 'touchmove', this);
    elation.events.remove(document, 'touchend', this);
    elation.events.remove(document, 'mousemove', this);
    elation.events.remove(document, 'mouseup', this);
    elation.events.remove(document, 'mouseleave', this);
    //console.log("TOTAL: " + (this.startmove - ev.pageY));

    var flick = this.getFlickSpeed();
    this.animateFlick(flick);

    ev.preventDefault();
    ev.stopPropagation();
    return false;
  },
  handleMouseWheel: function(ev) {
  },
  handleClick: function(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    return false;
  },
  getEventXY: function(ev) {
    var x, y;
    if (ev.touches) {
      x = ev.touches[0].clientX;
      y = ev.touches[0].clientY;
    } else {
      x = ev.clientX;
      y = ev.clientY;
    }
    return [x, y];
  },
  getFlickSpeed: function() {
    // Figure out start/stop for ringbuffer, then use it to calculate average speed over the last 50ms
    var istart = (this.timeinfo.counter >= this.timeinfo.num ? this.timeinfo.counter % this.timeinfo.num : 0);
    var iend = (this.timeinfo.counter - 1) % this.timeinfo.num;
    var tmin = this.timeinfo.buckets[istart].time;
    var tmax = this.timeinfo.buckets[iend].time;
    var maxint = 100;
    var tinterval = (tmax - tmin > maxint ? maxint : tmax - tmin);

    var lastindex = (istart > 0 ? istart : (this.timeinfo.counter < this.timeinfo.num ? 0 : this.timeinfo.num )) - 1;

    var sum = 0;
    for (var i = istart; i != iend; i = (i < this.timeinfo.num - 1 ? i + 1 : 0)) {
      if (this.timeinfo.buckets[i].time >= tmax - tinterval) {
        if (lastindex == -1)
          sum += this.starty - this.timeinfo.buckets[i].y;
        else
          sum += this.timeinfo.buckets[lastindex].y - this.timeinfo.buckets[i].y;
      }
      lastindex = i;
    }

    // Figure out how far the flick would go if left to go at its current speed (speed is in pixels/sec)
    speed = (sum / tinterval) * 1000;
    var dir = Math.abs(speed) / speed;
    var mass = 100;
    var friction = 0.2;
    var accel = -1 * friction * mass * 9.8;
    var distance = (speed * speed) / (-2 * accel);

    return {time: 500, direction: dir, distance: distance, speed: speed, t: new Date()};
  },
  
  animateFlick: function(flick) {
    var t = new Date();
    if (flick) {
      this.flick = flick;
    } else { 
      flick = this.flick;
    }

    if (flick.time > 0 && flick.distance > 0) {
      var move = Math.sqrt(flick.distance) * flick.direction;
      this.element.scrollTop += move;
      flick.distance -= move; 
      flick.time -= t - flick.t;
      (function(self) {
        self.timer = setTimeout(function() { self.animateFlick(); }, 10); 
      }(this));
      flick.t = t;
    }
  }
});


