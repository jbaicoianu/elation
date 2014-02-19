/**
 * Elation Namespace
 * @name elation
 * @namespace
 */
/**
 * UI Namespace
 * @name elation.ui
 * @namespace
 */

/** 
 * Base UI element
 *
 * @class base
 * @augments elation.component.base
 * @memberof elation.ui
 *
 * @param {object} args
 * @param {string} args.classname
 * @param {boolean} args.hidden
 */
elation.component.add("ui.base", function() {
  this.renderloopActive = false;
  this.dirty = false;

  /**
   * Make this component visible 
   * @function show
   * @memberof elation.ui.base#
   */
  this.show = function() {
    this.hidden = false;
    elation.html.removeclass(this.container, 'state_hidden');
  }
  /**
   * Make this component invisible 
   * @function hide
   * @memberof elation.ui.base#
   */
  this.hide = function() {
    this.hidden = true;
    elation.html.addclass(this.container, 'state_hidden');
  }
  /**
   * Sets the orientation of this component
   * @function setOrientation
   * @memberof elation.ui.base#
   * @param {string} orientation
   */
  this.setOrientation = function(orientation) {
    if (this.orientation) {
      elation.html.removeclass(this.container, 'orientation_' + this.orientation);
    }
    this.orientation = orientation;
    elation.html.addclass(this.container, 'orientation_' + this.orientation);
  }
  /**
   * Mark data as dirty, and then start the render loop if not already active
   * @function refresh
   * @memberof elation.ui.base#
   */
  this.refresh = function() {
    this.dirty = true;
    if (!this.renderloopActive) {
      this.renderloop();
    }
  }
  /**
   * Hook into the browser's animation loop to make component renders as efficient as possible
   * This also automatically rate-limits updates to the render speed of the browser (normally 
   * 60fps) rather than triggering a render every time data changes (which could be > 60fps)
   * 
   * @function renderloop
   * @memberof elation.ui.base#
   */
  this.renderloop = function() {
    if (this.dirty) {
      this.render();
      this.dirty = false;
      requestAnimationFrame(elation.bind(this, this.renderloop));
      this.renderloopActive = true;
    } else if (!this.dirty) {
      this.renderloopActive = false;
    } 
  }
  /**
   * Update the component's visual representation to reflect the current state of the data
   * 
   * @function render
   * @abstract
   * @memberof elation.ui.base#
   */
  this.render = function() {
  }
});
