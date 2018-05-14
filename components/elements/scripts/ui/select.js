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

  elation.elements.define('ui.select', class extends elation.elements.ui.list {
    init() {
      super.init();
    }
    create() {
      this.select = elation.elements.create('select');
      super.create();
      this.appendChild(this.select);

      this.defineAttributes({
        label: { type: 'string' },
        bindvar: { type: 'array' },
        selected: { type: 'object' },
        items: { type: 'object' },
      });

      if (this.label) {
        this.labelobj = elation.elements.create('ui.label', {
          append: this,
          before: this.select,
          label: this.label,
          class: 'ui_select_label' 
        });
        elation.events.add(this.labelobj, 'click', (ev) => { this.focus(); ev.stopPropagation(); });
      }
      if (this.bindvar) {
        this.selected = elation.utils.arrayget(this.bindvar[0], this.bindvar[1]);
      }
      elation.events.add(this.select, "change", this);

/*
      if (this.items) {
        this.setItems(this.items, this.selected);
      } else {
        this.extractItems();
      }
*/

      //this.value = this.select.value;
      this.addPropertyProxies(this.select, ['value']);
    }
    setItems(items, selected) {
      if (items instanceof Array) {
        //this.set('args.items', items.join(';'));
      } else {
        //this.set('args.items', items);
        //items = items.split(';');
      }
      this.items = items;
      this.select.innerHTML = '';
      for (var i = 0; i < items.length; i++) {
        this.addItem(items[i]);
      }
      if (selected) {
        this.setSelected(selected);
      }
    }
    addItem(value, selected) {
      var option = elation.elements.create('option');
      if (value instanceof HTMLElement) {
        option.value = value.value || value.innerHTML;
        option.innerHTML = value.label || value.innerHTML;
      } else {
        option.value = value;
        option.innerHTML = value;
      }
      if (selected) {
        option.selected = selected;
      }
      this.select.appendChild(option);
    }
    setSelected(value) {
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
    /**
     * Extracts items out of the list's existing HTML structure
     * @function extractItems
     * @memberof elation.ui.list#
     */
    extractItems() {
      var items = [];
      for (var i = 0; i < this.childNodes.length; i++) {
        var node = this.childNodes[i];
        if (node instanceof HTMLOptionElement || node instanceof elation.elements.ui.option) {
          items.push(node);
        }
      }
      this.setItems(items);
      for (var i = 0; i < items.length; i++) {
        items[i].parentNode.removeChild(items[i]);
      }
    }
    onchange(ev) {
      //this.value = this.select.value;

      // If a bindvar is passed in, automatically update the specified object property
      if (this.bindvar) {
        elation.utils.arrayset(this.bindvar[0], this.bindvar[1], this.value);
      }

      //this.dispatchEvent({type: "change", data: this.value});
    }
    focus() {
      this.select.focus();
    }
    blur() {
      this.select.blur();
    }
  });

  elation.elements.define('ui.option', class extends elation.elements.base {
  });
});
