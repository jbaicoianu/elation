elation.require(['ui.base', 'utils.math'], function() {
  elation.component.add("ui.slider_handle", function() {
    this.init = function() {
      console.log('handle', this);
      //this.handle = elation.html.create({tag: 'div', classname: 'ui_slider_handle', append: this.track});
      this.grabber = elation.html.create({tag: 'div', classname: 'ui_slider_handle_grabber', append: this.handle});
    }
  }, elation.ui.base);

  elation.component.add("ui.slider", function() {
    this.handles = [];

    this.init = function() {
      var defaults = {
        min: -333, 
        max: 333,
        value: false,
        snap: 1,
        center: true,
        id: 'ui_slider',
        handles: [{
          name: 'handle_one',
          bounds: 'track'
        }],
        labelprefix: 'value:',
        labelsuffix: ' units.'
      };

      for (var key in defaults) {
        if (elation.utils.isNull(this.args[key])) {
          this.args[key] = defaults[key];
        }
      }

      this.label_before = this.createLabel(this.args.labelprefix)
      this.input = elation.ui.input({ 
        id: this.args.id + '_input',
        append: this.container
      });

      this.label_after = this.createLabel(this.args.labelsuffix);

      elation.html.addclass(this.container, 'ui_slider');

      this.track = elation.html.create({tag: 'div', classname: 'ui_slider_track', append: this.container});
      
      console.log('fart', this.args.handles);
      for (var i=0; i < this.args.handles.length; i++) {
        var handle = this.args.handles[i];
        console.log('init handle', i, this.args.handles.length);
        this.handles.push( 
          elation.ui.slider_handle(
            handle.name, 
            elation.html.create({
              tag: 'div', 
              classname: 'ui_slider_handle', 
              append: this.track
            }), 
            handle
          )
        );
      }
      
      elation.events.add(this.container, 'mousedown', this);
      elation.events.add(this.container, 'mousewheel', this);
      elation.events.add(this.input, 'blur', this)
      
      if (this.args.center && elation.utils.isNull(this.args.value)) 
        this.args.value = (this.max + this.min) / 2;

      if (!elation.utils.isNull(this.args.value)) {
        this.setValue(this.args.value);
      }
    }
    this.createLabel = function(value) {
      return elation.html.create({
        tag: 'label',
        append: this.container,
        attributes: { 
          innerHTML: value,
          htmlFor: 'ui_slider_input'
        }
      });
    }
    this.setValue = function(value) {
      var v2p = elation.utils.math.value2percent,
          clamp = elation.utils.math.clamp,
          min = this.min, max = this.max;

      this.setPercent({
        x: v2p(clamp(value, min, max), min, max),
        y: v2p(clamp(value, min, max), min, max)
      });
    }
    this.setPercent = function(percent, skipevent) {
      var getValue = elation.utils.math.percent2value,
          getPercent = elation.utils.math.value2percent,
          value = {
            x: getValue(percent.x, this.min, this.max),
            y: getValue(percent.y, this.min, this.max)
          };

      if (this.snap) {
        value = {
          x: Math.round(value.x / this.snap) * this.snap,
          y: Math.round(value.y / this.snap) * this.snap
        };
        percent = {
          x: getPercent(value.x, this.min, this.max),
          y: getPercent(value.y, this.min, this.max)
        };
      }

      console.log('setpos', percent, value);
      this.value = value.x;
      this.handle.style.left = percent.x * 100 + '%';
      
      this.input.value = this.value;

      if (!skipevent) {
        elation.events.fire({
          type: 'ui_slider_change', 
          element: this, 
          data: this.value
        });
      }
    }
    this.blur = function(ev) {
      console.log('blur', ev);
      this.setValue(elation.utils.math.clamp(ev.data, this.min, this.max));
      //elation.events.fire({type: 'ui_slider_change', element: this, data: this.position});
    }
    this.mousedown = function(ev) {
      this.coords = elation.events.coords(ev);
      this.top = this.handle.offsetTop;
      this.left = this.handle.offsetLeft;
      this.width = this.track.offsetWidth;
      this.height = this.track.offsetHeight;

      elation.events.add(window, 'mousemove,mouseup', this);
      elation.events.fire({
        type: 'ui_slider_start', 
        element: this, 
        data: this.value
      });
      
      ev.preventDefault();
    }
    this.mousemove = function(ev) {
      var clamp = elation.utils.math.clamp,
          current = elation.events.coords(ev),
          delta = {
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
      var value = Number(this.input.value);
      
      this.setValue(value + (ev.wheelDeltaY / 120));
      
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
