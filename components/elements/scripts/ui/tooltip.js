elation.require(['elements.ui.window'], function() {
  /**
   * Headless floating window that follows the mouse while its parent is
   * hovered and auto-hides on `mouseout`. Contents are set via
   * `setcontent()` the same way as `ui.window`.
   *
   * @class tooltip
   * @hideconstructor
   * @category UI
   * @augments elation.elements.ui.window
   * @memberof elation.elements.ui
   */
  elation.elements.define('ui.tooltip', class extends elation.elements.ui.window {
    init() {
      super.init();
      this.controls = false;
      this.handleMouseMove = elation.bind(this, this.handleMouseMove);
      this.handleMouseOut = elation.bind(this, this.handleMouseOut);
    }
    create() {
      super.create();
      if (this.preview) {
        this.setcontent('This is a tooltip');
      }
    }
    show() {
      if (!this.visible) {
        super.show();
        if (this.parentNode) {
          elation.events.add(this.parentNode, 'mousemove', this.handleMouseMove);
          elation.events.add(this.parentNode, 'mouseout', this.handleMouseOut);
        }
      }
    }
    hide() {
      if (this.visible) {
        super.hide();
        if (this.parentNode) {
          elation.events.remove(this.parentNode, 'mousemove', this.handleMouseMove);
          elation.events.remove(this.parentNode, 'mouseout', this.handleMouseOut);
        }
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
