elation.require(['elements.ui.button'], function() {
console.log('WHY NOT');
  elation.elements.define('ui.popupbutton', class extends elation.elements.ui.button {
    init() {
      super.init();
      this.defineAttributes({
        active: { type: 'boolean', default: false },
        popupcontent: { type: 'object' },
      });
    }
    create() {
      super.create();
  console.log('MADE POPUP BUTTON', this);
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
      if (!elation.utils.isin(this, ev.target)) {
        this.hidePopup();
      }
    }
    createPopup() {
      let content = this.popupcontent;
      if (elation.utils.isString(content)) {
        content = elation.elements.create('ui-content');
        content.fromString(this.popupcontent);
      }
  console.log('make the popup', content, this);
      this.popup = elation.elements.create('ui.window', {
        append: this,
        //title: 'Sounds',
        movable: false, 
        controls: false,
        minimizable: '0', 
        maximizable: '0', 
        closable: '0', 
        resizable: '0', 
        bottom: '40px',
        left: 0,
      });
      this.popup.setcontent(content);
      //this.popup.open();
      this.windowClickHandler = (ev) => this.handleWindowClick(ev); // bind event so it can be added and removed
      window.addEventListener('click', this.windowClickHandler);
    }
    showPopup() {
      if (!this.popup) {
        this.createPopup();
      } else if (this.popup.parentNode !== this) {
        this.appendChild(this.popup);
        window.addEventListener('click', this.windowClickHandler);
      }
    }
    hidePopup() {
      if (this.popup.parentNode === this) {
        this.removeChild(this.popup);
        window.removeEventListener('click', this.windowClickHandler);
      }
    }
  });
});
