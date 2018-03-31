elation.require(['elements.ui.list', 'elements.ui.checkbox'], function() {
  elation.elements.define('ui.checklist', class extends elation.elements.ui.list {
    init() {
      super.init();
    }
    createlistitem(args) {
      var foo = elation.elements.create('ui.checklistitem', args);
      return foo;
    }
  });

  elation.elements.define('ui.checklistitem', class extends elation.elements.ui.item {
    init() {
      super.init();
      this.defineAttributes({
        checkedattr: { type: 'string' },
        checked: { type: 'boolean', default: false }
      });
    }
    create() {
      this.setcontent(this.value);
    }
    toggle() {
      this.checkbox.toggle();
      this.checked = this.checkbox.togglestate;
    }
    handletoggle(ev) {
      this.checked = this.checkbox.togglestate;
    }
    setcontent(value) {
      var filled = false;
      if (!this.checkbox) {
        this.checkbox = elation.elements.create('ui.checkbox', {
          label: '',
          checked: this.checked,
          append: this
        });
        elation.events.add(this.checkbox, 'toggle', elation.bind(this, this.handletoggle));
      }
      if (value instanceof elation.component.base) {
        this.checkbox.setlabel(value.container);
        filled = true;
      } else if (this.itemtemplate && this.itemtemplate != 'null') { // FIXME - should never get 'null' as a string here
        this.checkbox.setlabel(elation.template.get(this.itemtemplate, value));
        filled = true;
      } else if (this.itemcomponent && this.itemcomponent != 'null') { // FIXME - should never get 'null' as a string here
        var itemcomponentclass = elation.utils.arrayget(elation, this.itemcomponent);
        if (itemcomponentclass) {
          var itemcomponent = itemcomponentclass(value);
          this.checkbox.setlabel(itemcomponentclass);
          filled = true;
        }
      } 
      if (!filled) {
        if (elation.utils.isString(value)) {
          this.checkbox.setlabel(value);
        } else {
          var attrval = elation.utils.arrayget(value, this.labelattr);
          if (attrval !== null) {
            if (this.checkbox) this.checkbox.setlabel(attrval);
          }
        }
      }
    }
    refresh() {
      if (this.checkbox) {
        this.checkbox.setstate(this.checked);
      }
      super.refresh();
    }
  });
});

