elation.extend("ui.panel", function(parent, args, extras) {
  this.parent = parent;
  this.args = args;
  this.extras = extras;
  this.items = {};

  this.initialize = function(parent, args) {
    this.container = document.createElement('DIV');
    this.content = document.createElement('UL');
    //this.orientation = 'left'; // FIXME - this should be determined from the "anchor" parameter, or specified separately
    this.orientation = args.orientation || 'vertical';
    this.attach = args.attach || 'left';
    this.parentid = args.parentid || null;
    this.size = args.size || 'normal';
    this.type = args.type || 'slideout';
    this.collapsible = args.collapsible || false;
    this.content.className = 'ui_panel_content';
    this.classname = this.getClass();
    this.container.className = this.classname;
    this.container.appendChild(this.content);


    if (args) {
      this.anchor = args.anchor || 'top_left';
      this.offset = args.offset || [10, 10];

      if (args.id) {
        this.container.id = this.id = args.id;
      }

      if (this.collapsible) {
        this.handle = new elation.ui.panel.handle(this, args.handle);
      }

      if (args.items) {
        for (var k in args.items) {
          this.items[k] = new elation.ui.panel.item(this, args.items[k], {name: k});
        };
      }
    }

    return this.container;
  }
  this.getClass = function() {
    var classname = 'ui_panel';
    if (this.collapsible)
      classname += ' ui_panel_collapsible';
    if (this.orientation)
      classname += ' orientation_' + this.orientation;
    if (this.attach)
      classname += ' attach_' + this.attach;
    if (this.size)
      classname += ' size_' + this.size;
    if (this.type)
      classname += ' ui_panel_type_' + this.type;

    return classname;
  }

  this.initialize(parent, args);
});
elation.extend("ui.panel.handle", function (parent, args, extras) {
  this.parent = parent;
  this.args = args || {};
  this.extras = extras;

  // defaults
  this.togglestate = 1;
  this.gutter = 0;
  this.collapsetime = 350;
  this.collapsestyle = 'swing';
  this.label = '';
  this.type = 'slideout';
  this.attach = 'left';

    //this.orientation = this.orientations[this.parent.orientation];
  
  this.orientations = { 
    'left':   { 'margin': 'marginLeft',   'dimension': 'width' },
    'right':  { 'margin': 'marginRight',  'dimension': 'width' },
    'top':    { 'margin': 'marginTop',    'dimension': 'height' },
    'bottom': { 'margin': 'marginBottom', 'dimension': 'height' } // FIXME - bottom attachment doesn't work right
  };

  this.initialize = function(parent, args) {
    if (args) {
      this.gutter = args.gutter || this.gutter;
      this.collapsetime = args.collapsetime || this.collapsetime;
      this.collapsestyle = args.collapsestyle || this.collapsestyle;
      this.label = args.label || this.label;
      this.type = args.type || this.type;
      this.attach = args.attach || this.parent.attach || this.attach;
    }
    this.classname = this.getClass();
    this.element = document.createElement('DIV');
    this.element.className = this.classname;
    this.element.innerHTML = this.label;

    $(this.element).bind("mousedown", this, function (ev) {
    });
    $(this.element).bind("click", this, function (ev) {
      ev.data.toggle();
    });
    // FIXME - this doesn't work on the touchscreen
    if (this.args.autocollapse) {
      $(this.parent.container).bind("mouseleave", this, function (ev) {
        ev.data.collapse();
      });
    }

    this.parent.container.appendChild(this.element);
    if (this.args.collapsed) {
      var self = this;
      $(document).ready(function() {
        self.collapse(true);
      });
    }
  }
  this.getClass = function() {
    var classname = this.args.classname || 'ui_panel_handle';
    return classname;
  }
  this.toggle = function(instant) {
    if (this.togglestate)
      this.collapse(instant);
    else
      this.expand(instant);
  }
  this.collapse = function(instant) {
    if (this.togglestate != 0) {
      var element;
      if (this.parent.type == "slidein")
        element = this.parent.content;
      else
        element = this.parent.container;
      var panelelement = $(element);

      var dims = {'width': panelelement.width(), 'height': panelelement.height() };
      var orient = this.orientations[this.attach];
      var size = dims[orient.dimension];
      
      var css = {};
      css[orient.margin] = '-' + (size - this.gutter) + 'px';
//css.width = 0;
      if (instant) {
        if (elation.browser.type == "iphone" || elation.browser.type == "android")
          element.style.webkitTransform = "translateX(" + css[orient.margin] + ")";
        else 
          panelelement.css(css);
      } else {
        if (elation.browser.type == "iphone" || elation.browser.type == "android") {
          element.style.webkitTransition = "-webkit-transform " + this.collapsetime + "ms ease";
          element.style.webkitTransform = "translateX(" + css[orient.margin] + ")";
        } else {
          panelelement.animate(css, this.collapsetime, this.collapsestyle);
        }
      }
      this.togglestate = 0;
    }
  }
  this.expand = function(instant) {
    if (this.togglestate != 1) {
      var element;
      if (this.parent.type == "slidein")
        element = this.parent.content;
      else
        element = this.parent.container;
      var panelelement = $(element);
      var orient = this.orientations[this.attach];

      var css = {};
      css[orient.margin] = 0;

      if (instant) {
        if (elation.browser.type == "iphone" || elation.browser.type == "android")
          element.style.webkitTransform = "translateX(0)";
        else
          panelelement.css(css);
      } else {
        if (elation.browser.type == "iphone" || elation.browser.type == "android") {
          element.style.webkitTransition = "-webkit-transform " + this.collapsetime + "ms ease";
          element.style.webkitTransform = "translateX(0)";
        } else {
          panelelement.animate(css, this.collapsetime, this.collapsestyle);
        }
      }
      this.togglestate = 1;
    }
  }
  this.initialize(parent, args);
});

