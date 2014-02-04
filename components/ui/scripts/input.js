elation.component.add('ui.input', function() {
  this.init = function() {
    this.value = this.container.value;
    elation.events.add(this.container, 'input', this);
  }
  this.input = function(ev) {
    this.value = this.container.value;
  }
});
