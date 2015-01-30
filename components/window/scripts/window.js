elation.require(['ui.base', 'ui.button', 'ui.buttonbar'], function() {
  elation.requireCSS('window');
    elation.extend("window.manager", new function() {
    this.defaultcontainer = {tag: 'div', classname: 'windows'};
    this.init = function() {
			console.log('WindowManager', this);
			this.windows = [];
			this.windowmap = {};
			this.zIndexStart = 100;
			elation.events.add(null, 'window_focus', this);
    }

    this.handleEvent = function(event) {
    	this[event.type](event);
    }

    this.window_focus = function(event) {
 			var item = -1;

    	for (var i=0; i<this.windows.length; i++) {
    		if (!this.windows[i].visible || this.windows[i].args.ontop)
    			continue;

    		if (this.windows[i] == event.element) {
    			var item = i;
    		} else {
    			this.windows[i].blur();
    		}
    	}

    	if (item >= 0) {
	    	item = this.windows.splice(item, 1)[0];
	    	this.windows.push(item);

	    	for (var i=0; i<this.windows.length; i++) {
					this.windows[i].container.style.zIndex = this.zIndexStart + i;
				}
			}
    }

    this.add = function(name, item) {
    	if (item.args.ontop)
    		item.container.style.zIndex = (this.zIndexStart * 10) + this.windows.length;
    	else
				item.container.style.zIndex = this.zIndexStart + this.windows.length;
			
			this.windowmap[name] = this.windows.length;
    	this.windows.push(item);
    }

    this.remove = function(name) {
    	var item = this.get(name);

    	if (item.visible)
    		item.close();

    	if (item.container.parent)
    		item.container.parent.removeChild(item.container);

    	this.windows[index] = null;
    	delete this.windowmap[name];
    	delete item;
    }

    this.get = function(name) {
    	var index = this.windowmap[name],
	   			item = this.windows[index];

	   	return item;
    }

    this.init();
  });

	elation.component.add("window.create", function() {
    this.defaultcontainer = { tag: 'div', classname: 'window' };
		this.defaults = {
			content: '',					// (String|Component|HTMLElement) 
			parent: false,				// (Component|Element)
			append: false,				// (Component|Element) append.appendChild(window)
			before: false,				// (Component|Element) append.insertBefore(window, before)
			title: false,					// (String) Window title, requires titlebar, defaults to window name
			titlebar: false,			// (Boolean)
			btnClose: false, 			// (Boolean)
			btnMaximize: false,		// (Boolean)
			btnMinimize: false,		// (Boolean)
			btnResize: false,			// (Boolean)
			rendering: 'center',	// (String) auto, absolute, fixed, center, css
			bounds: false,				// (String|Component|HTMLElement) none, window, object
			resizable: false,			// (Boolean)
			moveable: false, 			// (Boolean)
			ontop: false, 				// (Boolean)
			lightbox: false,			// (Boolean)
			animation: 'expand',	// (String) slide, sweep, roll, explode, fade, none
			transition: false,		// (String) Overwrite css transition with a js one
			align: 'center',			// (String) top, left, right, bottom, center, auto
			margin: 20,						// (Integer) pixels to pad alignment
			tail: false,					// (Boolean)
			tail_anchor: false,		// (Component|Element) default = parent
			show_callback: false, // (Function) Executes on .show()
			hide_callback: false,	// (Function) Executes on .hide()
			event: 'click'				// (String) If set, <event> on <parent> will .toggle() window
		};

		this.init = function() {
			var args = this.args, 
					utils = elation.utils,
					isTrue = utils.isTrue, 
					isString = utils.isString;

			console.log('### Window', this.name, this);
			elation.html.addclass(this.container, this.name.replace(".","_") + (typeof this.id == 'string' ? ' '+this.id : ''));

			if (args.parent)
				this.parent = elation.utils.getContainerElement(args.parent);

			if (args.lightbox)
				this.lightbox = elation.window.options.lightbox(name, null, { parent: this });

			if (args.tail)
				this.tail = elation.window.options.tail(name, this.container, this.args);

			if (args.title || isTrue(args.btnClose) || isTrue(args.btnMaximize) || 
					isTrue(args.btnMinimize) || isTrue(args.btnResize))
				args.titlebar = true;

			if (args.titlebar)
				this.titlebar = elation.window.options.titlebar(name, null, { parent: this });

			if (args.moveable)
				this.moveable = elation.ui.moveable(name, this.container, { handle: this.titlebar });

			if (args.resizable)
				this.resizable = elation.window.options.resizable(name, null, { append: this });

			if (args.align != 'none')
				this.alignment = elation.window.rendering.alignment(name, this.container, this.args);
			
			this.rendering = elation.window.rendering[args.rendering](name, this.container, this.args);

			elation.events.add(this.container, 'mousedown', this);
      elation.window.manager.add(args.name, this);
		}

		this.setContent = function(content) {
			var content = content || this.args.content;

			this.container.innerHTML = '';
			elation.html.setContent(this, this.resizable, true);
			elation.html.setContent(this, this.titlebar, true);
			this.content_container = elation.html.create('div');
			elation.html.setContent(this.content_container, content, true);

			elation.html.addclass(this.content_container, 'window_content');
			this.container.appendChild(this.content_container);
		}

		this.open = function(content) {
			if (this.lightbox)
				this.lightbox.show();

			this.container.style.visibility = 'hidden';
			this.setContent(content);

			(function(self) {
				setTimeout(function(){
					self.show();
		      self.visible = true;
		     	self.refresh();
					elation.events.fire('window_show', self);
					self.container.style.visibility = 'visible';
				}, 1);
			})(this);
		}
		this.close = function() {
			if (this.lightbox)
				this.lightbox.hide();
			
			this.hide();
      this.visible = false;

			elation.events.fire('window_hide', this);
		}

    this.focus = function() {
      if (!this.active) {
        this.active = true;
        elation.html.addclass(this.container, 'state_active');
        elation.events.fire({type: 'window_focus', element: this});
      }
    }

    this.blur = function() {
      if (this.active) {
        this.active = false;
        elation.html.removeclass(this.container, 'state_active');
        elation.events.fire({type: 'window_blur', element: this});
      }
    }

    this.mousedown = function(ev) {
      this.focus();
    }

		this.render = function() {
			var dc = elation.html.dimensions(this.container),
					dp = elation.html.dimensions(this.args.parent),
					dw = elation.html.dimensions(window);
			
			dc = this.rendering.position(dc, dp, dw);
			
			if (this.alignment)
				dc = this.alignment.position(dc, dp, dw);
			
			elation.html.css(this.container, {
      	position: dc.positioning,
	      top: dc.y + 'px',
	      left: dc.x + 'px'
	    });
		}
	}, elation.ui.base);

	elation.component.add("ui.moveable", function() {
		this.init = function() {
			console.log('ui.moveable',this);
			this.handle = this.args.handle.container || this.container;
      elation.html.addclass(this.container, 'moveable');
			elation.events.add(this.handle, 'mousedown,touchstart', this);
		}

    this.mousedown = function(ev) {
      this.coords = elation.events.coords(ev);
      this.dimensions = elation.html.dimensions(this.container);

      elation.events.remove(window, 'touchmove,touchend,mousemove,mouseup', this);
      elation.events.add(window, 'touchmove,touchend,mousemove,mouseup', this);
      elation.events.fire({ type: 'ui_moveable_start', element: this });
    }

    this.mousemove = function(ev, delta) {
      var current = elation.events.coords(ev),
          delta = delta || {
            x: current.x - this.coords.x, 
            y: current.y - this.coords.y
          },
          position = {
            x: this.dimensions.x + delta.x,
            y: this.dimensions.y + delta.y
          };

      elation.html.css(this.container, {
      	top: position.y+'px',
      	left: position.x+'px'
      });
    }
    this.mouseup = function(ev) {
      elation.events.fire({ type: 'ui_moveable_end', element: this });
      elation.events.remove(window, 'touchmove,touchend,mousemove,mouseup', this);
    }
	});

	elation.component.add("window.options.titlebar", function() {
    this.defaultcontainer = { tag: 'div', classname: 'window_titlebar' };
    this.init = function() {
			this.labels = {
        minimize: '–',
        maximize: '□',
        restore: '₪',
        close: 'x'
      };

    	var args = this.args.parent.args, 
    			create = elation.html.create,
      		buttons = {};

      elation.html.addclass(this.args.parent.container, 'hasTitlebar');

    	if (elation.utils.isString(args.title))
    		create({ tag: 'span', classname: 'window_titlebar_span', append: this, content: args.title });

    	for (var key in this.labels) {
    		var button = key[0].toUpperCase() + key.slice(1, key.length);

    		if (elation.utils.isTrue(args['btn'+button]) && key != 'restore') {
    			buttons[key] = {
    				label: this.labels[key],
    				classname: 'window_controls_'+key,
    				events: { click: elation.bind(this, this[key]) }
    			};
    		}
    	}

      this.controls = elation.ui.buttonbar(null, elation.html.create({classname: 'window_controls'}), {
        buttons: buttons,
        append: this
      });

      elation.html.addclass(this.container, 'window_withcontrols');
    }

    this.maximize = function(event) {

    };

    this.minimize = function(event) {

    };

    this.close = function(event) { 
    	console.log('close', event, this); 
    	this.args.parent.close(); 
    };
	});

	elation.component.add("window.options.tail", function() {
		this.init = function() { 
			switch (this.args.align) {
				case 'left': 	this.alignment = 'right'; break;
				case 'right': this.alignment = 'left'; 	break;
				case 'up': 		this.alignment = 'down'; 	break;
				case 'down': 	this.alignment = 'up'; 		break;
			}

			elation.html.addclass(this.container, 'window_tail window_tail_'+this.alignment);
		}
	});

	elation.component.add("window.options.lightbox", function() {
    this.defaultcontainer = {tag: 'div', classname: 'window_lightbox'};
		this.init = function() { 
			console.log('window.options.lightbox', this);

			if (elation.utils.arrayget(this, 'args.parent.name') == 'window.modal')
				this.container.style.zIndex = 999;
			else
				elation.events.add(this.container, 'click', this);
		}
		this.show = function() {
			document.body.appendChild(this.container);
		}
		this.hide = function() {
			document.body.removeChild(this.container);
		}
		this.click = function(ev) {
			this.args.parent.close();
		}
	});

	elation.component.add("window.options.resizable", function() {
    this.defaultcontainer = {tag: 'div', classname: 'window_resize_container'};
		this.init = function() { 
			console.log('window.options.resizable', this);
			this.dim_array = ['x','y','w','h'];
			this.border_size = 7;
			this.corner_size = 25;
      this.dragging = false;
      this.parent = this.args.append.container;

      elation.html.addclass(this.parent, 'resizable');

      elation.html.css(this.container, {
      	top: 0 - this.border_size + 'px',
      	left: 0 - this.border_size + 'px',
      	right: 0 - this.border_size + 'px',
      	bottom: 0 - this.border_size + 'px',
      })

			elation.events.add(this.container, 'mousedown,mouseover,mouseout', this);
		}

    this.mousedown = function(ev) {
      this.coords = elation.events.coords(ev);
      this.dimensions = elation.html.dimensions(this.container);
    	this.direction = this.getDirection(this.coords);
      this.dragging = true;

      elation.events.add(window, 'mouseup', this);
      elation.events.fire({ type: 'ui_resize_start', element: this });
    }

    this.mousemove = function(ev, delta) {
      var coords = m = elation.events.coords(ev);

      if (this.dragging) {
	      var dim = this.dimensions,
	      		bsq = this.border_size * 2,
	      		delta = {
		          x: coords.x - this.coords.x, 
		          y: coords.y - this.coords.y
		        };

        switch (this.direction) {
        	case 'nw': dim.h -= delta.y; dim.y += delta.y; dim.w -= delta.x; dim.x += delta.x; break;
        	case 'ne': dim.h -= delta.y; dim.y += delta.y; dim.w += delta.x; break;
        	case 'sw': dim.h += delta.y; dim.w -= delta.x; dim.x += delta.x; break;
        	case 'se': dim.w += delta.x; dim.h += delta.y; break;
        	case 'n': dim.h -= delta.y; dim.y += delta.y; break;
        	case 'e': dim.w += delta.x; break;
        	case 'w': dim.w -= delta.x; dim.x += delta.x; break;
        	case 's': dim.h += delta.y; break;
        }

	      console.log('drag', ev.type, direction, dim);

	      elation.html.css(this.parent, {
	      	top: dim.y + this.border_size + 'px',
	      	left: dim.x + this.border_size + 'px',
	      	width: dim.w - bsq + 'px',
	      	height: dim.h - bsq + 'px'
	      });

	      this.coords = coords;
      } else {
    		var direction = this.getDirection(m);
      	cursor = direction ? direction + '-resize' : '';
	    	this.container.style.cursor = cursor;
    	}
    }

    this.mouseup = function(ev) {
      console.log('resize', ev.type, this.dragging);
      this.dragging = false;
      this.dimensions = null;
      elation.events.fire({ type: 'ui_resize_end', element: this });
      //elation.events.remove(window, 'mousemove,mouseup', this);
    }

    this.mouseover = function(ev) {
    	console.log('resize', ev.type, this.dragging);
    	if (this.dragging == false) {
      	elation.events.add(window, 'mousemove,mouseup', this);
    	}
    }

    this.mouseout = function(ev) {
    	console.log('resize', ev.type, ev, this.dragging);
    	if (this.dragging == false) {
    		this.container.style.cursor = '';
      	elation.events.remove(window, 'mousemove,mouseup', this);
    	}
    }

    this.getDirection = function(m, d) {
      var bs = this.border_size, cs = this.corner_size,
      		d = d || this.dimensions || elation.html.dimensions(this.container),
      		dxw = (d.x + d.w), dxy = (d.y + d.h),
      		dir = '';

      // calculations to determine if mouse is over corner or side for resizing
      		 if (m.x > d.x - bs && m.x < d.x + cs && m.y > d.y - bs && m.y < d.y + cs) dir = 'nw';
    	else if (m.x > dxw - cs && m.x < dxw + bs && m.y > d.y - bs && m.y < d.y + cs) dir = 'ne';
    	else if (m.x > dxw - cs && m.x < dxw + bs && m.y > dxy - cs && m.y < dxy + bs) dir = 'se';
    	else if (m.x > d.x - bs && m.x < d.x + cs && m.y > dxy - cs && m.y < dxy + bs) dir = 'sw';
      else if (m.y > d.y - bs && m.y < d.y + cs) dir = 'n';
      else if (m.x > dxw - cs && m.x < dxw + bs) dir = 'e';
	    else if (m.x > d.x - bs && m.x < d.x + cs) dir = 'w';
      else if (m.y > dxy - cs && m.y < dxy + bs) dir = 's';

      return dir;
    }
	});

	elation.component.add("window.rendering.absolute", function() {
		this.position = function(dc, dp, dw) {
			dc.positioning = 'absolute';
			dc.y = this.args.parent ? dp.y : dw.h >> 1;
			dc.x = this.args.parent ? dp.x : dw.w >> 1;

	    return dc;
		}
	});

	elation.component.add("window.rendering.relative", function() {
		this.init = function() { console.log('window.rendering.relative', this); }
	});

	elation.component.add("window.rendering.fixed", function() {
		this.position = function(dc, dp, dw) {
      var index = elation.window.manager.windows.length;

			dc.positioning = 'fixed';
			dc.y = 50 + (30 * index);
			dc.x = 100 + (30 * index);

	    return dc;
		}
	});

	elation.component.add("window.rendering.center", function() {
		this.position = function(dc, dp, dw) {
			dc.positioning = 'fixed';
			dc.y = dw.h >> 1;
			dc.x = dw.w >> 1;

	    return dc;
		}
	});

	elation.component.add("window.rendering.css", function() {
		this.init = function() { console.log('window.rendering.css', this); }
	});

	elation.component.add("window.rendering.alignment", function() {
		this.position = function(dc, dp, dw) {
			var top = 0, left = 0;

			switch (this.args.align) {
				case 'top':
					top = -dc.h - this.args.margin;
					left = (dp.w >> 1) - (dc.w >> 1);
					break;
				case 'bottom':
					top = dp.h + this.args.margin ;
					left = (dp.w >> 1) - (dc.w >> 1);
					break;
				case 'left':
					top = (dp.h >> 1) + -(dc.h >> 1);
					left = -dc.w - this.args.margin;
					break;
				case 'right':
					top = (dp.h >> 1) + -(dc.h >> 1);
					left = dp.w + this.args.margin;
					break;
				default:
					top = -(dc.h >> 1);
					left = -(dc.w >> 1);
			}

			dc.y += top;
			dc.x += left;

      return dc;
		}
	});

	elation.component.add("window.dialog", function() {
		this.defaults = {
			rendering: 'fixed',
			align: 'none',
			btnClose: true,
			lightbox: true,
			moveable: true
		};
		this.init = function() {
      elation.window.dialog.extendclass.init.call(this);
		}
	}, elation.window.create);

	elation.component.add("window.infobox", function() {
		this.defaults = {
			rendering: 'absolute',
			align: 'right',
			moveable: false,
			resizable: false,
			titlebar: false,
			title: false,
			tail: true
		};
		this.init = function() {
      elation.window.dialog.extendclass.init.call(this);
		}
	}, elation.window.create);

	elation.component.add("window.window", function() {
		this.defaults = {
			rendering: 'fixed',
			align: 'none',
			titlebar: true,
			title: 'Window',
			btnClose: true,
			btnMaximize: true,
			btnMinimize: true,
			resizable: true,
			moveable: true
		};
		this.init = function() {
			console.log('window.window',this.name, this.id, this);
      elation.window.window.extendclass.init.call(this);
		}
	}, elation.window.create);

	elation.component.add("window.modal", function() {
		this.defaults = {
			rendering: 'center',
			align: 'center',
			btnClose: false,
			lightbox: true,
			moveable: false,
			ontop: true
		};
		this.init = function() {
      elation.window.modal.extendclass.init.call(this);
		}
	}, elation.window.create);
});