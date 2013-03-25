elation.component.add("ui.slider", function() {
  this.minpos = 0;
  this.maxpos = 100;
  this.position = 0;

  this.init = function() {
    if (typeof this.args.minpos != 'undefined') this.minpos = this.args.minpos;
    if (typeof this.args.maxpos != 'undefined') this.maxpos = this.args.maxpos;
/*
    this.slider = elation.html.create('input');
    this.slider.type = 'range';
    this.slider = elation.html.create('input');
    this.container.appendChild(this.slider);
    elation.html.addclass(this.container, 'ui_slider');
    elation.events.add(this.slider, 'change', this);
*/
    this.track = elation.html.create({tag: 'div', classname: 'ui_slider_track', append: this.container});
    this.handle = elation.html.create({tag: 'div', classname: 'ui_slider_handle', append: this.track});
    elation.events.add(this.handle, 'mousedown', this);
    elation.events.add(this.container, 'mousewheel', this);
  }
  this.setposition = function(pos, skipevent) {
    //this.slider.value = pos;
    this.position = elation.utils.math.clamp(pos, this.minpos, this.maxpos);
    //console.log(this.track.offsetWidth * ((this.position) / (this.maxpos - this.minpos)), this.position, this.maxpos, this.minpos);
    this.handle.style.left = (this.track.offsetWidth * ((this.position) / (this.maxpos - this.minpos))) + 'px';
    if (!skipevent) {
      elation.events.fire({type: 'ui_slider_change', element: this, data: this.position});
    }
  }
  this.change = function(ev) {
    this.setposition(ev.data);
    //elation.events.fire({type: 'ui_slider_change', element: this, data: this.position});
  }
  this.mousedown = function(ev) {
    this.dragging = [ev.clientX, ev.clientY];
    elation.events.add(window, 'mousemove,mouseup', this);
    elation.events.fire({type: 'ui_slider_start', element: this, data: this.position});
    ev.preventDefault();
  }
  this.mousemove = function(ev) {
    var newpos = [ev.clientX, ev.clientY];
    var diff = [newpos[0] - this.dragging[0], newpos[1] - this.dragging[1]];
    this.dragging = newpos;
    var abspos = this.handle.offsetLeft + diff[0];
    var sliderpos = abspos / (this.track.offsetWidth / (this.maxpos - this.minpos));
    this.setposition(sliderpos);
  }
  this.mouseup = function(ev) {
    elation.events.fire({type: 'ui_slider_end', element: this, data: this.position});
    elation.events.remove(window, 'mousemove,mouseup', this);
  }
  this.mousewheel = function(ev) {
    //console.log(this.position, ev.wheelDeltaY, this.position + ev.wheelDeltaY / 120);
    this.setposition(this.position + ev.wheelDeltaY / 120);
  }
});
