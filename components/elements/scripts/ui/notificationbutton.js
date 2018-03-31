elation.require(['elements.ui.button', 'elements.ui.indicator'], function() {
  elation.elements.define('ui.notificationbutton', class extends elation.elements.ui.button {
    init() {
      super.init();
      this.defineAttributes({
        count: { type: 'integer', default: 0, set: this.updateCount }
      });
    }
    create() {
      super.create();
      this.indicator = elation.elements.create('ui.indicator', {
        value: this.count,
        append: this
      });
    }
    updateCount() {
      if (this.indicator) {
        this.indicator.value = this.count;
      }
    }
  });
});

