elation.require(['ui.base'], function() {
  /** 
   * Slider UI component
   *
   * @class slider
   * @augments elation.ui.base
   * @memberof elation.ui
   *
   * @param {object} args
   * @param {number} args.minpos
   * @param {number} args.maxpos
   * @param {number} args.value
   * @param {boolean} args.showlabel
   * @param {boolean} args.snap
   * @param {string} args.labelprefix
   * @param {string} args.labelsuffix
   */
  elation.component.add("ui.slider", function() {
    this.minpos = 0;
    this.maxpos = 100;
    this.position = 0;
    this.value = 0;

    this.init = function() {
      this.minpos = (typeof this.args.minpos != 'undefined' ? this.args.minpos : 0);
      this.maxpos = (typeof this.args.maxpos != 'undefined' ? this.args.maxpos : 100);
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
      this.position = elation.utils.math.clamp(pos, this.minpos, this.maxpos);
      if (this.snap) {
        this.value = Math.round(this.position / this.snap) * this.snap;
      } else {
        this.value = this.realposition;
      }
      //console.log(this.track.offsetWidth * ((this.position) / (this.maxpos - this.minpos)), this.position, this.maxpos, this.minpos);
      this.handle.style.left = (this.track.offsetWidth * ((this.position - this.minpos) / (this.maxpos - this.minpos))) + 'px';
  //console.log(this.position, this.value, this.minpos, this.maxpos, ((this.value - this.minpos) / (this.maxpos - this.minpos)), this.track.offsetWidth, this.handle.style.left);
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
      var percent = (this.track.offsetWidth / (this.maxpos - this.minpos));
      var sliderpos = abspos / (this.track.offsetWidth / (this.maxpos - this.minpos));
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
