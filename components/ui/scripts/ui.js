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
});
