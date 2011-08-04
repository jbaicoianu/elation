elation.component.add("html.dragdrop.source", {
  init: function(name, container, args) {
    this.name = name;
    this.container = container;
    this.args = args;
    this.container.draggable = true;
    elation.events.add(this.container, "dragstart,mousedown", this);
  },
  handleEvent: function(ev) {
    if (typeof this[ev.type] == 'function') {
      this[ev.type](ev);
    }
  },
  dragstart: function(ev) {
    console.log('dragstart', ev);
    ev.effectAllowed = 'move'; // only allow moves
    ev.dataTransfer.setData("text/html", "fuck yeah");
    ev.stopPropagation();
  }
});
elation.component.add("html.dragdrop.target", {
  init: function(name, container, args) {
    this.name = name;
    this.container = container;
    this.args = args;
    this.dropcover = new elation.html.dragdrop.dropcover();
    elation.events.add(this.container, "dragover,dragenter,dragleave,drop", this);
    elation.events.add(this.dropcover, "dropleft", this);
  },
  handleEvent: function(ev) {
    if (typeof this[ev.type] == 'function') {
      this[ev.type](ev);
    }
  },
  dragover: function(ev) {
    elation.html.addclass(this.container, "state_dragover");
    ev.dataTransfer.dropEffect = 'all';
    ev.preventDefault();
    ev.stopPropagation();

    this.dropcover.show(this.container, [ev.pageX, ev.pageY]);
  },
  dragenter: function(ev) {
    if (this.shit) this.shit = false;
  },
  dragleave: function(ev) {
    if (this.dropcover) {
/*
      (function(self) {
        self.shit = setTimeout(function() {
          self.container.removeChild(self.dropcover);
          self.dropcover = false;
        }, 200);
      })(this);
*/
    }
    elation.html.removeclass(this.container, "state_dragover");
  },
  drop: function(ev) {
    var region = this.dropcover.getRegion([ev.pageX, ev.pageY]);
    this.dropcover.hide();
    elation.html.removeclass(this.container, "state_dragover");
    console.log('drop', ev, ev.dataTransfer.getData("text/html"));
    this.container.innerHTML = ev.dataTransfer.getData("text/html") + '<h6>region = ' + region + '</h6>';
    ev.preventDefault();
  },
  dropleft: function(ev) {
    alert('shit, fuck!');
  } 
});
elation.component.add("html.dragdrop.dropcover", {
  maxbordersize: 25,
  minsize: 15,
  oncolor: '#9f9',
  offcolor: '#ccc',

  show: function(parent, pos) {
    if (!this.element) {
      this.element = elation.html.create({"tag": "div", "classname": "droptarget_dropcover"});
      elation.events.add(this.element, "drop,dragleave", this);
    }
    if (this.element.parent != parent) {
      if (this.element.parent) {
        this.element.parent.removeChild(this.parent);
      }
      if (parent.style.position == "" || parent.style.position == "static") {
        parent.style.position = 'relative';
      }
      var dim = elation.html.dimensions(parent);
      this.bordersize = this.maxbordersize;
      this.bordersize = Math.min((dim.h - this.minsize)  / 2, (dim.h - this.minsize)  / 2, this.maxbordersize);
      parent.appendChild(this.element);
    }
    
    this.element.style.backgroundColor = this.offcolor;
    this.element.style.display = 'block';
    this.element.style.borderStyle = 'solid';
    this.element.style.borderColor = this.offcolor;
    this.element.style.borderWidth = this.bordersize + 'px';
    var region = this.getRegion(pos);
    switch (region) {
      case 'main':
        this.element.style.backgroundColor = this.oncolor;
        break;
      case 'top':
        this.element.style.borderTopColor = this.oncolor;
        break;
      case 'right':
        this.element.style.borderRightColor = this.oncolor;
        break;
      case 'bottom':
        this.element.style.borderBottomColor = this.oncolor;
        break;
      case 'left':
        this.element.style.borderLeftColor = this.oncolor;
        break;
    }
  },
  hide: function() {
    if (this.element) {
      if (this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
      this.element = false;
    }
  },
  getRegion: function(pos) {
    var dims = elation.html.dimensions(this.element);
    var diff = [pos[0] - dims.x, pos[1] - dims.y];

    var region = "main";
    if (this.bordersize > 0) {
      var l = ['top', 'right', 'bottom', 'left'];
      var r = [
        this.bordersize - diff[1],
        this.bordersize - (dims.w - diff[0]),
        this.bordersize - (dims.h - diff[1]),
        this.bordersize - diff[0]
      ];

      // Resolve conflicts at corners for maximum accuracy
      for (var i = 0; i < r.length; i++) {
        if (r[i] > 0) {
          var prev = (i == 0 ? r.length : i) - 1;
          var next = (i == r.length ? -1 : i) + 1;
          if (r[prev] > 0) {
            region = (r[i] - r[prev] > 0 ? l[i] : l[prev]);
          } else if (r[next] > 0) {
            region = (r[i] - r[next] > 0 ? l[i] : l[next]);
          } else {
            region = l[i];
          }
          break;
        }
      }
    }
    return region;
  },
  handleEvent: function(ev) {
    if (typeof this[ev.type] == 'function') {
      this[ev.type](ev);
    }
  },
  dragleave: function(ev) {
    this.hide();
  },
  drop: function(ev) {
    var region = this.getRegion([ev.pageX, ev.pageY]);
    console.log('I been dropped!', region);
    elation.events.fire(this, "drop"+region, ev);
  }
});
