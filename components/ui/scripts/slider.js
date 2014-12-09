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
      elation.events.add(this.track, 'mousedown,mousewheel', this);
      
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
    this.setValue = function(value) {
      var v2p = elation.utils.math.value2percent,
          clamp = elation.utils.math.clamp,
          bounds = this.handle.getBounds(),
          bounds_min = bounds[0], 
          bounds_max = bounds[1];

      this.setPercent({
        x: v2p(clamp(value, bounds_min, bounds_max), this.args.min, this.args.max),
        y: v2p(clamp(value, bounds_min, bounds_max), this.args.min, this.args.max)
      });
    }
    this.setPercent = function(percent, skipevent) {
      var getValue = elation.utils.math.percent2value,
          getPercent = elation.utils.math.value2percent,
          bounds = this.handle.getBounds(),
          bounds_min = bounds[0], 
          bounds_max = bounds[1],
          clamp = elation.utils.math.clamp,
          value = {
            x: clamp(getValue(percent.x, this.args.min, this.args.max), bounds_min, bounds_max),
            y: clamp(getValue(percent.y, this.args.min, this.args.max), bounds_min, bounds_max)
          };

      if (this.handle.args.snap) {
        value = {
          x: Math.round(value.x / this.handle.args.snap) * this.handle.args.snap,
          y: Math.round(value.y / this.handle.args.snap) * this.handle.args.snap
        };
        percent = {
          x: getPercent(value.x, this.args.min, this.args.max),
          y: getPercent(value.y, this.args.min, this.args.max)
        };
      }
      
      this.handle.setValue(this.value = value.x, percent);

      if (!skipevent) {
        elation.events.fire({
          type: 'ui_slider_change', 
          element: this, 
          data: this.value
        });
      }
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
        var candidate = this.handles[i],
            position = candidate.position,
            distance = this.getDistance(position, coords);

        candidate.distance = distance;

        if (!handle || distance < handle.distance)
          handle = candidate;
      }

      this.handle = handle;
    }
    this.mousedown = function(ev) {
      this.coords = elation.events.coords(ev);
      this.dimensions = elation.html.dimensions(this.track);

      var clamp = elation.utils.math.clamp,
          percent = {
            x: clamp((this.coords.x - this.dimensions.x) / this.dimensions.w, 0, 1), 
            y: clamp((this.coords.y - this.dimensions.y) / this.dimensions.h, 0, 1)
          };

      this.getClosestHandle(this.coords);
      this.setPercent(percent);

      this.left = this.handle.container.offsetLeft;
      this.top = this.handle.container.offsetTop;

      elation.events.add(window, 'mousemove,mouseup', this);
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

      this.setPercent(percent);
    }
    this.mouseup = function(ev) {
      elation.events.fire({
        type: 'ui_slider_end', 
        element: this, 
        data: this.value
      });

      elation.events.remove(window, 'mousemove,mouseup', this);
    }
    this.mousewheel = function(ev) {
      this.coords = elation.events.coords(ev);
      this.dimensions = elation.html.dimensions(this.track);
      this.getClosestHandle(this.coords);
      
      this.setValue(this.handle.value + ((ev.wheelDeltaY / 120) * this.handle.args.snap));
      
      ev.preventDefault();
    }
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
        bounds: 'track',
        value: 0,
        snap: this.parent.args.snap || 1,
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

      this.display = elation.html.create({
        tag: 'div', 
        classname: 'ui_slider_handle_display', 
        append: this.parent.container
      });

      this.label_before = this.createLabel(this.args.labelprefix);
      this.createInput();
      this.label_after = this.createLabel(this.args.labelsuffix);

      if (this.args.center && elation.utils.isNull(this.args.value)) {
        this.args.value = (this.parent.args.max + this.parent.args.min) / 2;
      }

      if (!elation.utils.isNull(this.args.value)) {
        this.parent.handle = this;
        this.parent.setValue(this.args.value);
      }
    }
    this.createInput = function() {
      if (!this.args.input)
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

          if (handle && i < index)
            bounds[1] = handle.value - Number(snap);
          else if (handle)
            bounds[0] = handle.value + Number(snap);
        }
      }

      return bounds;
    }
    this.setValue = function(value, percent) {
      this.value = Number(value || 0);

      if (this.input)
        this.input.value = this.value;
      
      this.container.style.left = percent.x * 100 + '%';
      this.position.x = this.container.offsetLeft + this.parent.dimensions.x;
      this.position.y = this.container.offsetTop + this.parent.dimensions.y;

      // If a bindvar is passed in, automatically update the specified object property
      if (this.args.bindvar) {
        this.args.bindvar[0][this.args.bindvar[1]] = this.value;
      }
    }
    this.blur = function(ev) {
      var bounds = this.getBounds();

      this.parent.handle = this;
      this.parent.setValue(elation.utils.math.clamp(ev.data, bounds[0], bounds[1]));
      
      elation.events.fire({
        type: 'ui_slider_change', 
        element: this, 
        data: this.position
      });
    }
  }, elation.ui.base);
});
