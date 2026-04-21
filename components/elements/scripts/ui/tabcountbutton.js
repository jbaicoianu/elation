elation.require(['elements.ui.notificationbutton'], function() {
  /**
   * Tab-style button with a `selected` state and an integer count badge.
   * Used by `ui.tabbar` when a tabs container has `showcounts` enabled.
   *
   * @class tabcountbutton
   * @hideconstructor
   * @category UI
   * @augments elation.elements.ui.notificationbutton
   * @memberof elation.elements.ui
   *
   * @param {object} args
   * @param {boolean} args.selected
   */
  elation.elements.define('ui.tabcountbutton', class extends elation.elements.ui.notificationbutton {
    init() {
      super.init();
      this.defineAttributes({
        selected: { type: 'boolean', default: false }
      });
    }
  });
});

