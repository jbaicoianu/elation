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
elation.require(["ui.base", "ui.content"], function() {
  elation.requireCSS("ui.panel");

  elation.component.add("ui.panel", function() {
    this.defaultcontainer = {tag: 'div', classname: 'ui_panel'};

    this.init = function() {
      this.items = [];
      this.orientation = this.args.orientation || 'vertical';

      this.addclass('ui_panel');
      this.addclass('orientation_' + this.orientation);
      if (this.args.classname) {
        this.addclass(this.args.classname);
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
        if (elation.utils.isString(component)) {
          var panel = elation.ui.content({content: component, append: this});
          component = panel;
        } else {
          this.container.appendChild(component.container);
        }
        this.items.push(component);
        return component;
      } else {
        console.log('Error: invalid component passed in to ui.panel.add');
      }
      return false;
    }
    /**
     * Remove the specified component from this panel
     * @function remove
     * @memberof elation.ui.panel#
     * @param {elation.component.base} component
     */
    this.remove = function(component) {
      if (component.container && component.container.parentNode == this.container) {
        this.container.removeChild(component.container);
        var idx = this.items.indexOf(component);
        if (idx != -1) this.items.splice(idx, 1);
      }
    }
    /**
     * Clear all items from this panel
     * @function clear
     * @memberof elation.ui.panel#
     */
    this.clear = function() {
      while (this.items.length > 0) {
        this.remove(this.items[0]);
      }
    }
  }, elation.ui.base);

  elation.component.add("ui.panel_horizontal", function() {
    this.init = function() {
      this.args.orientation = 'horizontal';
      elation.ui.panel_horizontal.extendclass.init.call(this);
    }
  }, elation.ui.panel);
  elation.component.add("ui.panel_vertical", function() {
    this.init = function() {
      this.args.orientation = 'vertical';
      elation.ui.panel_vertical.extendclass.init.call(this);
    }
  }, elation.ui.panel);
  elation.component.add("ui.panel_float", function() {
    this.init = function() {
      this.args.orientation = 'float';
      elation.ui.panel_float.extendclass.init.call(this);
    }
  }, elation.ui.panel);
  elation.component.add("ui.panel_inline", function() {
    this.init = function() {
      this.args.orientation = 'inline';
      elation.ui.panel_inline.extendclass.init.call(this);
    }
  }, elation.ui.panel);
});
