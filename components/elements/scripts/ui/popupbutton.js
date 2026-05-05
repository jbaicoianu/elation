elation.require(['elements.ui.button'], function() {
  /**
   * Button that shows and hides a popup on click. The popup is a headless
   * `ui.window` whose content is taken from `popupcontent` (a string of
   * HTML or an `HTMLElement`). Clicking outside the popup closes it.
   *
   * The popup is rendered at document root rather than as a child of the
   * button so its containing block is the body — without that, an
   * absolute popup gets shrink-to-fit-bounded by the button width, which
   * squeezes any complex content inside.
   *
   * @class popupbutton
   * @hideconstructor
   * @category UI
   * @augments elation.elements.ui.button
   * @memberof elation.elements.ui
   * @example
   * <ui-popupbutton label="More..." popupcontent="<p>Popup body</p>"></ui-popupbutton>
   *
   * @param {object} args
   * @param {boolean} args.active
   * @param {object} args.popupcontent
   */
  elation.elements.define('ui.popupbutton', class extends elation.elements.ui.button {
    init() {
      super.init();
      this.defineAttributes({
        active: { type: 'boolean', default: false },
        popupcontent: { type: 'object' },
      });
    }
    handleClick(ev) {
      if (!this.popup) {
        this.createPopup();
      } else if (this.popup.parentNode) {
        this.hidePopup();
      } else {
        this.showPopup();
      }
    }
    handleWindowClick(ev) {
      if (!(elation.utils.isin(this, ev.target) || elation.utils.isin(this.popup, ev.target))) {
        this.hidePopup();
      }
    }
    createPopup() {
      let content = this.popupcontent;
      if (elation.utils.isString(content)) {
        // ui.content has no fromString helper; just set innerHTML directly.
        const wrapper = elation.elements.create('ui-content');
        wrapper.innerHTML = this.popupcontent;
        content = wrapper;
      }
      // Don't pass top/bottom/left/right as args — those flow through
      // ui-panel's anchor type, which would snap the popup to a viewport
      // edge. Position directly via inline styles in positionPopup().
      this.popup = elation.elements.create('ui.window', {
        append: document.body,
        movable: false,
        controls: false,
        minimizable: '0',
        maximizable: '0',
        closable: '0',
        resizable: '0',
      });
      this.popup.classList.add('state_popup');
      this.popup.setcontent(content);
      this.windowClickHandler = (ev) => this.handleWindowClick(ev);
      this.windowResizeHandler = () => this.positionPopup();
      window.addEventListener('click', this.windowClickHandler);
      window.addEventListener('resize', this.windowResizeHandler);
      window.addEventListener('scroll', this.windowResizeHandler, true);
      this.positionPopup();
    }
    showPopup() {
      if (!this.popup) {
        this.createPopup();
      } else if (!this.popup.parentNode) {
        document.body.appendChild(this.popup);
        window.addEventListener('click', this.windowClickHandler);
        window.addEventListener('resize', this.windowResizeHandler);
        window.addEventListener('scroll', this.windowResizeHandler, true);
        this.positionPopup();
      }
    }
    hidePopup() {
      if (this.popup && this.popup.parentNode) {
        this.popup.parentNode.removeChild(this.popup);
        window.removeEventListener('click', this.windowClickHandler);
        window.removeEventListener('resize', this.windowResizeHandler);
        window.removeEventListener('scroll', this.windowResizeHandler, true);
      }
    }
    /**
     * Place the popup so it butts up against an edge of the button without
     * clipping the viewport. Picks the vertical side (below preferred,
     * above as fallback) and horizontal alignment (left-edge preferred,
     * right-edge fallback) based on which combination keeps the popup
     * fully on screen. Re-runs on window resize/scroll while open.
     *
     * @function positionPopup
     * @memberof elation.elements.ui.popupbutton#
     */
    positionPopup() {
      if (!this.popup || !this.popup.parentNode) return;

      const gap        = 4;   // visual gap between button and popup
      const edgeMargin = 8;   // min distance from popup edge to viewport edge

      const s = this.popup.style;

      // Anchor a single edge per axis before measuring so the popup can
      // shrink-wrap to its content. An absolute element with both edges
      // on an axis unset gets sized to its containing block, giving a
      // misleading measurement that drives the wrong placement choice.
      s.top = '0';
      s.left = '0';
      s.right = '';
      s.bottom = '';

      const btn   = this.getBoundingClientRect();
      const popup = this.popup.getBoundingClientRect();
      const vpW   = window.innerWidth;
      const vpH   = window.innerHeight;

      // Vertical: prefer below; flip above if below clips AND above fits
      // (or simply has more room when neither side fits).
      const spaceBelow = vpH - btn.bottom - gap;
      const spaceAbove = btn.top - gap;
      const fitsBelow  = popup.height <= spaceBelow;
      const fitsAbove  = popup.height <= spaceAbove;
      const placeAbove = !fitsBelow && (fitsAbove || spaceAbove > spaceBelow);

      // Horizontal: prefer left-edge alignment; flip to right-edge if the
      // popup would run off the right side AND right-aligning fits.
      const fitsLeftAlign  = btn.left + popup.width + edgeMargin <= vpW;
      const fitsRightAlign = btn.right - popup.width >= edgeMargin;
      const useRightAlign  = !fitsLeftAlign && fitsRightAlign;

      const top = placeAbove
        ? btn.top + window.scrollY - popup.height - gap
        : btn.bottom + window.scrollY + gap;
      let left = useRightAlign
        ? btn.right + window.scrollX - popup.width
        : btn.left + window.scrollX;
      const minLeft = window.scrollX + edgeMargin;
      const maxLeft = window.scrollX + vpW - popup.width - edgeMargin;
      if (maxLeft >= minLeft) left = Math.max(minLeft, Math.min(left, maxLeft));

      s.top  = top + 'px';
      s.left = left + 'px';
    }
  });
});
