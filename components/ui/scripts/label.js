elation.component.add("ui.label", function() {
  this.init = function() {
    if (this.args.label) {
      this.setlabel(this.args.label);
    }
    elation.html.addclass(this.container, 'ui_label');
    if (this.args.classname) {
      elation.html.addclass(this.container, this.args.classname);
    }
    this.editable = this.args.editable || false;
    if (this.editable) {
      elation.html.addclass(this.container, 'state_editable');
      elation.events.add(this.container, 'keydown,blur', this);
      this.container.contentEditable = true;
    }
  }
  this.setlabel = function(label) {
    if (label != this.label) {
      this.label = label;
      this.container.innerHTML = label;
      if (typeof this.label != "undefined") {
        elation.events.fire({type: 'ui_label_change', element: this, data: this.label});
      }
    }
  }
  this.keydown = function(ev) {
    console.log(ev);
    //elation.events.fire({type: 'ui_label_change', element: this, data: this.container.innerHTML});
    switch (ev.keyCode) {
      case 13: // newline
        this.setlabel(this.container.innerHTML);
        this.container.blur();
        ev.preventDefault();
        break;
      case 27: // esc
        this.container.innerHTML = this.label;
        this.container.blur();
        break;
    }
  }
  this.blur = function(ev) {
console.log('blur', ev);
    this.setlabel(this.container.innerHTML);
  }
});
