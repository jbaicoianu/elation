function iCanvas(divid, debug) {
  this.element = document.getElementById(divid);
  this.orientation = new iOrientation();
  this.element.style.webkitPerspective = 1000;
  this.objects = {};
  this.inputs = {};
  this.framerate = 20;
  this.frametimer = [];
  this.framecount = 0;
  this.lastrender = 0;
  this.debug = debug || false;
  this.dirty = false;
  this.camera = true;

  this.create = function() {
    if (this.debug) {
      this.debugdiv = document.createElement("DIV");
      this.debugdiv.id = 'idebug';
      this.debugfps = document.createElement("INPUT");
      this.debugdiv.appendChild(this.debugfps);
      this.element.appendChild(this.debugdiv);
    }

    // iphone scroll hack
    addEvent(window, "load", function() { setTimeout(function() { window.scrollTo(0,1); }, 100);});

    this.dynamics = new iObjectDynamics(this, { mass: 2, friction: 20 });

    $(window).bind("load", this, function(ev) { setTimeout(function() { ev.data.maximize(); }, 100); });
    $(window).bind("resize", this, function(ev) { ev.data.maximize(); });
    $(window).bind("orientationchange", this, function(ev) { ev.data.reorient(); ev.data.maximize(); });
    this.reorient();
    this.maximize();
    this.frametimer[0] = new Date(); // Initialize frametimer
    //this.inputs['me'] = new iInput(this);
  }

  this.go = function() {
    var self = this;
    var thistime = new Date();
    var tdiff = thistime - self.frametimer[0];

    self.dynamics.iterate(tdiff/1000);
    self.render(self.dirty);
    self.dirty = false;

    if (self.frametimer.length > self.framerate)
      self.frametimer.pop();
    self.frametimer.unshift(thistime);

    //setTimeout(function() { self.go(); }, 1000/self.framerate);
    setTimeout(function() { self.go(); }, 0);
    if (self.debug)
      self.debugfps.value = Math.round((1/tdiff)*1000) + "fps";
  }

  this.render = function(force) {
    for (var k in this.objects) {
      if (this.objects[k].render)
        this.objects[k].render(force);
    }
  }

  this.addObject = function(name, obj) {
    obj.name = name;
    this.objects[obj.name] = new iObject(this, obj);
    //this.inputs[obj.name] = new iInput(this.objects[obj.name]);
  }
  this.addObjects = function(objects) {
    if (objects) {
      for (var k in objects) {
        this.addObject(k, objects[k]);
      }   
    }
  }
  this.addControls = function(controls) {
    this.controller = new iController(this, controls);
  }

  this.setInputMode = function(mode) {
    for (var k in this.inputs) {
      this.inputs[k].mode = mode;
    }
  }
  this.move = function(xyz) {
    this.dirty = true;
    if (xyz instanceof Vector)
      this.orientation.move(xyz);
    else
      this.orientation.move($V(xyz));
    //console.log("Location: " + this.orientation.origin.inspect() + " (" + this.dirty + ")");
  }
  this.rotateAbs = function(xyz) {
    this.dirty = true;
    this.orientation.rotateAroundOrigin(xyz);
  }
  this.rotateRel = function(xyz) {
    this.dirty = true;
    this.orientation.rotateThisEuler(xyz);
  }

  this.maximize = function() {
    window.scrollTo(0,1);
    this.element.style.height = $(window).height() + "px";
    this.element.style.width = $(window).width() + "px";
  }
  this.reorient = function() {
    switch(window.orientation) {
      case 90:
      case -90:
        $("body").removeClass("orientation_portrait").addClass("orientation_landscape");
        break;
      default:
        $("body").removeClass("orientation_landscape").addClass("orientation_portrait");
        break;
    }

    if (this.controller)
      this.controller.reset();
  }

  this.create();
}
function iPolygon(parent, orientation, dimensions, label) {
  this.parent = parent || rootCanvas;
  this.orientation = orientation || new iOrientation();
  this.dimensions = dimensions || [200,200];
  this.label = label || '';
  this.dirty = true;

  this.create = function(parent, orientation) {
    this.element = document.createElement("DIV");
    this.element.className = "iPolygon " + this.label;
    
    this.element.style.width = this.dimensions[0] + 'px';
    this.element.style.height = this.dimensions[1] + 'px';
    this.element.style.webkitPerspectiveOrigin = 'center';
    this.parent.element.appendChild(this.element);
    //console.log("Polygon:",this);

    //this.render(true);
  }

  this.render = function(force) {
    if (this.dirty || force) {
      this.element.style.webkitTransform = this.getTransformCSS();
      this.dirty = false;
    }
  }

  this.getTransformCSS = function() {
    //console.log("Rotation:",this.rotation);

    var m = this.T2W();
    var matrix3d = "";
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        matrix3d += (matrix3d ? ", " : "") + Math.floor(m.e(i+1,j+1)*10000)/10000; // FIXME - quick and dirty hack to 90-degree problem (webkit hates scientific notation and numbers like 1.0x10^-16 break the 3d rendering)
      }
    }
    var ret = "matrix3d(" + matrix3d + ")";
    return ret;
  }

  this.T2W = function(m) {
    var ret = this.orientation.transform();
    //var quat = this.orientation.quat;
    var ptr = this.parent;
    while (ptr && ptr.orientation) {
      //ret = ptr.orientation.transform().multiply(ret);
      ret = ptr.orientation.transform(ret);
      //quat = quat.multiply(ptr.orientation.quat);
      ptr = ptr.parent;
    }
    //var ret = quat.toMatrix();
    return ret;
  }
  this.create(parent, orientation);
}

