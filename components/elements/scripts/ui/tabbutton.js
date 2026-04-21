elation.require(['elements.ui.button'], function() {
  /**
   * Button rendered inside a `ui.tabbar`, one per `ui.tab`. Carries a
   * `selected` flag that `ui.tabs` flips when its corresponding tab
   * becomes active.
   *
   * @class tabbutton
   * @hideconstructor
   * @category UI
   * @augments elation.elements.ui.button
   * @memberof elation.elements.ui
   *
   * @param {object} args
   * @param {boolean} args.selected
   */
  elation.elements.define('ui.tabbutton', class extends elation.elements.ui.button {
    init() {
      super.init();
      this.defineAttributes({
        selected: { type: 'boolean', default: false }
      });
    }
  });
});
