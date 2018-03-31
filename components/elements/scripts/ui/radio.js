elation.require(['elements.ui.toggle'], function() {
  elation.elements.define('ui.radio', class extends elation.elements.ui.toggle {
    create() {
      super.create();
      this.checkbox.type = 'radio';
    }
  });
});

