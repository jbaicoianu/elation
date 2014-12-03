/** 
 * TabbedContent UI component
 *
 * @class tabbedconent
 * @augments elation.ui.panel
 * @memberof elation.ui
 *
 * @param {object} args
 * @param {string} args.items
 */
elation.require(['ui.panel', 'ui.content', 'ui.tabs'], function() {
  elation.component.add("ui.tabbedcontent", function() {
    this.init = function() {
      elation.ui.tabbedcontent.extendclass.init.call(this);

      this.items = this.args.items || {};

      this.tabs = elation.ui.tabs({
        append: this,
        items: this.items,
      });
      this.content = elation.ui.content({
        append: this
      });
      elation.events.add(this.tabs, 'ui_tabs_change', this);
    }
    this.ui_tabs_change = function(ev) {
      var tab = ev.data;
      if (tab && tab.content) {
        this.content.setcontent(tab.content);
      }
    }
  }, elation.ui.panel);
});

