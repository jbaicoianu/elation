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
      if (this.detached) {
        let pos = this.getBoundingClientRect();
        this.popup = elation.elements.create('ui.window', {
          append: document.body,
          movable: false,
          controls: false,
          minimizable: '0',
          maximizable: '0',
          closable: '0',
          resizable: '0',
          center: true,
        });
      } else {
        this.popup = elation.elements.create('ui.window', {
          append: this,
          movable: false,
          controls: false,
          minimizable: '0',
          maximizable: '0',
          closable: '0',
          resizable: '0',
          bottom: '40px',
          left: 0,
        });
      }
      this.popup.setcontent(content);
      //this.popup.open();
      this.windowClickHandler = (ev) => this.handleWindowClick(ev); // bind event so it can be added and removed
      window.addEventListener('click', this.windowClickHandler);
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
      }
    }
    hidePopup() {
      if (this.popup && this.popup.parentNode) {
        this.popup.parentNode.removeChild(this.popup);
        window.removeEventListener('click', this.windowClickHandler);
      }
    }
  });
});
