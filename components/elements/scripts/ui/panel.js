elation.require(['elements.elements'], function() {
  elation.elements.define('ui.panel', class extends elation.elements.base {
    init() { 
      super.init();
      this.defineAttributes({
        top:    {type: 'boolean', default: false, set: this.updateLayout },
        middle: {type: 'boolean', default: false, set: this.updateLayout },
        bottom: {type: 'boolean', default: false, set: this.updateLayout },
        left:   {type: 'boolean', default: false, set: this.updateLayout },
        center: {type: 'boolean', default: false, set: this.updateLayout },
        right:  {type: 'boolean', default: false, set: this.updateLayout },
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

