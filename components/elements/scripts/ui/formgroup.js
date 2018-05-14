elation.require(['elements.elements'], function() {
  elation.elements.define('ui.formgroup', class extends elation.elements.base {
    init() {
      super.init();
      this.defineAttributes({
        'label': { type: 'text' }
      });
    }
    create() {
      if (this.label) {
        this.labelobj = elation.elements.create('ui-label', {
          label: this.label,
          append: this,
          class: 'groupheader'
        });
      }
    }
  });
});