function iOrientation(origin, rotation, parent) {
  this.parent = parent || null;
  this.t2o = $M([[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]);
  this.origin = $V([0,0,0]);
  this.quat = $Q();
  //this.mode = "matrix";
  this.mode = "quat";

  this.move = function(xyz) {
    this.origin = this.origin.add(xyz);
  }
  this.rotateOther = function(m) {
    this.setT2O(this.t2o.multiply(m));
  }
  this.rotateOtherEuler = function(xyz) {
    if (this.mode == "matrix")
      return this.rotateOther($E(xyz).toMatrix());
    else if (this.mode == "quat") {
      this.quat = this.quat.multiply($E(xyz[0], xyz[1], xyz[2]).toQuaternion());
    }
  }
  this.rotateAroundOrigin = function(xyz) {
    var m = this.getT2O();
    var p = this.getT2OTranslation();
    //var mm = p.multiply(m).multiply($E(xyz).toMatrix()).multiply(p.multiply(-1));
    var mm = p.multiply(-1).multiply($E(xyz).toMatrix()).multiply(p);
    if (this.mode == "matrix")
      return this.rotateOther($E(xyz).toMatrix());
    else if (this.mode == "quat") {
      this.quat = this.quat.multiply(mm.toQuaternion());
      //this.quat = mm.toQuaternion();
    }
  }
  this.rotateThis = function(m) {
    if (this.mode == "matrix")
      this.setT2O(m.multiply(this.t2o));
  }
  this.rotateThisEuler = function(xyz) {
    if (this.mode == "matrix")
      return this.rotateThis($E(xyz).toMatrix());
    else if (this.mode == "quat") {
      this.quat = $E(xyz).toQuaternion().multiply(this.quat); // relative
    }
  }
  this.transform = function(m, camera) {
    var ret;
    if (this.mode == "matrix") {
      if (!camera) {
        ret = this.getT2O().multiply(this.getT2OTranslation());
      } else {
        ret = this.getT2OTranslation().multiply(this.getT2O());
      }

    } else if (this.mode == "quat") {
      ret = this.quat.toMatrix(this.origin);
//console.log(ret.inspect());
    }
    if (m)
      ret = m.multiply(ret);
    return ret;
  }

  this.getOrigin = function() {
    return this.origin;
  }
  this.setOrigin = function(origin) {
    this.origin = origin;
  }
  this.getT2O = function() {
    if (this.mode == "matrix")
      return this.t2o;
    else if (this.mode == "quat")
      return this.quat.toMatrix();
  }
  this.getT2OTranslation = function() {
    return $M([[1,0,0,0],
               [0,1,0,0],
               [0,0,1,0],
               [this.origin.e(1), this.origin.e(2), this.origin.e(3), 1]]);
  }
  this.getO2T = function() {
    return this.t2o.inverse();
  }
  this.setT2O = function(t2o) {
    this.t2o = t2o;
    this.t2o.orthogonalize();
    //this.o2t = this.t2o.inverse();
  }
  this.setO2T = function(o2t) {
    //this.o2t = o2t;
    this.t2o = o2t.inverse();
  }

  this.Other2This = function(v) {
    return this.getO2T().multiply(v.subtract(this.origin));
  }
  this.Other2ThisRelative = function(v) {
    return this.getO2T().multiply(v);
  }
  this.This2Other = function(v) {
    return this.origin.add(this.getT2O().multiply(v));
  }
}

function iObject(parent, objdef) {
  this.parent = parent;
  this.orientation = new iOrientation();
  this.objdef = objdef;
  this.p = [];
  this.camera = false;

  this.create = function(parent, objdef) {
    this.element = document.createElement("DIV");
    this.element.className = "iObject";

    if (objdef.classname)
      this.element.className += " " + objdef.classname;
    
    //console.log("Object:",this);

    if (objdef.rotate)
      this.rotateRel(objdef.rotate);
    if (objdef.origin)
      this.move(objdef.origin);
    if (objdef.dynamics)
      this.dynamics = new iObjectDynamics(this, objdef.dynamics);

    if (objdef.polygons.length > 0) {
      for (var i = 0; i < objdef.polygons.length; i++) {
        var orient = new iOrientation();
        orient.setOrigin($V(objdef.polygons[i][0]));
        orient.rotateOtherEuler(objdef.polygons[i][1]);
        this.p[i] = new iPolygon(this, orient, objdef.polygons[i][2], objdef.polygons[i][3]);
      }
    }

    this.element.style.webkitPerspectiveOrigin = 'center';
    this.parent.element.appendChild(this.element);

    this.render(true);
  }

  this.move = function(xyz) {
    this.dirty = true;
    this.orientation.move($V(xyz));
  }
  this.rotateAbs = function(xyz) {
    this.dirty = true;
    this.orientation.rotateOtherEuler(xyz);
  }
  this.rotateRel = function(xyz) {
    this.dirty = true;
    this.orientation.rotateThisEuler(xyz);
  }

  this.render = function(force) {
    var reallyforce = this.dirty || force;
    if (reallyforce) {
      var l = this.p.length;
      for (var i = 0; i < l; i++) {
        this.p[i].render(reallyforce);
      }
      this.dirty = false;
    }
  }

  this.create(parent, objdef);
}

function iController(parent, cfg) {
  this.parent = parent;
  this.cfg = cfg;
  this.sticks = {};
  this.buttons = {};

  this.create = function(parent, cfg) {
    this.element = document.createElement("DIV");
    this.element.className = "icontroller";
    if (cfg.sticks) {
      for (var k in cfg.sticks) {
        this.sticks[k] = new iControllerStick(this, cfg.sticks[k]);
      }
    }
    if (cfg.buttons) {
      for (var k in cfg.buttons) {
        this.buttons[k] = new iControllerButton(this, cfg.buttons[k]);
      }
    }
    this.parent.element.appendChild(this.element);
  }

  this.findOwner = function(element) {
    for (var k in this.sticks) {
      if (this.sticks[k].element == element || this.sticks[k].stickelement == element)
        return this.sticks[k];
    }
  }
  this.getActiveSticks = function() {
    var ret = [];
    for (var k in this.sticks) {
      if (this.sticks[k].active)
        ret.push(this.sticks[k]);
    }
    return ret;
  }

  this.reset = function() {
    for (var k in this.sticks) {
      this.sticks[k].center();
    }
  }

  this.create(parent, cfg);
}
function iControllerStick(parent, cfg) {
  this.parent = parent;
  this.cfg = cfg;
  this.distx = 0;
  this.disty = 0;
  this.active = false;
  this.mode = "rotate";
  this.create = function() {
    this.element = document.createElement("DIV");
    this.stickelement = document.createElement("DIV");
    this.element.className = "ui_controller_stick " + (this.cfg.classname || "");
    this.stickelement.className = "ui_controller_stick_handle";

    this.element.appendChild(this.stickelement);
    this.parent.element.appendChild(this.element);

    addEvent(this.element, "mousedown", this);
    addEvent(this.element, "touchstart", this);
    //addEvent(this.element, "touchstart", this);
    //addEvent(this.element, "mousedown", this);

    (function(self) {
      setTimeout(function() { self.center(); }, 0);
    }(this));
  }

  this.handleEvent = function(ev) {
    if (ev.type == "touchstart" || ev.type == "mousedown") {
      this.handleTouchstart(ev);
    } else if (ev.type == "touchmove" || ev.type == "mousemove") {
      this.handleTouchmove(ev);
    } else if (ev.type == "touchend" || ev.type == "mouseup") {
      this.handleTouchend(ev);
    }
  }

  this.handleTouchstart = function(ev) {
    if (ev.touches) {
      this.startx = this.lastx = ev.touches[0].clientX;
      this.starty = this.lasty = ev.touches[0].clientY;
    } else {
      this.startx = this.lastx = ev.clientX;
      this.starty = this.lasty = ev.clientY;
    }
    if (this.parent.getActiveSticks().length == 0) {
      addEvent(window, "touchmove", this);
      addEvent(window, "mousemove", this);
      addEvent(window, "mouseup", this);
      addEvent(window, "touchend", this);
    }
    this.active = true;
    ev.preventDefault();
    return false;
  }

  this.handleTouchmove = function(ev) {
    var thisx, thisy;
    if (ev.touches) {
      for (var i = 0; i < ev.touches.length; i++) {
        if (ev.touches[i].target == this.element || ev.touches[i].target == this.stickelement) {
          thisx = ev.touches[i].clientX;
          thisy = ev.touches[i].clientY;
        } else {
          var otherstick = this.parent.findOwner(ev.touches[i].target);
          if (otherstick) {
            otherstick.handleTouchmove(ev.touches[i]);
          }
        }
      }
    } else {
      thisx = ev.clientX;
      thisy = ev.clientY;
    }

    var diffx = thisx - this.lastx;
    var diffy = thisy - this.lasty;
    this.distx = thisx - this.startx;
    this.disty = thisy - this.starty;
    this.lastx = thisx;
    this.lasty = thisy;

    var capx = this.distx, capy = this.disty;
    if (this.distx > this.maxx || this.distx < - this.maxx)
      capx = this.distx * (this.maxx / Math.abs(this.distx)); 
    if (this.disty > this.maxy || this.disty < -this.maxy)
      capy = this.disty * (this.maxy / Math.abs(this.disty)); 

    var percentx = (capx / this.maxx) * 100;
    var percenty = (capy / this.maxy) * 100;
    //console.log(Math.round(theta * (180/Math.PI)) + "deg (" + this.distx + ", " + this.disty + "), (" + stickx + ", " + sticky + ") (" + percentx + "%, " + percenty + "%)");
    this.setStickPosition(percentx, percenty);

    if (ev.preventDefault)
      ev.preventDefault();
    return false;
  }

  this.handleTouchend = function(ev) {
    if (ev.touches && ev.touches.length > 0) { 
      var activesticks = this.parent.getActiveSticks();
      var touchsticks = [];
      for (var i = 0; i < ev.touches.length; i++) {
        var touchstick = this.parent.findOwner(ev.touches[i].target);

        for (var j = 0; j < activesticks.length; j++) {
          if (activesticks[j] == touchstick)
            delete activesticks[j];
        }
      }
      for (var j = 0; j < activesticks.length; j++) {
        if (activesticks[j]) {
          activesticks[j].center();
        }
      }
    } else {
      this.center(true);
    }
    ev.preventDefault();
    return false;
  }

  this.center = function(reset) {
    this.distx = this.disty = 0;
    if (this.element) {
      this.maxx = this.element.offsetWidth / 2;
      this.maxy = this.element.offsetHeight / 2;
    } else {
      this.maxx = this.maxy = 100;
    }
    if (this.stickelement) {
      this.stickwidth = this.stickelement.offsetWidth;
      this.stickheight = this.stickelement.offsetHeight;
      this.setStickPosition(0, 0);
    } else {
      this.stickwidth = this.stickheight = 0;
    }

    if (this.active) {
      if (reset) {
        removeEvent(window, "touchmove", this);
        removeEvent(window, "mousemove", this);
        removeEvent(window, "mouseup", this);
        removeEvent(window, "touchend", this);
      }
      this.active = false;
    }
  }
  this.setStickPosition = function(x, y) {
    var theta = Math.atan2(x, -y);
    var stickx = Math.cos(theta-Math.PI/2) * Math.abs((x / 100) * this.maxx);
    var sticky = Math.sin(theta-Math.PI/2) * Math.abs((y / 100) * this.maxy);

    var xpx = (stickx + (this.maxx - (this.stickwidth / 2))) + 'px';
    var ypx = (sticky + (this.maxy - (this.stickheight / 2))) + 'px';
    if (0) {
      this.stickelement.style.left = xpx;
      this.stickelement.style.top = ypx;
    } else {
      this.stickelement.style.webkitTransform = "translate("+xpx+", "+ypx+")";
    }

    if (this.cfg.events.axismove) {
      this.cfg.events.axismove({x: x, y: y}, this, this.parent.parent);
    }
  }

  this.create();
}
function iControllerButton(parent, cfg) {
  this.parent = parent;
  this.cfg = cfg;
  this.events = {};

  this.create = function(parent, cfg) {
    this.element = document.createElement("DIV");  
    this.element.className = 'icontroller_button ' + cfg.classname;
    this.element.innerHTML = cfg.label;

    if (cfg.events) {
      for (var k in cfg.events) {
        var keys = k.split(/,/);
        for (var i = 0; i < keys.length; i++) {
          this.events[keys[i]] = cfg.events[k];
          addEvent(this.element, keys[i], this);
        }
      }
    }

    this.parent.element.appendChild(this.element);
  }
  this.handleEvent = function(ev) {
    if (this.events[ev.type]) {
      this.events[ev.type](ev, this, this.parent.parent);
      ev.preventDefault();
      return false;
    }    
  }
  this.create(parent, cfg);
}

function Euler() {
  this.x = 0;
  this.y = 0;
  this.z = 0;
}
Euler.prototype = {
  setElements: function(x, y, z) {
    if (x instanceof Vector) {
      this.x = x.e(1);
      this.y = x.e(2);
      this.z = x.e(3);
    } else if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
      this.x = -x;
      this.y = y;
      this.z = z;
    } else if (!isNaN(x[0]) && !isNaN(x[1]) && !isNaN(x[2])) {
      this.x = -x[0];
      this.y = x[1];
      this.z = x[2];
    }
    return this;
  },

  toQuaternion: function() {
    var mult = Math.PI/360;
    var xr = this.x * mult,
        yr = this.y * mult,
        zr = this.z * mult,
        c1 = Math.cos(yr),
        s1 = Math.sin(yr),
        c2 = Math.cos(zr),
        s2 = Math.sin(zr),
        c3 = Math.cos(xr),
        s3 = Math.sin(xr),
        c1c2 = c1 * c2,
        s1s2 = s1 * s2,
        w = c1c2 * c3 - s1s2 * s3,
        x = c1c2 * s3 + s1s2 * c3,
        y = s1 * c2 * c3 + c1 * s2 * s3,
        z = c1 * s2 * c3 - s1 * c2 * s3,
        angle = 2 * Math.acos(w);

    var ret = $Q(w, $V([x, y, z]));
    return ret;
  },

  toMatrix: function(offset) {
    if (!offset)
      offset = [0,0,0];
    else if (offset instanceof Vector)
      offset = [offset.e(1), offset.e(2), offset.e(3)];

    var mult = Math.PI/180,
        x = this.x*mult,
        y = this.y*mult,
        z = this.z*mult,
        sinx = Math.sin(x),
        cosx = Math.cos(x),
        siny = Math.sin(y),
        cosy = Math.cos(y),
        sinz = Math.sin(z),
        cosz = Math.cos(z);

    return $M([[(cosy * cosz) + (siny * sinx * sinz), (-1 * cosy * sinz) + (siny * sinx * cosz), siny * cosz, 0],
               [sinz * cosx, cosz * cosx, -1 * sinx, 0],
               [(-siny * cosz) + (cosy * sinx * sinz), (sinz * siny) + (cosy * sinx * cosz), cosy * cosx, 0],
               [offset[0], offset[1], offset[2], 1]]);
  },

  inspect: function() {
    return "("+this.x+", "+this.y+", "+this.z+")";
  }
}
Euler.create = function(x, y, z) {
  var q = new Euler();
  var ret;
  if (typeof x == 'number') {
    ret = q.setElements(x, y, z);
  } else if (typeof x == 'object') {
    if (x instanceof Vector) {
      ret = q.setElements(x.e(1), x.e(2), x.e(3));
    } else {
      ret = q.setElements(x[0], x[1], x[2]);
    }
  }
  return ret;
};
var $E = Euler.create;

