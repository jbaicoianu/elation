elation.component.add('ui.spinner', function() {
  this.types = {
    'default': '<div class="loading-container"><div class="loading"></div><div class="loading-text">loading</div></div>'
  };

  this.init = function() {
    elation.html.addclass(this.container, 'ui_spinner');
    this.settype(this.args.type);
  }
  this.settype = function(type) {
    if (!type) type = 'default';
    if (this.type) {
      elation.html.removeclass(this.container, 'ui_spinner_' + this.type);
    }

    this.type = type;
    elation.html.addclass(this.container, 'ui_spinner_' + this.type);
    this.container.innerHTML = this.types[this.type];
  }
});
