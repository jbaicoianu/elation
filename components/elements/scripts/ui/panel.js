elation.require(['elements.elements'], function() {
  elation.requireCSS('ui.panel');

  // Hybrid boolean / pixel-offset type used by the edge-snap attributes.
  // Presence (with or without a value) means "snap to this edge"; a numeric
  // value carries an additional pixel offset that subclasses may consult.
  elation.elements.registerType('anchor', {
    read(value) {
      if (value === true || value === '' || value === 'true') return true;
      if (value === false || value == null || value === 'false') return false;
      const n = Number(value);
      if (isNaN(n) || n === 0) return true;
      return n | 0;
    },
    write(value) {
      if (value === true) return '';
      if (value === false || value == null) return 'false';
      return String(value);
    }
  });

  /**
   * Absolutely-positioned container that snaps to its offsetParent's edges
   * or center. The position is driven by edge flags — any combination of
   * `top` / `middle` / `bottom` with `left` / `center` / `right`. Auto-updates
   * on window resize, orientation change, and child-list mutations.
   *
   * The four corner attributes (`top` / `bottom` / `left` / `right`) use the
   * `anchor` type: an absent attribute means "don't constrain this edge",
   * and presence — boolean form, empty value, or a numeric pixel offset —
   * means "snap to this edge". Panel's own layout treats anchor values
   * purely as truthy/falsy snap signals; subclasses like `ui.window` read
   * the numeric value and apply it as a pixel offset.
   *
   * Base class for `ui.window`, `ui.flexpanel`, `ui.collapsiblepanel`, and `ui.tooltip`.
   *
   * @class panel
   * @hideconstructor
   * @category UI
   * @augments elation.elements.base
   * @memberof elation.elements.ui
   * @example
   * <ui-panel bottom right>Docked to bottom-right</ui-panel>
   *
   * @param {object} args
   * @param {boolean|integer} args.top
   * @param {boolean} args.middle
   * @param {boolean|integer} args.bottom
   * @param {boolean|integer} args.left
   * @param {boolean} args.center
   * @param {boolean|integer} args.right
   */
  elation.elements.define('ui.panel', class extends elation.elements.base {
    init() {
      super.init();
      this.defineAttributes({
        top:    {type: 'anchor',  default: false, set: this.updateLayout },
        middle: {type: 'boolean', default: false, set: this.updateLayout },
        bottom: {type: 'anchor',  default: false, set: this.updateLayout },
        left:   {type: 'anchor',  default: false, set: this.updateLayout },
        center: {type: 'boolean', default: false, set: this.updateLayout },
        right:  {type: 'anchor',  default: false, set: this.updateLayout },
      });
    }
    create() {
      this.style.position = 'absolute';

      // Mutation observer watches for any changes to our children, and updates our layout in response to changes
      var observer = new MutationObserver((mutations) => this.refresh());
      observer.observe(this, {attributes: false, childList: true, subtree: true});

      // Update our layout if the page is resized or if orientation changes
      document.addEventListener('DOMContentLoaded', (ev) => this.refresh());
      document.addEventListener('load', (ev) => this.refresh());
      window.addEventListener('resize', (ev) => this.refresh());
      window.addEventListener('orientationchange', (ev) => this.refresh());
      this.refresh();
      // FIXME - sometimes panels initialize too early, and their vertical positioning gets messed up.  A 10ms timeout helps but an event would be better.
      setTimeout(() => {
        this.refresh();
      }, 10);
    }
    render() {
      super.render();
      this.updateLayout();
    }
    updateLayout() {
      if (!this.offsetParent) return; // Not in the DOM, no layout to be done

      if (this.middle) {
        this.style.top = ((this.offsetParent.offsetHeight - this.offsetHeight) / 2) + 'px';
        this.style.bottom = 'auto';
      } else if (this.top) {
        this.style.top = 0;
        this.style.bottom = (this.bottom ? 0 : 'auto');
      } else if (this.bottom) {
        this.style.top = (this.top ? 0 : 'auto');
        this.style.bottom = 0;
      }
      if (this.center) {
        this.style.left = ((this.offsetParent.offsetWidth - this.offsetWidth) / 2) + 'px';
        this.style.right = 'auto';
      } else if (this.left) {
        this.style.left = 0;
        this.style.right = (this.right ? 0 : 'auto');
      } else if (this.right) {
        this.style.left = (this.left ? 0 : 'auto');
        this.style.right = 0;
      }
    }
    setcontent(content) {
      if (elation.utils.isString(content)) {
        this.innerHTML = content;
      } else if (content instanceof HTMLElement) {
        this.appendChild(content);
      }
    }
  });
});

