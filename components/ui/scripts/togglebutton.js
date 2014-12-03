elation.require(['ui.button'], function() {
  /** 
   * ToggleButton UI element
   *
   * @class togglebutton
   * @augments elation.ui.button
   * @memberof elation.ui
   *
   * @param {object} args
   * @param {string} args.toggletitle
   */

  elation.component.add('ui.togglebutton', function() {
    this.init = function() {
      elation.ui.togglebutton.extendclass.init.call(this);
      this.toggletitle = this.args.toggletitle || false;
      this.toggle(false);
    }
    this.toggle = function(newstate) {
      if (newstate === undefined) newstate = !this.state;
      this.state = newstate;
      elation.events.fire({type: 'ui_button_toggle', element: this, data: this.state});
      this.refresh();
    }
    this.render = function() {
      var hasclass = this.hasclass('state_active');
      if (!this.state && hasclass) {
        this.removeclass('state_active');
      } else if (this.state && !hasclass) {
        this.addclass('state_active');
      }

      if (!this.state && this.title) {
        this.setTitle(this.title);
      } else if (this.state && this.toggletitle) {
        this.setTitle(this.toggletitle);
      }
    }
    /**
     * Event handler for HTML button's click event
     * @function click
     * @memberof elation.ui.togglebutton#
     * @param {event} ev
     * @emits ui_button_click
     */
    this.click = function(ev) {
      elation.events.fire({type: 'ui_button_click', element: this});
      this.toggle();
      if (this.autoblur) {
        this.container.blur();
      }
    }
  }, elation.ui.button);
});
