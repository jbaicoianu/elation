elation.component.add("ui.contextmenu", function() {
  this.defaultcontainer = {tag: 'div', classname: 'ui_contextmenu'};

  this.init = function(name, container, args) {
    //this.parent = this.args.parent || document.body;
    this.items = {};
  }
  this.setParent = function(el) {
    this.parent = el;
    this.parent.appendChild(this.container);
  }
  this.show = function(ev) {
    this.render(ev);
    var ppos = elation.html.dimensions(this.parent);
    this.container.style.left = (ev.clientX - ppos.x) + 'px';
    this.container.style.top = (ev.clientY - ppos.y) + 'px';
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
  clear = function() {
    this.items = {};
  }
  this.add = function(name, callback) {
    if (typeof callback == 'function') {
      //this.items[name] = function(ev) { console.log('ffff', callback); callback.handleEvent(ev); }
      this.items[name] = callback;
    } else {
      this.items[name] = function(ev) { elation.events.trigger(callback[0], callback[1], ev, callback[2]); }
    }
  }
  this.render = function(ev) {
    var list = elation.html.create({'tag': 'ul'});
    for (var k in this.items) {
      var item = elation.html.create({'tag': 'li', 'attributes': { 'innerHTML': k } });
      (function(menu, item, callback, event) {
        // Pass the original event through to the callback, rather than the one which triggered item selection
        elation.events.add(item, "click", function(ev) { menu.hide(); callback(event); ev.stopPropagation(); });
      })(this, item, this.items[k], ev);
      list.appendChild(item);
    }
    this.container.innerHTML = '';
    this.container.appendChild(list);
    this.dirty = false;
  }
});

