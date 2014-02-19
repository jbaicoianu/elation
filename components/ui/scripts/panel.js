/** 
 * Panel layout UI element
 *
 * @class panel
 * @augments elation.ui.base
 * @memberof elation.ui
 *
 * @param {object} args
 * @param {string} args.classname
 * @param {string} args.orientation
 */
elation.component.add("ui.panel", function() {
  this.defaultcontainer = {tag: 'div', classname: 'ui_panel'};

  this.init = function() {
    this.items = [];
    this.orientation = this.args.orientation || 'vertical';

    elation.html.addclass(this.container, 'ui_panel');
    elation.html.addclass(this.container, 'orientation_' + this.orientation);
    if (this.args.classname) {
      elation.html.addclass(this.container, this.args.classname);
    }
  }
  /**
   * Append a new component to this panel
   * @function add
   * @memberof elation.ui.panel#
   * @param {elation.component.base} component
   */
  this.add = function(component) {
    if (component) {
      this.container.appendChild(component.container);
      this.items.push(component);
      return component;
    } else {
      console.log('Error: invalid component passed in to ui.panel.add');
    }
    return false;
  }
}, elation.ui.base);
