/** 
 * Simple text label
 *
 * @class label
 * @augments elation.ui.base
 * @memberof elation.ui
 *
 * @param {object} args
 * @param {string} args.label
 * @param {boolean} args.editable
 */
elation.require("ui.base", function() {
  elation.component.add("ui.label", function() {
    this.defaultcontainer = {tag: 'span', classname: 'ui_label'};

    this.init = function() {
      if (this.args.label) {
        this.setlabel(this.args.label);
      }
      elation.html.addclass(this.container, 'ui_label');
      if (this.args.classname) {
        elation.html.addclass(this.container, this.args.classname);
      }
      this.editable = this.args.editable || false;

      if (this.editable) {
        elation.html.addclass(this.container, 'state_editable');
        elation.events.add(this.container, 'keydown,blur', this);
        this.container.contentEditable = true;
      }
      if (this.args.hidden) {
        this.hide();
      }
    }
    /**
     * Set text for this label
     * @function setlabel
     * @memberof elation.ui.label#
     * @param {string} label
     */
    this.setlabel = function(label) {
      if (label != this.label) {
        this.label = label;
        this.container.innerHTML = label;
        if (typeof this.label != "undefined") {
          elation.events.fire({type: 'ui_label_change', element: this, data: this.label});
        }
      }
    }
    /**
     * Event handler: HTML element keydown event
     * @function keydown
     * @memberof elation.ui.label#
     * @param {event} ev
     */
    this.keydown = function(ev) {
      console.log(ev);
      //elation.events.fire({type: 'ui_label_change', element: this, data: this.container.innerHTML});
      switch (ev.keyCode) {
        case 13: // newline
          this.setlabel(this.container.innerHTML);
          this.container.blur();
          ev.preventDefault();
          break;
        case 27: // esc
          this.container.innerHTML = this.label;
          this.container.blur();
          break;
      }
    }
    /**
     * Event handler: HTML element blur event
     * @function blur
     * @memberof elation.ui.label#
     * @param {event} ev
     */
    this.blur = function(ev) {
      this.setlabel(this.container.innerHTML);
    }
  }, elation.ui.base);
});
