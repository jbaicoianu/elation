/** 
 * Form label element
 *
 * @class label
 * @augments elation.ui.base
 * @memberof elation.ui
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
      this.innerHTML = this.label;

      elation.events.add(this, 'click', this.handleFocus);
console.log('made the label', this.forf, typeof this.forf, this);
    }
    handleFocus(ev) {
console.log('click', this, this.forf);
      if (this.forf) {
        this.forf.focus();
      }
    }
  });
});

