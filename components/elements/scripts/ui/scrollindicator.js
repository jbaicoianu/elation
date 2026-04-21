/** 
 * Scroll indicator element
 *
 * @class scrollindicator
 * @hideconstructor
 * @category UI
 * @augments elation.elements.ui.base
 * @memberof elation.elements.ui
 *
 * @param {object} args
 * @param {string} args.target
 */
elation.require(["elements.elements"], function() {
  elation.elements.define("ui.scrollindicator", class extends elation.elements.base {
    init() {
      super.init();
      this.defineAttributes({
        target: { type: 'string' },
      });
    }
    create() {
      elation.events.add(this, 'click', this.handleClick);
    }
    handleClick(ev) {
      if (this.target) {
        let el = document.querySelector(this.target);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          ev.preventDefault();
        }
      }
    }
  });
});


