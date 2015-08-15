elation.require(['ui.base', 'ui.label'], function() {
  elation.requireCSS('ui.toggle');

  elation.component.add('ui.toggle', function() {
    this.defaultcontainer = {tag: 'div', classname: 'ui_toggle'};
    this.init = function() {
      this.togglestate = this.args.togglestate || false;
      this.toggleclass = this.args.toggleclass || 'state_toggled';
      this.label = this.args.label || this.name;
      this.create();
    }
    this.create = function() {
      var checkboxid = "ui_toggle_checkbox_" + this.id;
      var selected = this.args.selected || this.args.checked;

      this.formlabel = elation.ui.formlabel({label: this.args.label || this.name, for: checkboxid, append: this});

      this.checkbox = elation.html.create({
        tag: 'input', 
        id: checkboxid, 
        append: this, 
        attributes: { 
          type: 'checkbox', 
          name: this.args.formname
        }
      });

      if (selected)
        this.toggle();

      elation.events.add(this.checkbox, 'click', elation.bind(this, this.toggle));
      this.refresh();
    }
    this.toggle = function() {
      this.setstate(!this.togglestate);
    }
    this.setlabel = function(newlabel) {
      this.label = newlabel;
      this.formlabel.setlabel(newlabel);
    }
    this.setstate = function(newstate) {
      this.togglestate = newstate;
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
      var hasclass = this.hasclass(this.toggleclass);
      if (this.togglestate && !hasclass) {
        this.addclass(this.toggleclass);
      } else if (!this.togglestate && hasclass) {
        this.removeclass(this.toggleclass);
      }
    }
  }, elation.ui.base);
});
