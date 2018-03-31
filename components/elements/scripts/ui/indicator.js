elation.require(['elements.base'], function() {
  elation.elements.define('ui.indicator', class extends elation.elements.base {
    init() {
      super.init();
      this.defineAttributes({
        value: { type: 'integer', default: 0, set: this.updateValue }
      });
    }
    create() {
      this.updateValue();
    }
    updateValue() {
      this.innerHTML = this.value;
    }
  });
});
