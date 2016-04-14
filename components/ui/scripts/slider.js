elation.require(['ui.base','ui.input','utils.math'], function() {
  elation.requireCSS('ui.slider');
  /** 
   * PegBoard UI component
   *
   * @class pegboard
   * @augments elation.ui.base
   * @memberof elation.ui
   *
   * @param {object} args
   * @param {number} args.min
   * @param {number} args.max
   * @param {array} args.peg
   */
  elation.component.add("ui.pegboard", function() {
    this.defaultcontainer = { tag: 'div', classname: 'ui_pegboard' };
    this.defaults = {
      min: 0, 
      max: 1,
      prefix: "ui_pegboard",
      pegs: [{
        name: this.id + '_indicator'
      }]
    };
    this.initialize = function() {
      this.prefix = this.args.prefix;
      this.pegs = [];
      this.pegmap = {};
      this.container.id = this.prefix + '_' + this.id;

      elation.html.addclass(this.container, this.prefix);
      
      if (this.args.label) {
        this.formlabel = elation.ui.formlabel({label: this.args.label, append: this});
      }

      this.track = elation.html.create({tag: 'div', classname: this.prefix + '_track', append: this.container});
      this.dimensions = elation.html.dimensions(this.track);
      
      elation.events.add(this.track, 'touchstart,mousedown,mousewheel', this);
      
      for (var i in this.args.pegs) {
        if (this.args.pegs[i])
          this.addPeg(this.args.pegs[i]);
      }
      elation.ui.pegboard.extendclass.init.call(this);
    }
    this.addPeg = function(peg) {
      peg.parent = this;

      this.pegmap[peg.name] = this.pegs.length;
      
      this.pegs.push(
        elation.ui.pegboard_peg(
          this.id + '_' + peg.name, 
          elation.html.create({
            tag: 'div',
            id: this.args.prefix + '_' + this.id + '_peg_' + peg.name,
            classname: 'ui_pegboard_peg', 
            append: this.track
          }), 
          peg
        )
      );
    }
    this.setValue = function(peg, value) {
      var v2p = elation.utils.math.value2percent,
          clamp = elation.utils.math.clamp,
          bounds = peg.getBounds(),
          bounds_min = bounds[0], 
          bounds_max = bounds[1];

      this.setPercent(peg, {
        x: v2p(clamp(value, bounds_min, bounds_max), this.args.min, this.args.max),
        y: v2p(clamp(value, bounds_min, bounds_max), this.args.min, this.args.max)
      });
    }
    this.setPercent = function(peg, percent, skipevent) {
      if (!peg)
        return;

      var getValue = elation.utils.math.percent2value,
          getPercent = elation.utils.math.value2percent,
          clamp = elation.utils.math.clamp,
          bounds = peg.getBounds(),
          bounds_min = Number(bounds[0]), 
          bounds_max = Number(bounds[1]),
          min = Number(this.args.min),
          max = Number(this.args.max),
          snap = Number(peg.args.snap),
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
      
      peg.setValue(this.value = value.x, percent);
      this.refresh();

      if (!skipevent) {
        elation.events.fire({
          type: this.prefix + '_change', 
          element: this, 
          data: this.value
        });
      }
    }
    this.render = function() {
      for (var i=0; i<this.pegs.length; i++)
        if (this.pegs[i].dirty)
          this.pegs[i].render();
    }
    this.getDistance = function(a, b) {
      if (!a || !b) 
        return -1;
      else
        return elation.utils.math.vector3.distance([a.x, a.y, 0], [b.x, b.y, 0]);
    }
    this.getClosestPeg = function(coords) {
      var peg;

      for (var i=0; i<this.pegs.length; i++) {
        var candidate = this.pegs[i];

        if (!elation.utils.isTrue(candidate.args.moveable))
          continue;

        var position = candidate.position,
            distance = this.getDistance(position, coords);

        candidate.distance = distance;

        if (!peg || distance < peg.distance)
          peg = candidate;
      }

      return this.peg = peg;
    }
    this.mousedown = function(ev) {
      this.coords = elation.events.coords(ev);
      this.dimensions = elation.html.dimensions(this.track);

      var clamp = elation.utils.math.clamp,
          percent = {
            x: clamp((this.coords.x - this.dimensions.x) / this.dimensions.w, 0, 1), 
            y: clamp((this.coords.y - this.dimensions.y) / this.dimensions.h, 0, 1)
          },
          peg = this.getClosestPeg(this.coords);
      
      if (!peg)
        return;

      this.setPercent(peg, percent);

      this.left = peg.args.anchor == 'left'
        ? peg.container.offsetLeft
        : peg.container.offsetLeft + peg.container.offsetWidth;
      this.top = peg.container.offsetTop;

      elation.html.addclass([ this.container, peg.container ], 'active');
      elation.events.add(window, 'touchmove,touchend,mousemove,mouseup', this);
      elation.events.fire({
        type: this.prefix + '_start', 
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

      this.setPercent(this.peg, percent);
    }
    this.mouseup = function(ev) {
      elation.events.fire({
        type: this.prefix + '_end', 
        element: this, 
        data: this.value
      });

      elation.html.removeclass([ this.container, this.peg.container ], 'active');
      elation.events.remove(window, 'touchmove,touchend,mousemove,mouseup', this);
    }
    this.mousewheel = function(ev) {
      this.coords = elation.events.coords(ev);
      this.dimensions = elation.html.dimensions(this.track);
      
      var peg = this.getClosestPeg(this.coords);
      
      this.setValue(peg, peg.value + ((ev.wheelDeltaY / 120) * peg.args.snap));
      
      ev.preventDefault();
    }
    this.touchstart = this.mousedown;
    this.touchmove = this.mousemove;
    this.touchend = this.mouseup;
  }, elation.ui.base);
  /*
   * PegBoard Peg UI component
   *
   * @class pegboard_peg
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
  elation.component.add("ui.pegboard_peg", function() {
    this.defaults = {
      name: 'peg',
      bounds: 'track', // csv - specify names of other pegs
      anchor: 'left', // anchor the main peg element to one end or the other
      moveable: 'true',
      snap: .01,
      toFixed: 1,
      center: true,
      input: false,
      prefix: false,
      suffix: false
    };
    this.init = function() {
      this.parent = this.args.parent;

      this.position = {
        x:this.parent.track.offsetLeft,
        y:this.parent.track.offsetTop
      };

      this.grabber = elation.html.create({
        tag: 'div', 
        classname: 'ui_pegboard_peg_grabber', 
        append: this.container
      });

      switch (this.args.append) {
        case "track": var append_element = this.parent.track; break;
        case "peg": var append_element = this.container; break;
        case "grabber": var append_element = this.grabber; break;
        default: var append_element = this.parent.container; break;
      }

      switch(this.args.before) {
        case "track": var before_element = this.parent.track; break;
        case "peg": var before_element = this.container; break;
        case "grabber": var before_element = this.grabber; break;
        default: var before_element = null; break;
      }

      this.display = elation.html.create({
        tag: 'div', 
        classname: 'ui_pegboard_peg_display', 
        append: append_element,
        before: before_element
      });

      this.label_before = this.createLabel(this.args.prefix);
      this.createInput();
      this.label_after = this.createLabel(this.args.suffix);

      if (this.args.bindvar) {
        this.args.value = this.args.bindvar[0][this.args.bindvar[1]];
      } else if (this.args.center && elation.utils.isNull(this.args.value)) {
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
        id: 'ui_pegboard_' + this.id + '_input',
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
            htmlFor: 'ui_pegboard_' + this.id + '_input'
          }
        });
      }
    }
    this.getBounds = function() {
      var bounds = [this.parent.args.min, this.parent.args.max],
          pegs = this.parent.pegs,
          pegmap = this.parent.pegmap;

      if (this.args.bounds && this.args.bounds != 'track') {
        var names = this.args.bounds.split(',');

        for (var i=0; i<names.length; i++) {
          var name = names[i],
              index = pegmap[name],
              peg = pegs[index],
              snap = this.args.snap;

          if (peg && peg.value && i < index)
            bounds[1] = (peg.value) - Number(snap);
          else if (peg && peg.value)
            bounds[0] = (peg.value) + Number(snap);
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
        type: 'ui_pegboard_change', 
        element: this, 
        data: this.position
      });
    }
  }, elation.ui.base);
  /*
   * Range UI component
   *
   * @class range
   * @augments elation.ui.pegboard
   * @memberof elation.ui
   */
  elation.component.add("ui.range", function() {
    this.defaults = {
      prefix: 'ui_range',
      pegs: [],
      left: {
        name: "min",
        bounds: "max",
        input: "true",
        anchor: "right",
        labelprefix: "",
        value: 0,
        snap: "0.01",
        toFixed: "2"
      },
      right: {
        name: "max",
        bounds: "min",
        input: "true",
        labelprefix: "",
        value: 100,
        snap: "0.01",
        toFixed: "2"
      }
    };
    this.init = function() {
      for (var key in this.args.left)
        this.defaults.left[key] = this.args.left[key];

      for (var key in this.args.right)
        this.defaults.right[key] = this.args.right[key];

      this.args.pegs.push(this.defaults['left']);
      this.args.pegs.push(this.defaults['right']);

      this.initialize();
    }
  }, elation.ui.pegboard);
  /*
   * Slider UI component
   *
   * @class slider
   * @augments elation.ui.pegboard
   * @memberof elation.ui
   */
  elation.component.add("ui.slider", function() {
    this.defaults = {
      prefix: 'ui_slider',
      pegs: [],
      handle: {
        name: 'indicator',
        toFixed: 2,
        center: true,
        input: true,
        prefix: null,
        suffix: null,
        append: 'peg'
      }
    };
    this.init = function() {
      //console.log('slider', this);
      var handle = {};
      
      for (var key in this.defaults.handle) {
        handle[key] = this.defaults.handle[key];
      }
      
      handle.name += '_' + this.id;
      
      if (typeof this.args.handle == 'object') {
        for (var key in this.args.handle) {
          handle[key] = this.args.handle[key];
        }
      }

      this.args.pegs = [ handle ];

      this.initialize();
    }
  }, elation.ui.pegboard);
  /*
   * NavigationDots UI component
   *
   * @class navdots
   * @augments elation.ui.pegboard
   * @memberof elation.ui
   */
  elation.component.add("ui.navdots", function() {
    this.defaults = {
      prefix: 'ui_dots',
      selected: 0,
      pegs: []
    };
    this.init = function() {
      console.log('navdots', this);
      var max = this.args.max;
      var min = this.args.min || 1;
      
      for (var i=this.args.min; i<this.args.max; i++) {
        this.args.pegs.push({
          name: i,
          moveable: false,
          input: false,
          value: i,
          snap: 1
        });
      }

      this.args.pegs.push({
        name: "indicator",
        input: false,
        value: this.args.selected,
        snap: 1
      });

      this.initialize();
    }
  }, elation.ui.pegboard);
  /*
   * ProgressBar UI component
   *
   * @class progressbar
   * @augments elation.ui.pegboard
   * @memberof elation.ui
   */
  elation.component.add("ui.progressbar", function() {
    this.defaults = {
      prefix: 'ui_progressbar',
      min: 0,
      max: 100,
      pegs: [{
        name: "progress",
        input: true,
        anchor: "right",
        moveable: false,
        append: "grabber",
        suffix: "%",
        value: "0",
        snap: "0.01",
        toFixed: "0"
      }]
    };
    this.init = function() {
      var peg = this.args.pegs[0];
      peg.prefix = this.args.labelprefix || peg.prefix;
      peg.suffix = this.args.labelsuffix || peg.suffix;
      this.initialize();
    }
    this.set = function(percentx, percenty) {
      this.setPercent(this.pegs[0],{
        x: percentx || 0,
        y: percenty || 0
      });
    }
  }, elation.ui.pegboard);
  /*
   * InputSlider UI component
   *
   * @class inputslider
   * @augments elation.ui.pegboard
   * @memberof elation.ui
   */
  elation.component.add("ui.inputslider", function() {
    this.defaults = {
      prefix: 'ui_inputslider',
      pegs: [],
      handle: {
        name: 'peg',
        input: true,
        anchor: "right",
        append: "container",
        before: "track",
        value: 20,
        snap: 1,
        toFixed: 0
      }
    };
    this.init = function() {
      var handle = {};
      
      for (var key in this.defaults.handle) {
        handle[key] = this.defaults.handle[key];
      }
      
      handle.name += '_' + this.id;
      
      if (typeof this.args.handle == 'object') {
        for (var key in this.args.handle) {
          handle[key] = this.args.handle[key];
        }
      }

      this.args.pegs = [ handle ];
      console.log('inputslider', handle);

      this.initialize();
    }
  }, elation.ui.pegboard);
});
