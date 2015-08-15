elation.require(['ui.list'], function() {
  elation.component.add("ui.contextmenu", function() {
    this.defaultcontainer = {tag: 'ul', classname: 'ui_contextmenu'};

    this.init = function(name, container, args) {
      //this.parent = this.args.parent || document.body;
      //this.items = {};
      this.label = this.args.label;
      this.itemcount = 0;

      //this.root = elation.ui.contextmenu.item({label: 'root', append: this.container});
      this.items = {};
      this.root = elation.utils.any(this.args.root, true);

      if (this.args.parent) {
        this.setParent(this.args.parent);
      }
      if (this.args.items) {
        this.setItems(this.args.items);
      }
    }
    this.setParent = function(el) {
      this.parent = el;
      this.parent.appendChild(this.container);
    }
    this.setItems = function(items) {
      for (var k in items) {
        this.add(k, items[k]);
      }
    }
    this.show = function(ev) {
      this.render(ev);
      if (ev) {
        var ppos = elation.html.dimensions(this.container.parentNode);
        this.container.style.left = (ev.clientX - ppos.x) + 'px';
        this.container.style.top = (ev.clientY - ppos.y) + 'px';
      }
      this.container.style.display = 'block';
      this.shown = true;
    }
    this.hide = function() {
      if (this.shown) {
        this.container.style.display = 'none';
        elation.events.remove(document, "click", this);
        this.shown = false;
      }
    }
    this.toggle = function(ev) {
      if (this.shown) {
        this.hide();
      } else {
        this.show(ev);
      }
    }
    this.clear = function() {
      this.items = {};
      this.container.innerHTML = '';
    }
    this.add = function(name, callback) {
      if (typeof this.items[name] == 'undefined') {
        this.itemcount++;
      }
      if (typeof callback == 'function') {
        this.items[name] = elation.ui.contextmenu.item({label: name, callback: callback, append: this.container});
      } else if (elation.utils.isObject(callback)) {
        this.items[name] = elation.ui.contextmenu.submenu({label: name, items: callback, append: this.container});
      }
      elation.events.add(this.items[name], 'select', this);
      //this.root.add(name, callback);
    }
    this.render = function(ev) {
      if (this.label) {
        this.container.innerHTML = this.label;
      }
      var keys = Object.keys(this.items);
      if (keys.length > 0) {
        /*
        var list = elation.html.create({'tag': 'ul'});
        for (var k in this.items) {
          var item = elation.html.create({'tag': 'li', 'attributes': { 'innerHTML': k } });
          (function(menu, item, callback, event) {
            // Pass the original event through to the callback, rather than the one which triggered item selection
            elation.events.add(item, "click", function(ev) { menu.hide(); callback(event); ev.stopPropagation(); });
          })(this, item, this.items[k], ev);
          list.appendChild(item);
        }
        this.container.appendChild(list);
        */
        for (var k in this.items) {
          if (typeof this.items[k] != 'function') {
            //if (this.items[k].componentname == 'ui.contextmenu.item') {
              this.items[k].render(ev);
              this.items[k].reparent(this.container);
            //}
          }
        }
      }
      this.dirty = false;
    }
    this.select = function(ev) {
      this.hide();
      elation.events.fire({element: this, type: 'select'});
    }
  }, elation.ui.list);

  elation.component.add('ui.contextmenu.item', function() {
    this.defaultcontainer = {tag: 'li', classname: 'ui_contextmenu_item'};

    this.init = function() {
      this.label = this.args.label;
      this.callback = this.args.callback;
      this.disabled = false;

  /*
      this.items = {};
      if (this.args.items) {
        for (var k in this.args.items) {
          this.add(k, this.args.items[k]);
        }
      }
  */

      elation.events.add(this.container, 'click', this);
    }
  /*
    this.add = function(name, callback) {
      if (typeof callback == 'function') {
        //this.items[name] = function(ev) { console.log('ffff', callback); callback.handleEvent(ev); }
        //this.items[name] = callback;
        this.items[name] = elation.ui.contextmenu.item({label: name, callback: callback, append: this.container});
      } else if (elation.utils.isObject(callback)) {
        this.items[name] = elation.ui.contextmenu.submenu({label: name, items: callback, append: this.container});
      } else {
        this.items[name] = function(ev) { elation.events.trigger(callback[0], callback[1], ev, callback[2]); }
      }
    }
  */
    this.render = function(ev) {
      this.container.innerHTML = this.label;
      if (this.items) {
        var keys = Object.keys(this.items);
        if (keys.length > 0) {
          /*
          var list = elation.html.create({'tag': 'ul'});
          for (var k in this.items) {
            var item = elation.html.create({'tag': 'li', 'attributes': { 'innerHTML': k } });
            (function(menu, item, callback, event) {
              // Pass the original event through to the callback, rather than the one which triggered item selection
              elation.events.add(item, "click", function(ev) { menu.hide(); callback(event); ev.stopPropagation(); });
            })(this, item, this.items[k], ev);
            list.appendChild(item);
          }
          this.container.appendChild(list);
          */
          for (var k in this.items) {
            if (typeof this.items[k] != 'function') {
              //this.items[k].reparent(this.container);
              this.items[k].render(ev);
            }
          }
        }
      }
      this.dirty = false;
    }
    this.disable = function() {
      this.disabled = true;
      elation.html.addclass(this.container, 'state_disabled');
    }
    this.click = function(ev) {
      console.log('clicked:', this.label, this);
      //this.hide();
      this.callback(ev);
      ev.stopPropagation();
      elation.events.fire({element: this, type: 'select'});
    }
  }, elation.ui.base);
  elation.component.add('ui.contextmenu.submenu', function() {
    this.defaultcontainer = {tag: 'li', classname: 'ui_contextmenu_item ui_contextmenu_submenu'};

    this.init = function() {
      this.label = this.args.label;
      this.submenu = elation.ui.contextmenu({items: this.args.items, append: this.container});

      if (this.submenu.itemcount == 0) {
        this.disable();
      }
      elation.events.add(this.container, 'mouseover,mouseout', this);
      elation.events.add(this.submenu, 'select', this);
    }
    this.mouseover = function(ev) {
      if (!this.disabled && elation.events.isTransition(ev, this.container)) {
        this.submenu.reparent(this.container);
        this.submenu.show();
      }
    }
    this.mouseout = function(ev) {
      if (elation.events.isTransition(ev, this.container)) {
        this.submenu.hide();
      }
    }
    this.select = function(ev) {
      elation.events.fire({element: this, type: 'select'});
    }
  }, elation.ui.contextmenu.item);
});
