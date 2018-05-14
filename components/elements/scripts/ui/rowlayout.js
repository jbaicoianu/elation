elation.require(['elements.base'], function() {
  elation.elements.define('ui.columnlayout', class extends elation.elements.ui.list {
    init() {
      super.init();
      this.defineAttributes({
        rows: { type: 'integer' }
      });
    }
  });
});


