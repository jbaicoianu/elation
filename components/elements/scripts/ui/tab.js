elation.require(['elements.ui.item'], function() {
  elation.elements.define('ui.tab', class extends elation.elements.ui.item {
    init() {
      super.init();
      //this.tabname = this.args.name;
      this.defineAttributes({
        label: { type: 'string' },
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
      this.dispatchEvent({type: 'select'});
      this.refreshChildren();
    }
    unselect() {
      this.selected = false;
      this.dispatchEvent({type: 'unselect'});
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
  });
});
