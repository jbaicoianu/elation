elation.require(['elements.ui.item'], function() {
  elation.requireCSS('ui.button');
  /** 
   * Button UI element
   *
   * @class button
   * @augments elation.ui.base
   * @memberof elation.ui
   *
   * @param {object} args
   * @param {string} args.tag
   * @param {string} args.classname
   * @param {string} args.label
   * @param {string} args.title
   * @param {boolean} args.draggable
   * @param {boolean} args.autoblur
   * @param {boolean} args.autofocus
   */
  elation.elements.define('ui.button', class extends elation.elements.ui.item {
    init() {
      super.init()
      this.defineAttributes({
        label: { type: 'string', set: this.updateLabel },
        name: { type: 'string' },
        disabled: { type: 'boolean', default: false },
        autoblur: { type: 'boolean', default: false },
        tabIndex: { type: 'boolean', default: false }
      });
      if (this.preview) {
        this.label = 'Click Here';
      }
    }
    /**
     * Initialize HTML element
     * @function create
     * @memberof elation.ui.button#
     */
    create() {
      //this.element = document.createElement(this.tag);
      //this.buttonelement = elation.elements.create('button', {append: this});
      //this.buttonelement.innerHTML = this.label;
      if (!this.label) {
        this.label = this.innerHTML;
      } else {
        this.innerHTML = this.label;
      }
      //this.addPropertyProxies(this.buttonelement, ['disabled']);
      //this.addEventProxies(this.buttonelement, ['mouseover','mouseout','mousedown', 'mouseup', 'mousemove', 'touchstart', 'touchmove', 'touchend', 'focus', 'blur']);
      this.addEventListener('click', (ev) => this.handleClick(ev));
    }
    /**
     * Add as a child of the specified element, removing from current parent if necessary
     * @function addTo
     * @memberof elation.ui.button#
     * @returns {boolean}
     */
    addTo(parent) {
      if (typeof parent != 'undefined') {
        if (!this.buttonelement)
          this.create();
        parent.appendChild(this);
        return true;
      }
      return false;
    }
    /**
     * Sets the text label of the button
     * @function setLabel
     * @memberof elation.ui.button#
     */
    setLabel(label) {
      this.label = label;
      this.updateLabel();
    }
    /**
     * Updates the HTML that displays the label for this button
     * @function updateLabel
     * @memberof elation.ui.button#
     */
    updateLabel() {
      this.innerHTML = this.label;
    }
    /**
     * Sets the title text of the button
     * @function setTitle
     * @memberof elation.ui.button#
     */
    setTitle(title) {
      if (this.buttonelement)
        this.buttonelement.title = title;
    }
    /**
     * Set whether the element is active or not
     * @function setActive
     * @memberof elation.ui.button#
     * @param {boolean} active
     */
    setActive(active) {
      if (active) {
        this.addclass('state_active');
      } else {
        this.removeclass('state_active');
      }
    }
    /**
     * Event handler for HTML button's click event
     * @function click
     * @memberof elation.ui.button#
     * @param {boolean} active
     * @emits ui_button_click
     */
    handleClick(ev) {
      if (this.disabled) {
        ev.stopPropagation();
        ev.preventDefault();
        return false;
      }
      //this.dispatchEvent({type: 'click', element: this});
      if (this.autoblur) {
        this.buttonelement.blur();
      }
      //ev.stopPropagation();
    }
  });
});

