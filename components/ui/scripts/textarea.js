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
  elation.component.add('ui.textarea', function() {
    this.defaultcontainer = {tag: 'div', classname: 'ui_textarea'};

    this.init = function() {
      elation.ui.textarea.extendclass.init.call(this);
    }

    this.create = function() {
      if (this.args.label) {
        this.label = elation.ui.label({ append: this, label: this.args.label });
      }

      if (this.container instanceof HTMLTextAreaElement) {
        this.inputelement = this.container;
      } else {
        var inputs = elation.find('textarea', this.container);
        if (inputs.length > 0) {
          this.inputelement = inputs[0];
        } else {
          this.inputelement = elation.html.create({tag: 'textarea', append: this.container});
        }
      }
      if (this.args.value) {
        this.value = this.args.value;
      }
    }
    /**
     * Event handler for HTML input element's keydown event
     * @function handlekeydown
     * @memberof elation.ui.textarea#
     * @param ev event
     */
    this.handlekeydown = function(ev) {
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
  }, elation.ui.input);
});