function Quaternion() {
  this.w = 1;
  this.v = $V([0,0,0]);
}

Quaternion.prototype = {
  setElements: function(w, v) {
    this.w = w;
    this.v = v;
    return this;
  },

  rotateThis: function(xyz) {
    var mult = Math.PI/180;
    var sinx = Math.sin(xyz[0]/2*mult),
        cosx = Math.cos(xyz[0]/2*mult),
        siny = Math.sin(xyz[1]/2*mult),
        cosy = Math.cos(xyz[1]/2*mult),
        sinz = Math.sin(xyz[2]/2*mult),
        cosz = Math.cos(xyz[2]/2*mult);

    return $Q((cosy * cosx * cosz) + (siny * sinx * sinz), $V([(cosy * sinx * cosz) + (siny * cosx * sinz), (-cosy * sinx * sinz) + (siny * cosx * cosz), (-siny * sinx * cosz) + (cosy * cosx * sinz)]));
  },
  rotateOther: function(xyz) {
    var mult = Math.PI/180;
    var sinx = Math.sin(xyz[0]/2*mult),
        cosx = Math.cos(xyz[0]/2*mult),
        siny = Math.sin(xyz[1]/2*mult),
        cosy = Math.cos(xyz[1]/2*mult),
        sinz = Math.sin(xyz[2]/2*mult),
        cosz = Math.cos(xyz[2]/2*mult);

    return $Q((cosy * cosx * cosz) + (siny * sinx * sinz), $V([(-cosy * sinx * cosz) - (siny * cosx * sinz), (cosy * sinx * sinz) - (siny * cosx * cosz), (siny * sinx * cosz) - (cosy * cosx * sinz)]));
  },
  multiply: function(other) {
    var w = (this.w * other.w) - (this.v.e(1) * other.v.e(1)) - (this.v.e(2) * other.v.e(2)) - (this.v.e(3) * other.v.e(3)),
        x = (this.w * other.v.e(1)) + (this.v.e(1) * other.w) + (this.v.e(2) * other.v.e(3)) - (this.v.e(3) * other.v.e(2)),
        y = (this.w * other.v.e(2)) - (this.v.e(1) * other.v.e(3)) + (this.v.e(2) * other.w) + (this.v.e(3) * other.v.e(1)),
        z = (this.w * other.v.e(3)) + (this.v.e(1) * other.v.e(2)) - (this.v.e(2) * other.v.e(1)) + (this.v.e(3) * other.w);
    var ret = $Q(this.w * other.w - this.v.dot(other.v), other.v.multiply(this.w).add(this.v.multiply(other.w)).add(other.v.cross(this.v)));
    return ret;
  },
  toMatrix: function(offset) {
    var wsq = this.w * this.w;
    var w = this.w;
    var x = this.v.e(1);
    var y = this.v.e(2);
    var z = this.v.e(3);
    var xsq = Math.pow(x, 2);
    var ysq = Math.pow(y, 2);
    var zsq = Math.pow(z, 2);

    if (!offset)
      offset = $V([0, 0, 0]);

    return $M([[1 - 2*ysq - 2*zsq, 2*x*y + 2*w*z, 2*x*z - 2*w*y, 0],
               [2*x*y - 2*w*z, 1 - 2*xsq - 2*zsq, 2*y*z + 2*w*x, 0],
               [2*x*z + 2*w*y, 2*y*z - 2*w*x, 1 - 2*xsq - 2*ysq, 0],
               [offset.e(1), offset.e(2), offset.e(3), 1]]);
  },
  inspect: function() {
    return "[" + this.w + ", [" + this.v.e(1) + ", " + this.v.e(2) + ", " + this.v.e(3) + "] ]";
  }


}
Quaternion.create = function(w, v) {
  var q = new Quaternion();
  if (typeof w == 'undefined')
    w = 1;
  if (typeof v == 'undefined') {
    v = $V([0,0,0]);
  } else if (!(v instanceof Vector)) {
    v = $V(v);
  }
  return q.setElements(w, v);
};
var $Q = Quaternion.create;

