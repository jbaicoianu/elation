/** 
 * Select UI component
 *
 * @class select
 * @augments elation.ui.base
 * @memberof elation.ui
 * @todo this could probably inherit from ui.list to be more general
 *
 * @param {object} args
 * @param {string} args.items
 */
elation.require(['ui.base','ui.label'], function() {
  elation.requireCSS('ui.select');

  elation.component.add('ui.select', function() {
    this.defaultcontainer = { tag: 'div', classname: 'ui_select' };

    this.init = function() {
      elation.ui.select.extendclass.init.call(this);

      if (this.args.label) {
        this.label = elation.ui.label({
          append: this,
          label: this.args.label,
          classname: 'ui_select_label' 
        });
      }
      if (this.container instanceof HTMLSelectElement) {
        this.select = this.container;
      } else {
        this.select = elation.html.create({tag: 'select', append: this.container});
      }
      elation.events.add(this.select, "change", this);
      if (this.args.items) {
        this.setItems(this.args.items, this.args.selected);
      }
      this.value = this.select.value;
    }
    this.setItems = function(items, selected) {
      if (items instanceof Array) {
        this.set('args.items', items.join(';'));
      } else {
        this.set('args.items', items);
        items = items.split(';');
      }
      this.select.innerHTML = '';
      for (var i = 0; i < items.length; i++) {
        this.addItem(items[i]);
      }
      if (selected) {
        this.setSelected(selected);
      }
    }
    this.addItem = function(value, selected) {
      var option = elation.html.create({tag: 'option'});
      option.value = value;
      option.innerHTML = value;
      if (selected) {
        option.selected = selected;
      }
      this.select.appendChild(option);
    }
    this.setSelected = function(value) {
      this.value = value;
      var found = false;
      for (var i = 0; i < this.select.childNodes.length; i++) {
        var node = this.select.childNodes[i];
        if (node.value == value) {
          node.selected = true;
          found = true;
        } else {
          node.selected = false;
        }
      }
      if (!found) {
        this.addItem(value, true);
      }
    }
    this.change = function(ev) {
      this.value = this.select.value;
      // FIXME - instead of having custom events per-type, we should reuse common names like "change".  
      //          Here we fire both for compatibility
      elation.events.fire({type: "ui_select_change", data: this.select.value, element: this});
      elation.events.fire({type: "change", data: this.select.value, element: this});
    }
  }, elation.ui.base);
});
