elation.require(['elements.base'], function() {
  /**
   * List variant that arranges its items into a fixed number of rows.
   *
   * @class rowlayout
   * @hideconstructor
   * @category UI
   * @augments elation.elements.ui.list
   * @memberof elation.elements.ui
   * @example
   * <ui-rowlayout rows="3">
   *   <li>One</li>
   *   <li>Two</li>
   *   <li>Three</li>
   * </ui-rowlayout>
   *
   * @param {object} args
   * @param {integer} args.rows
   */
  elation.elements.define('ui.rowlayout', class extends elation.elements.ui.list {
    init() {
      super.init();
      this.defineAttributes({
        rows: { type: 'integer' }
      });
    }
  });
});


