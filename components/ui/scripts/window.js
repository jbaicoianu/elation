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
 * @param {int} args.top
 * @param {int} args.bottom
 * @param {int} args.left
 * @param {int} args.right
 */

elation.require(['ui.base', 'ui.button', 'ui.buttonbar'], function() {
  elation.requireCSS('ui.window');

  elation.component.add('ui.window', function() {
    this.defaultcontainer = {tag: 'div', classname: 'ui_window'};

    this.init = function() {
      this.initUIWindow();
    }
    this.initUIWindow = function() {
      this.windownum = (elation.ui.window.numwindows ? elation.ui.window.numwindows : 0);
      elation.ui.window.numwindows = this.windownum + 1;
      //this.container.style.top = 0;
      //this.container.style.left = 0;
      this.offsetpos = [0, 0];
      this.titlebar = elation.html.create({tag: 'div', classname: 'ui_window_titlebar', append: this.container});
      this.toolbar = false;
      this.minimized = false;
      this.maximized = false;
      this.transformorigin = "50% 50%";
      this.labels = {
        minimize: '_',
        maximize: '□',
        restore: '₪',
        close: 'x'
      };
      if (this.args.controls !== false) {
        this.createcontrols();
      }
      if (this.args.title) {
        this.settitle(this.args.title);
      }
      if (this.args.toolbar) {
        this.settoolbar(this.args.toolbar);
      }
      if (this.args.position) {
        this.setposition(this.args.position);
      }
      this.setcontent(this.args.content);

      elation.events.add(window, 'resize,orientationchange', this);

      var curpos = elation.html.position(this.container);
      elation.html.addclass(this.container, "ui_window");
      if (this.args.classname) {
        this.addclass(this.args.classname);
      }
      if (this.args.movable !== false) {
        this.addclass('state_movable');
        elation.events.add(this.container, 'mousedown,touchstart', this);
      }
      if (this.args.left) this.addclass('orientation_left');
      if (this.args.right) this.addclass('orientation_right');
      if (this.args.top) this.addclass('orientation_top');
      if (this.args.bottom) this.addclass('orientation_bottom');
      if (this.args.center) this.addclass('orientation_center');

      if (this.args.width) {
        this.container.style.width = this.args.width;  
      }
      this.refresh();
      this.focus(true);
    }
    this.render = function() {
      this.size = this.getsize();
      if (this.args.center) {
        this.center();
      }
      // TODO - should "center" be an orientation too?
      if (this.args.orientation) {
        this.setOrientation(this.args.orientation);
      }
      if (this.args.top) {
        this.setposition([this.offsetpos[0], this.args.top]);
      } else if (this.args.bottom) {
        this.setposition([this.offsetpos[0], window.innerHeight - this.container.offsetHeight - this.args.bottom]);
      }
      if (this.args.left) {
        this.setposition([this.args.left, this.offsetpos[1]]);
      } else if (this.args.right) {
        this.setposition([window.innerWidth - this.container.offsetWidth - this.args.right, this.offsetpos[1]]);
      }
    }
    this.focus = function(skipmove) {
      if (!this.active) {
        this.windownum = elation.ui.window.numwindows++;
        // first remove focus from any existing active windows
        var activewindows = elation.find('.ui_window.state_active');
        if (activewindows.length > 0) {
          for (var i = 0; i < activewindows.length; i++) {
            elation.component.fetch(activewindows[i]).blur();
          }
        }
        elation.html.addclass(this.container, 'state_active');
        if (this.minimized) {
          //this.minimize();
        } else {[]
          //this.setposition((this.maximized ? [0,0] : this.offsetpos), false);
          elation.html.transform(this.container, this.gettransform(), this.transformorigin, (skipmove ? '' : 'all 100ms ease-in-out'));
        }
        this.active = true;
        elation.events.fire({type: 'focus', element: this});
      }
    }
    this.blur = function() {
      if (this.active) {
        this.active = false;
        elation.html.removeclass(this.container, 'state_active');
        elation.events.fire({type: 'blur', element: this});
      }
    }
    this.createcontrols = function() {
      var buttons = {};
      if (this.args.minimize !== false) {
        buttons.minimize = { 
          label: this.labels.minimize,
          classname: 'ui_window_control_minimize',
          events: { click: elation.bind(this, this.minimize) }
        };
      }
      if (this.args.maximize !== false) {
        buttons.maximize = {
          label: this.labels.maximize,
          classname: 'ui_window_control_maximize',
          events: { click: elation.bind(this, this.maximize) }
        };
      }
      if (this.args.close !== false) {
        buttons.close = { 
          label: this.labels.close,
          classname: 'ui_window_control_close',
          events: { click: elation.bind(this, this.close) }
        }
      }

      this.controls = elation.ui.buttonbar(null, elation.html.create({classname: 'ui_window_controls'}), {
        buttons: buttons
      });
      elation.html.addclass(this.container, 'ui_window_withcontrols');
      if (this.args.resizable !== false) {
        this.resizer = elation.html.create({tag: 'div', classname: 'ui_window_resizer', append: this.container});
      }
    }
    this.open = function() {
      this.show();
      this.visible = true;
      elation.events.fire({type: 'ui_window_open', element: this});
    }
    this.close = function(ev) {
      if (this.container.parentNode) {
        //this.container.parentNode.removeChild(this.container);
      }
      this.hide();
      this.visible = false;
      elation.events.fire({type: 'ui_window_close', element: this});
      if (ev) ev.stopPropagation();
    }
    this.minimize = function(ev) {
      if (this.maximized) {
        this.maximize();
      }
      if (!this.minimized) {
        // minimize
        if (!this.oldtransform) {
          this.oldtransform = elation.html.transform(this.container);
        }
        this.windownum = -1;
        elation.html.transform(this.container, this.gettransform(false, false, .25), this.transformorigin, 'all 100ms ease-out');
        elation.html.addclass(this.container, 'state_minimized');
        this.controls.buttons.minimize.setLabel(this.labels.restore);
        this.controls.buttons.maximize.setLabel(this.labels.maximize);
        this.minimized = true;
        this.blur();
        elation.events.fire({type: 'ui_window_minimize', element: this});
      } else {
        // restore
        elation.html.removeclass(this.container, 'state_minimized');
        if (this.oldtransform) {
          this.oldtransform = false;
        }
        this.controls.buttons.minimize.setLabel(this.labels.minimize);
        this.minimized = false;
        elation.html.transform(this.container, this.gettransform(), this.transformorigin, 'all 100ms ease-out');
        elation.events.fire({type: 'ui_window_restore', element: this});
      }
      if (ev) ev.stopPropagation();
    }
    this.maximize = function(ev) {
      if (!this.maximized) {
        // maximize
        this.focus();
        elation.html.addclass(this.container, 'state_maximized');
  /*
        elation.html.transform(this.container, this.gettransform([0,0]), this.transformorigin, 'none'); //'all 100ms ease-out');
        this.container.style.width = window.innerWidth + 'px';
        this.container.style.height = window.innerHeight + 'px';
  */
        this.restorestate = [this.getposition(), this.getsize()];
        this.setposition([0,0]);
        this.setsize([window.innerWidth, window.innerHeight]);

        this.controls.buttons.minimize.setLabel(this.labels.minimize);
        this.controls.buttons.maximize.setLabel(this.labels.restore);
        this.maximized = true;
        elation.events.fire({type: 'ui_window_maximize', element: this});
      } else {
        // restore
        elation.html.removeclass(this.container, 'state_maximized');
        this.setposition(this.restorestate[0]);
        this.setsize(this.restorestate[1]);
        //elation.html.transform(this.container, this.gettransform(), this.transformorigin, 'none'); //'all 100ms ease-out');
        this.controls.buttons.maximize.setLabel(this.labels.maximize);
        this.maximized = false;
        elation.events.fire({type: 'ui_window_restore', element: this});
      }
      if (this.minimized) {
        elation.html.removeclass(this.container, 'state_minimized'); // clear minimized flag if set
        this.minimized = false;
      }
      if (ev) ev.stopPropagation();
    }
    this.getsize = function() {
      return [this.container.offsetWidth, this.container.offsetHeight];
    }
    this.setsize = function(size) {
      elation.html.transform(this.container, this.gettransform(), this.transformorigin, 'none');
      this.content.style.width = size[0] + 'px';
      this.content.style.height = (size[1] - this.titlebar.offsetHeight - (this.toolbar ? this.toolbar.offsetHeight : 0)) + 'px';
      this.size[0] = size[0];
      this.size[1] = size[1];
  //alert('setted:' + this.size[0] + 'x' + this.size[1] + ", " + this.content.style.width + " x " + this.content.style.height);
    }
    this.center = function() {
      var dim = elation.html.dimensions(this.container);
      var realx = (window.innerWidth - this.container.offsetWidth) / 2;
      var realy = (window.innerHeight - this.container.offsetHeight) / 2;
      this.content.style.maxHeight = (window.innerHeight - this.content.offsetTop) + 'px';
      this.setposition([realx, realy]);
    }
    this.drag = function(diff) {
    }
    this.getposition = function() {
      return [this.offsetpos[0], this.offsetpos[1]];
    }
    this.setposition = function(pos, animate) {
      this.offsetpos[0] = pos[0];
      this.offsetpos[1] = pos[1];
      elation.html.transform(this.container, this.gettransform(), this.transformorigin, (animate ? 'all 100ms ease-in-out' : 'none'));
    }
    this.settitle = function(newtitle) {
      if (newtitle instanceof HTMLElement) {
        if (this.titlebar) {
          this.container.replaceChild(newtitle, this.titlebar);
        } else {
          this.container.appendChild(newtitle);
        }
        this.titlebar = newtitle;
        if (!elation.html.hasclass(this.titlebar, 'ui_window_titlebar')) {
          elation.html.addclass(this.titlebar, 'ui_window_titlebar');
        }
      } else {
        this.titlebar.innerHTML = "<span class='ui_window_titlebar_span'>"+newtitle+"</span>" || '';
      }
      if (this.controls) {
        //this.titlebar.appendChild(this.controls.container);
        this.titlebar.insertBefore(this.controls.container, this.titlebar.firstChild);
      }
    }
    this.settoolbar = function(newtoolbar) {
      if (this.toolbar) {
        this.container.removeChild(this.toolbar.container);
      }
      if (newtoolbar instanceof elation.component.base) {
        newtoolbar = newtoolbar.container;
      } else if (newtoolbar instanceof HTMLElement) {
        // ...
      } else {
        newtoolbar = elation.html.create({tag: 'div', content: newtoolbar});
      }
      this.toolbar = newtoolbar;
      this.container.insertBefore(newtoolbar, this.titlebar.nextSibling);
      if (!elation.html.hasclass(this.toolbar, 'ui_window_toolbar')) {
        elation.html.addclass(this.toolbar, 'ui_window_toolbar');
      }
    }
    this.setcontent = function(newcontent) {
      if (newcontent instanceof HTMLElement) {
        this.setcontenthtml(newcontent);
      } else if (newcontent instanceof elation.component.base) {
        this.setcontenthtml(newcontent.container);
      } else {
        if (!this.content) {
          this.content = elation.html.create({tag: 'div', classname: 'ui_window_content', append: this.container});
        }
        if (!elation.utils.isNull(newcontent)) {
          this.content.innerHTML = newcontent;
        }
      }
      elation.component.init();
      this.refresh();
      elation.html.addclass(this.content, 'ui_window_content');
    }
    this.setcontenthtml = function(newcontent) {
      if (this.content) {
        this.container.removeChild(this.content);
      }
      if (newcontent.parentNode) newcontent.parentNode.removeChild(newcontent);
    
      this.container.appendChild(newcontent);
      this.content = newcontent;
    }
    this.gettransform = function(pos, layer, scale) {
      if (!pos && pos !== 0) pos = this.offsetpos;
      if (!layer && layer !== 0) layer = this.windownum;
      if (!scale) scale = (this.minimized ? .25 : 1);
      return 'translate3d(' + Math.round(pos[0]) + 'px, ' + Math.round(pos[1]) + 'px, ' + layer + 'px) scale(' + scale + ')';
    }
    this.animationstart = function() {
      this.animating = true;
      this.animate();
    }
    this.animationend = function() {
      this.animating = false;
    }
    this.animate = function(animating) {
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
    this.dragstart = function(ev) {
      this.dragstartpos = (ev.touches ? [ev.touches[0].clientX, ev.touches[0].clientY] : [ev.clientX, ev.clientY]);
      this.dirtyposition = this.dirtysize = false;
      this.newpos = [0, 0];
      if (ev.target == this.titlebar || this.minimized) {
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
    this.dragmove = function(ev) {
      this.newpos[0] = (ev.touches ? ev.touches[0].clientX : ev.clientX);
      this.newpos[1] = (ev.touches ? ev.touches[0].clientY : ev.clientY);
      //var diff = [this.dragstartpos[0] - newpos[0], this.dragstartpos[1] - newpos[1]];
      // limit left side offset to prevent windows from getting lost
      //this.container.style.left = Math.max(newpos[0] + this.dragdims.x - this.dragstartpos[0], this.dragdims.w * -.9) + 'px';
      //this.container.style.top = (newpos[1] + this.dragdims.y - this.dragstartpos[1]) + 'px';
      //this.offsetpos = [Math.max(newpos[0] + this.dragdims.x - this.dragstartpos[0], this.dragdims.w * -.9), (newpos[1] + this.dragdims.y - this.dragstartpos[1])];
      var wasanimating = (this.animating && (this.dirtysize || this.dirtyposition));
      if (this.resizing) {
        this.size[0] -= (this.dragstartpos[0] - this.newpos[0]);
        this.size[1] -= (this.dragstartpos[1] - this.newpos[1]);
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
    this.dragend = function(ev) {
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
    this.mousedown = function(ev) {
      if (ev.button == 0) {
        this.dragstart(ev);
      }
      this.focus();
    }
    this.mousemove = function(ev) {
      this.dragmove(ev);
    }
    this.mouseup = function(ev) {
      if (ev.button == 0) {
        this.dragend(ev);
      }
    }
    this.touchstart = function(ev) {

      if (ev.touches.length == 1) {
        this.dragstart(ev);
      }
      this.focus();
    }
    this.touchmove = function(ev) {
      if (ev.touches.length == 1) {
        this.dragmove(ev);
      }
    }
    this.touchend = function(ev) {
      if (ev.touches.length == 0) {
        this.dragend(ev);
      }
    }
    this.resize = function(ev) {
      if (this.maximized) {
        this.setsize([window.innerWidth, window.innerHeight]);
      }
      this.refresh();
    }
    this.orientationchange = function(ev) {
      if (this.maximized) {
        this.setsize([window.innerWidth, window.innerHeight]);
      }
      this.refresh();
    }
  }, elation.ui.base);
});
