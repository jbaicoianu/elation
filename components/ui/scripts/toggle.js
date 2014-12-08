elation.require(['ui.base', 'ui.label'], function() {
  elation.component.add('ui.toggle', function() {
    this.defaultcontainer = {tag: 'div', classname: 'ui_toggle'};
    this.init = function() {
      this.togglestate = this.args.togglestate || false;
      this.create();
    }
    this.create = function() {
      var checkboxid = "ui_toggle_checkbox_" + this.id;
      this.checkbox = elation.html.create({tag: 'input', id: checkboxid, append: this, attributes: { type: 'checkbox', name: this.args.formname }});
      this.label = elation.ui.formlabel({label: this.args.label || this.name, for: checkboxid, append: this});
      elation.events.add(this.checkbox, 'click', elation.bind(this, this.toggle));
      this.refresh();
    }
    this.toggle = function() {
      this.togglestate = !this.togglestate;
      var evname = "toggle_" + (this.togglestate ? "on" : "off");
      // Fire two events - separate toggle_on/toggle_off events, plus a general toggle event
      elation.events.fire({type: evname, element: this, data: this.togglestate});
      elation.events.fire({type: 'toggle', element: this, data: this.togglestate});

      // If a bindvar is passed in, automatically update the specified object property
      if (this.args.bindvar) {
        this.args.bindvar[0][this.args.bindvar[1]] = this.togglestate;
      }

      this.refresh();
    }
    this.render = function() {
      this.checkbox.checked = this.togglestate;
    }
  }, elation.ui.base);
});
