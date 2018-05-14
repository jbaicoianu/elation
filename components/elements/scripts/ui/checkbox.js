elation.require(['elements.ui.toggle'], function() {
  elation.elements.define('ui.checkbox', class extends elation.elements.ui.toggle {
    init() {
      super.init();
      if (this.preview) {
        this.label = 'Checkbox';
      }
    }
  });
});