Matrix.prototype.orthogonalize = function() {
  var r1 = this.row(1);
  var r2 = this.row(2);
  var r3 = this.row(3);
  var r1dotr1 = r1.dot(r1);
  var r2p = r2.subtract(r1.multiply((r2.dot(r1)/r1dotr1)));
  var r3p = r3.subtract(r1.multiply((r3.dot(r1)/r1dotr1))).subtract(r2p.multiply(r3.dot(r2)/r2.dot(r2)));

  var r1p = r1.toUnitVector();
  r2p = r2p.toUnitVector();
  r3p = r3p.toUnitVector();

  this.setElements([[r1p.e(1), r1p.e(2), r1p.e(3), 0],
                    [r2p.e(1), r2p.e(2), r2p.e(3), 0],
                    [r3p.e(1), r3p.e(2), r3p.e(3), 0],
                    [0, 0, 0, 1]]);
}
Matrix.prototype.toQuaternion = function() {
  var m11 = this.e(1,1),
      m22 = this.e(2,2),
      m33 = this.e(3,3);
  var t = 1 + m11 + m22 + m33;
  var w=1, x=0, y=0, z=0, s=0;
  if (t > 0.0000001) {
    s = Math.sqrt(t)*2;
    x = (this.e(2,3) - this.e(3,2)) * s;
    y = (this.e(3,1) - this.e(1,3)) * s;
    z = (this.e(1,2) - this.e(2,1)) * s;
    w = s / 4;
  } else {
    if (m11 > m22 && m11 > m33) {
      s = 2 * Math.sqrt(1 + m11 - m22 - m33);
      x = s / 4;
      y = (this.e(1,2) + this.e(2,1)) / s;
      z = (this.e(3,1) + this.e(1,3)) / s;
      w = (this.e(2,3) - this.e(3,2)) / s;
    } else if (m22 > m33) {
      s = 2 * Math.sqrt(1 + m22 - m11 - m33);
      x = (this.e(1,2) + this.e(2,1)) / s;
      y = s / 4;
      z = (this.e(2,3) + this.e(3,2)) / s;
      w = (this.e(3,1) - this.e(1,3)) / s;
    } else {
      s = 2 * Math.sqrt(1 + m33 - m11 - m22);
      x = (this.e(3,1) + this.e(1,3)) / s;
      y = (this.e(2,3) + this.e(3,2)) / s;
      z = s / 4;
      w = (this.e(1,2) - this.e(2,1)) / s;
    }
  }
  return $Q(w, [x, y, z]);
}

