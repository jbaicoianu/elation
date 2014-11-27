elation.require(['ui.base','utils.math'], function() {
  elation.component.add("ui.slider_handle", function() {
    this.init = function() {
      this.parent = this.args.parent;

      var defaults = {
        name: 'handle',
        bounds: 'track',
        value: 0,
        snap: this.parent.args.snap,
        center: false,
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
      this.input = this.createInput();
      this.label_after = this.createLabel(this.args.labelsuffix);

      elation.events.add(this.input, 'blur', this)

      if (this.args.center && elation.utils.isNull(this.args.value)) {
        this.args.value = (this.max + this.min) / 2;
      }

      if (!elation.utils.isNull(this.args.value)) {
        this.parent.handle = this;
        this.parent.setValue(this.args.value);
      }
    }
    this.createInput = function() {
      return elation.ui.input({ 
        id: 'ui_slider_' + this.id + '_input',
        append: this.display
      });
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
      var bounds = [this.parent.min, this.parent.max],
          handles = this.parent.handles,
          handlemap = this.parent.handlemap;

      if (this.args.bounds && this.args.bounds != 'track') {
        var names = this.args.bounds.split(',');

        for (var i=0; i<names.length; i++) {
          var name = names[i],
              index = handlemap[name],
              handle = handles[index],
              snap = this.args.snap;

          if (handle && index > handlemap[this.id])
            bounds[1] = Number(handle.input.value) - Number(snap);
          else if (handle)
            bounds[0] = Number(handle.input.value) + Number(snap);
        }
      }

      return bounds;
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

  elation.component.add("ui.slider", function() {
    this.handles = [];
    this.handlemap = {};

    this.init = function() {
      var defaults = {
        min: -500, 
        max: 500,
        snap: 50,
        id: 'ui_slider',
        handles: [
          {
            name: 'handle_one',
            bounds: 'handle_two,handle_indicator',
            value: -250,
            labelprefix: 'min:'
          },{
            name: 'handle_indicator',
            bounds: 'handle_one,handle_two',
            snap: 1,
            labelprefix: 'set:'
          },{
            name: 'handle_two',
            bounds: 'handle_one,handle_indicator',
            value: 250,
            labelprefix: 'max:',
            labelsuffix: '.'
          }
        ]
      };

      for (var key in defaults) {
        if (elation.utils.isNull(this.args[key])) {
          this.args[key] = defaults[key];
        }
      }

      this.min = this.args.min;
      this.max = this.args.max;

      elation.html.addclass(this.container, 'ui_slider');

      this.track = elation.html.create({tag: 'div', classname: 'ui_slider_track', append: this.container});
      this.dimensions();
      
      for (var i=0; i < this.args.handles.length; i++) {
        var handle = this.args.handles[i];
        handle.parent = this;

        this.handlemap[handle.name] = this.handles.length;
        
        this.handles.push( 
          elation.ui.slider_handle(
            handle.name, 
            elation.html.create({
              tag: 'div',
              id: 'ui_slider_handle_' + handle.name,
              classname: 'ui_slider_handle', 
              append: this.track
            }), 
            handle
          )
        );
      }
      
      elation.events.add(this.track, 'mousedown,mousewheel', this);
    }
    this.setValue = function(value) {
      var v2p = elation.utils.math.value2percent,
          clamp = elation.utils.math.clamp,
          bounds = this.handle.getBounds(),
          min = bounds[0], max = bounds[1];

      this.setPercent({
        x: v2p(clamp(value, min, max), this.min, this.max),
        y: v2p(clamp(value, min, max), this.min, this.max)
      });
    }
    this.setPercent = function(percent, skipevent) {
      var getValue = elation.utils.math.percent2value,
          getPercent = elation.utils.math.value2percent,
          bounds = this.handle.getBounds(),
          min = bounds[0], max = bounds[1];
          clamp = elation.utils.math.clamp,
          value = {
            x: clamp(getValue(percent.x, this.min, this.max), min, max),
            y: clamp(getValue(percent.y, this.min, this.max), min, max)
          };

      if (this.handle.args.snap) {
        value = {
          x: Math.round(value.x / this.handle.args.snap) * this.handle.args.snap,
          y: Math.round(value.y / this.handle.args.snap) * this.handle.args.snap
        };
        percent = {
          x: getPercent(value.x, this.min, this.max),
          y: getPercent(value.y, this.min, this.max)
        };
      }

      this.value = value.x;
      this.handle.container.style.left = percent.x * 100 + '%';
      this.handle.input.value = this.value;
      this.handle.position.x = this.handle.container.offsetLeft + this.x;
      this.handle.position.y = this.handle.container.offsetTop + this.y;

      if (!skipevent) {
        elation.events.fire({
          type: 'ui_slider_change', 
          element: this, 
          data: this.value
        });
      }
    }
    this.distance = function(a, b) {
      if (!a || !b) return 0;
      var a = [a.x, a.y, 0];
      var b = [b.x, b.y, 0];
      return elation.utils.math.vector3.distance(a, b);
    }
    this.getClosestHandle = function(coords) {
      var handle;

      for (var i=0; i<this.handles.length; i++) {
        var candidate = this.handles[i],
            position = candidate.position,
            distance = this.distance(position, coords);

        candidate.distance = distance;

        if (!handle || distance < handle.distance)
          handle = candidate;
      }

      this.handle = handle;
    }
    this.dimensions = function() {
      this.x = this.track.offsetLeft;
      this.y = this.track.offsetTop;
      this.width = this.track.offsetWidth;
      this.height = this.track.offsetHeight;
    }
    this.mousedown = function(ev) {
      this.coords = elation.events.coords(ev);
      this.dimensions();

      var clamp = elation.utils.math.clamp,
          percent = {
            x: clamp((this.coords.x - this.x) / this.width, 0, 1), 
            y: clamp((this.coords.y - this.y) / this.height, 0, 1)
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
            x: clamp(position.x / this.width, 0, 1),
            y: clamp(position.y / this.height, 0, 1)
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
      this.dimensions();
      this.getClosestHandle(this.coords);
      var value = Number(this.handle.input.value);
      
      this.setValue(value + ((ev.wheelDeltaY / 120) * this.handle.args.snap));
      
      ev.preventDefault();
    }
  }, elation.ui.base);

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
   * @param {number} args.value
   * @param {boolean} args.showlabel
   * @param {boolean} args.snap
   * @param {string} args.labelprefix
   * @param {string} args.labelsuffix
   */
  elation.component.add("ui.slider_old", function() {
    this.min = 0;
    this.max = 100;
    this.position = 0;
    this.value = 0;

    this.init = function() {
      this.min = (typeof this.args.min != 'undefined' ? this.args.min : 0);
      this.max = (typeof this.args.max != 'undefined' ? this.args.max : 100);
      this.showlabel = (typeof this.args.showlabel != 'undefined' ? this.args.showlabel : true);
      this.labelprefix = (typeof this.args.labelprefix != 'undefined' ? this.args.labelprefix : '');
      this.labelsuffix = (typeof this.args.labelsuffix != 'undefined' ? this.args.labelsuffix : '');
      this.snap = (typeof this.args.snap != 'undefined' ? this.args.snap : false);
      /*
      this.slider = elation.html.create('input');
      this.slider.type = 'range';
      this.slider = elation.html.create('input');
      this.container.appendChild(this.slider);
      elation.html.addclass(this.container, 'ui_slider');
      elation.events.add(this.slider, 'change', this);
      */
      if (this.showlabel) {
        this.label = elation.html.create({tag: 'label', append: this.container});
      }
      elation.html.addclass(this.container, 'ui_slider');
      this.track = elation.html.create({tag: 'div', classname: 'ui_slider_track', append: this.container});
      this.handle = elation.html.create({tag: 'div', classname: 'ui_slider_handle', append: this.track});
      elation.events.add(this.handle, 'mousedown', this);
      elation.events.add(this.container, 'mousewheel', this);
      if (typeof this.args.value != 'undefined') this.setposition(this.args.value);
    }
    this.setposition = function(pos, skipevent) {
      //this.slider.value = pos;
      this.position = elation.utils.math.clamp(pos, this.min, this.max);
      if (this.snap) {
        this.value = Math.round(this.position / this.snap) * this.snap;
      } else {
        this.value = this.position;
      }
      //console.log(this.track.offsetWidth * ((this.position) / (this.max - this.min)), this.position, this.max, this.min);
      this.handle.style.left = (this.track.offsetWidth * ((this.position - this.min) / (this.max - this.min))) + 'px';
  //console.log(this.position, this.value, this.min, this.max, ((this.value - this.min) / (this.max - this.min)), this.track.offsetWidth, this.handle.style.left);
      if (this.showlabel) {
        this.label.innerHTML = this.labelprefix + this.value.toFixed(2) + this.labelsuffix;
      }
      if (!skipevent) {
        elation.events.fire({type: 'ui_slider_change', element: this, data: this.value});
      }
    }
    this.change = function(ev) {
      this.setposition(ev.data);
      //elation.events.fire({type: 'ui_slider_change', element: this, data: this.position});
    }
    this.mousedown = function(ev) {
      this.dragging = [ev.clientX, ev.clientY, this.position];
      elation.events.add(window, 'mousemove,mouseup', this);
      elation.events.fire({type: 'ui_slider_start', element: this, data: this.value});
      ev.preventDefault();
    }
    this.mousemove = function(ev) {
      var newpos = [ev.clientX, ev.clientY];
      var diff = [newpos[0] - this.dragging[0], newpos[1] - this.dragging[1]];
      //this.dragging = newpos;
      var abspos = diff[0];
      var percent = (this.track.offsetWidth / (this.max - this.min));
      var sliderpos = abspos / (this.track.offsetWidth / (this.max - this.min));
  console.log(sliderpos, percent, diff);
      this.setposition(sliderpos);
    }
    this.mouseup = function(ev) {
      elation.events.fire({type: 'ui_slider_end', element: this, data: this.value});
      elation.events.remove(window, 'mousemove,mouseup', this);
    }
    this.mousewheel = function(ev) {
      //console.log(this.position, ev.wheelDeltaY, this.position + ev.wheelDeltaY / 120);
      this.setposition(this.position + ev.wheelDeltaY / 120);
    }
  }, elation.ui.base);
});
