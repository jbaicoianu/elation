console.log('aa');
elation.component.add('ui.draggable', function() {
  this.init = function() {
    this.dragenabled = false;
  }
  this.enabledrag = function() {
    if (!this.dragenabled) {
      elation.events.add(this.container, 'mousedown', this);
      elation.html.addclass(this.container, 'ui_draggable');
      this.dragenabled = true;
console.log('enable drag');
    }
  }
  this.disabledrag = function() {
    if (this.dragenabled) {
console.log('disable drag');
      elation.events.remove(this.container, 'mousedown', this);
      elation.html.removeclass(this.container, 'ui_draggable');
      this.dragenabled = false;
    }
  }
  this.mousedown = function(ev) {
    if (ev.button == 0) {
      elation.events.add(window, 'mousemove,mouseup', this);
      this.mousepos = [ev.clientX, ev.clientY];
      this.windowpos = [this.container.offsetLeft, this.container.offsetTop];
      
      this.container.style.left = this.windowpos[0] + 'px';
      this.container.style.top = this.windowpos[1] + 'px';
      elation.events.fire({type: 'ui_draggable_start', element: this});
    }
  }
  this.mousemove = function(ev) {
    var diff = [ev.clientX - this.mousepos[0], ev.clientY - this.mousepos[1]];
    if (diff[0] != 0 || diff[1] != 0) {
      elation.html.addclass(this.container, 'ui_draggable_dragging');
      this.container.style.left = this.windowpos[0] + diff[0] + 'px';
      this.container.style.top = this.windowpos[1] + diff[1] + 'px';
      elation.events.fire({type: 'ui_draggable_move', element: this});
    }
    //this.mousepos = [ev.clientX, ev.clientY];
    ev.preventDefault();
  }
  this.mouseup = function(ev) {
    elation.html.removeclass(this.container, 'ui_draggable_dragging');
    elation.events.remove(window, 'mousemove,mouseup', this);
    elation.events.fire({type: 'ui_draggable_end', element: this});
  }
});
