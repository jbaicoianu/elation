elation.require(['elements.ui.button'], function() {
  elation.elements.define('ui.tabbutton', class extends elation.elements.ui.button {
    init() {
      super.init();
      this.defineAttributes({
        selected: { type: 'boolean', default: false }
      });
    }
  });
});
