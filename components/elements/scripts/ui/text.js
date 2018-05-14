/** 
 * Simple text element
 *
 * @class text
 * @augments elation.ui.base
 * @memberof elation.ui
 *
 * @param {object} args
 * @param {string} args.text
 * @param {boolean} args.editable
 */
elation.require(["elements.elements"], function() {
  elation.elements.define("ui.text", class extends elation.elements.base {
    init() {
      if (this.innerHTML && this.innerHTML.length > 0) {
        this.text = this.innerHTML;
      }
      super.init();
      this.defineAttributes({
        editable: { type: 'boolean', default: false },
        hidden: { type: 'boolean', default: false },
        text: { type: 'string', /*set: this.settext*/ }
      });
      if (this.preview) {
        this.text = 'The quick brown fox jumped over the lazy dog';
      }
    }
    create() {
      if (this.editable) {
        this.addclass('state_editable');
        elation.events.add(this, 'keydown,blur', this);
        this.contentEditable = true;
      }
      if (!this.innerHTML || this.innerHTML != this.text) {
        this.settext(this.text);
      }
      if (this.hidden) {
        this.hide();
      }
    }
    /**
     * Set text for this element
     * @function settext
     * @memberof elation.ui.text#
     * @param {string} text
     */
    settext(text) {
      this.innerHTML = text;
      if (text != this.text) {
        this.text = text;
        if (typeof this.text != "undefined") {
          this.dispatchEvent({type: 'change', data: this.text});
        }
      }
    }
    /**
     * Event handler: HTML element keydown event
     * @function keydown
     * @memberof elation.ui.text#
     * @param {event} ev
     */
    keydown(ev) {
      console.log(ev);
      switch (ev.keyCode) {
        case 13: // newline
          this.settext(this.innerHTML);
          this.blur();
          ev.preventDefault();
          break;
        case 27: // esc
          this.innerHTML = this.text;
          this.blur();
          break;
      }
    }
    /**
     * Event handler: HTML element blur event
     * @function blur
     * @memberof elation.ui.text#
     * @param {event} ev
     */
    blur(ev) {
      this.settext(this.innerHTML);
    }
  });
});