elation.extend("ui.panel.item", function(parent, args, extras) {
  this.parent = parent;
  this.args = args;
  this.extras = extras;

  this.initialize = function(parent, args) {
    this.id = args.id || null;
    this.tag = args.tag || 'a';
    this.href = args.href || '';
    this.type = args.type || 'none';
    this.label = args.label || '';
    this.status = args.status || 'default';
    this.component = args.component || null;
    this.classname = this.getClass();
    this.container = document.createElement("LI");
    this.element = document.createElement(this.tag);
    this.container.className = this.classname;

    if (this.href != '')
      this.element.href = this.href;

    this.element.innerHTML = this.label;

    if (this.type == "component" && this.component) {
      if (!this.id)
        this.id = this.parent.id + "_" + this.extras.name;
      ajaxlib.Get('/'+this.component.replace(/\./g, '/') + '.ajax?targetid=' + this.id); 
    }

    if (args.click) { 
      $(this.element).bind("click", this, args.click);
    }

    if (this.id)
      this.container.id = this.id;

    this.container.appendChild(this.element);
    if (parent.content) {
      parent.content.appendChild(this.container);
    }
//console.log('created new UIPanelItem:', this);
    return this.element;
  }
  this.getClass = function() {
    var classname = args.classname || 'ui_panel_item';
    if (this.type)
      classname += " ui_panel_item_" + this.type;

    return classname;
  }

  this.setStatus = function(status) {
    if (status != this.status) {
      $(this.element).removeClass('status_'+this.status);
      this.status = status;
      $(this.element).addClass('status_'+this.status);
    }
  }
  this.initialize(parent, args);
});
elation.extend("ui.panel.slideout", function(parentdiv, args) {
  var template = '<div class="ui_panel_slideout"><div class="ui_panel_slideout_handle"></div><div class="ui_panel_slideout_content"></div></div>';

  this.init = function (parentdiv, args) {
    this.parent = parent;
    this.args = args;
    this.div = $(this.template);
    parentdiv.appendChild(this.div);
  }
  this.expand = function () {
    
  }

  this.init(parentdiv, args);
});

