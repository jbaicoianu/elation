elation.require(['elements.ui.item'], function() {
  elation.elements.define('ui.tab', class extends elation.elements.ui.item {
    init() {
      super.init();
      //this.tabname = this.args.name;
      this.defineAttributes({
        label: { type: 'string', set: this.updateLabel },
        count: { type: 'integer', default: 0, set: this.updateCount },
        selected: { type: 'boolean', default: false },
        tooltip: { type: 'string' }
      });
    }
    create() {
      elation.events.add(this, 'mouseover,mouseout,click', this);
    }
    hover() {
      this.addclass("state_hover");
      this.dispatchEvent({type: 'hover'});
    }
    unhover() {
      this.removeclass("state_hover");
      this.dispatchEvent({type: 'unhover'});
    }
    select() {
      this.selected = true;
      // FIXME - using the 'select' event causes issues if the tab contains an <input> or <textarea>, for now we throw both events but we should refactor code that uses 'select'
      this.dispatchEvent({type: 'select'});
      this.dispatchEvent({type: 'tabselect'});
      this.refreshChildren();
    }
    unselect() {
      this.selected = false;
      this.dispatchEvent({type: 'unselect'});
      this.dispatchEvent({type: 'tabunselect'});
    }
    mouseover(ev) {
      if (!this.disabled) {
        this.hover();
      }
    }
    mouseout(ev) {
      if (!this.disabled) {
        this.unhover();
      }
    }
    click(ev) {
      if (!this.disabled) {
        this.select();
      }
    }
    enable() {
      this.disabled = false;
    }
    disable() {
      this.disabled = true;
    }
    updateCount() {
      this.dispatchEvent({type: 'countchange', element: this, data: this.count});
    }
    updateLabel() {
      this.dispatchEvent({type: 'tablabelchange', element: this, data: this.label, bubbles: true});
    }
  });
});
