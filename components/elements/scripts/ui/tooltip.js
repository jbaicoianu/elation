elation.require(['elements.ui.window'], function() {
  elation.elements.define('ui.tooltip', class extends elation.elements.ui.window {
    init() {
      super.init();
      this.handleMouseMove = elation.bind(this, this.handleMouseMove);
      this.handleMouseOut = elation.bind(this, this.handleMouseOut);
    }
    create() {
      super.create();
    }
    show() {
      if (!this.visible) {
        super.show();
        elation.events.add(this.parentNode, 'mousemove', this.handleMouseMove);
        elation.events.add(this.parentNode, 'mouseout', this.handleMouseOut);
      }
    }
    hide() {
      if (this.visible) {
        super.hide();
        elation.events.remove(this.parentNode, 'mousemove', this.handleMouseMove);
        elation.events.remove(this.parentNode, 'mouseout', this.handleMouseOut);
      }
    }
    handleMouseMove(ev) {
      this.setposition([ev.x, ev.y], false);
    }
    handleMouseOut(ev) {
      this.close();
    }
  });
});
