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
    var ray = new THREE.Ray(obj.pos, obj.vel.clone().normalize());
//console.log(ray);
    var speed = obj.vel.length();
    var c = THREE.Collisions.rayCastNearest(ray);
    if (c) { // && c.distance <= speed) {
      
      var vrel = obj.vel.clone();
      if (c.entity && c.entity.dynamics) {
        vrel.subSelf(c.entity.dynamics.vel);
      }
      var vsep = vrel.dot(c.normal);
      //console.log("vsep", vsep, obj.radius);
      if (vsep > 0) {
        console.log('already moving away');
      } else if ((c.distance - obj.radius) <= speed * t) {
        //console.log('crash at ', c.distance, speed, speed * t, obj.vel);
        //obj.setVelocity([0,0,0]);
        obj.bounce(c, t);
      } else {
      }
    } else {
    }
        obj.iterate(t);
  }
  this.add = function(obj) {
    if (obj instanceof elation.utils.physics.object) {
      var idx = this.objects.push(obj)-1;
    } else {
      var idx = this.objects.push(new elation.utils.physics.object(obj))-1;
    }
    console.log("added dynamics object:", this.objects[idx]);
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
  this.vel = this.args.vel || new THREE.Vector3(0,0,0); // Velocity, in m/s
  this.angular = this.args.angular || new THREE.Vector3(0,0,0); // Rotational velocity, in degrees/s
  this.restitution = this.args.restitution || 1;
  this.radius = this.args.radius || 1;
  this.forces = {'_num': 0}; // Forces on this object, in N
  this.forcesum = new THREE.Vector3();

  this.init = function() {
    console.log('Initialized physics object', this);
  }
  this.iterate = function(t) {
    if (!this.sleeping) {
      var fallasleep = true;
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
        elation.events.fire({type: "rotate", element: this, data: this.angular.clone().multiplyScalar(t)});
      }
      //this.sleeping = fallasleep;
      if (this.sleeping) {
        this.removeForce("gravity");
      }
      //console.log(fallasleep ? "fall asleep" : "keep going");
      elation.events.fire({type: "dynamicsupdate", element: this});
    }
  }
  this.addForce = function(name, force) {
    if (force instanceof THREE.Vector3)
      this.forces[name] = force;
    else
      this.forces[name] = new THREE.Vector3(force[0], force[1], force[2]);
    this.forces._num++;

    this.calculateAcceleration();
    //console.log('added force', name, [force.x, force.y, force.z], [this.accel.x, this.accel.y, this.accel.z]);
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
    //this.sleeping = !(this.accel && this.accel.length() > 0);
  }
  this.setVelocity = function(xyz) {
    if (xyz instanceof THREE.Vector3) {
      this.vel.set(xyz.x, xyz.y, xyz.z);
    } else {
      this.vel.set(xyz[0], xyz[1], xyz[2]);
    }
    //this.sleeping = (this.vel.length() == 0);
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
//console.log(this.angular.x, this.angular.y, this.angular.z);
    this.rotating = true;//!(this.angular.length() == 0);
  }
  this.bounce = function(collision, t) {
    var normal = collision.normal;
    
    var relvel = this.vel.clone();
    var accvel = this.accel.clone();
    var restitution = this.restitution;
    var imass = 0;
    if (this.mass > 0) {
      imass += 1 / this.mass;
    }

    if (collision.entity && collision.entity.dynamics) {
      relvel.subSelf(collision.entity.dynamics.vel);
      accvel.subSelf(collision.entity.dynamics.accel);
      restitution *= collision.entity.dynamics.restitution;
      if (collision.entity.dynamics.mass > 0)
        imass += 1 / collision.entity.dynamics.mass;
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
    elation.events.fire({type: 'bounce', element: this});
  }
  this.init();
});
