elation.require(['elements.base'], function() {
  elation.elements.define('ui.indicator', class extends elation.elements.base {
    init() {
      super.init();
      this.defineAttributes({
        value: { type: 'integer', default: 0, set: this.updateValue }
      });
    }
    create() {
      this.setAttribute('aria-label', 'No new notifications');
      this.updateValue();
    }
    updateValue() {
      this.innerHTML = this.value;
      this.setAttribute('aria-label', this.value + ' new notifications');
    }
  });
});
