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
elation.require(['ui.base'], function() {
  elation.requireCSS('ui.tabs');

  elation.component.add("ui.tabs", function() {
    this.defaultcontainer = { tag: 'div', classname: 'ui_tabs' };

    this.init = function() {
      this.items = [];
      this.tabitems = [];
      if (this.args.items) {
        for (var k in this.args.items) {
          var item = this.args.items[k];
          if (!item.name) item.name = k;
          this.items.push(item);
        }
      }
      elation.html.addclass(this.container, 'ui_tabs');
      if (this.args.classname) {
        elation.html.addclass(this.container, this.args.classname);
      }
      this.create();
      setTimeout(function() {
        if (this.args.selected) {
          this.setActiveTab(this.args.selected);
        } else {
          this.setActiveTab(Object.keys(this.tabitems)[0]);
        }
      }.bind(this), 0);
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
      elation.events.fire({ type: 'ui_tabs_create', element: this });
    }
    this.add = function(tab) {
      var tabitem = elation.ui.tabitem(null, elation.html.create({
        tag: 'li', 
        append: this.ul, 
        content: tab.label
      }), tab);
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
  }, elation.ui.base);
  elation.component.add("ui.tabitem", function() {
    this.init = function() {
      this.tabname = this.args.name;
      if (this.args.tooltip) {
        this.tooltip = this.args.tooltip;
        this.container.title = this.args.tooltip;
      }
      if (this.args.disabled) {
        this.disable();
      }
      elation.events.add(this.container, 'mouseover,mouseout,click', this);
    }
    this.hover = function() {
      this.addclass("state_hover");
      elation.events.fire({type: 'ui_tabitem_hover', element: this});
    }
    this.unhover = function() {
      this.removeclass("state_hover");
      elation.events.fire({type: 'ui_tabitem_unhover', element: this});
    }
    this.select = function() {
      this.addclass("state_selected");
      elation.events.fire({type: 'ui_tabitem_select', element: this});
    }
    this.unselect = function() {
      this.removeclass("state_selected");
      elation.events.fire({type: 'ui_tabitem_unselect', element: this});
    }
    this.mouseover = function(ev) {
      if (!this.disabled) {
        this.hover();
      }
    }
    this.mouseout = function(ev) {
      if (!this.disabled) {
        this.unhover();
      }
    }
    this.click = function(ev) {
      if (!this.disabled) {
        this.select();
      }
    }
    this.enable = function() {
      this.disabled = false;
      this.removeclass('state_disabled');
    }
    this.disable = function() {
      this.disabled = true;
      this.addclass('state_disabled');
    }
  }, elation.ui.base);
});
