/** 
 * Handles multi-line text input from users
 *
 * @class textarea
 * @augments elation.ui.base
 * @memberof elation.ui
 *
 * @param {object} args
 * @param {string} args.type
 * @param {string} args.value
 * @param {string} args.inputname
 * @param {string} args.placeholder
 * @param {boolean} args.disabled
 * @param {boolean} args.hidden
 * @param {boolean} args.autofocus
 */
elation.require(['ui.input'], function() {
  elation.elements.define('ui.textarea', class extends elation.elements.ui.input {
    init() {
      super.init();
    }

    create() {
      if (this.label) {
        this.labelobject = elation.ui.label({ append: this, label: this.label });
      }

      this.inputelement = elation.html.create({tag: 'textarea', append: this});
      if (this.inputelement) {
        this.addEventProxies(this.inputelement, [
          'dragover', 'dragenter', 'dragleave', 'drop', 
          'change', 'input', 'keydown', 'keypress', 'keyup', 
          'mouseover', 'mouseout', 'mousedown', 'mouseup', 'click',
          'touchstart', 'touchend', 'touchmove']);
      }
    }
    /**
     * Event handler for HTML input element's keydown event
     * @function handlekeydown
     * @memberof elation.ui.textarea#
     * @param ev event
     */
    handlekeydown(ev) {
      switch (ev.keyCode) {
        case 13: // enter
          if (ev.ctrlKey) {
            this.accept();
          }
          break;
        case 27: // esc
          this.cancel();
          break;
      } 
    }
  });
});


