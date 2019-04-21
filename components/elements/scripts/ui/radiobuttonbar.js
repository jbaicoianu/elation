/** 
 * RadioButtonBar UI element
 * Like a normal ButtonBar, but only one button can be selected at a time
 *
 * @class buttonbar
 * @augments elation.ui.base
 * @memberof elation.ui
 *
 * @param {object} args
 * @param {object} args.buttons
 */
elation.require(['elements.ui.buttonbar'], function() {
  elation.elements.define('ui.radiobuttonbar', class extends elation.elements.ui.buttonbar {
    init() {
      super.init();
      this.defineAttributes({
        'itemcomponent': { type: 'string', default: 'ui.togglebutton' }
      });
    }
    create() {
      super.create();
      for (let i = 0; i < this.items.length; i++) {
        if (this.items[i].active) {
          if (!this.activebutton) {
            this.activebutton = this.items[i];
          } else {
            this.items[i].active = false;
          }
        }
        elation.events.add(this.items[i], 'activate', (ev) => this.handleButtonActivate(ev));
        elation.events.add(this.items[i], 'deactivate', (ev) => this.handleButtonDeactivate(ev));
      }
      if (!this.activebutton) {
        this.items[0].activate();
      }
    }
    handleButtonActivate(ev) {
      let button = ev.target;
      if (button !== this.activebutton) {
        this.dispatchEvent({type: 'change', data: button.value});
        this.activebutton = button;
      }
      for (let i = 0; i < this.items.length; i++) {
        if (this.items[i] !== button && this.items[i].active) {
          this.items[i].deactivate();
        }
      }
    }
    handleButtonDeactivate(ev) {
      // Prevent the active button from being deactivated
      if (ev.target === this.activebutton) {
        ev.preventDefault();
      }
    }
  });
});
