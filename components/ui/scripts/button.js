elation.component.add('ui.button', {
  init: function(name, container, args) {
    this.tag = this.args.tag || "BUTTON";
    this.classname = this.args.classname || "";
    this.title = this.args.title || false;
    this.draggable = this.args.draggable || false;
    this.label = this.args.label || container.innerHTML;
    elation.html.addclass(this.container, 'ui_button');
    this.create();
    elation.events.add(this.container, 'click', this);
  },
  create: function() {
    //this.element = document.createElement(this.tag);
    this.container.innerHTML = this.label;
    var classname = '';
    if (this.draggable) {
      classname = 'elation_ui_button_draggable';
      this.container.draggable = true;
    }
    classname += this.classname;
    if (classname.length > 0) {
      this.container.className = classname;
    }
    if (this.title)
      this.container.title = this.title;
  },
  addTo: function(parent) {
    if (typeof parent != 'undefined') {
      if (!this.container)
        this.create();
      parent.appendChild(this.container);
      return true;
    }
    return false;
  },
  setLabel: function(label) {
    this.label = label;
    if (this.container)
      this.container.innerHTML = label;
  },
  setActive: function(active) {
    if (active) {
      elation.html.addclass(this.container, 'state_active');
    } else {
      elation.html.removeclass(this.container, 'state_active');
    }
  },
  click: function(ev) {
    elation.events.fire({type: 'ui_button_click', element: this});
  }
});

/*
plop = new function() {
  this.extend = function(name, definition, implement) {
    plop[name] = definition;
//    elation.utils.arrayset(this, name, definition);
    foo = elation.utils.arrayget(this, name);
    foo.prototype = new plop.Object;
    foo.prototype.constructor = plop[name];
    foo.prototype.supr = plop.Object.prototype;
    if (implement instanceof Array) {
      console.log(implement);
    }
  }
}

plop.Object = function() {
  this.implement = function(from) {
console.log('inherit', this.constructor.prototype, 'from', from);
    for (var k in from) {
      if (k != 'constructor' && k != 'prototype') {
        this[k] = from[k];
      }
    }
  }
  this.implements = function(constructor) {
//console.log('see if',this,'implements',constructor);
    if (this instanceof constructor) {
//console.log('ya');
      return true;
    }
    var k, b = true, po = this, pc = new constructor;
//console.log('check 4 rlz', pc);
    for (k in pc) {
      b = b && k in po;
    }
//console.log((!!k && b) ? "probably" : "nope");
    return !!k && b;
  }
}
*/
/*
// Thing
plop.Thing = function() {
  this.doThing = function(n) {
    alert('thing it up ' + n + 'times');
  }
}
plop.Thing.prototype = new plop.Object;
//plop.Thing.prototype.constructor = plop.Thing;
// Magic
plop.Magic = function() {
  this.doMagic = function(n) {
    alert('magic it up ' + n + 'times');
  }
}
plop.Magic.prototype = new plop.Object;
//plop.Magic.prototype.constructor = plop.Magic;
// MagicThing
plop.MagicThing = function() {
  this.doMagicThing = function(n) {
    this.doThing(n);
    this.doMagic(n);
  }
  this.doThing = function(n) {
    alert('CUSTOM THINGER: ' + n);
  }
}
plop.MagicThing.prototype = new plop.Object;
plop.MagicThing.prototype.implement(new plop.Thing);
plop.MagicThing.prototype.implement(new plop.Magic);
//plop.MagicThing.prototype.constructor = plop.MagicThing.prototype;


function dump(thing) {
  console.log(thing, thing.implements(plop.Object), thing.implements(plop.Magic), thing.implements(plop.Thing));
}

var thing = new plop.Thing();
var magic = new plop.Magic();
var magicthing = new plop.MagicThing();
dump(thing);
dump(magic);
dump(magicthing);
*/
