/**
 * Horizontal tab bar paired with content panels. Child `<ui-tab>` elements
 * become the tabs; each tab's `label` attribute provides the button text.
 * Only the active tab is attached to the DOM at a time.
 *
 * @class tabs
 * @hideconstructor
 * @category UI
 * @augments elation.elements.ui.list
 * @memberof elation.elements.ui
 * @example
 * <ui-tabs>
 *   <ui-tab label="Overview">Overview content</ui-tab>
 *   <ui-tab label="Details">Detail content</ui-tab>
 * </ui-tabs>
 */
elation.require(['elements.ui.list', 'elements.ui.tabbar', 'elements.ui.tab'], function() {
  elation.requireCSS('ui.tabs');

  elation.elements.define('ui.tabs', class extends elation.elements.ui.list {
    init() {
      super.init();
      this.defineAttributes({
        itemcomponent: { type: 'string', default: 'ui.tab' },
        showcounts: { type: 'boolean', default: false },
        selectable: { type: 'boolean', default: false }
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

      elation.events.add(this, 'tablabelchange', ev => {
        let idx = this.items.indexOf(ev.target);
        if (idx != -1) {
          this.buttons[idx].label = ev.data;
          ev.stopPropagation();
        }
      });
    }
    setItems(items) {
      this.items = items;

      this._ensureTabbar();
      this.tabbar.setButtons(this.getTabButtons());
      this.buttons = this.tabbar.items;
      if (this.selected) {
        this.setActiveTab(this.selected);
      } else {
        this.updateActiveTab();
      }

      for (var i = 0; i < this.items.length; i++) {
        this._wireTabEvents(this.items[i]);
      }
    }
    /**
     * Add a tab dynamically. Accepts either an existing `ui-tab` element or an args object
     * (passed through to `elation.elements.create('ui-tab', ...)`).
     *
     * Insertion position is resolved in priority order: `options.position` → `options.before`
     * → `options.after` → append to end.
     *
     * The new tab is auto-selected only when the tabs component was previously empty,
     * unless `options.select` is explicitly set.
     *
     * @function addTab
     * @memberof elation.elements.ui.tabs#
     * @fires elation.elements.ui.tabs#tabadd
     * @param {elation.elements.ui.tab|object} tab  A tab element or an args object used to create one.
     * @param {object} [options]
     * @param {number} [options.position]  Explicit insertion index.
     * @param {elation.elements.ui.tab} [options.before]  Insert before this existing tab.
     * @param {elation.elements.ui.tab} [options.after]  Insert after this existing tab.
     * @param {boolean} [options.select]  Force-activate (true) or suppress activation (false).
     * @returns {elation.elements.ui.tab}  The newly-added tab element.
     */
    addTab(tab, options = {}) {
      if (!(tab instanceof elation.elements.ui.tab)) {
        tab = elation.elements.create('ui-tab', tab);
      }

      let index;
      if (typeof options.position === 'number') {
        index = options.position;
      } else if (options.before) {
        index = this.items.indexOf(options.before);
        if (index === -1) index = this.items.length;
      } else if (options.after) {
        let afterIdx = this.items.indexOf(options.after);
        index = (afterIdx === -1) ? this.items.length : afterIdx + 1;
      } else {
        index = this.items.length;
      }
      index = Math.max(0, Math.min(index, this.items.length));

      let wasEmpty = this.items.length === 0;

      this._ensureTabbar();
      this.buttons = this.tabbar.items;

      this.items.splice(index, 0, tab);

      let button = this.tabbar.createButton(this._buildButtonArgs(tab, index));
      if (index >= this.tabbar.items.length) {
        this.tabbar.appendChild(button);
        this.tabbar.items.push(button);
      } else {
        let ref = this.tabbar.items[index];
        this.tabbar.insertBefore(button, ref);
        this.tabbar.items.splice(index, 0, button);
      }

      for (let i = index + 1; i < this.tabbar.items.length; i++) {
        this.tabbar.items[i].name = i;
      }

      this._wireTabEvents(tab);

      let shouldSelect = (options.select !== undefined) ? options.select : wasEmpty;
      if (shouldSelect) {
        this.setActiveTab(index);
      }

      this.dispatchEvent({type: 'tabadd', data: tab});
      return tab;
    }
    /**
     * Remove a tab dynamically. Accepts either the tab element or its numeric index.
     * If the removed tab was active, the next tab (or previous if it was last) is activated.
     *
     * @function removeTab
     * @memberof elation.elements.ui.tabs#
     * @fires elation.elements.ui.tabs#tabremove
     * @param {elation.elements.ui.tab|number} tab  Tab element or index to remove.
     * @returns {elation.elements.ui.tab|null}  The removed tab, or null if not found.
     */
    removeTab(tab) {
      let index;
      if (typeof tab === 'number') {
        index = tab;
        tab = this.items[index];
      } else {
        index = this.items.indexOf(tab);
      }
      if (!tab || index === -1) return null;

      let wasActive = (tab.parentNode === this);

      let button = this.tabbar && this.tabbar.items[index];
      if (button) {
        if (button.parentNode === this.tabbar) {
          this.tabbar.removeChild(button);
        }
        this.tabbar.items.splice(index, 1);
      }

      this.items.splice(index, 1);
      if (tab.parentNode === this) {
        this.removeChild(tab);
      }

      if (this.tabbar) {
        for (let i = index; i < this.tabbar.items.length; i++) {
          this.tabbar.items[i].name = i;
        }
      }

      if (wasActive && this.items.length > 0) {
        let next = Math.min(index, this.items.length - 1);
        this.setActiveTab(next);
      }

      this.dispatchEvent({type: 'tabremove', data: tab});
      return tab;
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
          button.selected = true;
          if (tab.parentNode !== this) {
            this.appendChild(tab);
          }
          tab.select();
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
          buttons.push(this._buildButtonArgs(items[i], i));
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
      this.dispatchEvent({type: 'tabchange', data: this.selecteditem});
    }
    _ensureTabbar() {
      if (!this.tabbar) {
        this.tabbar = elation.elements.create('ui-tabbar', {
          append: this,
          itemcomponent: (this.showcounts ? 'ui.tabcountbutton' : 'ui.button')
        });
        elation.events.add(this.tabbar, 'click', (ev) => this.handleTabbarClick(ev));
      }
    }
    _buildButtonArgs(tab, index) {
      return {
        label: tab.label,
        name: index,
        disabled: tab.disabled && tab.disabled !== '',
        count: tab.count || 0
      };
    }
    _wireTabEvents(tab) {
      if (!elation.events.hasEventListener(tab, 'countchange')) {
        elation.events.add(tab, 'countchange', (ev) => this.updateButtonCounts());
      }
    }
  });
});

