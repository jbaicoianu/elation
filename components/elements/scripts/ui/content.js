elation.require(['elements.elements'], function() {
  elation.requireCSS('ui.content');

  /**
   * Generic content container. Assigning a string or `HTMLElement` to
   * `value` replaces the current contents — useful as a slot for
   * dynamic content, e.g. inside `ui.window` or `ui.popupbutton`.
   *
   * @class content
   * @hideconstructor
   * @category UI
   * @augments elation.elements.base
   * @memberof elation.elements.ui
   *
   * @param {object} args
   * @param {string} args.align
   * @param {object} args.value
   */
  elation.elements.define('ui.content', class extends elation.elements.base {
    init() {
      super.init();
      this.defineAttributes({
        align: { type: 'string' },
        value: { type: 'object', set: this.updateContent }
      });
      this.updateContent(this.value);
    }
    updateContent(value) {
      if (value instanceof HTMLElement) {
        this.innerHTML = '';
        this.appendChild(value);
      } else if (elation.utils.isString(value)) {
        this.innerHTML = value;
      }
    }
  });
});
