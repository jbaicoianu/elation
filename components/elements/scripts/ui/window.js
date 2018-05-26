/** 
 * Window UI component
 *
 * @class window
 * @augments elation.ui.base
 * @memberof elation.ui
 *
 * @param {object} args[]
 * @param {array} args.items
 * @param {boolean} args.controls
 * @param {string} args.title
 * @param {string} args.content
 * @param {array} args.position
 * @param {boolean} args.center
 * @param {int} args.width
 * @param {int} args.height
 * @param {int} args.top
 * @param {int} args.bottom
 * @param {int} args.left
 * @param {int} args.right
 */

elation.require(['elements.elements', 'elements.ui.button', 'elements.ui.buttonbar'], function() {
  elation.requireCSS('ui.window');

  elation.elements.define('ui.window', class extends elation.elements.ui.panel {
    init() {
      super.init();
      this.defineAttributes({
        title:     { type: 'string', default: '' },
        //toolbar:   { type: 'object' },
        position:  { type: 'vector2' },
        content:   { type: 'object' },
        movable:   { type: 'boolean' },
        controls: { type: 'boolean' },
        center: { type: 'boolean' },
        left: { type: 'boolean' },
        right: { type: 'boolean' },
        top: { type: 'boolean' },
        bottom: { type: 'boolean' },
        resizable: { type: 'boolean' },
        scrollable: { type: 'boolean' },
        minimizable:  { type: 'boolean' },
        maximizable:  { type: 'boolean' },
        closable:     { type: 'boolean' },
        resizable: { type: 'boolean' },
      });
      this.offsetpos = [0, 0];
    }
    initUIWindow() {
      this.initialized = true;
      this.windownum = (elation.elements.ui.window.numwindows ? elation.elements.ui.window.numwindows : 0);
      elation.elements.ui.window.numwindows = this.windownum + 1;
      //this.style.top = 0;
      //this.style.left = 0;

      var content = this.getElementsByTagName('ui-window-content');
      if (content.length > 0) {
        this.content = content[0];
      } else {
        if (this.childNodes.length > 0) {
          this.content = document.createElement('ui-window-content');
          var children = [];
          while (this.childNodes.length > 0) {
            var child = this.childNodes[0];
            this.removeChild(child);
            this.content.appendChild(child);
          }
        }
      }

      this.titlebar = elation.elements.create('ui.window.titlebar', {append: this});
      this.toolbar = false;
      this.minimized = false;
      this.maximized = false;
      this.transformorigin = "50% 50%";
      this.labels = {
        minimize: '–',
        maximize: '□',
        restore: '₪',
        close: 'x'
      };
      if (this.controls !== false) {
        this.createcontrols();
      }
      this.settitle(this.title);
      if (this.toolbar) {
        this.settoolbar(this.toolbar);
      }
      if (this.position) {
        this.setposition(this.position);
      }
      this.setcontent(this.content);

      elation.events.add(window, 'resize,orientationchange', this);

      var curpos = elation.html.position(this);
      //this.addclass("ui_window");
      if (this.movable !== false) {
        this.addclass('state_movable');
        elation.events.add(this, 'mousedown,touchstart', this);
      }
      if (this.left) this.addclass('orientation_left');
      if (this.right) this.addclass('orientation_right');
      if (this.top) this.addclass('orientation_top');
      if (this.bottom) this.addclass('orientation_bottom');
      if (this.center) this.addclass('orientation_center');

      if (this.width) {
        this.style.width = this.width;  
      }
      if (this.height) {
        this.content.style.height = this.height;
      }
      this.refresh();
      this.focus(true);
    }
    render() {
      //super.render();
      if (!this.initialized) {
        this.initUIWindow();
      }
      this.size = this.getsize();
      if (this.center) {
        this.centerwindow();
      }
      // TODO - should "center" be an orientation too?
      if (this.orientation) {
        this.setOrientation(this.orientation);
      }
      if (this.top) {
        this.setposition([this.offsetpos[0], this.top]);
      } else if (this.bottom) {
        this.setposition([this.offsetpos[0], window.innerHeight - this.offsetHeight - this.bottom]);
      }
      if (this.left) {
        this.setposition([this.left, this.offsetpos[1]]);
      } else if (this.right) {
        this.setposition([window.innerWidth - this.offsetWidth - this.right, this.offsetpos[1]]);
      }
    }
    focus(skipmove) {
      if (!this.active) {
        this.windownum = elation.elements.ui.window.numwindows++;
        // first remove focus from any existing active windows
        var activewindows = elation.find('.ui_window.state_active');
        if (activewindows.length > 0) {
          for (var i = 0; i < activewindows.length; i++) {
            //elation.component.fetch(activewindows[i]).blur();
          }
        }
        this.addclass('state_active');
        if (this.minimized) {
          //this.minimize();
        } else {[]
          //this.setposition((this.maximized ? [0,0] : this.offsetpos), false);
          elation.html.transform(this, this.gettransform(), this.transformorigin, (skipmove ? '' : 'all 100ms ease-in-out'));
        }
        this.active = true;
        elation.events.fire({type: 'focus', element: this});
      }
    }
    blur() {
      if (this.active) {
        this.active = false;
        elation.html.removeclass(this, 'state_active');
        elation.events.fire({type: 'blur', element: this});
      }
    }
    createcontrols() {
      var buttons = {};
      if (this.minimizable !== false) {
        buttons.minimize = { 
          label: this.labels.minimize,
          classname: 'ui_window_control_minimize',
          onclick: (ev) => this.minimize(ev)
        };
      }
      if (this.maximizable !== false) {
        buttons.maximize = {
          label: this.labels.maximize,
          classname: 'ui_window_control_maximize',
          onclick: (ev) => this.maximize(ev)
        };
      }
      if (this.closable !== false) {
        buttons.close = { 
          label: this.labels.close,
          classname: 'ui_window_control_close',
          onclick: (ev) => this.close(ev),
          ontouchend: (ev) => this.close(ev)
        }
      }

/*
      this.controls = elation.ui.buttonbar(null, elation.html.create({classname: 'ui_window_controls'}), {
        buttons: buttons
      });
*/
      this.controls = document.createElement('ui-buttonbar');
      this.controls.buttons = buttons;
      this.addclass('ui_window_withcontrols');
      if (this.resizable !== false) {
        this.resizer = elation.html.create({tag: 'div', classname: 'ui_window_resizer', append: this});
      }
    }
    open() {
      this.show();
      this.visible = true;
      elation.events.fire({type: 'ui_window_open', element: this});
    }
    close(ev) {
      if (this.parentNode) {
        //this.parentNode.removeChild(this);
      }
      this.hide();
      this.visible = false;
      elation.events.fire({type: 'ui_window_close', element: this});
      if (ev) ev.stopPropagation();
    }
    minimize(ev) {
      if (this.maximized) {
        this.maximize();
      }
      if (!this.minimized) {
        // minimize
        if (!this.oldtransform) {
          this.oldtransform = elation.html.transform(this);
        }
        this.windownum = -1;
        elation.html.transform(this, this.gettransform(false, false, .25), this.transformorigin, 'all 100ms ease-out');
        this.addclass('state_minimized');
        //this.controls.buttons.minimize.setLabel(this.labels.restore);
        //this.controls.buttons.maximize.setLabel(this.labels.maximize);
        this.minimized = true;
        this.blur();
        elation.events.fire({type: 'ui_window_minimize', element: this});
      } else {
        // restore
        elation.html.removeclass(this, 'state_minimized');
        if (this.oldtransform) {
          this.oldtransform = false;
        }
        //this.controls.buttons.minimize.setLabel(this.labels.minimize);
        this.minimized = false;
        elation.html.transform(this, this.gettransform(), this.transformorigin, 'all 100ms ease-out');
        elation.events.fire({type: 'ui_window_restore', element: this});
      }
      if (ev) ev.stopPropagation();
    }
    maximize(ev) {
      if (!this.maximized) {
        // maximize
        this.focus();
        this.addclass('state_maximized');
  /*
        elation.html.transform(this, this.gettransform([0,0]), this.transformorigin, 'none'); //'all 100ms ease-out');
        this.style.width = window.innerWidth + 'px';
        this.style.height = window.innerHeight + 'px';
  */
        this.restorestate = [this.getposition(), this.getsize()];
        this.setposition([0,0]);
        this.setsize([window.innerWidth, window.innerHeight]);

        //this.controls.buttons.minimize.setLabel(this.labels.minimize);
        //this.controls.buttons.maximize.setLabel(this.labels.restore);
        this.maximized = true;
        elation.events.fire({type: 'ui_window_maximize', element: this});
      } else {
        // restore
        elation.html.removeclass(this, 'state_maximized');
        this.setposition(this.restorestate[0]);
        this.setsize(this.restorestate[1]);
        //elation.html.transform(this, this.gettransform(), this.transformorigin, 'none'); //'all 100ms ease-out');
        //this.controls.buttons.maximize.setLabel(this.labels.maximize);
        this.maximized = false;
        elation.events.fire({type: 'ui_window_restore', element: this});
      }
      if (this.minimized) {
        elation.html.removeclass(this, 'state_minimized'); // clear minimized flag if set
        this.minimized = false;
      }
      if (ev) ev.stopPropagation();
    }
    getsize() {
      return [this.offsetWidth, this.offsetHeight];
    }
    setsize(size) {
      elation.html.transform(this, this.gettransform(), this.transformorigin, 'none');
      if (this.style.width != 'auto') this.style.width = 'auto';
      if (this.style.height != 'auto') this.style.height = 'auto';
      this.content.style.width = size[0] + 'px';
      this.content.style.height = (Math.min(window.innerHeight, size[1]) - this.titlebar.offsetHeight - (this.toolbar ? this.toolbar.offsetHeight : 0)) + 'px';
      this.size[0] = size[0];
      this.size[1] = size[1];
  //alert('setted:' + this.size[0] + 'x' + this.size[1] + ", " + this.content.style.width + " x " + this.content.style.height);
    }
    centerwindow() {
      var dim = elation.html.dimensions(this);
      if (dim.w > window.innerWidth) {
        this.maximize();
        //this.setsize([window.innerWidth, window.innerHeight]);
      }
      var realx = (window.innerWidth - this.offsetWidth) / 2;
      var realy = (window.innerHeight - this.offsetHeight) / 2;
      // TODO - border width should be detected automatically using getComputedStyle
      var borderwidth = 4;
      this.content.style.maxHeight = (window.innerHeight - this.content.offsetTop - borderwidth) + 'px';
      this.setposition([realx, realy]);
    }
    drag(diff) {
    }
    getposition() {
      return [this.offsetpos[0], this.offsetpos[1]];
    }
    setposition(pos, animate) {
      this.offsetpos[0] = pos[0];
      this.offsetpos[1] = pos[1];
      elation.html.transform(this, this.gettransform(), this.transformorigin, (animate ? 'all 100ms ease-in-out' : 'none'));
    }
    settitle(newtitle) {
      if (newtitle instanceof HTMLElement) {
        if (this.titlebar) {
          this.replaceChild(newtitle, this.titlebar);
        } else {
          this.appendChild(newtitle);
        }
        this.titlebar = newtitle;
        if (!elation.html.hasclass(this.titlebar, 'ui_window_titlebar')) {
          elation.html.addclass(this.titlebar, 'ui_window_titlebar');
        }
      } else {
        this.titlebar.innerHTML = "<span class='ui_window_titlebar_span'>"+newtitle+"</span>" || '';
      }
      if (this.controls) {
        //this.titlebar.appendChild(this.controls);
        this.titlebar.insertBefore(this.controls, this.titlebar.firstChild);
      }
    }
    settoolbar(newtoolbar) {
      if (this.toolbar) {
        this.removeChild(this.toolbar);
      }
      if (newtoolbar instanceof elation.component.base) {
        newtoolbar = newtoolbar.container;
      } else if (newtoolbar instanceof HTMLElement) {
        // ...
      } else {
        newtoolbar = elation.html.create({tag: 'div', content: newtoolbar});
      }
      this.toolbar = newtoolbar;
      this.insertBefore(newtoolbar, this.titlebar.nextSibling);
      if (!elation.html.hasclass(this.toolbar, 'ui_window_toolbar')) {
        elation.html.addclass(this.toolbar, 'ui_window_toolbar');
      }
    }
    setcontent(newcontent) {
      if (newcontent instanceof HTMLElement) {
        this.setcontenthtml(newcontent);
      } else if (newcontent instanceof elation.component.base) {
        this.setcontenthtml(newcontent.container);
      } else {
        if (!this.content) {
          this.content = elation.html.create({tag: 'ui-window-content', classname: 'ui_window_content', append: this});
        }
        if (!elation.utils.isNull(newcontent)) {
          this.content.innerHTML = newcontent;
        }
      }
      elation.component.init();
      this.refresh();
      //elation.html.addclass(newcontent, 'ui_window_content');
    }
    setcontenthtml(newcontent) {
      if (this.content && this.content.parentNode) {
        this.content.parentNode.removeChild(this.content);
      }
      if (newcontent.parentNode) newcontent.parentNode.removeChild(newcontent);
    
      this.appendChild(newcontent);
      this.content = newcontent;
    }
    gettransform(pos, layer, scale) {
      if (!pos && pos !== 0) pos = this.offsetpos;
      if (!layer && layer !== 0) layer = this.windownum;
      if (!scale) scale = (this.minimized ? .25 : 1);
      return 'translate3d(' + Math.round(pos[0]) + 'px, ' + Math.round(pos[1]) + 'px, ' + layer + 'px) scale(' + scale + ')';
    }
    animationstart() {
      this.animating = true;
      this.animate();
    }
    animationend() {
      this.animating = false;
    }
    animate(animating) {
      if (this.animating && (this.dirtysize || this.dirtyposition)) {
        if (!this.boundfunc) this.boundfunc = elation.bind(this, this.animate);
        if (window.requestAnimationFrame) requestAnimationFrame(this.boundfunc); 
        else if (window.webkitRequestAnimationFrame) webkitRequestAnimationFrame(this.boundfunc); 
        else if (window.mozRequestAnimationFrame) mozRequestAnimationFrame(this.boundfunc); 
        else if (window.msRequestAnimationFrame) msRequestAnimationFrame(this.boundfunc); 
        else { setTimeout(this.boundfunc, 1/60); }
      }
      if (this.dirtysize) {
        this.dirtysize = false;
        this.setsize(this.size);
      }
      if (this.dirtyposition) {
        this.dirtyposition = false;
        this.setposition(this.offsetpos, false);
      }
    }
    dragstart(ev) {
      this.dragstartpos = (ev.touches ? [ev.touches[0].clientX, ev.touches[0].clientY] : [ev.clientX, ev.clientY]);
      this.dirtyposition = this.dirtysize = false;
      this.newpos = [0, 0];
      if (elation.utils.isin(this.titlebar, ev.target) || this.minimized) {
        // titlebar dragging
        elation.html.addclass(this.titlebar, 'state_dragging');
        this.dragging = false;
        elation.events.add(window, 'mousemove,mouseup,touchmove,touchend', this);
        this.animationstart();
        ev.preventDefault();
      } else if (ev.target == this.resizer) {
        this.size = this.getsize();
        this.resizing = true;
        elation.events.add(window, 'mousemove,mouseup,touchmove,touchend', this);
        this.animationstart();
        ev.preventDefault();
      }
    }
    dragmove(ev) {
      this.newpos[0] = (ev.touches ? ev.touches[0].clientX : ev.clientX);
      this.newpos[1] = (ev.touches ? ev.touches[0].clientY : ev.clientY);
      //var diff = [this.dragstartpos[0] - newpos[0], this.dragstartpos[1] - newpos[1]];
      // limit left side offset to prevent windows from getting lost
      //this.style.left = Math.max(newpos[0] + this.dragdims.x - this.dragstartpos[0], this.dragdims.w * -.9) + 'px';
      //this.style.top = (newpos[1] + this.dragdims.y - this.dragstartpos[1]) + 'px';
      //this.offsetpos = [Math.max(newpos[0] + this.dragdims.x - this.dragstartpos[0], this.dragdims.w * -.9), (newpos[1] + this.dragdims.y - this.dragstartpos[1])];
      var wasanimating = (this.animating && (this.dirtysize || this.dirtyposition));
      if (this.resizing) {
        if (this.right) {
          this.offsetpos[0] -= (this.dragstartpos[0] - this.newpos[0]);
          this.size[0] += (this.dragstartpos[0] - this.newpos[0]);
        } else {
          this.size[0] -= (this.dragstartpos[0] - this.newpos[0]);
        }

        if (this.bottom) {
          this.offsetpos[1] -= (this.dragstartpos[1] - this.newpos[1]);
          this.size[1] += (this.dragstartpos[1] - this.newpos[1]);
        } else {
          this.size[1] -= (this.dragstartpos[1] - this.newpos[1]);
        }
        this.dirtysize = true;
      } else {
        this.dirtyposition = true;
        this.offsetpos = [this.offsetpos[0] - (this.dragstartpos[0] - this.newpos[0]), this.offsetpos[1] - (this.dragstartpos[1] - this.newpos[1])];
      }
      if (!wasanimating && (this.dirtysize || this.dirtyposition)) {
        this.animate();
      }
      this.dragstartpos[0] = this.newpos[0];
      this.dragstartpos[1] = this.newpos[1];
      this.dragging = true;
    }
    dragend(ev) {
      if (this.resizing) {
        elation.events.remove(window, 'mousemove,mouseup,touchmove,touchend', this);
        this.resizing = false;
      } else {
        elation.events.remove(window, 'mousemove,mouseup,touchmove,touchend', this);
        elation.html.removeclass(this.titlebar, 'state_dragging');
        if (this.minimized && !this.dragging) {
          this.minimize();
        }
      }
      this.dragging = false;
      //this.dragstartpos = [0,0];
      this.animationend();
    }
    onmousedown(ev) {
      if (ev.button == 0) {
        this.dragstart(ev);
      }
      this.focus();
      ev.stopPropagation();
    }
    onmousemove(ev) {
      this.dragmove(ev);
    }
    onmouseup(ev) {
      if (ev.button == 0) {
        this.dragend(ev);
      }
    }
    ontouchstart(ev) {
      if (ev.touches.length == 1 && !this.maximized) {
        this.dragstart(ev);
      }
      this.focus();
    }
    ontouchmove(ev) {
      if (ev.touches.length == 1 && !this.maximized) {
        this.dragmove(ev);
      }
    }
    ontouchend(ev) {
      if (ev.touches.length == 0) {
        this.dragend(ev);
      }
    }
    onresize(ev) {
      if (this.maximized) {
        this.setsize([window.innerWidth, window.innerHeight]);
      }
      this.refresh();
    }
    onorientationchange(ev) {
      if (this.maximized) {
        this.setsize([window.innerWidth, window.innerHeight]);
      }
      this.refresh();
    }
  });
  elation.elements.define('ui.window.titlebar', class extends elation.elements.base {
  });
  elation.elements.define('ui.window.content', class extends elation.elements.base {
  });
});

