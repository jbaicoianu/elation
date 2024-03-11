elation.require(['elements.elements'], function() {
  elation.elements.define('ui-image-picker', class extends elation.elements.base {
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
