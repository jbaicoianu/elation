elation.require(['ui.base'], function() {
  /** 
   * Progressbar UI component
   *
   * @class progressbar
   * @augments elation.ui.base
   * @memberof elation.ui
   *
   * @param {object} args
   * @param {string} args.label
   */
  elation.component.add("ui.progressbar", function() {
    this.value = 0;
    this.start = 0;
    this.end = 100;
    this.orientation = 'horizontal';
    this.hidden = false;

    this.init = function() {
      if (this.args.orientation) this.orientation = this.args.orientation;
      elation.html.addclass(this.container, 'ui_progressbar');
      elation.html.addclass(this.container, 'ui_progressbar_' + this.orientation);
      this.inner = elation.html.create({tag: 'div', classname: 'ui_progressbar_inner', append: this.container});
      this.labeldiv = elation.html.create({tag: 'div', classname: 'ui_progressbar_label', append: this.container});

      if (this.args.label) this.setlabel(this.args.label);
      if (this.args.hidden) {
        this.hide();
      }
    }
    this.set = function(value) {
      this.value = value;
      this.render();
    }
    this.setlabel = function(label) {
      this.labeldiv.innerHTML = label;
    }
    this.hide = function() {
      this.hidden = true;
      elation.html.addclass(this.container, 'state_hidden');
    }
    this.show = function(value, label) {
      this.hidden = false;
      if (label) this.setlabel(label);
      if (value) this.set(value);
      elation.html.removeclass(this.container, 'state_hidden');
    }
    this.render = function() {
      var percent = (this.value - this.start) / (this.end - this.start);
      switch (this.orientation) {
        case 'vertical':
          var height = this.container.offsetHeight;
          this.inner.style.height = (height * percent) + 'px';
          break;
        case 'horizontal':
        default:
          var width = this.container.offsetWidth;
          this.inner.style.width = (width * percent) + 'px';
          break;
      }
    }
  }, elation.ui.base);
});
