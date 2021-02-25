elation.require(['elements.elements'], function() {
  elation.elements.define('ui.content', class extends elation.elements.base {
    init() {
      super.init();
      this.defineAttributes({
        align: { type: 'string' },
        value: { type: 'object', set: this.updateContent }
      });
      this.updateContent(this.value);
    }
    updateContent(value) {
      if (value instanceof HTMLElement) {
        this.innerHTML = '';
        this.appendChild(value);
      } else if (elation.utils.isString(value)) {
        this.innerHTML = value;
      }
    }
  });
});
