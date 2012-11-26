elation.component.add("ui.droptarget", function() {
  this.initdroptarget = function(droptarget) {
    this.droptarget = droptarget || this.container;
    elation.events.add(window, 'dragenter,dragover,dragleave,drop', this);
    elation.events.add(this.container, 'dragmove', this);
    elation.html.addclass(this.droptarget, "ui_droptarget");
  }
  this.setdroptarget = function(isdroppable, istarget) {
    if (isdroppable) {
      elation.html.removeclass(this.droptarget, 'state_active');
      elation.html.addclass(this.droptarget, 'state_droppable');
    } else if (istarget) {
      elation.html.removeclass(this.droptarget, 'state_droppable');
      elation.html.addclass(this.droptarget, 'state_active');
    } else {
      elation.html.removeclass(this.droptarget, 'state_active');
      elation.html.removeclass(this.droptarget, 'state_droppable');
    }
  }
  this.dragenter = function(ev) {
    this.setdroptarget(elation.utils.isin(this.droptarget, ev.target), true);
  }
  this.dragover = function(ev) {
    ev.preventDefault();
  }
  this.dragleave = function(ev) {
    if (ev.pageX == 0) {
      this.setdroptarget(false, false);
    }
  }
  this.drop = function(ev) {
    if (elation.utils.isin(this.droptarget, ev.target)) {
      elation.events.fire({type: 'ui_droptarget_drop', element: this, data: ev.dataTransfer});
    }
    this.setdroptarget(false, false);
    ev.preventDefault();
  }
});
