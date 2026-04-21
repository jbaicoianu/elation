elation.require(['elements.ui.toggle'], function() {
  /**
   * Radio-button variant of `ui.toggle`. Renders the underlying input as
   * `type="radio"` so browser grouping applies when multiple radios share a
   * `formname`. Attributes and events are inherited from `ui.toggle`.
   *
   * @class radio
   * @hideconstructor
   * @category UI
   * @augments elation.elements.ui.toggle
   * @memberof elation.elements.ui
   * @example
   * <ui-radio label="Small" formname="size"></ui-radio>
   * <ui-radio label="Medium" formname="size" checked></ui-radio>
   * <ui-radio label="Large" formname="size"></ui-radio>
   */
  elation.elements.define('ui.radio', class extends elation.elements.ui.toggle {
    create() {
      if (this.preview) {
        this.label = 'Radio Button';
      }
      super.create();
      this.checkbox.type = 'radio';
    }
  });
});

