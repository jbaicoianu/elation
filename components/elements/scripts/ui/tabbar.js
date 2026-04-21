/** 
 * Tabbar UI component
 *
 * @class tabbar
 * @hideconstructor
 * @category UI
 * @augments elation.elements.ui.buttonbar
 * @memberof elation.elements.ui
 *
 * @param {object} args
 * @param {string} args.items
 */
elation.require(['elements.ui.buttonbar', 'elements.ui.tabbutton', 'elements.ui.tabcountbutton'], function() {
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

