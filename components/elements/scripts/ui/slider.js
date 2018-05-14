elation.require(['elements.elements', 'elements.ui.input', 'elements.ui.text'], function() {
  elation.elements.define('ui.slider', class extends elation.elements.base {
    init() {
      super.init();
      this.defineAttributes({
        label: { type: 'string' },
        min: { type: 'float', default: 0 },
        max: { type: 'float', default: 1 },
        value: { type: 'float', default: 0 },
        snap: { type: 'float' }
      });
    }
    create() {
      if (this.values) return;
      this.values = [];
      if (this.label) {
        this.labelelement = elation.elements.create('ui-label', {
          append: this,
          label: this.label
        });
      }
      this.trackelement = elation.elements.create('ui-slider-track', { append: this });
      
      this.createHandles();
    }
    createHandles() {
      var handle = elation.elements.create('ui-slider-handle', {
        append: this.trackelement,
        onchange: (ev) => this.updateHandle(handle),
        value: this.value
      });
      handle.slider = this;
      this.handles = [handle];
    }
    updateHandle(handle) {
      var idx = this.handles.indexOf(handle);
      if (idx != -1) {
        this.values[idx] = handle.value;
      }
    }
  });
  elation.elements.define('ui.slider.track', class extends elation.elements.base {
    create() {
      elation.events.add(this, 'mousedown', this.handleMouseDown);
      elation.events.add(this, 'touchstart', this.handleTouchStart);
    }
    handleMouseDown(ev) {
      var slider = this.parentNode;
      // Pass event through to the right handle
      var handle = slider.handles[0]; // TODO - pick closest
      handle.handleMouseDown(ev);
    }
    handleTouchStart(ev) {
      var slider = this.parentNode;
      // Pass event through to the right handle
      var handle = slider.handles[0]; // TODO - pick closest
      handle.handleTouchStart(ev);
    }
  });
  elation.elements.define('ui.slider.handle', class extends elation.elements.base {
    init() {
      this.defineAttributes({
        label: { type: 'string' },
        value: { type: 'float', default: 0, set: this.sendChangeEvent },
      });
    }
    create() {
      this.slider = this.parentNode.parentNode;

      // FIXME - these should be bound at a lower level
      this.handleMouseDown = elation.bind(this, this.handleMouseDown);
      this.handleMouseMove = elation.bind(this, this.handleMouseMove);
      this.handleMouseUp = elation.bind(this, this.handleMouseUp);
      this.handleTouchStart = elation.bind(this, this.handleTouchStart);
      this.handleTouchMove = elation.bind(this, this.handleTouchMove);
      this.handleTouchEnd = elation.bind(this, this.handleTouchEnd);

      elation.events.add(this, 'mousedown', this.handleMouseDown);
      elation.events.add(this, 'touchstart', this.handleTouchStart);

      this.refresh();
    }
    render() {
      this.style.left = 'calc(' + (100 * this.value / (this.slider.max - this.slider.min)) + '% - ' + (this.offsetWidth / 2) + 'px)';
      this.style.top = -(this.offsetHeight / 2 - this.parentNode.offsetHeight / 2) + 'px';
    }
    sendChangeEvent() {
      this.dispatchEvent({type: 'change', data: this.value});
    }
    updateValueFromEvent(ev) {
      var value = this.projectMouseEventOnAxis(ev);
      if (value !== this.value) {
        this.value = value;
      }
    }
    projectMouseEventOnAxis(ev) {
      var x = ev.clientX,
          y = ev.clientY,
          rect = this.parentNode.getBoundingClientRect();

      var percent = Math.max(0, Math.min(1, (x - rect.x) / rect.width));
      var value = percent * (this.slider.max - this.slider.min);
      //console.log(value, percent, x, y, rect);
      return value;
    }
    handleMouseDown(ev) {
      elation.events.add(window, 'mousemove', this.handleMouseMove);
      elation.events.add(window, 'mouseup', this.handleMouseUp);
      ev.preventDefault();
      this.updateValueFromEvent(ev);
      this.refresh();
    }
    handleMouseMove(ev) {
      this.updateValueFromEvent(ev);
      this.refresh();
    }
    handleMouseUp(ev) {
      elation.events.remove(window, 'mousemove', this.handleMouseMove);
      elation.events.remove(window, 'mouseup', this.handleMouseUp);
    }
    handleTouchStart(ev) {
console.log('do touch', ev, ev.touches.length);
      if (ev.touches.length == 1) {
        elation.events.add(window, 'touchmove', this.handleTouchMove);
        elation.events.add(window, 'touchend', this.handleTouchEnd);
        ev.preventDefault();
        this.updateValueFromEvent(ev.touches[0]);
      }
      this.refresh();
    }
    handleTouchMove(ev) {
      this.updateValueFromEvent(ev.touches[0]);
      this.refresh();
    }
    handleTouchEnd(ev) {
      elation.events.remove(window, 'touchmove', this.handleTouchMove);
      elation.events.remove(window, 'touchend', this.handleTouchEnd);
    }
  });
});
