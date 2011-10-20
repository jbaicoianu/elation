elation.extend("utils.dynamics", function(parent, args) {
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

  this.iterate = function(fullt) {
    if (fullt > 2) return; // If it's been more than 2 seconds, it's probably because the browser was inactive/paused

    var subdivisions = (fullt < .02 ? 1 : 4);
    var t = fullt / subdivisions;

    for (var s = 0; s < subdivisions; s++) {
  
      if ((this.drag > 0 || this.friction > 0) && this.moving) {
        this.calculateFriction();
      }
      if (this.accel) {
        this.vel = this.vel.add(this.accel.multiply(.5*t*t));
        this.moving = true;
      }
      if (this.rotating && this.parent && this.parent.rotateRel) {
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
        this.parent.objects[k].dynamics.iterate(time);
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
    if (force instanceof THREE.Vector3)
      this.forces[name] = $V([force.x, force.y, force.z]);
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

  this.setFriction = function(friction) {
    this.friction = friction;
    if (friction == 0) {
      this.removeForce('friction');
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
      if (this.radius && obj.box) { // FIXME - this only works in 2d right now...
        var speed = this.vel.multiply(time);
        var blah = speed.modulus();
        var newpos = this.pos.add(speed);
        var fraction;
        if (obj.box.inverted) {
          if ((newpos.e(1) < obj.box.tl[0] + this.radius) && speed.e(1) < 0 && 
              (fraction = ((this.pos.e(1) - obj.box.tl[0]) - this.radius) / ((this.pos.e(1) - obj.box.tl[0]) - (newpos.e(1) - obj.box.tl[0]))) < ret[0])
              //(fraction = (newpos.e(1) - (obj.box.tl[0] + this.radius)) / speed.e(1)) < ret[0])
              ret = [fraction, $V([-1, 0, 0]), obj]; // moving left, left side - bounce right
          if ((newpos.e(1) > obj.box.br[0] - this.radius) && speed.e(1) > 0 &&
              (fraction = ((this.pos.e(1) - obj.box.br[0]) + this.radius) / ((this.pos.e(1) - obj.box.br[0]) - (newpos.e(1) - obj.box.br[0]))) < ret[0])
              //(fraction = (newpos.e(1) - (obj.box.br[0] - this.radius)) / speed.e(1)) < ret[0])
            ret = [fraction, $V([1, 0, 0]), obj]; // moving right, right side - bounce left
          if ((newpos.e(2) < obj.box.tl[1] + this.radius) && speed.e(2) < 0 &&
              (fraction = ((this.pos.e(2) - obj.box.tl[1]) - this.radius) / ((this.pos.e(2) - obj.box.tl[1]) - (newpos.e(2) - obj.box.tl[1]))) < ret[0])
              //(fraction = (newpos.e(2) - (obj.box.tl[1] + this.radius)) / speed.e(2)) < ret[0])
            ret = [fraction, $V([0, -1, 0]), obj]; // moving up, top side - bounce down
          if ((newpos.e(2) > obj.box.br[1] - this.radius) && speed.e(2) > 0 && 
              (fraction = ((this.pos.e(2) - obj.box.br[1]) + this.radius) / ((this.pos.e(2) - obj.box.br[1]) - (newpos.e(2) - obj.box.br[1]))) < ret[0])
              //(fraction = (newpos.e(2) - (obj.box.br[1] - this.radius)) / speed.e(2)) < ret[0])
            ret = [fraction, $V([0, 1, 0]), obj]; // moving down, bottom side - bounce up
        } else {
          // FIXME - this doesn't actually work.  Need to implement full dynamic polygon collision detection...
          /*
          if ((newpos.e(1) < obj.box.br[0] + this.radius) && speed.e(1) < 0 && (newpos.e(2) > obj.box.tl[1] && newpos.e(2) < obj.box.br[1]) && 
              (fraction = ((this.pos.e(1) - obj.box.br[0]) - this.radius) / ((this.pos.e(1) - obj.box.br[0]) - (newpos.e(1) - obj.box.br[0]))) < ret[0])
              ret = [fraction, $V([1, 0, 0]), obj]; // moving left, right wall - bounce right
          if ((newpos.e(1) > obj.box.tl[0] - this.radius) && speed.e(1) > 0 &&
              (fraction = ((this.pos.e(1) - obj.box.tl[0]) + this.radius) / ((this.pos.e(1) - obj.box.tl[0]) - (newpos.e(1) - obj.box.tl[0]))) < ret[0])
            ret = [fraction, $V([-1, 0, 0]), obj]; // moving right, left wall - bounce left
          if ((newpos.e(2) < obj.box.br[1] + this.radius) && speed.e(2) < 0 &&
              (fraction = ((this.pos.e(2) - obj.box.br[1]) - this.radius) / ((this.pos.e(2) - obj.box.br[1]) - (newpos.e(2) - obj.box.br[1]))) < ret[0])
            ret = [fraction, $V([0, 1, 0]), obj]; // moving up, bottom wall - bounce down
          if ((newpos.e(2) > obj.box.tl[1] - this.radius) && speed.e(2) > 0 && 
              (fraction = ((this.pos.e(2) - obj.box.tl[1]) + this.radius) / ((this.pos.e(2) - obj.box.tl[1]) - (newpos.e(2) - obj.box.tl[1]))) < ret[0])
            ret = [fraction, $V([0, -1, 0]), obj]; // moving down, top wall - bounce up
          */
        }
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
    if (this.options.collisionmesh) this.collisionmesh = this.options.collisionmesh;
  }
  this.intersects = function(other) {

  }
  this.init();
});
