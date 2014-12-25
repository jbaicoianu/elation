elation.require(['ui.list', 'ui.checkbox'], function() {
  elation.requireCSS(['ui.checklist']);

  elation.component.add('ui.checklist', function() {
    this.init = function() {
      elation.ui.checklist.extendclass.init.call(this);
      this.addclass('ui_checklist');
    }
    this.createlistitem = function(args) {
console.log('new list item', args);
      var foo = elation.ui.checklistitem(args);
      return foo;
    }
  }, elation.ui.list);

  elation.component.add('ui.checklistitem', function() {
    this.defaultcontainer = { tag: 'li', classname: 'ui_list_item' };
    this.init = function() {
      elation.ui.checklistitem.extendclass.init.call(this);

      var checkattr = elation.utils.any(this.attrs.checked, 'checked');

      this.checked = elation.utils.any(this.args.checked, this.value[checkattr], false);
      this.checkbox = elation.ui.checkbox({label: '', togglestate: this.checked, append: this});
      elation.events.add(this.checkbox, 'toggle', elation.bind(this, this.handletoggle));
      this.setcontent(this.value);
    }
    this.toggle = function() {
      this.checkbox.toggle();
      this.checked = this.checkbox.togglestate;
    }
    this.handletoggle = function(ev) {
      this.checked = this.checkbox.togglestate;
    }
    this.setcontent = function(value) {
      var filled = false;
      if (value instanceof elation.component.base) {
        this.checkbox.setlabel(value.container);
        filled = true;
      } else if (this.attrs.itemtemplate) {
        this.checkbox.setlabel(elation.template.get(this.attrs.itemtemplate, value));
        filled = true;
      } else if (this.attrs.itemcomponent) {
        var itemcomponentclass = elation.utils.arrayget(elation, this.attrs.itemcomponent);
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
          var attrval = elation.utils.arrayget(value, this.attrs.label);
          if (attrval !== null) {
            if (this.checkbox) this.checkbox.setlabel(attrval);
          }
        }
      }
    }
    this.refresh = function() {
      this.checkbox.setstate(this.checked);
      elation.ui.checklistitem.extendclass.refresh.call(this);
    }
  }, elation.ui.listitem);
});
