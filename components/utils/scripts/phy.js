elation.extend("utils.physics.system", new function() {
  this.objects = [];
  this.active = false;
  this.lambda = 5;

  this.init = function() {
  }
  this.start = function() {
    this.active = true;
  }
  this.iterate = function(t) {
    // If there are no objects we have nothing to do
    if (!this.active || this.objects.length == 0) return;

    // If it's been more than 2 seconds, the browser was probably inactive/paused
    if (t > 2) return; 

    // Switch to 4th-order integration if framerate is < 50fps
    var subdivisions = (t < .02 ? 1 : 4); 
    var timeslice = t / subdivisions;

    for (var s = 0; s < subdivisions; s++) {
      this.collisioncache = {};
      for (var k in this.objects) {
        if (!this.objects[k].sleeping) {
          this.checkCollision(this.objects[k], timeslice);
        }
      }        
    }
  }
  this.checkCollision = function(obj, t) {
    obj.object.updateMatrix();
    obj.object.updateMatrixWorld();

    if (obj.contacting && obj.contacting.length > 0) {
      //console.log('untouching', obj, obj.contacting);
    }
    obj.contacting = [];
    if (obj.radius > 0) {
      if (!this.tmpray) {
        this.tmpray = new THREE.Ray(obj.pos.clone(), obj.vel.clone().normalize());
      } else {
        this.tmpray.origin = obj.pos.clone();
        this.tmpray.direction = obj.vel.clone().normalize();
      }
      var speed = obj.vel.length() * t;
      var potential = [];
      for (var k in this.objects) {
        if (this.objects[k] != obj) {
          var other = this.objects[k];
          var xrel = other.pos.clone().subSelf(obj.pos);
          //console.log(obj.pos, this.pos, xrel);
          var rsq = Math.pow(obj.radius + other.radius, 2);
          var c = xrel.dot(xrel) - rsq;
          if (c < 0) {
            //console.log('crashy?');
            potential.push(other.object);
          } else {
            var vrel = obj.vel.clone().subSelf(other.vel);
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
                potential.push(other.object);
              }
            }
/*
            var b = 2 * xrel.dot(vrel);
            var q = -.5 * (b + ((b < 0 ? -1 : 1) * Math.sqrt(b*b - 4*a*c)));
            var t0 = q / a, t1 = c/q;
            //console.log(obj.object.name, other.object.name, a, b, c, t0, t1);
*/
/*
            if (!isNaN(t0) || !isNaN(t1)) {
              potential.push(other.object);
            }
*/
          }
        }
      }

      if (potential.length > 0) {
        //var objects = this.tmpray.intersectScene(elation.space.fly(0).scene);
        var objects = this.tmpray.intersectObjects(potential);
if (objects.length > 0) {
  //console.log(objects, potential, [this.tmpray.origin.x, this.tmpray.origin.y, this.tmpray.origin.z], [this.tmpray.direction.x, this.tmpray.direction.y, this.tmpray.direction.z], obj.radius);
} else if (potential.length > 0) {
  //console.log(potential, [this.tmpray.origin.x, this.tmpray.origin.y, this.tmpray.origin.z], [this.tmpray.direction.x, this.tmpray.direction.y, this.tmpray.direction.z], obj.radius);
}
        for (var i = 0; i < objects.length; i++) {
          var c = objects[i];

          if (c && !c.object.ignoreCollider) {
//console.log(c);
            var blurp = obj.pos.clone().subSelf(c.point);
            if (blurp.length() < obj.radius) {
              obj.contacting.push(c);
              //console.log(blurp.length(), [blurp.x, blurp.y, blurp.z]);
                var foo = elation.space.admin(0).findThingParent(c.object);
                if (foo && foo.dynamics) {
                  if (foo.dynamics != obj) {
                    obj.bounce(c, t);
                    foo.dynamics.bounce(c, t);
                  }
                } else {
                  obj.bounce(c, t);
                }
                break;
            } else if (c.distance <= speed) {
              //console.log(objects);
              var vrel = obj.vel.clone();
              if (c.object && c.object.dynamics) {
                vrel.subSelf(c.object.dynamics.vel);
              }
              var vsep = vrel.dot(c.face.normal);
              //console.log("vsep", vsep, obj.radius);
              if (vsep > 0) {
                //console.log('already moving away');
              } else if (obj.radius > 0 && (c.distance - obj.radius) <= speed) {
                //console.log('crash at ', c.distance, speed, speed * t, obj.vel, obj.radius);
                //obj.setVelocity([0,0,0]);
                obj.contacting.push(c);
                var foo = elation.space.admin(0).findThingParent(c.object);
                if (foo && foo.dynamics) {
                  if (foo.dynamics != obj) {
                    obj.bounce(c, t);
                    foo.dynamics.bounce(c, t);
                  }
                } else {
                  obj.bounce(c, t);
                }
                break;
              } else {
              }
            } else if (c.distance > speed) {
              // Object too far away, bail out
              break;
            }
          }
        }
      }
    }
    if (obj.forces['gravity']) {
      if (obj.contacting && obj.contacting.length > 0) {
        //console.log('touching:', obj, obj.contacting);
        var gsum = new THREE.Vector3();
        for (var i = 0; i < obj.contacting.length; i++) {
          var a = obj.forces['gravity'].clone();
          var b = obj.contacting[i].face.normal.clone().normalize();
          
          gsum.subSelf(b.multiplyScalar(a.dot(b)));
        }
        obj.addForce("normalforce", gsum);
        obj.setFriction(1000);
      } else if (obj.forces["normalforce"]) {
        obj.removeForce("normalforce");
        obj.setFriction(0);
      }
    }
    obj.iterate(t);
  }
  this.add = function(obj) {
    if (obj instanceof elation.utils.physics.object) {
      var idx = this.objects.push(obj)-1;
    } else {
      var idx = this.objects.push(new elation.utils.physics.object(obj))-1;
    }
    //console.log("added dynamics object:", this.objects[idx]);
  }
  this.remove = function(obj) {
    for (var i = 0; i < this.objects.length; i++) {
      if (this.objects[i] == obj) {
        this.objects.splice(i, 1);
        break;
      }
    }
  }
  this.init();
});

