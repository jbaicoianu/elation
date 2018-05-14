elation.require(['elements.elements', 'elements.ui.label'], function() {
  elation.requireCSS('ui.toggle');

  elation.elements.define('ui.toggle', class extends elation.elements.base {
    init() {
      super.init();
      this.defineAttributes({
        checked: { type: 'boolean', default: false },
        disabled: { type: 'boolean', default: false },
        label: { type: 'string' }
      });
      if (this.checked === '') this.checked = true; // FIXME - type hinting should handle this

      if (this.preview) {
        this.label = 'Toggle';
      }
    }
    create() {
      var checked = this.checked || this.checked === '';
      if (this.bindvar && this.bindvar[0][this.bindvar[1]]) {
        checked = true;
      }

      if (!this.checkbox) {
        this.checkbox = elation.elements.create('input', {
          append: this, 
          type: 'checkbox', 
          name: this.formname,
          checked: checked
        });
        this.createlabel(this.label);
        this.toggleelement = elation.elements.create('div', {
          append: this, 
        });

        elation.events.add(this, 'click', (ev) => { this.toggle(); ev.stopPropagation(); });
      }
      this.refresh();
    }
    createlabel(value) {
      if (!this.formlabel) {
        this.formlabel = elation.elements.create('ui.label', {
          label: value,
          append: this,
        });
        this.formlabel.setLabel(value);
      } else {
        this.formlabel.setLabel(value);
      }
    }
    toggle() {
      if (this.disabled === false) {
        this.setstate(!(this.checked || this.checked === ''));
      }
    }
    setlabel(newlabel) {
      this.label = newlabel;
      if (this.formlabel) {
        this.formlabel.setLabel(newlabel);
      } else {
        this.createlabel(newlabel);
      }
    }
    setstate(newstate) {
      this.checked = newstate;

      // If a bindvar is passed in, automatically update the specified object property
      if (this.bindvar) {
        this.bindvar[0][this.bindvar[1]] = this.checked;
      }

      var evname = "toggle_" + (this.checked ? "on" : "off");
      // Fire two events - separate toggle_on/toggle_off events, plus a general toggle event
      elation.events.fire({type: evname, element: this, data: this.checked});
      elation.events.fire({type: 'toggle', element: this, data: this.checked});

      this.refresh();
    }
    render() {
      super.render();
      if (this.checkbox) {
        this.checkbox.checked = (this.checked || this.checked === '');
      }
    }
    focus() {
      this.toggle();
      this.checkbox.focus();
    }
  });
});

