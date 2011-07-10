elation.component.add("html.flippable", {
  init: function(name, container, args) {
    this.name = name;
    this.container = container;
    this.args = args || {};
    this.sides = [];
    this.animatetime = this.args.animatetime || 350;
    this.active = 0;
    
    this.initSides(); 

    if (this.args.events) {
      for (var k in this.args.events) {
        elation.events.add(this.container, k, this.args.events[k]);
      }
    }
  },
  handleEvent: function(ev) {
    if (typeof this[ev.type] == 'function') {
      return this[ev.type](ev);
    }
  },
  mouseover: function(ev) {
    if (elation.events.isTransition(ev, this.sides[this.active])) {
      this.flip();
    }
  },
  mouseout: function(ev) {
    if (elation.events.isTransition(ev, this.sides[this.active])) {
      this.unflip();
    }
  },
  flipstart: function(ev) {
    console.log('fuh', ev);
  },
  flipend: function(ev) {
    console.log('unfuh', ev);
  },
  flip: function() {
    if (!elation.html.hasclass(this.container, "state_flipped")) {
      this.active = 1;
      this.reposition();
      elation.html.addclass(this.sides[0], "state_flipped");
      elation.html.addclass(this.sides[1], "state_flipped");
      elation.events.fire({type: "flipstart", fn: this, data: this, element: this.container});
    }
  },
  unflip: function() {
    if (elation.html.hasclass(this.container, "state_flipped")) {
      this.active = 0;
      elation.html.removeclass(this.sides[0], "state_flipped");
      elation.html.removeclass(this.sides[1], "state_flipped");
      elation.events.fire({type: "flipend", fn: this, data: this, element: this.container});
    }
  },
  toggle: function() {
    if (elation.html.hasclass(this.container, "state_flipped")) {
      this.unflip();
    } else {
      this.flip();
    }
  },
  initSides: function() {
    this.sides[0] = this.container;
    elation.html.addclass(this.sides[0], "html_flippable");

    this.sides[1] = elation.find(".html_flippable_side2", this.container, true);
    if (this.sides[1]) {
      this.container.removeChild(this.sides[1]);
    } else {
      this.sides[1] = elation.html.create({'tag':'div','classname':'html_flippable_side2'});
      this.sides[1].innerHTML = "hi";
    }
    this.sides[1].style.position = 'absolute';
    this.sides[1].style.border = this.container.style.border;
    document.body.appendChild(this.sides[1]);
    this.reposition();
    elation.events.add(this.sides[0], "mouseover,mouseout", this);
    elation.events.add(this.sides[1], "mouseover,mouseout", this);
  },
  setSide: function(side, contents) {
    if (typeof contents == 'string') {
      this.sides[side].innerHTML = contents;
    } else if (contents instanceof HTMLElement) {
      this.container.removeChild(this.sides[side]);
      this.sides[side] = contents;
      elation.html.addclass(this.sides[side], "html_flippable_side"+(side+1));
      this.container.appendChild(this.sides[side]);
    }
  },
  reposition: function() {
    var dims = elation.html.dimensions(this.sides[0]);
    var flipdims = elation.html.dimensions(this.sides[1]);
    var styles = elation.html.styleget(this.sides[0], ["border", "width", "height", "padding"]);
    this.sides[1].style.left = dims.x + 'px';
    this.sides[1].style.top = dims.y + 'px';
    this.sides[1].style.width = styles["width"];
    elation.html.stylecopy(this.sides[1], this.sides[0], ["border", "boxShadow", "background", "padding"]);
console.log(parseInt(styles["height"]) + parseInt(styles.borderTopWidth) + parseInt(styles.borderBottomWidth), flipdims.h);
    if (parseInt(styles["height"]) - 20 >= flipdims.h) {
      this.sides[1].style.height = (parseInt(styles["height"]) + 0)+ 'px';
    } else {
      this.sides[1].style.height = 'auto';
    }
  }
});
