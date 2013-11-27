elation.component.add('ui.list', function() {
  this.init = function(name, container, args) {
    this.tag = this.args.tag || this.container.tagName || 'DIV';
    this.classname = this.args.classname || "";
    this.title = this.args.title || false;
    this.draggable = this.args.draggable || false;
    this.events = this.args.events || {}
    this.orientation = this.args.orientation || 'vertical';
    this.items = [];
    this.listitems = [];

    this.animatetime = 850;

    elation.html.addclass(this.container, 'ui_list');
    elation.html.addclass(this.container, 'orientation_' + this.orientation);

    if (this.args.sortbydefault) {
      this.setSortBy(this.args.sortbydefault);
    }

    this.setItems(this.args.items);
  }
  this.getDefaultAttributes = function() {
    var attrs = this.args.attrs || {};
    if (elation.utils.isEmpty(attrs.name)) attrs.name = 'name';
    if (elation.utils.isEmpty(attrs.children)) attrs.children = 'items';
    return attrs;
  }
  this.setItems = function(items) {
    this.clear();
    if (elation.utils.isArray(items)) {
      this.items = items;
    } else {
      for (var k in items) {
        this.items.push(items[k]);
      }
    }
    this.refresh();
  }
  this.addItem = function(item) {
    this.items.push(item);
    this.refresh();
  }
  this.addItemAtPosition = function(item, position) {
    this.items.splice(position, 0, item);
    this.listitems.splice(position, 0, null);
    this.refresh();
  }
  this.clear = function() {
    for (var i = 0; i < this.items.length; i++) {
      if (this.listitems[i]) {
        this.listul.removeChild(this.listitems[i].container);
        delete this.listitems[i];
        delete this.items[i];
      }
    }
    this.listitems = [];
    this.items = [];
  }
  this.refresh = function() {
    if (!this.listul) {
      this.listul = elation.html.create({tag: 'ul', append: this.container});
    }
    var attrs = this.getDefaultAttributes();
    for (var i = 0; i < this.items.length; i++) {
      if (!this.listitems[i]) {
        var li = elation.html.create({tag: 'li'});
        if (this.listitems[i+1]) {
          this.listul.insertBefore(li, this.listitems[i+1].container);
        } else {
          this.listul.appendChild(li);
        }
        this.listitems[i] = elation.ui.listitem(null, li, {item: this.items[i], attrs: attrs});
      }
    }
    elation.component.init();
  }
  this.sort = function(sortby, reverse) {
    if (!reverse) reverse = false; // force to bool

    // Resort list items
    // FIXME - should also update this.items to reflect new order
    this.listitems.sort(function(a, b) {
      var val1 = elation.utils.arrayget(a.value, sortby),
          val2 =  elation.utils.arrayget(b.value, sortby);
      if ((val1 < val2) ^ reverse) return -1;
      else if ((val1 > val2) ^ reverse) return 1;
      else return 0;
    });
    var items = [];
    // First calculate existing position of all items
    for (var i = 0; i < this.listitems.length; i++) {
      items[i] = {
        container: this.listitems[i].container,
        oldpos: [this.listitems[i].container.offsetLeft, this.listitems[i].container.offsetTop]
      };
    }

    // Remove and re-add all items from list, so DOM order reflects item order
    // FIXME - this could be much more efficient, and is probably the slowest part of the whole process
    for (var i = 0; i < items.length; i++) {
      elation.html.removeclass(items[i].container, 'state_animating');
      this.listul.removeChild(items[i].container);
      this.listul.appendChild(items[i].container);
    }
    // Calculate new item positions, and set transform
    var maxdist = 0;
    for (var i = 0; i < items.length; i++) {
      items[i].newpos = [items[i].container.offsetLeft, items[i].container.offsetTop];
      items[i].diff = [items[i].oldpos[0] - items[i].newpos[0], items[i].oldpos[1] - items[i].newpos[1]],
      items[i].dist = Math.sqrt(items[i].diff[0]*items[i].diff[0] + items[i].diff[1] * items[i].diff[1]);
      if (items[i].dist > maxdist) maxdist = items[i].dist;
    }

    for (var i = 0; i < items.length; i++) {
      // FIXME - zooming is exaggerated and the animation feels slow on lists with fewer items.  need to scale this value somehow
      var ratio = items[i].dist / maxdist;
      items[i].z = 100 * ratio;
      items[i].animatetime = this.animatetime * ratio;
      items[i].container.style.zIndex = parseInt(items[i].z);

      // Start transform at item's old position, z=0
      elation.html.transform(items[i].container, 'translate3d(' + items[i].diff[0] + 'px, ' + items[i].diff[1] + 'px, 0px)', '50% 50%', 'none');

      // Animate halfway to the new position while zooming out
      setTimeout(elation.bind(items[i], function() {
        elation.html.transform(this.container, 'translate3d(' + (this.diff[0]/2) + 'px,' + (this.diff[1]/2) + 'px, ' + this.z + 'px)', '50% 50%', 'all ' + (this.animatetime / 2) + 'ms ease-in');
      }), 0);

      // Finish animating to the new position, and zoom back in
      setTimeout(elation.bind(items[i], function() {
        elation.html.transform(this.container, 'translate3d(0, 0, 0)', '50% 50%', 'all ' + (this.animatetime / 2) + 'ms ease-out');
      }), items[i].animatetime / 2);
    }

    // Set classname based on sortby parameter
    this.setSortBy(sortby);
  }
  this.setSortBy = function(sortby) {
    if (this.sortby) {
      elation.html.removeclass(this.container, 'ui_list_sortby_' + this.sortby);
    }
    this.sortby = sortby;
    elation.html.addclass(this.container, 'ui_list_sortby_' + this.sortby);
  }
});
elation.component.add('ui.listitem', function() {
  this.init = function() {
    this.value = this.args.item;
    this.attrs = this.args.attrs || {};
    if (!this.attrs.label) this.attrs.label = 'label';

    if (this.value.classname) {
      elation.html.addclass(this.container, this.value.classname);
    }

    if (this.value) {
      if (this.value instanceof elation.component.base) {
        this.container.appendChild(this.value.container);
      } else if (this.attrs.itemtemplate) {
        this.container.innerHTML = elation.template.get(this.attrs.itemtemplate, this.value);
      } else if (this.value[this.attrs.label]) {
        this.container.innerHTML = this.value[this.attrs.label];
      }

      if (!elation.utils.isEmpty(this.attrs.disabled) && !elation.utils.isEmpty(this.value[this.attrs.disabled])) {
        elation.html.addclass(this.container, "state_disabled");
      }
    }
  }
});
