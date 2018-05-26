elation.requireCSS('ui.input');
elation.require(['elements.elements'], function() {
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

  elation.elements.define('ui.input', class extends elation.elements.base {
    /** 
     * Initialize component
     * @function init
     * @memberof elation.ui.input#
     */
    init() {
      super.init();
      this.defineAttributes({
        hidden: { type: 'boolean', default: false },
        label: { type: 'string' },
        type: { type: 'string' },
        placeholder: { type: 'string' },
        value: { type: 'string', get: this.getValue, set: this.setValue },
        disabled: { type: 'boolean', default: false },
        autofocus: { type: 'boolean', get: this.getAutofocus, set: this.setAutofocus },
        onaccept: { type: 'callback' },
      });

      if (this.preview) {
        this.value = 'Lorem ipsum dolor sit amet...';
      }
    }
    create() {
      if (this.label) {
        //this.labelobj = elation.ui.label({ append: this, label: this.label });
        this.labelobject = elation.elements.create('ui.label', { append: this, label: this.label });
        elation.events.add(this.labelobject, 'click', (ev) => { this.focus(); ev.stopPropagation(); });
      }

      this.inputelement = elation.html.create({tag: 'input', append: this});

      if (this.type) { 
        this.inputelement.type = this.type;
      }

      for (var k in this.events) {
        elation.events.add(this.inputelement, k, this.events[k]);
      }

      if (this.hidden) this.hide();

      if (this.placeholder) {
        this.inputelement.placeholder = this.placeholder;
      }

      let value = this.value;
      elation.events.add(this, 'keydown', this.handlekeydown.bind(this));
      this.addEventProxies(this.inputelement, 'keydown,keyup,keypress,focus,blur,input,select,change');
      this.addPropertyProxies(this.inputelement, 'value,disabled,autofocus,form,name,type,required,placeholder');
      if (value) {
        this.value = value;
      }

      elation.events.add(this, 'focus', this.handlefocus.bind(this));

      // Set up object setters/getters to bridge with HTML element attributes
/*
      Object.defineProperty(this, "value", { get: function() { return this.inputelement.value; }, set: function(v) { this.inputelement.value = v; } });
      Object.defineProperty(this, "disabled", { get: function() { return this.inputelement.disabled; }, set: function(v) { this.inputelement.disabled = v; } });
      Object.defineProperty(this, "autofocus", { get: function() { return this.inputelement.autofocus; }, set: function(v) { this.inputelement.autofocus = v; } });
*/

      if (this.name) {
        this.inputelement.name = this.name;
      }
      if (this.placeholder) {
        this.inputelement.placeholder = this.placeholder;
      }
      if (this.disabled) {
        this.inputelement.disabled = true;
      }
      if (this.autofocus) {
        this.inputelement.autofocus = true;
      }
      if (this.value) {
        this.inputelement.value = this.value;
      }
    }
    /**
     * Mark this component as being enabled
     * @function enable
     * @memberof elation.ui.input#
     */
    enable() {
      this.disabled = false;
    }
    /** Mark this component as being disabled
     * @function disable
     * @memberof elation.ui.input#
     */
    disable() {
      this.disabled = true;
    }
    /** Sets this input element as focused
     * @function focus
     * @memberof elation.ui.input#
     */
    focus() {
      this.inputelement.focus();
      //this.dispatchEvent({type: 'focus'});
    }
    /** Removes focus from this input element
     * @function blur
     * @memberof elation.ui.input#
     */
    blur() {
      this.inputelement.blur();
      //this.dispatchEvent({type: 'blur'});
    }
    /** Accepts the current value of the input component and emit appropriate events
     * @function accept
     * @memberof elation.ui.input#
     * @fire elation.ui.input#ui_input_accept
     */
    accept() {
      this.blur();
      this.dispatchEvent({type: 'accept', data: this.value});
    }
    /** Restore input value to what it was before editing began and emit appropriate events
     * @function cancel
     * @memberof elation.ui.input#
     * @fire elation.ui.input#ui_input_cancel
     */
    cancel() {
      if (!elation.utils.isNull(this.lastvalue) && this.lastvalue != this.value) {
        this.value = this.lastvalue;
        this.dispatchEvent({type: 'cancel', data: this.value});
      }
      this.blur();
    }
    /** Select all text
     * @function selectall
     * @memberof elation.ui.input#
     * @fire elation.ui.input#ui_input_select
     */
    selectall() {
      this.inputelement.setSelectionRange(0, this.value.length)
      this.dispatchEvent({type: 'select', data: this.value});
    }
    /**
     * Reset input to blank, optionally focusing it
     * @function clear
     * @memberof elation.ui.input#
     * @param focus boolean force focus on this component
     * @fire elation.ui.input#ui_input_clear
     */
    clear(focus) {
      this.value = "";
      this.lastvalue = "";
      if (focus) {
        this.focus();
      }
      this.dispatchEvent({type: 'clear', data: this.value});
    }
    /**
     * Event handler for HTML input element's keydown event
     * @function handlekeydown
     * @memberof elation.ui.input#
     * @param ev event
     */
    handlekeydown(ev) {
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
    handlefocus(ev) {
      this.lastvalue = this.value;
      //this.dispatchEvent({type: 'focus'});
    }
  });
});
