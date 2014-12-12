elation.require(['ui.base'], function() {
  elation.requireCSS('ui.button');
  /** 
   * Button UI element
   *
   * @class button
   * @augments elation.ui.base
   * @memberof elation.ui
   *
   * @param {object} args
   * @param {string} args.tag
   * @param {string} args.classname
   * @param {string} args.label
   * @param {string} args.title
   * @param {boolean} args.draggable
   * @param {boolean} args.autoblur
   * @param {boolean} args.autofocus
   */
  elation.component.add('ui.button', function() {
    this.defaultcontainer = { tag: 'button', classname: 'ui_button' };

    this.init = function(name, container, args) {
      this.tag = this.args.tag || "BUTTON";
      this.classname = this.args.classname || "";
      this.title = this.args.title || false;
      this.draggable = this.args.draggable || false;
      this.label = this.args.label || this.container.innerHTML;
      this.autoblur = this.args.autoblur || false;
      this.tabindex = this.args.tabindex || false;

      this.create();
      elation.events.add(this.container, 'click', this);

      for (var k in this.events) {
        elation.events.add(this.container, k, this.events[k]);
      }
    }
    /**
     * Initialize HTML element
     * @function create
     * @memberof elation.ui.button#
     */
    this.create = function() {
      //this.element = document.createElement(this.tag);
      this.container.innerHTML = this.label;
      var classname = 'ui_button ';
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
      if (this.tabindex !== false) {
        this.container.tabIndex = this.tabindex;
      }
      this.addPropertyProxies(['disabled']);
      if (this.args.disabled) {
        this.disabled = true;
      }
    }
    /**
     * Add as a child of the specified element, removing from current parent if necessary
     * @function addTo
     * @memberof elation.ui.button#
     * @returns {boolean}
     */
    this.addTo = function(parent) {
      if (typeof parent != 'undefined') {
        if (!this.container)
          this.create();
        parent.appendChild(this.container);
        return true;
      }
      return false;
    }
    /**
     * Sets the text label of the button
     * @function setLabel
     * @memberof elation.ui.button#
     */
    this.setLabel = function(label) {
      this.label = label;
      if (this.container)
        this.container.innerHTML = label;
    }
    /**
     * Sets the title text of the button
     * @function setTitle
     * @memberof elation.ui.button#
     */
    this.setTitle = function(title) {
      if (this.container)
        this.container.title = title;
    }
    /**
     * Set whether the element is active or not
     * @function setActive
     * @memberof elation.ui.button#
     * @param {boolean} active
     */
    this.setActive = function(active) {
      if (active) {
        elation.html.addclass(this.container, 'state_active');
      } else {
        elation.html.removeclass(this.container, 'state_active');
      }
    }
    /**
     * Event handler for HTML button's click event
     * @function click
     * @memberof elation.ui.button#
     * @param {boolean} active
     * @emits ui_button_click
     */
    this.click = function(ev) {
      elation.events.fire({type: 'ui_button_click', element: this});
      if (this.autoblur) {
        this.container.blur();
      }
    }
  }, elation.ui.base);
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
