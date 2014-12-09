elation.require(['ui.input', 'ui.infinilist', 'ui.panel', 'ui.button', 'elation.collection'], function() {
  elation.requireCSS('ui.combobox');

  elation.component.add('ui.combobox', function() {
    this.defaultcontainer = {tag: 'div', classname: 'ui_combobox'};

    this.init = function() {
      elation.ui.combobox.extendclass.init.call(this);

/*
      if (this.args.items) {
        this.setitems(this.args.items);
      }
*/
      this.inputpanel = elation.ui.panel({
        append: this,
        orientation: 'horizontal'
      });
      this.inputpanel.container.appendChild(this.inputelement);
      this.dropdownbutton = elation.ui.button({
        append: this.inputpanel,
        classname: 'ui_combobox_dropdownbutton',
        label: '▾',
        tabindex: -1,
        events: {
          'click': elation.bind(this, this.toggledropdown)
        }
      });
      this.dropdownlist = elation.ui.infinilist({
        append: this,
        classname: 'ui_combobox_dropdown',
        attrs: this.args.listattrs,
        events: {
          'ui_list_select': elation.bind(this, this.setselection)
        }
      });
      this.dropdownlist.hide();
      if (this.args.filterkeys) {
        this.filterkeys = this.args.filterkeys;
      } else if (this.args.listattrs && this.args.listattrs.value) {
        this.filterkeys = [this.args.listattrs.value];
      } else {
        this.filterkeys = [];
      }
      if (this.args.collection) {
        this.setcollection(this.args.collection);
      }

      //elation.events.add(this.inputelement, 'blur', elation.bind(this, this.blur));
    }
    this.setcollection = function(collection) {
      if (this.collection) {
        // TODO - uninitialize existing collection
      }
      this.collection = collection;
      this.filteredcollection = collection.filter(elation.bind(this, this.filterselection));
      this.dropdownlist.setItemCollection(this.filteredcollection);
    }
    this.filterselection = function(d) {
      for (var i = 0; i < this.filterkeys.length; i++) {
        var k = this.filterkeys[i];
        //if (d[k] && d[k].match(this.value)) {
        if (d[k] && d[k].toLowerCase().indexOf(this.value.toLowerCase()) != -1) {
          return true;
        }
      }
      return false;
    }
    this.showdropdown = function() {
        this.dropdownlist.container.style.width = this.inputelement.offsetWidth + 'px';
        this.dropdownlist.container.style.left = this.inputelement.offsetLeft + 'px';
        this.dropdownlist.show();
        this.dropdownlist.refresh();
    }
    this.hidedropdown = function() {
        this.dropdownlist.hide();
    }

    /* events */
    this.setselection = function(ev) {
console.log('got a set selection', ev.data, this, ev.data.target);
      if (this.args.listattrs && this.args.listattrs.value) {
        this.value = ev.data[this.args.listattrs.value];
      } else {
        this.value = ev.data;
      }
      this.dropdownlist.hide();
      this.inputelement.focus();
    }
    this.toggledropdown = function(ev) {
      if (this.dropdownlist.hidden) {
        this.showdropdown();
      } else {
        this.hidedropdown();
      }
      this.inputelement.focus();
      ev.preventDefault();
    }
/*
    this.blur = function(ev) {
console.log('blur?', ev.relatedTarget);
if (ev.relatedTarget == this.dropdownbutton.container) {
  console.log('YEAH!');
  ev.preventDefault();
  ev.stopPropagation();
this.inputelement.focus();
  return false;
}
      if (!this.dropdownlist.hidden && ev.relatedTarget != this.dropdownbutton && ev.relatedTarget != this.dropdownlist) {
        this.dropdownlist.hide();
      }
    }
*/
    this.handleinput = function(ev) {
      console.log('ding!', this.filteredcollection.items);
      if (this.value.length > 0) {
        this.filteredcollection.update();
        this.showdropdown();
      } else {
        this.hidedropdown();
      }
    }
  }, elation.ui.input);
});
