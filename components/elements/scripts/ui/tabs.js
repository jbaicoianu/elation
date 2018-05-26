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
      this.defineAttributes({
        itemcomponent: { type: 'string', default: 'ui.tab' },
        showcounts: { type: 'boolean', default: false }
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
      super.create();

      if (this.preview) {
        this.setItems([
          elation.elements.create('ui-tab', {
            append: this,
            label: 'One',
            content: 'Welcome to Tab One'
          }),
          elation.elements.create('ui-tab', {
            append: this,
            label: 'Two',
            content: 'You are now seeing Tab Two'
          }),
          elation.elements.create('ui-tab', {
            append: this,
            label: 'Three',
            content: 'And this is the final tab, Tab Three'
          })
        ]);
      }
      this.updateActiveTab();
      this.dispatchEvent({type: 'create'});
    }
    setItems(items) {
      this.items = items;

      if (!this.tabbar) {
        this.tabbar = elation.elements.create('ui-tabbar', {
          append: this,
          itemcomponent: (this.showcounts ? 'ui.tabcountbutton' : 'ui.button')
        });
        elation.events.add(this.tabbar, 'click', (ev) => this.handleTabbarClick(ev));
      }
//console.log('create it!', this.items);
      this.tabbar.setButtons(this.getTabButtons());
      this.buttons = this.tabbar.items;
      if (this.selected) {
        this.setActiveTab(this.selected);
      } else {
        this.updateActiveTab();
      }

      for (var i = 0; i < this.items.length; i++) {
        let tab = this.items[i];
        if (!elation.events.hasEventListener(tab, 'countchange')) {
          elation.events.add(tab, 'countchange', (ev) => this.updateButtonCounts());
        }
      }
    }
    setActiveTab(name) {
      for (var k in this.items) {
        let tab = this.items[k],
            button = this.buttons[k];

        if (!(tab instanceof elation.elements.ui.tab)) continue;
        //if (this.items[name]) {
          //console.log('bing', name, this.items[name]);
          //this.items[name].select();
        //}
        if (k == name) {
          tab.select();
          button.selected = true;
          if (tab.parentNode !== this) {
            this.appendChild(tab);
          }
          tab.refresh();
        } else {
          tab.unselect();
          button.selected = false;
          if (tab.parentNode === this) {
            this.removeChild(tab);
          }
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
          let buttonargs = {
            label: items[i].label,
            name: i,
            disabled: items[i].disabled && items[i].disabled !== '',
            count: items[i].count || 0
          };
          buttons.push(buttonargs);
        }
      }
      return this.buttons;
    }
    updateButtonCounts() {
      for (var i = 0; i < this.items.length; i++) {
        this.buttons[i].count = this.items[i].count;
      }
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

