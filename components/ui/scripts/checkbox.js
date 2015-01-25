elation.require(['ui.toggle'], function() {
  //elation.requireCSS('ui.checkbox');

  elation.component.add('ui.checkbox', function() {
    this.init = function() {
      elation.ui.checkbox.extendclass.init.call(this);
    }
  }, elation.ui.toggle);
});
