elation.require(['elements.ui.button', 'elements.ui.indicator'], function() {
  /**
   * Button that renders a `ui.indicator` badge alongside its label. Setting
   * `count` updates the badge; a count of zero hides it via CSS.
   *
   * @class notificationbutton
   * @hideconstructor
   * @category UI
   * @augments elation.elements.ui.button
   * @memberof elation.elements.ui
   * @example
   * <ui-notificationbutton label="Inbox" count="3"></ui-notificationbutton>
   *
   * @param {object} args
   * @param {integer} args.count
   */
  elation.elements.define('ui.notificationbutton', class extends elation.elements.ui.button {
    init() {
      super.init();
      this.defineAttributes({
        count: { type: 'integer', default: 0, set: this.updateCount }
      });
      if (this.preview) {
        this.count = 3;
        this.label = 'Notifications';
      }
    }
    create() {
      super.create();
      this.indicator = elation.elements.create('ui.indicator', {
        value: this.count,
        append: this
      });
    }
    updateCount() {
      if (this.indicator) {
        this.indicator.value = this.count;
      }
    }
  });
});

