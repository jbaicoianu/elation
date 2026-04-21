/** 
 * ButtonList UI element
 *
 * @class buttonlist
 * @hideconstructor
 * @category UI
 * @augments elation.elements.ui.buttonbar
 * @memberof elation.elements.ui
 *
 * @param {object} args
 * @param {object} args.buttons
 */
elation.require(['elements.ui.buttonbar'], function() {
  elation.elements.define('ui.buttonlist', class extends elation.elements.ui.buttonbar {
  });
});

