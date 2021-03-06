/** 
 * TabbedContent UI component
 *
 * @class tabbedconent
 * @augments elation.ui.content
 * @memberof elation.ui
 *
 * @param {object} args
 * @param {string} args.items
 */
elation.require(['ui.content', 'ui.tabs'], function() {
  elation.component.add("ui.tabbedcontent", function() {
    this.defaults = {
      contenttype: 'content'
    };
    this.init = function() {
      elation.ui.tabbedcontent.extendclass.init.call(this);

      this.items = this.args.items || {};

      this.tabs = elation.ui.tabs({
        append: this,
        items: this.items,
        selected: this.args.selected,
        events: {
          'ui_tabs_change': elation.bind(this, this.ui_tabs_change)
        }
      });

      this.content = elation.ui[this.args.contenttype]({
        append: this,
        animation: this.args.animation,
        items: this.items
      });
    }
    this.add = function(name, tab) {
      this.items[name] = tab;
      this.tabs.add(tab);
    }
    this.setActiveTab = function(name) {
      return this.tabs.setActiveTab(name);
    }
    this.ui_tabs_change = function(ev) {
      var tab = ev.data;
      if (tab && tab.content) {
        //console.log('tabitem_select', ev, this);
        this.content.setcontent(this.args.contenttype == 'content' ? tab.content : tab.name);
        elation.events.fire({element: this, type: 'tab_change', data: tab});
      }
    }
  }, elation.ui.content);
});

