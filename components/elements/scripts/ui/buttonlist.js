/** 
 * ButtonList UI element
 *
 * @class buttonlist
 * @augments elation.ui.buttonbar
 * @memberof elation.ui
 *
 * @param {object} args
 * @param {object} args.buttons
 */
elation.require(['elements.ui.buttonbar'], function() {
  elation.elements.define('ui.buttonlist', class extends elation.elements.ui.buttonbar {
  });
});

