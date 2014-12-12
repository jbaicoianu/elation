elation.require(['ui.base','ui.input','utils.math'], function() {
  elation.requireCSS('ui.slider');
  /** 
   * Slider UI component
   *
   * @class slider
   * @augments elation.ui.base
   * @memberof elation.ui
   *
   * @param {object} args
   * @param {number} args.min
   * @param {number} args.max
   * @param {array} args.handle
   */
  elation.component.add("ui.slider", function() {
    this.defaultcontainer = { tag: 'div', classname: 'ui_slider' };
    this.init = function() {
      this.handles = [];
      this.handlemap = {};
      this.container.id = "ui_slider_" + this.id;
      
      var defaults = {
        min: 0, 
        max: 100,
        handles: [{
          name: this.id + '_indicator'
        }]
      };

      for (var key in defaults) {
        if (elation.utils.isNull(this.args[key])) {
          this.args[key] = defaults[key];
        }
      }

      elation.html.addclass(this.container, 'ui_slider');
      this.track = elation.html.create({tag: 'div', classname: 'ui_slider_track', append: this.container});
      this.dimensions = elation.html.dimensions(this.track);
      elation.events.add(this.track, 'touchstart,mousedown,mousewheel', this);
      
      for (var i in this.args.handles) {
        this.addHandle(this.args.handles[i]);
      }
    }
    this.addHandle = function(handle) {
      handle.parent = this;

      this.handlemap[handle.name] = this.handles.length;
      
      this.handles.push( 
        elation.ui.slider_handle(
          handle.name + '_' + this.handles.length, 
          elation.html.create({
            tag: 'div',
            id: 'ui_slider_' + this.id + '_handle_' + handle.name,
            classname: 'ui_slider_handle', 
            append: this.track
          }), 
          handle
        )
      );
    }
    this.setValue = function(handle, value) {
      var v2p = elation.utils.math.value2percent,
          clamp = elation.utils.math.clamp,
          bounds = handle.getBounds(),
          bounds_min = bounds[0], 
          bounds_max = bounds[1];

      this.setPercent(handle, {
        x: v2p(clamp(value, bounds_min, bounds_max), this.args.min, this.args.max),
        y: v2p(clamp(value, bounds_min, bounds_max), this.args.min, this.args.max)
      });
    }
    this.setPercent = function(handle, percent, skipevent) {
      if (!handle)
        return;

      var getValue = elation.utils.math.percent2value,
          getPercent = elation.utils.math.value2percent,
          clamp = elation.utils.math.clamp,
          bounds = handle.getBounds(),
          bounds_min = Number(bounds[0]), 
          bounds_max = Number(bounds[1]),
          min = Number(this.args.min),
          max = Number(this.args.max),
          snap = Number(handle.args.snap),
          value = {
            x: clamp(getValue(percent.x, min, max), bounds_min, bounds_max),
            y: clamp(getValue(percent.y, min, max), bounds_min, bounds_max)
          };

      if (snap) {
        value = {
          x: Math.round(value.x / snap) * snap,
          y: Math.round(value.y / snap) * snap
        };
        percent = {
          x: getPercent(value.x, min, max),
          y: getPercent(value.y, min, max)
        };
      }
      
      handle.setValue(this.value = value.x, percent);
      this.refresh();

      if (!skipevent) {
        elation.events.fire({
          type: 'ui_slider_change', 
          element: this, 
          data: this.value
        });
      }
    }
    this.render = function() {
      for (var i=0; i<this.handles.length; i++)
        if (this.handles[i].dirty)
          this.handles[i].render();
    }
    this.getDistance = function(a, b) {
      if (!a || !b) 
        return 0;
      else
        return elation.utils.math.vector3.distance([a.x, a.y, 0], [b.x, b.y, 0]);
    }
    this.getClosestHandle = function(coords) {
      var handle;

      for (var i=0; i<this.handles.length; i++) {
        var candidate = this.handles[i];

        if (!elation.utils.isTrue(candidate.args.moveable))
          continue;

        var position = candidate.position,
            distance = this.getDistance(position, coords);

        candidate.distance = distance;

        if (!handle || distance < handle.distance)
          handle = candidate;
      }

      return this.handle = handle;
    }
    this.mousedown = function(ev) {
      this.coords = elation.events.coords(ev);
      this.dimensions = elation.html.dimensions(this.track);

      var clamp = elation.utils.math.clamp,
          percent = {
            x: clamp((this.coords.x - this.dimensions.x) / this.dimensions.w, 0, 1), 
            y: clamp((this.coords.y - this.dimensions.y) / this.dimensions.h, 0, 1)
          },
          handle = this.getClosestHandle(this.coords);
      
      if (!handle)
        return;

      this.setPercent(handle, percent);

      this.left = handle.args.anchor == 'left'
        ? handle.container.offsetLeft
        : handle.container.offsetLeft + handle.container.offsetWidth;
      this.top = handle.container.offsetTop;

      elation.events.add(window, 'touchmove,touchend,mousemove,mouseup', this);
      elation.events.fire({
        type: 'ui_slider_start', 
        element: this, 
        data: this.value
      });

      ev.preventDefault();
    }
    this.mousemove = function(ev, delta) {
      var clamp = elation.utils.math.clamp,
          current = elation.events.coords(ev),
          delta = delta || {
            x: current.x - this.coords.x, 
            y: current.y - this.coords.y
          },
          position = {
            x: this.left + delta.x,
            y: this.top + delta.y
          },
          percent = {
            x: clamp(position.x / this.dimensions.w, 0, 1),
            y: clamp(position.y / this.dimensions.h, 0, 1)
          };

      this.setPercent(this.handle, percent);
    }
    this.mouseup = function(ev) {
      elation.events.fire({
        type: 'ui_slider_end', 
        element: this, 
        data: this.value
      });

      elation.events.remove(window, 'touchmove,touchend,mousemove,mouseup', this);
    }
    this.mousewheel = function(ev) {
      this.coords = elation.events.coords(ev);
      this.dimensions = elation.html.dimensions(this.track);
      
      var handle = this.getClosestHandle(this.coords);
      
      this.setValue(handle, handle.value + ((ev.wheelDeltaY / 120) * handle.args.snap));
      
      ev.preventDefault();
    }
    this.touchstart = this.mousedown;
    this.touchmove = this.mousemove;
    this.touchend = this.mouseup;
  }, elation.ui.base);
  /*
   * Slider Handle UI component
   *
   * @class slider_handle
   * @augments elation.ui.base
   * @memberof elation.ui
   *
   * @param {number} args.value
   * @param {boolean} args.snap
   * @param {boolean} args.center
   * @param {string} args.name
   * @param {string} args.bounds
   * @param {string} args.labelprefix
   * @param {string} args.labelsuffix
   */
  elation.component.add("ui.slider_handle", function() {
    this.init = function() {
      this.parent = this.args.parent;

      var defaults = {
        name: 'handle',
        bounds: 'track', // csv - specify names of other handles
        anchor: 'left', // anchor the main handle element to one end or the other
        moveable: 'true',
        snap: 1,
        center: true,
        input: false,
        labelprefix: false,
        labelsuffix: false
      };

      for (var key in defaults) {
        if (elation.utils.isNull(this.args[key])) {
          this.args[key] = defaults[key];
        }
      }

      this.position = {
        x:this.parent.track.offsetLeft,
        y:this.parent.track.offsetTop
      };

      this.grabber = elation.html.create({
        tag: 'div', 
        classname: 'ui_slider_handle_grabber', 
        append: this.container
      });

      switch(this.args.append) {
        case "track": var append_element = this.parent.track; break;
        case "handle": var append_element = this.container; break;
        case "grabber": var append_element = this.grabber; break;
        default: var append_element = this.parent.container; break;
      }

      switch(this.args.before) {
        case "track": var before_element = this.parent.track; break;
        case "handle": var before_element = this.container; break;
        case "grabber": var before_element = this.grabber; break;
        default: var before_element = null; break;
      }

      this.display = elation.html.create({
        tag: 'div', 
        classname: 'ui_slider_handle_display', 
        append: append_element,
        before: before_element
      });

      this.label_before = this.createLabel(this.args.labelprefix);
      this.createInput();
      this.label_after = this.createLabel(this.args.labelsuffix);

      if (this.args.center && elation.utils.isNull(this.args.value)) {
        this.args.value = (this.parent.args.max + this.parent.args.min) / 2;
      }

      if (!elation.utils.isNull(this.args.value)) {
        (function(self) {
          /* timer needed to solve no input value race condition */
          setTimeout(function() {
            self.parent.setValue(self, self.args.value);
          }, 1);
        })(this);
      }
    }
    this.createInput = function() {
      if (!elation.utils.isTrue(this.args.input))
        return;

      this.input = elation.ui.input({ 
        id: 'ui_slider_' + this.id + '_input',
        append: this.display
      });

      elation.events.add(this.input, 'blur', this);
    }
    this.createLabel = function(value) {
      if (!value) {
        return false;
      } else {
        return elation.html.create({
          tag: 'label',
          append: this.display,
          attributes: { 
            innerHTML: value,
            htmlFor: 'ui_slider_' + this.id + '_input'
          }
        });
      }
    }
    this.getBounds = function() {
      var bounds = [this.parent.args.min, this.parent.args.max],
          handles = this.parent.handles,
          handlemap = this.parent.handlemap;

      if (this.args.bounds && this.args.bounds != 'track') {
        var names = this.args.bounds.split(',');

        for (var i=0; i<names.length; i++) {
          var name = names[i],
              index = handlemap[name],
              handle = handles[index],
              snap = this.args.snap;

          if (handle && handle.value && i < index)
            bounds[1] = (handle.value) - Number(snap);
          else if (handle && handle.value)
            bounds[0] = (handle.value) + Number(snap);
        }
      }

      return bounds;
    }
    this.render = function() {
      if (this.input)
        this.input.value = this.args.toFixed 
          ? this.value.toFixed(this.args.toFixed) 
          : this.value;

      var anchor = this.args.anchor,
          percent = (anchor == 'left' ? this.percent.x : (1 - this.percent.x)) * 100;

      this.container.style[anchor] = percent + '%';
      this.position.x = this.container.offsetLeft + this.parent.dimensions.x;
      this.position.y = this.container.offsetTop + this.parent.dimensions.y;

      // If a bindvar is passed in, automatically update the specified object property
      if (this.args.bindvar) {
        this.args.bindvar[0][this.args.bindvar[1]] = this.value;
      }

      this.dirty = false;
    }
    this.setValue = function(value, percent) {
      this.value = Number(value || 0);
      this.percent = percent;
      this.dirty = true;
    }
    this.blur = function(ev) {
      var bounds = this.getBounds();

      this.parent.setValue(this, elation.utils.math.clamp(ev.data, bounds[0], bounds[1]));
      
      elation.events.fire({
        type: 'ui_slider_change', 
        element: this, 
        data: this.position
      });
    }
  }, elation.ui.base);
});
