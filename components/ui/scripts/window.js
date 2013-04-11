elation.component.add('ui.window', function() {
  this.init = function() {
    elation.html.addclass(this.container, "ui_window");
    this.titlebar = elation.html.create({tag: 'h1', classname: 'ui_window_titlebar', content: this.args.title || '', append: this.container});
    //this.closebutton = elation.html.create({tag: 'button', classname: 'ui_window_close', content: 'x', append: this.titlebar});
    elation.events.add(this.container, 'mousedown', this);
    this.offsetpos = [0, 0];
  }
  this.setactive = function() {
    // first remove focus from any existing active windows
    elation.html.removeclass(elation.find('.ui_window.state_active'), 'state_active');
    elation.html.addclass(this.container, 'state_active');
  }
  this.close = function() {
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
  this.center = function() {
    var dim = elation.html.dimensions(this.container);
    var realx = (window.innerWidth - dim.w) / 2;
    var realy = (window.innerHeight - dim.h) / 2;
    this.setOffset(realx, realy);
  }
  this.setOffset = function(x, y) {
    this.offsetpos = [x, y];
    elation.html.transform(this.container, 'translate(' + this.offsetpos[0] + 'px, ' + this.offsetpos[1] + 'px)');
  }
  this.setcontent = function(newcontent) {
    if (newcontent instanceof HTMLElement) {
      if (this.content) {
        this.container.removeChild(this.content);
      }
      if (newcontent.parentNode) newcontent.parentNode.removeChild(content);
    
      this.container.appendChild(newcontent);
      this.content = newcontent;
    } else {
      if (!this.content) {
        this.content = elation.html.create({tag: 'div', classname: 'ui_window_content', append: this.container});
      }
      this.content.innerHTML = newcontent;
    }
  }
  this.mousedown = function(ev) {
    // focus window
    this.setactive();

    if (ev.target == this.titlebar) {
      // titlebar dragging
      elation.html.addclass(this.titlebar, 'state_dragging');
      this.dragstartpos = [ev.clientX, ev.clientY];
      this.dragdims = elation.html.dimensions(this.container);
      elation.events.add(window, 'mousemove,mouseup', this);
      ev.preventDefault();
    }
  }
  this.mousemove = function(ev) {
    var newpos = [ev.clientX, ev.clientY];
    var diff = [this.dragstartpos[0] - newpos[0], this.dragstartpos[1] - newpos[1]];
    // limit left side offset to prevent windows from getting lost
    //this.container.style.left = Math.max(newpos[0] + this.dragdims.x - this.dragstartpos[0], this.dragdims.w * -.9) + 'px';
    //this.container.style.top = (newpos[1] + this.dragdims.y - this.dragstartpos[1]) + 'px';
    //this.offsetpos = [Math.max(newpos[0] + this.dragdims.x - this.dragstartpos[0], this.dragdims.w * -.9), (newpos[1] + this.dragdims.y - this.dragstartpos[1])];
    this.dragstartpos = newpos;
    this.setOffset(this.offsetpos[0] - diff[0], this.offsetpos[1] - diff[1]);
  }
  this.mouseup = function(ev) {
    elation.events.remove(window, 'mousemove', this);
    elation.html.removeclass(this.titlebar, 'state_dragging');
    this.dragstartpos = this.dragoffset = false;
  }
});
