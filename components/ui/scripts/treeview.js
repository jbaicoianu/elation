elation.component.add("ui.treeview", function() {
  this.init = function() {
    elation.html.addclass(this.container, 'ui_treeview');
    var attrs = this.args.attrs || {};
    if (elation.utils.isEmpty(attrs.name)) attrs.name = 'name';
    if (elation.utils.isEmpty(attrs.children)) attrs.children = 'items';

    if (this.args.items) {
      this.add(this.args.items, this.container, attrs);
    }
  }
  this.add = function(items, root, attrs) {
    if (!root) root = this.container;

    var ul = elation.html.create({tag: 'ul', append: root});
    for (var k in items) {
      var li = elation.html.create({tag: 'li', append: ul});
      var tvitem = elation.ui.treeviewitem(null, li, {item: items[k], attrs: attrs});
      elation.events.add(tvitem, 'ui_treeviewitem_hover,ui_treeviewitem_select', this);
      if (items[k][attrs.children]) {
        this.add(items[k][attrs.children], li, attrs);
      }
    }
  }
  this.ui_treeviewitem_hover = function(ev) {
    if (this.hover && this.hover != ev.target) {
      this.hover.unhover();
    }
    this.hover = ev.target;
    elation.events.fire({type: 'ui_treeview_hover', element: this, data: this.hover});
  }
  this.ui_treeviewitem_select = function(ev) {
    if (this.selected && this.selected != ev.target) {
      this.selected.unselect();
    }
    this.selected = ev.target;
    elation.events.fire({type: 'ui_treeview_select', element: this, data: this.selected});
  }
});
elation.component.add("ui.treeviewitem", function() {
  this.init = function() {
    this.value = this.args.item;
    this.attrs = this.args.attrs || {};
    if (!this.attrs.label) this.attrs.label = 'label';

    if (this.value && this.value[this.attrs.label]) {
      this.container.innerHTML = this.value[this.attrs.label];

      if (!elation.utils.isEmpty(this.attrs.disabled) && !elation.utils.isEmpty(this.value[this.attrs.disabled])) {
        elation.html.addclass(this.container, "state_disabled");
      }

      elation.events.add(this.container, "mouseover,mouseout,click", this);
      elation.events.add(this.value, "mouseover,mouseout,click", this);
    }
  }
  this.hover = function() {
    elation.html.addclass(this.container, 'state_hover');
    elation.events.fire({type: 'ui_treeviewitem_hover', element: this});
    //this.container.scrollIntoView();
  }
  this.unhover = function() {
    elation.html.removeclass(this.container, 'state_hover');
    elation.events.fire({type: 'ui_treeviewitem_unhover', element: this});
  }
  this.select = function() {
    elation.events.fire({type: 'ui_treeviewitem_select', element: this});
    //this.container.scrollIntoView();
    elation.html.addclass(this.container, 'state_selected');
  }
  this.unselect = function() {
    elation.html.removeclass(this.container, 'state_selected');
    elation.events.fire({type: 'ui_treeviewitem_unselect', element: this});
  }
  this.mouseover = function(ev) {
    this.hover();
    ev.stopPropagation();
  }
  this.mouseout = function(ev) {
    this.unhover();
    ev.stopPropagation();
  }
  this.mousedown = function(ev) {
  }
  this.mouseup = function(ev) {
  }
  this.click = function(ev) {
    this.select();
    ev.stopPropagation();
  }
});
