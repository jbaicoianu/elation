/**
 * UI Namespace
 * @name elation.ui
 * @namespace
 */
elation.require(['utils.events'], function() {
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
    this.deferred = true;
    this.defaultcontainer = { tag: 'div' };

    this.init = function() {
      if (this.args.classname) {
        this.addclass(this.args.classname);
      }
    }

    /**
     * Add an HTML class to this component
     * @function addclass
     * @memberof elation.ui.base#
     */
    this.addclass = function(classname) {
      if (!elation.html.hasclass(this.container, classname)) {
        elation.html.addclass(this.container, classname);
      }
    }
    /**
     * Remove an HTML class from this component
     * @function removeclass
     * @memberof elation.ui.base#
     */
    this.removeclass = function(classname) {
      if (elation.html.hasclass(this.container, classname)) {
        elation.html.removeclass(this.container, classname);
      }
    }
    /**
     * Check whether this component has the specified class
     * @function hasclass
     * @memberof elation.ui.base#
     * @returns {bool}
     */
    this.hasclass = function(classname) {
      return elation.html.hasclass(this.container, classname);
    }
    /**
     * Make this component visible 
     * @function show
     * @memberof elation.ui.base#
     */
    this.show = function() {
      this.hidden = false;
      this.removeclass('state_hidden');
    }
    /**
     * Make this component invisible 
     * @function hide
     * @memberof elation.ui.base#
     */
    this.hide = function() {
      this.hidden = true;
      this.addclass('state_hidden');
    }
    /**
     * Sets the orientation of this component
     * @function setOrientation
     * @memberof elation.ui.base#
     * @param {string} orientation
     */
    this.setOrientation = function(orientation) {
      if (this.orientation) {
        this.removeclass('orientation_' + this.orientation);
      }
      this.orientation = orientation;
      this.addclass('orientation_' + this.orientation);
    }
    /**
     * Mark data as dirty, and then start the render loop if not already active
     * @function refresh
     * @memberof elation.ui.base#
     */
    this.refresh = function() {
      this.dirty = true;
      if (this.deferred) {
        if (!this.renderloopActive) {
          this.renderloop();
        }
      } else {
        this.render();
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
        if (typeof requestAnimationFrame == 'function') {
          requestAnimationFrame(elation.bind(this, this.renderloop));
        } else {
          setTimeout(elation.bind(this, this.renderloop), 1000/60);
        }
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
    this.addPropertyProxies = function(properties) {
      for (var i = 0; i < properties.length; i++) {
        (function(self, p) {
          Object.defineProperty(self, p, { get: function() { return this.getPropertyValue(p); }, set: function(v) { this.setPropertyValue(p, v); } });
        })(this, properties[i]);
      }
    }
    this.getPropertyValue = function(k) {
      return this.container[k];
    }
    this.setPropertyValue = function(k, v) {
      return this.container[k] = v;
    }
  });
});
