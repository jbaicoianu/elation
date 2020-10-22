elation.require(['elements.ui.button'], function() {
  elation.elements.define('ui.togglebutton', class extends elation.elements.ui.button {
    init() {
      super.init();
      this.defineAttributes({
        active: { type: 'boolean', default: false }
      });
    }    
    create() {
      super.create();
    }
    handleClick(ev) {
      if (ev.button == 0) {
        if (!this.active) {
          this.activate();
        } else {
          this.deactivate();
        }
      }
    }
    activate() {
      let events = this.dispatchEvent({type: 'activate'});
      if (!events || !elation.events.wasDefaultPrevented(events)) {
        this.active = true;
      }
    }
    deactivate() {
      let events = this.dispatchEvent({type: 'deactivate'});
      if (!events || !elation.events.wasDefaultPrevented(events)) {
        this.active = false;
      }
    }
    toggle() {
      if (this.active) {
        this.deactivate();
      } else {
        this.activate();
      }
    }
  });
});
