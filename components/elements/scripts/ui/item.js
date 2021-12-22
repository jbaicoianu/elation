elation.require(['elements.base'], function() {

  /** 
   * Item UI element
   * Represents an individual item in a ui.list
   *
   * @class item
   * @augments elation.ui.base
   * @memberof elation.ui
   * @alias elation.ui.item
   *
   * @param {object}  args
   * @param {object}  args.item
   * @param {object}  args.attrs
   * @param {boolean} args.selectable
   */
  elation.elements.define('ui.item', class extends elation.elements.base {
    init() {
      super.init();

      this.defineAttributes({
        value: { type: 'object', innerHTML: true },
        disabled: { type: 'boolean', default: false },
        selected: { type: 'boolean', default: false },
        selectable: { type: 'boolean', default: false },
        nameattr: { type: 'string', default: 'name' },
        childattr: { type: 'string', default: 'items' },
        labelattr: { type: 'string', default: 'label' },
        titleattr: { type: 'string', default: 'title' },
        disabledattr: { type: 'string', default: 'disabled' },
        itemtemplate: { type: 'string' },
        itemcomponent: { type: 'object' },
        itemplaceholder: { type: 'object' },
      });
    }
    create() {
      elation.events.add(this, 'mousedown', (ev) => this.mousedown(ev));

      this.render();
    }
    setValue(value) {
      this.value = value;
      this.render();
    }
    render() {
      super.render();
      // reset classname to default
      this.className = '';
      if (typeof this.value != 'undefined') {
        if (this.placeholder) {
          this.placeholder = false;
        }

        if (this.value instanceof HTMLElement) {
          this.setcontent(this.value);
        } else if (elation.utils.isString(this.value) && this.value != this.innerHTML) {
          this.setcontent(this.value);

          if (this.value.classname) {
            this.addclass(this.value.classname);
          }
        } else if (this.itemtemplate) {
          this.setcontent(this.value);
        }

        if (this.selected) {
          this.addclass("state_selected");
        }
        if (this.lastselected) {
          this.addclass("state_lastselected");
        }
        if (this.titleattr && this.value[this.titleattr]) {
          this.title = this.value[this.titleattr];
        }
        if (!elation.utils.isEmpty(this.disabledattr) && !elation.utils.isEmpty(this.value[this.disabledattr])) {
          this.addclass("state_disabled");
        }
      } else {
        //console.log('JRJRIJRIJRIJR', this.childNodes);
        if (this.childNodes.length > 0) {
          this.extractcontent();
        }
        if (!this.placeholder && this.itemplaceholder && this.itemplaceholder != 'null') { // FIXME - type hinting should mean we never get 'null' as a string
          this.placeholder = true;
          this.setcontent(elation.utils.any(this.itemplaceholder, ''));
        }
      }
    }
    setcontent(value) {
//console.log('set content', (value == this.innerHTML), value, this.innerHTML);
      this.innerHTML = '';
      var filled = false;
      if (value instanceof elation.component.base) {
        this.appendChild(value.container);
        filled = true;
      } else if (value instanceof HTMLElement) {
        this.appendChild(value);
//this.innerHTML = value.innerHTML;
//console.log('here I add the guy to the thing', this.innerHTML, value, value.parentNode, this.parentNode);
        filled = true;
/*
      } else if (this.itemcomponent) {
        var itemcomponentclass = elation.utils.arrayget(elation, this.itemcomponent);
        if (itemcomponentclass) {
          var itemcomponent = itemcomponentclass(null, this, value);
          this.itemcomponent = itemcomponent;
          filled = true;
        }
*/
      } else if (this.itemtemplate) {
        this.innerHTML = elation.template.get(this.itemtemplate, value);
        filled = true;
      }
      if (!filled) {
        if (elation.utils.isString(value)) {
          this.innerHTML = value;
        } else if (this.labelattr) {
          var attrval = elation.utils.arrayget(value, this.labelattr);
          if (attrval !== null) {
            this.innerHTML = attrval;
          }
        }
      }
    }
    extractcontent() {
      var root;
      if (!this.value && this.innerHTML != '') {
        //this.value = this.innerHTML;
      }
    }
    /**
     * Set this list item as being selected
     * @function select
     * @memberof elation.ui.item#
     * @fires elation.ui.item#ui_list_item_select
     */
    select(extra) {
      this.selected = true;
      this.addclass('state_selected');
      this.setAttribute('aria-selected', true);
      // FIXME - 'extra' has two meanings here; if you pass false it doesn't emit events, but if you
      //          pass an object, it's treated as an event, and its properties are cloned
      if (extra !== false) {
        if (elation.events.wasDefaultPrevented(elation.events.fire({type: 'select', element: this, data: this.value, event: extra}))) {
          extra.preventDefault();
        }
      }
    }
    /**
     * Set this list item as being unselected
     * @function unselect
     * @memberof elation.ui.item#
     * @fires elation.ui.item#ui_list_item_unselect
     */
    unselect() {
      this.selected = false;
      this.removeclass('state_selected');
      this.setAttribute('aria-selected', false);
      elation.events.fire({type: 'unselect', element: this, data: this.value});
    }
    /**
     * Set this list item as being the last item selected in its list
     * @function setlastselected
     * @memberof elation.ui.item#
     */
    setlastselected(state) {
      this.lastselected = state;
      var hasclass = this.hasclass('state_lastselected');
      if (state && !hasclass) {
        this.addclass('state_lastselected');
      } else if (!state && hasclass) {
        this.removeclass('state_lastselected');
      }
    }
    /**
     * Event handler: HTML element click
     * @function click
     * @memberof elation.ui.item#
     * @param {event} ev
     */
    mousedown(ev) {
      if (this.selectable && !this.selected) {
        this.select(ev);
        ev.stopPropagation();
      }
    }
  });
});