elation.extend("utils.physics.object", function(args) {
  this.args = args || {};
  this.sleeping = false;
  this.mass = this.args.mass || 1;        // Mass, in kg
  this.drag = this.args.drag || 0;
  this.friction = this.args.friction || 0;
  this.pos = this.args.position || new THREE.Vector3(0,0,0); // Position, in m
  this.rot = this.args.rotation || new THREE.Vector3(0,0,0); // Rotation, in radians
  this.vel = this.args.velocity || new THREE.Vector3(0,0,0); // Velocity, in m/s
  this.accel = this.args.accel || new THREE.Vector3(); // Acceleration, in m/s^2
  this.angular = this.args.angular || new THREE.Vector3(0,0,0); // Rotational velocity, in degrees/s
  this.restitution = this.args.restitution || 1;
  this.radius = (typeof this.args.radius != 'undefined' ? this.args.radius : 0);
  this.box = (typeof this.args.box != 'undefined' ? this.args.box : null);
  this.object = (typeof this.args.object != 'undefined' ? this.args.object : null);
  this.forces = {'_num': 0}; // Forces on this object, in N
  this.forcesum = new THREE.Vector3();

  this.init = function() {
    //console.log('Initialized physics object', this);
    this.updateSleepState();
  }
  this.iterate = function(t) {
    if (!this.sleeping) {
      var fallasleep = true;
      if ((this.drag > 0 || this.friction > 0)) {
        this.calculateFriction(t);
      }

      /*
       * Note to self: the entire accel/vel/pos update cycle could be done with a single 9x9 matrix multiply:
       *
       * [1, 0, 0, t, 0, 0, .5*t^2, 0, 0]   [px]   [ px + vx*t + .5*ax*t^2 ]
       * [0, 1, 0, 0, t, 0, 0, .5*t^2, 0]   [py]   [ py + vy*t + .5*ay*t^2 ]
       * [0, 0, 1, 0, 0, t, 0, 0, .5*t^2]   [pz]   [ pz + vz*t + .5*az*t^2 ]
       * [0, 0, 0, 1, 0, 0, t, 0, 0     ] * [vx] = [ vx + ax*t ]
       * [0, 0, 0, 0, 1, 0, 0, t, 0     ]   [vy]   [ vy + ay*t ]
       * [0, 0, 0, 0, 0, 1, 0, 0, t     ]   [vz]   [ vz + az*t ]
       * [0, 0, 0, 0, 0, 0, 1, 0, 0     ]   [ax]   [ ax ]
       * [0, 0, 0, 0, 0, 0, 0, 1, 0     ]   [ay]   [ ay ]
       * [0, 0, 0, 0, 0, 0, 0, 0, 1     ]   [az]   [ az ]
       *
       * Alternatively (and more efficiently) it could be broken down into seperate x, y, and z steps and solved using 3 3x3 matrix multiplies:
       * 
       * [ 1, t, .5*t^2 ]   [p]   [ p + v*t + .5*a*t^2 ]
       * [ 0, 1, t      ] * [v] = [ v + a*t ]
       * [ 0, 0, 1      ]   [a]   [ a ]
       */

      if (this.accel && this.accel.length() > elation.utils.physics.system.lambda) {
        //this.vel = this.vel.add(this.accel.multiply(.5*t*t));
        this.vel.addSelf(this.accel.clone().multiplyScalar(.5*t*t));
        fallasleep = false;
      }
      if (this.vel.length() > elation.utils.physics.system.lambda) {
        this.pos.addSelf(this.vel.clone().multiplyScalar(t));
        fallasleep = false;
      }
      if (this.rotating) {
        this.rot.addSelf(this.angular.clone().multiplyScalar(t));
        //elation.events.fire({type: "rotate", element: this, data: this.angular.clone().multiplyScalar(t)});
      }
/*
      this.sleeping = fallasleep;
      if (this.sleeping) {
        this.removeForce("gravity");
      }
*/
      this.updateSleepState();
      //console.log(fallasleep ? "fall asleep" : "keep going");
      elation.events.fire({type: "dynamicsupdate", element: this, data: t});
    }
  }
  this.addForce = function(name, force) {
    if (force instanceof THREE.Vector3) {
      this.forces[name] = force;
    } else
      this.forces[name] = new THREE.Vector3(force[0], force[1], force[2]);
    this.forces._num++;

    this.calculateAcceleration();
  }
  this.updateSleepState = function() {
    this.accelerating = (this.accel && this.accel.length() > 0.00001);
    this.moving = (this.vel && this.vel.length() > 0.00001);
    this.rotating = (this.angular && this.angular.length() > 0.00001);

    this.sleeping = !(this.accelerating || this.moving || this.rotating);
    return this.sleeping;
  }
  this.removeForce = function(name) {
    if (this.forces[name]) {
      delete this.forces[name];
      this.forces._num--;
      this.calculateAcceleration();
      //console.log('removed force', name, [this.accel.x, this.accel.y, this.accel.z]);
    }
  }
  this.calculateAcceleration = function() {
    this.forcesum.set(0,0,0);
    if (this.forces._num > 0) {
      for (var k in this.forces) {
        if (k != "_num") {
          this.forcesum.addSelf(this.forces[k]);
        }
      }

      this.accel = this.forcesum.multiplyScalar(1/this.mass);
    } else {
      this.accel = false;
    }
    this.updateSleepState();
  }
  this.setFriction = function(friction) {
    this.friction = friction;
    if (friction == 0) {
      this.removeForce('friction');
    }
  }
  this.calculateFriction = function(t) {
    var v = this.vel.length();

    if (v > 0.00001) {
      if (this.drag > 0) {
        var fd = this.vel.clone().multiplyScalar(-.5*this.drag*v);
        this.addForce("drag", fd);
      }
      if (this.friction > 0) {
        var fd = this.vel.clone().multiplyScalar(-1 * this.friction * this.mass);
        var a = fd.length() / this.mass;
        var dv = .5 * a * t * t ;
        if (dv > this.vel.length()) {
          // FIXME - this is to prevent friction from ever pushing an object backwards
          //         but it's probably wrong right now...
          var newa = 2 * this.vel.length();
          fd.normalize().multiplyScalar(newa);
          var newdv = .5 * newa;

          console.log('overaccel', t, [a, dv], [newa, newdv], "E", this.vel.length(), fd.length());
        }
        this.addForce("friction", fd);
      }
    } else {
      //console.log('stopped', this.vel);
      // Friction always wins!  We've ground to a halt.
      this.removeForce("friction");
      this.removeForce("drag");
      //this.vel.set(0,0,0);
      //this.accel = false; // Are we 100% sure this is what we want?  What happens if there are still other forces being applied?
      this.updateSleepState();
    }
  }
  this.setVelocity = function(xyz) {
    if (xyz instanceof THREE.Vector3) {
      this.vel.set(xyz.x, xyz.y, xyz.z);
    } else {
      this.vel.set(xyz[0], xyz[1], xyz[2]);
    }
    this.updateSleepState();
  }
  this.setVelocityX = function(x) {
    this.setVelocity([x, this.vel.y, this.vel.z]);
  }
  this.setVelocityY = function(y) {
    this.setVelocity([this.vel.x, y, this.vel.z]);
  }
  this.setVelocityZ = function(z) {
    this.setVelocity([this.vel.x, this.vel.y, z]);
  }
  this.setAngularVelocity = function(xyz) {
    if (xyz instanceof THREE.Vector3) {
      this.angular = xyz;
    } else {
      this.angular.set(xyz[0], xyz[1], xyz[2]);
    }
    this.rotating = true;//!(this.angular.length() == 0);
    this.updateSleepState();
  }
  this.bounce = function(collision, t) {
    var normal = collision.face.normal;
    
    var relvel = this.vel.clone();
    var accvel = this.accel.clone();
    var restitution = this.restitution;
    var imass = 0;
    if (this.mass > 0) {
      imass += 1 / this.mass;
    }

    if (collision.object && collision.object.dynamics) {
      relvel.subSelf(collision.object.dynamics.vel);
      accvel.subSelf(collision.object.dynamics.accel);
      restitution *= collision.object.dynamics.restitution;
      if (collision.object.dynamics.mass > 0)
        imass += 1 / collision.object.dynamics.mass;
    }

    var sepspeed = relvel.dot(normal);
    if (sepspeed > 0) { // moving away, do nothing
      return;
    }
    var newsepspeed = -sepspeed * restitution;
    var accsepspeed = accvel.dot(normal) * .5 * t * t;

    if (accsepspeed < sepspeed) {
      newsepspeed += restitution * accsepspeed;
      if (newsepspeed < 0) newsepspeed = 0;
    }

    var deltaspeed = newsepspeed - sepspeed;
//console.log(relvel, accvel, sepspeed, accsepspeed, newsepspeed, restitution, t);

    if (imass <= 0) return; // infinite mass = no impulses

    var impulse = deltaspeed / imass;
    var impulseperimass = normal.clone().multiplyScalar(impulse);
    this.vel.addSelf(impulseperimass.multiplyScalar(1 / this.mass));
    
/*
    var vel = this.vel.clone();
    var restitution = this.restitution * obj.restitution;
    var vpar = normal.clone().multiplyScalar(vel.dot(normal) * restitution);
    var vper = vel.clone().subSelf(vpar);
    var vother = normal.clone().multiplyScalar(obj.vel.clone().dot(normal));
    var vfinal = vpar.clone().multiplyScalar(-1).addSelf(vper).addSelf(vother);
    this.setVelocity(vfinal);
*/
/*
    if(collision[0] == 0) {
        this.pos = $V(obj.pos).to3D().subtract(normal.multiply(this.radius + obj.radius + .1));
    }
*/
    //console.log(this.vel.add(normal.multiply(j / this.mass)));
    //this.setVelocity(this.vel.add(normal.multiply(j / this.mass)));
    //if (this.args.onbounce) this.args.onbounce(); // FIXME - use custom events
    if (collision.object) {
      elation.events.fire({type: 'bounce', element: this, fn: this, data: collision.object});
      //elation.events.fire({type: 'bounce', element: collision.object, data: this});
    } else {
      elation.events.fire({type: 'bounce', element: this});
    }
  }
  this.init();
});
elation.extend("utils.physics.aabb", new function() {
  this.min = false;
  this.max = false;

  
});
