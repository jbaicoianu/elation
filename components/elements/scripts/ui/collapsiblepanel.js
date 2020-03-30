elation.require(['elements.ui.panel', 'elements.ui.togglebutton'], function() {
  elation.elements.define('ui.collapsiblepanel', class extends elation.elements.ui.panel {
    init() {
      super.init();
      this.defineAttributes({
        collapsed: { type: 'boolean', default: false },
        peek: { type: 'boolean', default: false },
        hideempty: { type: 'boolean', default: false }
      });

      this.handleMouseMove = this.handleMouseMove.bind(this);
      this.handleMouseUp = this.handleMouseUp.bind(this);
    }
    create() {
      super.create();
  
      // We want to put our content inside of two wrapper divs, which will let us
      // slide our content in and out in an efficient way.  We use hardware-accelerated
      // CSS transforms for smooth animations, and the containing div uses overflow to
      // make the content disappear when collapsed.

      // Extract our children - we'll reparent them later
      var children = [];
      while (this.childNodes.length > 0) {
        children.push(this.childNodes[0]);
        this.removeChild(this.childNodes[0]);
      }

      // The handle that's used to toggle this panel open or closed
      this.handle = elation.elements.create('ui.togglebutton', {
        append: this,
        label: '',
        onactivate: (ev) => this.expand(),
        ondeactivate: (ev) => this.collapse(),
        onmousedown: (ev) => this.startResize(ev)
      });
      this.handle.addclass('collapse');

      // Our outer wrapper
      this.container = elation.elements.create('div', {
        append: this,
        class: 'container'
      });

      // Our main container
      this.inner = elation.elements.create('div', {
        append: this.container,
        class: 'container-inner'
      });

      // Re-add the children
      for (var i = 0; i < children.length; i++) {
        this.inner.appendChild(children[i]);
      } 

      this.addclass('default');

      if (this.collapsed) {
        this.collapse();
      } else {
        this.expand();
      }
    }
    appendChild(child) {
      return (this.inner ? this.inner.appendChild(child) : HTMLElement.prototype.appendChild.call(this, child));
    }
    updateLabel() {
      let dirs = {
        'up': '^',
        'down': 'v',
        'left': '<',
        'right': '>',
      };
      let dir = 'right';
      if (this.top) {
        dir = (this.collapsed ? 'down' : 'up');
      } else if (this.bottom) {
        dir = (this.collapsed ? 'up' : 'down');
      }
      if (this.left) {
        dir = (this.collapsed ? 'right' : 'left');
      } else if (this.right) {
        dir = (this.collapsed ? 'left' : 'right');
      }
      this.handle.setLabel(dirs[dir]);
    }
    render() {
      super.render();
/*
      var collapsed = this.collapsed;
      this.collapsed = false;
      this.collapsed = collapsed;
*/
      if (this.hideempty && this.inner) {
        if (this.inner.childNodes.length == 0) {
          this.hide();
        } else {
          this.show();
        }
      }
    }
    collapse() {
      var dim = this.inner.getBoundingClientRect();
      this.inner.style.width = dim.width + 'px';
      if (this.left || this.right) {
        this.container.style.width = '0px';
      } else if (this.top || this.bottom) {
        this.container.style.height = '0px';
      }
      this.collapsed = true;
      //this.style.width = 0;
      this.updateLabel();
    }
    expand() {
      if (this.inner.offsetWidth == 0) {
        this.inner.style.width = 'auto';
      } else {
        //this.style.width = this.inner.offsetWidth + 'px';
      }
      this.container.style.width = 'auto';
      this.container.style.height = 'auto';
      this.collapsed = false;
      this.updateLabel();
    }
    startResize(ev) {
      if (ev.button == 0) {
        window.addEventListener('mousemove', this.handleMouseMove); 
        window.addEventListener('mouseup', this.handleMouseUp); 
        this.resizepos = [ev.clientX, ev.clientY];
      }
    }
    handleMouseMove(ev) {
      if (this.hasclass('default')) {
        this.removeclass('default');
      }
      if (this.top || this.bottom) {
        var height = this.inner.offsetHeight + (this.resizepos[1] - ev.clientY);
        this.container.style.height = height + 'px';
        this.inner.style.height = height + 'px';
      }
      if (this.left || this.right) {
        var width = this.inner.offsetWidth + (this.resizepos[0] - ev.clientX);
        this.container.style.width = width + 'px';
        this.inner.style.width = width + 'px';
      }
      this.resizepos[0] = ev.clientX;
      this.resizepos[1] = ev.clientY;
    }
    handleMouseUp(ev) {
      window.removeEventListener('mousemove', this.handleMouseMove); 
      window.removeEventListener('mouseup', this.handleMouseUp); 
    }
  });
});


