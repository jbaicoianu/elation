/** 
 * Tabbar UI component
 *
 * @class tabbar
 * @augments elation.ui.base
 * @memberof elation.ui
 *
 * @param {object} args
 * @param {string} args.items
 */
elation.require(['elements.ui.buttonbar', 'elements.ui.tabbutton'], function() {
  elation.requireCSS('ui.tabbar');

  elation.elements.define('ui.tabbar', class extends elation.elements.ui.buttonbar {
    init() {
      super.init();
      this.defineAttributes({
        itemcomponent: { type: 'string', default: 'ui.tabbutton' }
      });
    }
  });
});

