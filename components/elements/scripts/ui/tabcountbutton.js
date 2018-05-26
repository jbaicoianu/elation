elation.require(['elements.ui.notificationbutton'], function() {
  elation.elements.define('ui.tabcountbutton', class extends elation.elements.ui.notificationbutton {
    init() {
      super.init();
      this.defineAttributes({
        selected: { type: 'boolean', default: false }
      });
    }
  });
});

