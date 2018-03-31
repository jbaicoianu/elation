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
elation.require(['elements.ui.list', 'elements.ui.tabbar', 'elements.ui.tab'], function() {
  elation.requireCSS('ui.tabs');

  elation.elements.define('ui.tabs', class extends elation.elements.ui.list {
    init() {
      super.init();
console.log(this.innerHTML);
      this.defineAttributes({
        itemcomponent: { type: 'string', default: 'ui.tab' }
      });
      //this.collection = elation.elements.create('collection-simple');
/*
      if (this.args.items) {
        if (elation.utils.isArray(this.args.items)) {
          for (var i = 0; i < this.args.items.length; i++) {
            var item = this.args.items[i];
            if (elation.utils.isString(item)) {
              item = { name: item, label: item };
            }
            this.items.push(item);
          }
        } else {
          for (var k in this.args.items) {
            var item = this.args.items[k];
            if (!item.name) item.name = k;
            this.items.push(item);
          }
        }
      }
*/
    }
    create() {
console.log(this.innerHTML);
      if (this.tabbar) return; // FIXME - create is being called twice
      this.buttons = false;
/*
      this.ul = elation.html.create({tag: 'ul', append: this.container});
      for (var i = 0; i < this.items.length; i++) {
        var tab = this.items[i];
        var tabargs = {};
        if (tab.tooltip) {
          tabargs.title = tab.tooltip;
        }
        this.add(tab);
      }
*/
      this.tabbar = elation.elements.create('ui-tabbar', {
        append: this,
/*
        buttons: [
          { label: 'Foo', name: 0 },
          { label: 'Bar', name: 1 },
          { label: 'Baz', name: 2 },
          { label: 'Blah', name: 3 },
        ]
*/
        //collection: this.tabcollection,
      });
      elation.events.add(this.tabbar, 'click', (ev) => this.handleTabbarClick(ev));
      super.create();
//console.log('create it!', this.items);
      this.tabbar.setButtons(this.getTabButtons());
      this.buttons = this.tabbar.items;
      if (this.selected) {
        this.setActiveTab(this.selected);
      } else {
        this.updateActiveTab();
      }
      this.dispatchEvent({type: 'create'});
    }
    setActiveTab(name) {
      for (var k in this.items) {
        //if (this.items[name]) {
          //console.log('bing', name, this.items[name]);
          //this.items[name].select();
        //}
        if (k == name) {
          this.items[k].select();
          this.buttons[k].selected = true;
        } else {
          this.items[k].unselect();
          this.buttons[k].selected = false;
        }
      }
    }
    updateActiveTab() {
      var tabs = this.items;
      for (var i = 0; i < tabs.length; i++) {
        var tab = tabs[i];
        if (tab.selected || tab.selected === "") {
          this.setActiveTab(i);
          return;
        }
      }
      // No tab selected in mark-up, so default to the first tab
      this.setActiveTab(0);
    }
    getTabButtons() {
      if (!this.buttons) {
        var buttons = this.buttons = [];
        var items = this.items;
        for (var i = 0; i < items.length; i++) {
          buttons.push({label: items[i].label, name: i, disabled: items[i].disabled && items[i].disabled !== ''});
        }
      }
      return this.buttons;
    }
    handleTabbarClick(ev) {
      var button = ev.target;
      if (button instanceof elation.elements.ui.button) {
        this.setActiveTab(button.name);
      }
    }
    ui_tabitem_hover(ev) {
      if (this.hoveritem && this.hoveritem != ev.target) {
        //this.hoveritem.unhover();
      }
      this.hoveritem = ev.target;
      //this.hoveritem.hover();
    }
    ui_tabitem_select(ev) {
      if (this.selecteditem && this.selecteditem != ev.target) {
        this.selecteditem.unselect();
      }
      this.selecteditem = ev.target;
      //this.selecteditem.select();
      this.dispatchEvent({type: 'change', data: this.selecteditem});
    }
  });
});

