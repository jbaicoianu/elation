/** 
 * Handles text input from users
 *
 * @class input
 * @augments elation.ui.base
 * @memberof elation.ui
 *
 * @param {object} args
 * @param {string} args.type
 * @param {string} args.value
 * @param {string} args.inputname
 * @param {string} args.placeholder
 * @param {boolean} args.disabled
 * @param {boolean} args.hidden
 * @param {boolean} args.autofocus
 */
elation.require(['ui.base', 'ui.label'], function() {
  elation.requireCSS('ui.input');

  elation.component.add('ui.input', function() {
    this.defaultcontainer = {tag: 'div', classname: 'ui_input'};

    /** 
     * Initialize component
     * @function init
     * @memberof elation.ui.input#
     */
    this.init = function() {
      //this.value = this.container.value;
      this.hidden = false;

      this.create();

      for (var k in this.events) {
        elation.events.add(this.inputelement, k, this.events[k]);
      }

      if (this.args.hidden) this.hide();

      elation.events.add(this.inputelement, 'focus', elation.bind(this, this.handlefocus));
      elation.events.add(this.inputelement, 'blur', elation.bind(this, this.handleblur));
      elation.events.add(this.inputelement, 'input', elation.bind(this, this.handleinput));
      elation.events.add(this.inputelement, 'change', elation.bind(this, this.handleinput));
      elation.events.add(this.inputelement, 'keydown', elation.bind(this, this.handlekeydown));

      // Set up object setters/getters to bridge with HTML element attributes
      Object.defineProperty(this, "value", { get: function() { return this.inputelement.value; }, set: function(v) { this.inputelement.value = v; } });
      Object.defineProperty(this, "disabled", { get: function() { return this.inputelement.disabled; }, set: function(v) { this.inputelement.disabled = v; } });
      Object.defineProperty(this, "autofocus", { get: function() { return this.inputelement.autofocus; }, set: function(v) { this.inputelement.autofocus = v; } });

      if (this.args.inputname) {
        this.inputelement.name = this.args.inputname;
      }
      if (this.args.placeholder) {
        this.inputelement.placeholder = this.args.placeholder;
      }
      if (this.args.disabled) {
        this.inputelement.disabled = true;
      }
      if (this.args.autofocus) {
        this.inputelement.autofocus = true;
      }
      if (this.args.value) {
        this.value = this.args.value;
      }
      elation.html.addclass(this.inputelement, 'ui_input_element'); 
      if (this.args.classname) {
        elation.html.addclass(this.container, this.args.classname); 
      }
    }
    this.create = function() {
      if (this.args.label) {
        this.label = elation.ui.label({ append: this, label: this.args.label });
      }

      if (this.container instanceof HTMLInputElement) {
        this.inputelement = this.container;
      } else {
        var inputs = elation.find('input', this.container);
        if (inputs.length > 0) {
          this.inputelement = inputs[0];
        } else {
          this.inputelement = elation.html.create({tag: 'input', append: this.container});
          if (this.args.type) { 
            this.inputelement.type = this.args.type;
          }
        }
      }

      if (this.args.id) {
        this.inputelement.id = this.args.id;
      }
    }
    /**
     * Mark this component as being enabled
     * @function enable
     * @memberof elation.ui.input#
     */
    this.enable = function() {
      this.disabled = false;
    }
    /** Mark this component as being disabled
     * @function disable
     * @memberof elation.ui.input#
     */
    this.disable = function() {
      this.disabled = true;
    }
    /** Sets this input element as focused
     * @function focus
     * @memberof elation.ui.input#
     */
    this.focus = function() {
      this.inputelement.focus();
      elation.events.fire(this, 'focus');
    }
    /** Removes focus from this input element
     * @function blur
     * @memberof elation.ui.input#
     */
    this.blur = function() {
      this.inputelement.blur();
      elation.events.fire(this, 'blur');
    }
    /** Accepts the current value of the input component and emit appropriate events
     * @function accept
     * @memberof elation.ui.input#
     * @fire elation.ui.input#ui_input_accept
     */
    this.accept = function() {
      this.blur();
      elation.events.fire({type: 'ui_input_accept', element: this, data: this.value});
    }
    /** Restore input value to what it was before editing began and emit appropriate events
     * @function cancel
     * @memberof elation.ui.input#
     * @fire elation.ui.input#ui_input_cancel
     */
    this.cancel = function() {
      if (!elation.utils.isNull(this.lastvalue) && this.lastvalue != this.value) {
        this.value = this.lastvalue;
        elation.events.fire({type: 'ui_input_cancel', element: this, data: this.value});
      }
      this.blur();
    }
    /**
     * Reset input to blank, optionally focusing it
     * @function clear
     * @memberof elation.ui.input#
     * @param focus boolean force focus on this component
     * @fire elation.ui.input#ui_input_clear
     */
    this.clear = function(focus) {
      this.value = "";
      this.lastvalue = "";
      if (focus) {
        this.focus();
      }
      elation.events.fire({type: 'ui_input_clear', element: this, data: this.value});
    }
    /**
     * Event handler for HTML input element's input event
     * @function handleinput
     * @memberof elation.ui.input#
     * @param ev event
     * @fire elation.ui.input#ui_input_change
     */
    this.handleinput = function(ev) {
      //this.value = this.inputelement.value;
      elation.events.fire({type: 'ui_input_change', element: this, data: this.value});
    }
    /**
     * Event handler for HTML input element's keydown event
     * @function handlekeydown
     * @memberof elation.ui.input#
     * @param ev event
     */
    this.handlekeydown = function(ev) {
      switch (ev.keyCode) {
        case 13: // enter
          this.accept();
          break;
        case 27: // esc
          this.cancel();
          break;
      } 
    }
    /**
     * Event handler for HTML input element's focus event
     * @function handlefocus
     * @memberof elation.ui.input#
     * @param ev event
     */
    this.handlefocus = function(ev) {
      this.lastvalue = this.value;
      elation.events.fire(this, 'focus');
    }
    /**
     * Event handler for HTML input element's blur event
     * @function handleblur
     * @memberof elation.ui.input#
     * @param ev event
     */
    this.handleblur = function(ev) {
      elation.events.fire({type: 'blur', element: this, data: this.value});
    }
  }, elation.ui.base);
});
