elation.require(['elements.ui.button'], function() {
  /**
   * Button that shows and hides a popup on click. The popup is a headless
   * `ui.window` whose content is taken from `popupcontent` (a string of
   * HTML or an `HTMLElement`). Clicking outside the popup closes it.
   * Set `detached` to float the popup at document root instead of
   * anchoring it to the button.
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
   * @param {boolean} args.detached
   */
  elation.elements.define('ui.popupbutton', class extends elation.elements.ui.button {
    init() {
      super.init();
      this.defineAttributes({
        active: { type: 'boolean', default: false },
        popupcontent: { type: 'object' },
        detached: { type: 'boolean', default: false },
      });
    }
    create() {
      super.create();
      //this.addEventListener('click', (ev) => this.handleClick(ev));
    }
    handleClick(ev) {
      if (!this.popup) {
        this.createPopup();
      } else {
        if (this.popup.parentNode === this) {
          if (!elation.utils.isin(this.popup, ev.target)) {
            this.hidePopup();
          }
        } else {
          this.showPopup();
        }
      }
    }
    handleWindowClick(ev) {
      // Separate click handler to hide the window if the user clicks anywhere in the window that's not inside the popup window
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
      // The popup is a chrome-less ui-window. Don't pass top/bottom/left/right
      // as args — those flow through ui-panel's anchor type, which would snap
      // the popup to a viewport edge. Position directly via inline styles
      // instead, in positionPopup() once the popup has been measured.
      const winargs = {
        movable: false,
        controls: false,
        minimizable: '0',
        maximizable: '0',
        closable: '0',
        resizable: '0',
      };
      const parent = this.detached ? document.body : this;
      this.popup = elation.elements.create('ui.window', Object.assign({ append: parent }, winargs));
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
        if (this.detached) {
          document.body.appendChild(this.popup);
          setTimeout(() => this.popup.refresh(), 0);
        } else {
          this.appendChild(this.popup);
        }
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

      // Anchor a single edge per axis before measuring so the popup
      // can shrink-wrap to its content. An absolute element with no
      // offsets — or with both edges on an axis set — gets sized to
      // its containing block (the button), giving a misleadingly
      // narrow measurement that would then drive layout decisions.
      s.top = '0';
      s.left = '0';
      s.right = '';
      s.bottom = '';
      s.marginTop = s.marginBottom = '';

      const btn   = this.getBoundingClientRect();
      const popup = this.popup.getBoundingClientRect();
      const vpW   = window.innerWidth;
      const vpH   = window.innerHeight;

      // Vertical: prefer below; flip to above if below clips AND above fits
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

      // Reset positioning props before applying the final placement.
      s.top = s.bottom = s.left = s.right = '';
      s.marginTop = s.marginBottom = '';

      if (this.detached) {
        // Document-space pixel coordinates — clamp to viewport on overflow.
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
      } else {
        // Parent-relative: percentages butt the popup against a button edge.
        if (placeAbove) {
          s.bottom = '100%';
          s.marginBottom = gap + 'px';
        } else {
          s.top = '100%';
          s.marginTop = gap + 'px';
        }
        if (useRightAlign) {
          s.right = '0';
        } else {
          s.left = '0';
        }
      }
    }
  });
});
