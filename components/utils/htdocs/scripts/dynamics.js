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
elation.extend("utils.dynamics", function (parent, args) {
  this.parent = parent;
  this.args = args || {};
  this.mass = 1;        // grams
  this.drag = 0;
  this.friction = 0;
  this.pos = $V([0,0,0]);
  this.vel = $V([0,0,0]); // m/s
  this.angular = $V([0,0,0]); // degrees/s
  this.forces = {'_num': 0};     // Forces which are acting on this object
  this.moving = false;
  this.rotating = false;
  this.radius = 0;
  this.colliders = [];

  this.create = function() {
    if (this.args.mass)
      this.mass = this.args.mass;
    if (this.args.drag)
      this.drag = this.args.drag;
    if (this.args.friction)
      this.friction = this.args.friction;
    if (this.args.colliders)
      this.colliders = this.args.colliders;
    if (this.args.position)
      this.setPosition(this.args.position);
    if (this.args.velocity)
      this.setVelocity(this.args.velocity);
    if (this.args.angularvelocity)
      this.setAngularVelocity(this.args.angularvelocity);
    if (this.args.radius)
      this.radius = this.args.radius;
    if (this.args.box)
      this.box = this.args.box;
    this.elasticity = this.args.elasticity || 1;
    console.log("colliders:", this.colliders);
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
    if (this.rotating) {
      this.parent.rotateRel(this.angular.multiply(t));
    }
    var collision = [1, false, false]; //this.checkCollisions(t);
    var maxcollisions = 4;
    var collisionnum = 0;
    var foo = t;
    while (foo > 0 && /*collision[0] !== 1 && collision[0] >= 0 &&*/ collisionnum++ < maxcollisions) {
      collision = this.checkCollisions(foo);
      this.move(foo * collision[0], (collision[0] == 1));
      foo *= (1 - collision[0]);
      if (collision[1]) {
        if (collision[2].allowskipcollisions) {
          collision[2].skiptime = .1;
        }
        //console.log(collisionnum, t, foo, collision);
        this.bounce(collision);
      }
      //this.setVelocity([0,0,0]);
    }
    if (collisionnum == maxcollisions) 
      console.log("MAX COLLISIONS");
  }
  this.setVelocity = function(xyz) {
    this.vel = $V(xyz).to3D();
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
  this.setPosition = function(xyz) {
    this.pos = $V(xyz).to3D();
    console.log('set pos', this.pos);
  }
  this.move = function(time, skipcallback) {
    this.pos = this.pos.add(this.vel.multiply(time));
    for (var k in this.parent.objects) {
      if (this.parent.objects[k].dynamics) 
        this.parent.objects[k].dynamics.iterate(t);
    }
    if (skipcallback !== false && this.args.onmove) this.args.onmove(); // FIXME - use custom events
  }
  this.bounce = function(collision) {
    var normal = collision[1];
    var obj = collision[2];
    var objvel = $V(obj.vel).to3D();
    var vrel = $V(obj.vel).to3D().subtract(this.vel);
    var elasticity = this.elasticity * obj.elasticity;
    //var j = (vrel.multiply(-1 + elasticity).dot(normal)) / normal.dot(normal.multiply(1 / (this.mass + obj.mass)));
    //console.log([vrel.e(1), vrel.e(2), vrel.e(3)], j);
    var vpar = normal.multiply(this.vel.dot(normal) * elasticity);
    //var vpar = normal.multiply(j);
    var vper = this.vel.subtract(vpar);
    var vother = normal.multiply($V(obj.vel || [0,0,0]).dot(normal));
    var vfinal = vpar.multiply(-1).add(vper).add(vother);
    this.setVelocity(vfinal);
    if(collision[0] == 0) {
        this.pos = $V(obj.pos).to3D().subtract(normal.multiply(this.radius + obj.radius + .1));
    }
    //console.log(this.vel.add(normal.multiply(j / this.mass)));
    //this.setVelocity(this.vel.add(normal.multiply(j / this.mass)));
    if (this.args.onbounce) this.args.onbounce(); // FIXME - use custom events
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

  this.calculateFriction = function(time) {
    var v = this.vel.modulus();

    if (v > 0.00001) {
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
      console.log('stopped', this.vel);
      // Friction always wins!  We've ground to a halt.
      this.removeForce("friction");
      this.removeForce("drag");
      this.vel = $V([0,0,0]);
      this.accel = false; // Are we 100% sure this is what we want?  What happens if there are still other forces being applied?
      this.moving = false;
    }
  }
  this.checkCollisions = function(time) {
    var ret = [1, false, false];
    if (typeof this.colliders == 'undefined' || this.colliders.length == 0)
      return ret;
    for (var i = 0; i < this.colliders.length; i++) {
      var obj = this.colliders[i];
      if (obj.skiptime > 0) {
        obj.skiptime -= time;
        continue;
      }
      if (this.radius && obj.box) { // FIXME - this only works for the outer level walls right now, it should be for general-purpose bounding boxes
        var speed = this.vel.multiply(time);
        var blah = speed.modulus();
        var newpos = this.pos.add(speed);
        var fraction;
        if ((newpos.e(1) < obj.box[0][0] + this.radius) && speed.e(1) < 0 && 
            (fraction = ((this.pos.e(1) - obj.box[0][0]) - this.radius) / ((this.pos.e(1) - obj.box[0][0]) - (newpos.e(1) - obj.box[0][0]))) < ret[0])
            //(fraction = (newpos.e(1) - (obj.box[0][0] + this.radius)) / speed.e(1)) < ret[0])
            ret = [fraction, $V([-1, 0, 0]), obj];
        if ((newpos.e(1) > obj.box[1][0] - this.radius) && speed.e(1) > 0 &&
            (fraction = ((this.pos.e(1) - obj.box[1][0]) + this.radius) / ((this.pos.e(1) - obj.box[1][0]) - (newpos.e(1) - obj.box[1][0]))) < ret[0])
            //(fraction = (newpos.e(1) - (obj.box[1][0] - this.radius)) / speed.e(1)) < ret[0])
          ret = [fraction, $V([1, 0, 0]), obj];
        if ((newpos.e(2) < obj.box[0][1] + this.radius) && speed.e(2) < 0 &&
            (fraction = ((this.pos.e(2) - obj.box[0][1]) - this.radius) / ((this.pos.e(2) - obj.box[0][1]) - (newpos.e(2) - obj.box[0][1]))) < ret[0])
            //(fraction = (newpos.e(2) - (obj.box[0][1] + this.radius)) / speed.e(2)) < ret[0])
          ret = [fraction, $V([0, -1, 0]), obj];
        if ((newpos.e(2) > obj.box[1][1] - this.radius) && speed.e(2) > 0 && 
            (fraction = ((this.pos.e(2) - obj.box[1][1]) + this.radius) / ((this.pos.e(2) - obj.box[1][1]) - (newpos.e(2) - obj.box[1][1]))) < ret[0])
            //(fraction = (newpos.e(2) - (obj.box[1][1] - this.radius)) / speed.e(2)) < ret[0])
          ret = [fraction, $V([0, 1, 0]), obj];
      } else if (this.radius && obj.radius) {
        var xrel = $V(obj.pos).to3D().subtract($V(this.pos).to3D());
        //console.log(obj.pos, this.pos, xrel);
        var rsq = Math.pow(obj.radius + this.radius, 2);
        var c = xrel.dot(xrel) - rsq;
        if (c < 0) {
          // overlapping
          ret = [0, xrel.toUnitVector(), obj];
          break;
        } else {
          var vrel = $V(obj.vel || [0,0,0]).subtract($V(this.vel));
          var a = vrel.dot(vrel);
          if (a < 0.00001) {
            continue; // Moving away from each other
          } else {
            var b = xrel.dot(vrel);
            var d = b * b - a * c;
            if (d < 0) {
              //console.log('no solutions');
              continue;
            } else {
              var t = -b - Math.sqrt(d) / a;
              if (t <= ret[0] && t >= 0) {
                  ret = [t, xrel.add(vrel.multiply(t)).toUnitVector(), obj];
                continue;
              }
            }
          }
        }
      }
    }
    return ret;
  }
  this.create();
});


elation.extend("utils.collider", function(parent, options) {
  this.parent = parent;
  this.options = options;

  this.init = function() {
    if (this.options.radius) this.radius = this.options.radius;
  }
  this.intersects = function(other) {

  }
  this.init();
});
