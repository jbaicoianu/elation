elation.require(['elements.ui.item'], function() {
  /**
   * Single tab for use inside `ui.tabs`. The `label` renders as the tab
   * button; `count` drives an optional badge; `tooltip` shows on hover.
   * Only the selected tab is attached to the DOM at a time, so children
   * are detached while unselected.
   *
   * @class tab
   * @hideconstructor
   * @category UI
   * @augments elation.elements.ui.item
   * @memberof elation.elements.ui
   * @example
   * <ui-tabs>
   *   <ui-tab label="Overview" tooltip="Summary">Overview content</ui-tab>
   *   <ui-tab label="Inbox" count="3">Inbox content</ui-tab>
   * </ui-tabs>
   *
   * @param {object} args
   * @param {string} args.label
   * @param {integer} args.count
   * @param {boolean} args.selected
   * @param {string} args.tooltip
   */
  elation.elements.define('ui.tab', class extends elation.elements.ui.item {
    init() {
      super.init();
      //this.tabname = this.args.name;
      this.defineAttributes({
        label: { type: 'string', set: this.updateLabel },
        count: { type: 'integer', default: 0, set: this.updateCount },
        selected: { type: 'boolean', default: false },
        tooltip: { type: 'string' }
      });
    }
    create() {
      elation.events.add(this, 'mouseover,mouseout,click', this);
    }
    hover() {
      this.addclass("state_hover");
      this.dispatchEvent({type: 'hover'});
    }
    unhover() {
      this.removeclass("state_hover");
      this.dispatchEvent({type: 'unhover'});
    }
    select() {
      this.selected = true;
      // FIXME - using the 'select' event causes issues if the tab contains an <input> or <textarea>, for now we throw both events but we should refactor code that uses 'select'
      this.dispatchEvent({type: 'select'});
      this.dispatchEvent({type: 'tabselect', bubbles: true});
      this.refreshChildren();
    }
    unselect() {
      this.selected = false;
      this.dispatchEvent({type: 'unselect'});
      this.dispatchEvent({type: 'tabunselect'});
    }
    mouseover(ev) {
      if (!this.disabled) {
        this.hover();
      }
    }
    mouseout(ev) {
      if (!this.disabled) {
        this.unhover();
      }
    }
    click(ev) {
      if (!this.disabled) {
        this.select();
      }
    }
    enable() {
      this.disabled = false;
    }
    disable() {
      this.disabled = true;
    }
    updateCount() {
      this.dispatchEvent({type: 'countchange', element: this, data: this.count});
    }
    updateLabel() {
      this.dispatchEvent({type: 'tablabelchange', element: this, data: this.label, bubbles: true});
    }
  });
});
