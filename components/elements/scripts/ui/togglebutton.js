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
      if (!this.active) {
        this.activate();
      } else {
        this.deactivate();
      }
    }
    activate() {
      this.active = true;
      this.dispatchEvent({type: 'activate'});
    }
    deactivate() {
      this.active = false;
      this.dispatchEvent({type: 'deactivate'});
    }
  });
});
