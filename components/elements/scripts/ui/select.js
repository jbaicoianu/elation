/** 
 * Select UI component
 *
 * @class select
 * @hideconstructor
 * @category UI
 * @augments elation.elements.ui.list
 * @memberof elation.elements.ui
 *
 * @param {object} args
 * @param {string} args.items
 */
elation.require(['elements.ui.list','elements.ui.label'], function() {
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
      elation.events.add(this.select, "change", (ev) => this.handleSelectChange(ev));

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
      if (value instanceof HTMLOptionElement) {
        // Native option already has reflected value/label/selected.
        option.value     = value.value;
        option.innerHTML = value.label || value.innerHTML;
        if (value.selected) option.selected = true;
      } else if (value instanceof HTMLElement) {
        // Custom element (typically ui-option) — read attributes directly,
        // since value.value / value.label aren't reflected.
        var v = value.getAttribute('value');
        var l = value.getAttribute('label');
        option.value     = (v != null) ? v : ((value.textContent || '').trim() || value.innerHTML);
        option.innerHTML = (l != null) ? l : value.innerHTML;
        if (value.hasAttribute('selected')) option.selected = true;
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
      if (!this.select) return;
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
    setLabel(label) {
      this.label = label;
      this.labelobj.setLabel(label);
    }
    /**
     * Extracts items out of the list's existing HTML structure
     * @function extractItems
     * @memberof elation.elements.ui.list#
     */
    extractItems() {
      // Snapshot the current children so the iteration is stable, then
      // remove the option-shaped ones from the DOM up front. We only
      // need them as data sources for populating the internal <select>;
      // leaving them attached lets them render as visible siblings.
      var items = [];
      var nodes = Array.prototype.slice.call(this.childNodes);
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        var isOption = node instanceof HTMLOptionElement
          || (elation.elements.ui.option && node instanceof elation.elements.ui.option);
        if (isOption) {
          items.push(node);
          if (node.parentNode) node.parentNode.removeChild(node);
        }
      }
      this.setItems(items, this.value);
    }
    handleSelectChange(ev) {
      //this.value = this.select.value;

      // If a bindvar is passed in, automatically update the specified object property
      if (this.bindvar) {
        elation.utils.arrayset(this.bindvar[0], this.bindvar[1], this.value);
      }

      this.dispatchEvent({type: "change", data: this.value});
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
