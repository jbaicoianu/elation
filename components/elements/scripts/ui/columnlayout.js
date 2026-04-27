elation.require(['elements.base'], function() {
  elation.requireCSS('ui.columnlayout');

  /**
   * List variant that arranges its items into a fixed number of columns.
   *
   * @class columnlayout
   * @hideconstructor
   * @category UI
   * @augments elation.elements.ui.list
   * @memberof elation.elements.ui
   * @example
   * <ui-columnlayout columns="4">
   *   <li>One</li>
   *   <li>Two</li>
   *   <li>Three</li>
   * </ui-columnlayout>
   *
   * @param {object} args
   * @param {integer} args.columns
   */
  elation.elements.define('ui.columnlayout', class extends elation.elements.ui.list {
    init() {
      super.init();
      this.defineAttributes({
        columns: { type: 'integer', default: 3 }
      });
    }
  });
});

