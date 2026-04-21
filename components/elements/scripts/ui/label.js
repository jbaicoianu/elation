/** 
 * Form label element
 *
 * @class label
 * @hideconstructor
 * @category UI
 * @augments elation.elements.ui.base
 * @memberof elation.elements.ui
 *
 * @param {object} args
 * @param {string} args.label
 */
elation.require(["elements.elements"], function() {
  elation.elements.define("ui.label", class extends elation.elements.base {
    init() {
      super.init();
      this.defineAttributes({
        label: { type: 'string' },
        forf: { type: 'object' },
      });
    }
    create() {
      this.setLabel(this.label);

      elation.events.add(this, 'click', this.handleFocus);
    }
    setLabel(label) {
      this.label = label;
      this.innerHTML = label;
    }
    handleFocus(ev) {
      if (this.forf) {
        this.forf.focus();
      }
    }
  });
});

