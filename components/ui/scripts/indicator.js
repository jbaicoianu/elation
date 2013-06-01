elation.component.add('ui.indicator', function() {
  this.init = function() {
    elation.html.addclass(this.container, 'ui_indicator');
  }
  this.setState = function(state) {
    if (!elation.html.hasclass(this.container, state)) {
      elation.html.addclass(this.container, state);
    }
  }
});
