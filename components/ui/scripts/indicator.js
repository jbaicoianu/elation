elation.component.add('ui.indicator', function() {
  this.init = function() {
    elation.html.addclass(this.container, 'ui_indicator');
    elation.events.add(this.container, 'click', this);
  }
  this.setState = function(state) {
    if (this.state && this.state != state) {
      this.removeState(this.state);
    }
    this.state = state;
    if (!elation.html.hasclass(this.container, state)) {
      elation.html.addclass(this.container, state);
    }
  }
  this.removeState = function(state) {
    elation.html.removeclass(this.container, state);
  }
  this.click = function(ev) {
    elation.events.fire({type: 'click', element: this, event: ev});
  }
});
