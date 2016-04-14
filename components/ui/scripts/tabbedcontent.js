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
    this.setActiveTab = function(name) {
      return this.tabs.setActiveTab(name);
    }
    this.ui_tabs_change = function(ev) {
      var tab = ev.data;
      if (tab && tab.content) {
        //console.log('tabitem_select', ev, this);
        this.content.setcontent(this.args.contenttype == 'content' ? tab.content : tab.name);
      }
    }
  }, elation.ui.content);
});