function iObjectDynamics(parent, args) {
  this.parent = parent;
  this.args = args || {};
  this.mass = 1;        // grams
  this.drag = 0;
  this.friction = 0;
  this.vel = $V([0,0,0]); // m/s
  this.angular = $V([0,0,0]); // degrees/s
  this.forces = {'_num': 0};     // Forces which are acting on this object
  this.moving = false;
  this.rotating = false;

  this.create = function() {
    if (this.args.mass)
      this.mass = this.args.mass;
    if (this.args.drag)
      this.drag = this.args.drag;
    if (this.args.friction)
      this.friction = this.args.friction;
    if (this.args.velocity)
      this.setVelocity(this.args.velocity);
    if (this.args.angularvelocity)
      this.setAngularVelocity(this.args.angularvelocity);
  }

  this.iterate = function(t) {
    if (t > 2) return; // If it's been more than 2 seconds, it's probably because the browser was inactive/paused
    if ((this.drag > 0 || this.friction > 0) && this.moving) {
      this.calculateFriction();
    }
    if (this.accel) {
      this.vel = this.vel.add(this.accel.multiply(.5*t*t));
      this.moving = true;
    }
    if (this.moving) {
      this.parent.move(this.vel.multiply(t));

      for (var k in this.parent.objects) {
        if (this.parent.objects[k].dynamics) 
          this.parent.objects[k].dynamics.iterate(t);
      }
    }
    if (this.rotating) {
      this.parent.rotateRel(this.angular.multiply(t));
    }
  }
  this.setVelocity = function(xyz) {
    this.vel = $V(xyz);
    this.moving = !(Math.abs(xyz[0])+Math.abs(xyz[1])+Math.abs(xyz[2]) == 0);
  }
  this.setVelocityX = function(x) {
    this.setVelocity([x, this.vel.e(2), this.vel.e(3)]);
  }
  this.setVelocityY = function(y) {
    this.setVelocity([this.vel.e(1), y, this.vel.e(3)]);
  }
  this.setVelocityZ = function(z) {
    this.setVelocity([this.vel.e(1), this.vel.e(2), z]);
  }
  this.setAngularVelocity = function(xyz) {
    this.angular = $V(xyz);
    this.rotating = !(Math.abs(xyz[0])+Math.abs(xyz[1])+Math.abs(xyz[2]) == 0);
  }

  this.addForce = function(name, force) {
    if (force instanceof Vector)
      this.forces[name] = force;
    else
      this.forces[name] = $V(force);
    this.forces._num++;

    this.calculateAcceleration();
  }
  this.removeForce = function(name) {
    if (this.forces[name]) {
      delete this.forces[name];
      this.forces._num--;
      this.calculateAcceleration();
    }
  }
  this.calculateAcceleration = function() {
    if (this.forces._num > 0) {
      var sum = $V([0,0,0]);
      for (var k in this.forces) {
        if (k != "_num") {
          sum = sum.add(this.forces[k]);
        }
      }

      this.accel = sum.multiply(1/this.mass);
    } else {
      this.accel = false;
    }
  }

  this.calculateFriction = function() {
    var v = this.vel.modulus();

    if (v > 0.001) {
      if (this.drag > 0) {
        var fd = this.vel.multiply(-.5*this.drag*v);
        this.addForce("drag", fd);
      }
      if (this.friction > 0) {
        var fd = this.vel.multiply(-1 * this.friction * this.mass);

//console.log('friction: ' + fd.modulus());
        this.addForce("friction", fd);
      }
    } else {
      // Friction always wins!  We've ground to a halt.
      this.removeForce("friction");
      this.removeForce("drag");
      this.vel = $V([0,0,0]);
      this.accel = false; // Are we 100% sure this is what we want?  What happens if there are still other forces being applied?
      this.moving = false;
    }
  }
  this.create();
}


