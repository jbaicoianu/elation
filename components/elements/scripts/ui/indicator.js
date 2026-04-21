elation.require(['elements.base'], function() {
  /**
   * Notification count badge. Displays an integer and keeps its
   * `aria-label` in sync for screen readers. Typically composed into
   * other elements like `ui.notificationbutton`.
   *
   * @class indicator
   * @hideconstructor
   * @category UI
   * @augments elation.elements.base
   * @memberof elation.elements.ui
   * @example
   * <ui-indicator value="5"></ui-indicator>
   *
   * @param {object} args
   * @param {integer} args.value
   */
  elation.elements.define('ui.indicator', class extends elation.elements.base {
    init() {
      super.init();
      this.defineAttributes({
        value: { type: 'integer', default: 0, set: this.updateValue }
      });
    }
    create() {
      this.setAttribute('aria-label', 'No new notifications');
      this.updateValue();
    }
    updateValue() {
      this.innerHTML = this.value;
      this.setAttribute('aria-label', this.value + ' new notifications');
    }
  });
});
