elation.require(['elements.elements', 'elements.ui.input', 'elements.ui.text'], function() {
  elation.elements.define('ui.slider', class extends elation.elements.base {
    init() {
      super.init();
      this.defineAttributes({
        label: { type: 'string' },
        min: { type: 'float', default: 0 },
        max: { type: 'float', default: 1 },
        value: { type: 'float', default: 0, set: this.updateValue },
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
        if (this.values.length == 1) {
          this.value = this.values[0];
        }
        //this.dispatchEvent({type: 'change', data: handle.value});
        elation.events.fire({element: this, type: 'change', data: handle.value});
      }
    }
    updateValue() {
      let handle = this.handles[0];
      handle.sendchangeevent = false;
      handle.value = this.value;
      this.values[0] = this.value;
      handle.sendchangeevent = true;
    }
  });
  elation.elements.define('ui.slider.track', class extends elation.elements.base {
    init() {
      super.init();
      this.defineAttributes({
        hover: { type: 'boolean', default: false },
      });
    }
    create() {
      elation.events.add(this, 'mousedown', ev => this.handleMouseDown(ev));
      elation.events.add(this, 'mouseover', ev => this.handleMouseOver(ev));
      elation.events.add(this, 'mouseout', ev => this.handleMouseOut(ev));
      elation.events.add(this, 'touchstart', ev => this.handleTouchStart(ev));
      elation.events.add(this, 'wheel', ev => this.handleWheel(ev));
    }
    handleMouseDown(ev) {
      var slider = this.parentNode;
      // Pass event through to the right handle
      var handle = slider.handles[0]; // TODO - pick closest
      handle.handleMouseDown(ev);
    }
    handleMouseOver(ev) {
      this.hover = true;
      this.parentNode.handles[0].showLabel();
    }
    handleMouseOut(ev) {
      this.hover = false;
      let handle = this.parentNode.handles[0];
      if (!handle.dragging) {
        handle.hideLabel();
      }
    }
    handleTouchStart(ev) {
      var slider = this.parentNode;
      // Pass event through to the right handle
      var handle = slider.handles[0]; // TODO - pick closest
      handle.handleTouchStart(ev);
    }
    handleWheel(ev) {
      let slider = this.parentNode,
          amount = (slider.snap ? slider.snap : (slider.max - slider.min) / 20);
      let handle = slider.handles[0]; // TODO - pick closest
      handle.value = Math.max(slider.min, Math.min(slider.max, handle.value + (ev.deltaY < 0 ? 1 : -1) * amount));
    }
  });
  elation.elements.define('ui.slider.handle', class extends elation.elements.base {
    init() {
      this.defineAttributes({
        label: { type: 'string' },
        value: { type: 'float', default: 0, set: this.sendChangeEvent },
        sendchangeevent: { type: 'bool', default: true},
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
      elation.events.add(this, 'mouseover', this.handleMouseOver);
      elation.events.add(this, 'mouseout', this.handleMouseOut);

      this.labelel = elation.elements.create('ui-label', {
        append: this,
        label: this.value,
      });
      this.positionLabel();
      this.labelel.hide();
      this.refresh();

      let foo = new IntersectionObserver(d => this.handleIntersectionObserver(d), {
        root: null,
        threshold: [0, .5, 1],
      });
      foo.observe(this);
    }
    render() {
      this.style.left = 'calc(' + (100 * (this.value - this.slider.min) / (this.slider.max - this.slider.min)) + '% - ' + (this.offsetWidth / 2) + 'px)';
      this.style.top = -(this.offsetHeight / 2 - this.parentNode.offsetHeight / 2) + 'px';
      if (this.labelel) {
        let digits = 3;
        if (this.slider.snap) {
          if (this.slider.snap % 1 > 0) {
            digits = this.slider.snap.toString().split('.')[1].length;
          } else {
            digits = 0;
          }
        }
        this.labelel.setLabel(this.value.toFixed(digits));
        this.positionLabel();
      }
    }
    sendChangeEvent() {
      this.refresh();
      if (this.sendchangeevent) {
        this.dispatchEvent({type: 'change', data: this.value});
      }
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
      var value = percent * (this.slider.max - this.slider.min) + this.slider.min;
      if (this.slider.snap) {
        value = Math.floor(value / this.slider.snap) * this.slider.snap;
      }
      //console.log(value, percent, x, y, rect);
      return value;
    }
    positionLabel() {
      if (this.labelel) {
        let mycoords = this.getBoundingClientRect(),
            objcoords = this.labelel.getBoundingClientRect(),
            wincoords = document.body.getBoundingClientRect();


        this.labelel.style.right = 'auto'
        this.labelel.style.width = 'auto'
        this.labelel.style.bottom = this.offsetHeight + 'px';
        let margin = 2;

        let labeloffset = objcoords.width / 2;
       if (mycoords.x + labeloffset >= wincoords.width - margin) {
          labeloffset = labeloffset + ((mycoords.x + labeloffset) - wincoords.width) + margin;
        }
        //console.log(labeloffset, objcoords, wincoords);
        this.labelel.style.left = -labeloffset + 'px';
      }
    }
    showLabel() {
      if (this.labelel) {
        this.labelel.show();
        this.positionLabel();
      }
    }
    hideLabel() {
      if (this.labelel) {
        this.labelel.hide();
      }
    }
    handleMouseDown(ev) {
      elation.events.add(window, 'mousemove', this.handleMouseMove);
      elation.events.add(window, 'mouseup', this.handleMouseUp);
      ev.preventDefault();
      this.updateValueFromEvent(ev);
      this.refresh();
      this.labelel.show();
      this.positionLabel();
      this.dragging = true;
    }
    handleMouseMove(ev) {
      this.updateValueFromEvent(ev);
      this.refresh();
    }
    handleMouseUp(ev) {
      elation.events.remove(window, 'mousemove', this.handleMouseMove);
      elation.events.remove(window, 'mouseup', this.handleMouseUp);
      this.labelel.hide();
      this.dragging = false;
    }
    handleMouseOver(ev) {
      this.showLabel();
    }
    handleMouseOut(ev) {
      if (!this.dragging && this.labelel) {
        this.hideLabel();
      }
    }
    handleTouchStart(ev) {
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
    handleIntersectionObserver(d) {
      this.render();
    }
  });
});
