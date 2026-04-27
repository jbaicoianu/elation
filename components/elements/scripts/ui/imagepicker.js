elation.require(['elements.elements'], function() {
  elation.requireCSS('ui.imagepicker');

  /**
   * Image file-picker control with a preview canvas. Accepts file input via
   * the standard `<input type="file">` flow and renders the selected image
   * into an adjacent `<canvas>`. Use `onaccept` to receive the selected
   * image data.
   *
   * @class imagepicker
   * @hideconstructor
   * @category UI
   * @augments elation.elements.base
   * @memberof elation.elements.ui
   * @example
   * <ui-imagepicker label="Avatar"></ui-imagepicker>
   *
   * @param {object} args
   * @param {boolean} args.hidden
   * @param {string} args.label
   * @param {string} args.type
   * @param {string} args.placeholder
   * @param {string} args.value
   * @param {boolean} args.disabled
   * @param {boolean} args.autofocus
   * @param {callback} args.onaccept
   */
  elation.elements.define('ui.imagepicker', class extends elation.elements.base {
    init() {
      super.init();
      this.defineAttributes({
        hidden: { type: 'boolean', default: false },
        label: { type: 'string' },
        type: { type: 'string' },
        placeholder: { type: 'string' },
        value: { type: 'string', get: this.getValue, set: this.setValue },
        disabled: { type: 'boolean', default: false },
        autofocus: { type: 'boolean', get: this.getAutofocus, set: this.setAutofocus },
        onaccept: { type: 'callback' },
      });
    }
    create() {
      if (this.label) {
        //this.labelobj = elation.ui.label({ append: this, label: this.label });
        this.labelobject = elation.elements.create('ui.label', { append: this, label: this.label });
        elation.events.add(this.labelobject, 'click', (ev) => { this.focus(); ev.stopPropagation(); });
      }
      this.preview = elation.elements.create('canvas', {
        append: this,
      });
    }
  });
});
