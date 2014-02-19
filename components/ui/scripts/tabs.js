/** 
 * Tabs UI component
 *
 * @class tabs
 * @augments elation.ui.base
 * @memberof elation.ui
 * @todo this could probably inherit from ui.list to be more general
 *
 * @param {object} args
 * @param {string} args.items
 */
elation.component.add("ui.tabs", function() {
  this.init = function() {
    this.items = [];
    this.tabitems = [];
    if (this.args.items) {
      for (var k in this.args.items) {
        this.items.push(this.args.items[k]);
      }
    }
    elation.html.addclass(this.container, 'ui_tabs');
    elation.events.fire({type: 'ui_tabs_create'});
    this.create();
  }
  this.create = function() {
    this.ul = elation.html.create({tag: 'ul', append: this.container});
    for (var i = 0; i < this.items.length; i++) {
      var tab = this.items[i];
      var tabargs = {};
      if (tab.tooltip) {
        tabargs.title = tab.tooltip;
      }
      this.add(tab);
    }
  }
  this.add = function(tab) {
    var tabitem = elation.ui.tabitem(null, elation.html.create({tag: 'li', append: this.ul, content: tab.label}), tab);
    elation.events.add(tabitem, "ui_tabitem_hover,ui_tabitem_select", this);
    this.tabitems[tabitem.tabname] = tabitem;
  }
  this.setActiveTab = function(name) {
    if (this.tabitems[name]) {
      this.tabitems[name].select();
    }
  }
  this.ui_tabitem_hover = function(ev) {
    if (this.hoveritem && this.hoveritem != ev.target) {
      //this.hoveritem.unhover();
    }
    this.hoveritem = ev.target;
    //this.hoveritem.hover();
  }
  this.ui_tabitem_select = function(ev) {
    if (this.selecteditem && this.selecteditem != ev.target) {
      this.selecteditem.unselect();
    }
    this.selecteditem = ev.target;
    //this.selecteditem.select();
    elation.events.fire({type: 'ui_tabs_change', element: this, data: this.selecteditem.args});
  }
});
elation.component.add("ui.tabitem", function() {
  this.init = function() {
    this.tabname = this.args.name;
    if (this.args.tooltip) {
      this.tooltip = this.args.tooltip;
      this.container.title = this.args.tooltip;
    }
    elation.events.add(this.container, 'mouseover,mouseout,click', this);
  }
  this.hover = function() {
    elation.html.addclass(this.container, "state_hover");
    elation.events.fire({type: 'ui_tabitem_hover', element: this});
  }
  this.unhover = function() {
    elation.html.removeclass(this.container, "state_hover");
    elation.events.fire({type: 'ui_tabitem_unhover', element: this});
  }
  this.select = function() {
    elation.html.addclass(this.container, "state_selected");
    elation.events.fire({type: 'ui_tabitem_select', element: this});
  }
  this.unselect = function() {
    elation.html.removeclass(this.container, "state_selected");
    elation.events.fire({type: 'ui_tabitem_unselect', element: this});
  }
  this.mouseover = function(ev) {
    this.hover();
  }
  this.mouseout = function(ev) {
    this.unhover();
  }
  this.click = function(ev) {
    this.select();
  }
});