elation.extend("ui.buttonize", function(parent, args) {
  this.parent = parent;
  this.classname = elation.utils.arrayget(args, 'classname') ? args.classname : 'tf_ui_button';
  this.nudge = elation.utils.arrayget(args, 'nudge') ? args.nudge : 'both';
  this.click_callback = elation.utils.arrayget(args, 'click_callback') ? args.click_callback : false;
  
  this.init = function() {
    switch (this.nudge) {
      case 'both': this.nudge_right = true; this.nudge_down = true; break;
      case 'down': this.nudge_right = false; this.nudge_down = true; break;
      case 'right': this.nudge_right = true; this.nudge_down = false; break;
      case 'none': this.nudge_right = false; this.nudge_down = false; break;
    }
    
    elation.events.add(this.parent, 'mousedown,mouseover,mouseout,selectstart', this);
    
    if (this.click_callback)
      elation.events.add(this.parent, 'click', this);
  }
  this.nudger = function(target, nudge) {
    var css = {};
    
    if (this.nudge_down)
      css.marginTop = parseInt($TF(target).css("marginTop")) + (nudge?1:-1) +'px';
    
    if (this.nudge_right)
      css.marginLeft = parseInt($TF(target).css("marginLeft")) + (nudge?1:-1) +'px';
    
    $TF(target).css(css);
  }
	this.handleEvent = function(event) {
		var event = event || window.event,
				target = elation.events.getTarget(event),
				type = event.type == 'DOMMouseScroll' ? 'mousewheel' : event.type;
		
		if (typeof this[type] == 'function')
			return this[type](event, target);
	}
  this.click = function(event, target) {
    if (this.click_callback)
      this.click_callback(event, target);
  }
	this.mousedown = function(event, target) {
    elation.events.add(document, "mouseup", this);
    var target = this.parent;
    
    if (this.nudge)
      this.nudger(target, true);
    
    elation.html.addclass(target, this.classname+'_down');
		event.preventDefault();
	}
	this.mouseup = function(event, target) {
    elation.events.remove(document, "mouseup", this);
    var target = this.parent;
    
    if (this.nudge)
      this.nudger(target, false);
    
    elation.html.removeclass(target, this.classname+'_down');
	}
	this.mouseover = function(event, target) {
		target = this.parent;
		
		elation.html.addclass(target, this.classname+'_hover');
	}
	this.mouseout = function(event, target) {
		target = this.parent;
		
		elation.html.removeclass(target, this.classname+'_hover');
	}
  this.selectstart = function(e) {
    e.preventDefault();
    return false;
  }
  
  this.init();
});

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

elation.component.add('ui.button', {
  init: function(name, container, args) {
    args = args || {};
    this.tag = args.tag || "BUTTON";
    this.classname = args.classname || "";
    this.title = args.title || false;
    this.draggable = args.draggable || false;
    this.events = args.events || {}

    if (typeof(container) != 'undefined') {
      this.label = args.label || container.innerHTML || "Submit";
      container.innerHTML = "";
      this.addTo(container);
    } else {
      this.label = args.label || "Submit";
    }
  },
  create: function() {
    this.element = document.createElement(this.tag);
    this.element.innerHTML = this.label;
    var classname = '';
    if (this.draggable) {
      classname = 'elation_ui_button_draggable';
      this.element.draggable = true;
    }
    classname += this.classname;
    this.element.className = classname;
    if (this.title)
      this.element.title = this.title;

    for (var k in this.events) {
      elation.events.add(this.element, k, this.events[k]);
    }
  },
  addTo: function(container) {
    if (typeof container != 'undefined') {
      if (!this.element)
        this.create();
      container.appendChild(this.element);
      return true;
    }
    return false;
  },
  setLabel: function(label) {
    this.label = label;
    if (this.element)
      this.element.innerHTML = label;
  }
});

elation.component.add("ui.toggle", {
  init: function(name, container, args) {
    this.panels = container.getElementsByClassName("ui_toggle_panel");
    this.formname = args.formname;
    for (var i = 0; i < this.panels.length; i++) {
      var inputs = this.panels[i].getElementsByTagName("INPUT");
      for (var j = 0; j < inputs.length; j++) {
        if (inputs[j].name == this.formname) {
          elation.events.add(inputs[j], "click,change", this);
        }
      }
    }
    this.setActivePanel();
  },
  handleEvent: function(ev) {
    this.setActivePanel();
  },
  setActivePanel: function() {
    for (var i = 0; i < this.panels.length; i++) {
      var selected = false;
      var inputs = this.panels[i].getElementsByTagName("INPUT");
      for (var j = 0; j < inputs.length; j++) {
        if (inputs[j].name == this.formname && inputs[j].checked) {
          selected = true;
        }
      }
      if (selected) {
        elation.html.addclass(this.panels[i], "state_selected");
      } else {
        elation.html.removeclass(this.panels[i], "state_selected");
      }
    }
  }
});

/*
 * This function will checkall / uncheckall the checkboxes in a form.
 * state: true (check), false (uncheck)
 */
elation.extend("ui.checkall", function checkall(link, state) {
  while (link.tagName != 'FORM')
    link = link.parentNode;

  var	form = link,
			inputs = form.getElementsByTagName('input'),
			checkboxes = new Array();

	for (i=0; i<inputs.length; i++)
		if (inputs[i].type == 'checkbox')
			inputs[i].checked = state;
});