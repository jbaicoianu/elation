elation.require(['elements.ui.toggle'], function() {
  /**
   * Checkbox variant of `ui.toggle`. Visually styled as a checkbox but
   * otherwise behaves identically; attributes and events are inherited.
   *
   * @class checkbox
   * @hideconstructor
   * @category UI
   * @augments elation.elements.ui.toggle
   * @memberof elation.elements.ui
   * @example
   * <ui-checkbox label="Remember me" checked></ui-checkbox>
   */
  elation.elements.define('ui.checkbox', class extends elation.elements.ui.toggle {
    init() {
      super.init();
      if (this.preview) {
        this.label = 'Checkbox';
      }
    }
  });
});

