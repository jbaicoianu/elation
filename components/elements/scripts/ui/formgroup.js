elation.require(['elements.elements'], function() {
  elation.requireCSS('ui.formgroup');

  /**
   * Container for grouping form controls under an optional header label.
   * Use as a logical (and visual) section divider inside larger forms.
   *
   * @class formgroup
   * @hideconstructor
   * @category UI
   * @augments elation.elements.base
   * @memberof elation.elements.ui
   * @example
   * <ui-formgroup label="Account">
   *   <ui-input placeholder="Email"></ui-input>
   *   <ui-input type="password" placeholder="Password"></ui-input>
   * </ui-formgroup>
   *
   * @param {object} args
   * @param {string} args.label
   */
  elation.elements.define('ui.formgroup', class extends elation.elements.base {
    init() {
      super.init();
      this.defineAttributes({
        'label': { type: 'string' }
      });
    }
    create() {
      if (this.label) {
        this.labelobj = elation.elements.create('ui-label', {
          label: this.label,
          append: this,
          class: 'groupheader'
        });
      }
    }
  });
});
