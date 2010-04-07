elation.extend("games.airhockey", {
  tables: [],
  init: function(container, options) {
    this.tables.push(new this.table(container, options));
  },
  table: function(container, options) {
    this.container = container;
    this.options = options || {};
    this.objects = [];
    this.pos = [0, 0, 0];
    this.box = [];

    this.init = function() {
      if (typeof this.container == "string")
        this.container = document.getElementById(this.container);
  
      // sound sometimes crashes the iphone, and it doesn't fully support HTML5 audio anyway
      this.options.sound = !(this.options.sound === false || elation.browser.type == 'iphone'); 
      this.pos = [this.container.offsetLeft, this.container.offsetTop, 0];
      this.size = [this.container.offsetWidth, this.container.offsetHeight];
      this.maxspeed = this.options.maxspeed || 1000;

      // this.objects contains a list of all collidable objects
      // Start with the level bounding box (ie, the table walls)
      this.objects.push(new elation.utils.dynamics(this, {box: [[0, 0], this.size]})); 

      // Top and bottom paddles (TODO - add AI for one of the paddles)
      this.paddles = [
        new elation.games.airhockey.paddle(this.container, {restrict: [[0, 0], [this.size[0], this.size[1] / 2]]}),
        new elation.games.airhockey.paddle(this.container, {restrict: [[0, this.size[1] / 2], [this.size[0], this.size[1]]]})
      ];
      this.objects = this.objects.concat(this.paddles);

      // The puck is the main object in the game, we pass it a list of all the other colliders and it's the object which is iterated on
      // In the future, the dynamics system should handle multiple moving objects more efficiently and this distinction won't be necessary
      this.puck = [
	  new elation.games.airhockey.puck(this.container, {
	  //pin: changing puck elasticity to .75 from .92
        elasticity: .75,
        pos: [this.size[0] / 2, this.size[1] / 2],
        vel: [(Math.random() * this.maxspeed * 2) - this.maxspeed, (Math.random() * this.maxspeed * 2) - this.maxspeed, 0],
        maxspeed: this.maxspeed,
        sound: this.options.sound,
        colliders: this.objects
		
      }),
	  new elation.games.airhockey.puck(this.container, {
        elasticity: .92,
        //pos: [(this.size[0] / 2)+2, (this.size[1] / 2)+2],
		pos: [100, 100],
        vel: [(Math.random() * this.maxspeed * 2) - this.maxspeed, (Math.random() * this.maxspeed * 2) - this.maxspeed, 0],
        maxspeed: this.maxspeed,
        sound: this.options.sound,
        colliders: this.objects
      })
	  ];
	  
	  

      // Basic input handling for paddles
      elation.events.add(this.container, "touchstart,mousedown", this);
      elation.events.add(window, "scroll", this);
      elation.events.add(window, "orientationchange", this);
    }
    this.handleEvent = function(ev) {
      var ret = true;
      switch(ev.type) {
        case 'touchstart':
        case 'mousedown':
          elation.events.add(this.container, "touchmove,mousemove,touchend,mouseup", this);
        case 'touchmove':
        case 'mousemove':
          window.scrollTo(0, 1); // for iPhone
          if (ev.changedTouches) { // multitouch
            for (var i = 0; i < ev.changedTouches.length; i++) {
              this.handleMove(ev.changedTouches[i]);
            }
          } else { // single input (mouse)
            this.handleMove(ev);
          }
          ret = false;
          ev.stopPropagation();
          break;
        case 'touchend':
        case 'mouseup':
          elation.events.remove(this.container, "touchmove,mousemove,touchend,mouseup", this);
          // FIXME - this might cause issues in multitouch games, if timed perfectly one player could cause the other player's
          //         paddle velocity to drop to 0 for a single frame which could mess up their shot...we should maintain a mapping
          //         of touches to their respective paddles, and track it that way
          this.paddles[0].resetVelocity();
          this.paddles[1].resetVelocity();
          break;
        case 'scroll':
          ret = false;
          break;
        case 'orientationchange':
          // FIXME - doesn't really work yet
          this.updateLayout();
          ret = false;
          break;
      }
      if (!ret) {
        ev.preventDefault();
      }
      return ret;
    }
    this.handleMove = function(ev) {
      var paddlenum = ((ev.clientY - this.pos[1]) < this.container.offsetHeight / 2 ? 0 : 1);
      this.paddles[paddlenum].updateVelocity(ev);
      if (!this.paddles[paddlenum].drawtimer) {
        // ratelimit paddle graphical updates to 50fps (1000ms, 20ms per frame)
        (function(paddle, x, y) {
          paddle.drawtimer = setTimeout(function() { paddle.position([x, y, 0]); paddle.drawtimer = false; }, 20);
        })(this.paddles[paddlenum], ev.clientX - this.pos[0], ev.clientY - this.pos[1]);
      }
    }
    this.updateLayout = function() {
      this.rotation = 0;
      if (typeof window.orientation != 'undefined') {
        var orient = (Math.abs(window.orientation) == 90 ? "landscape" : "portrait");
        document.body.setAttribute("orient", orient);
        window.scrollTo(0, 1);

        document.body.style.WebkitTransform = "scale(1)";
        this.container.style.WebkitTransformOrigin = '50% 50%';
        this.container.style.WebkitTransform = 'rotate(' + (-1 * window.orientation) + 'deg)';
     }
   }

    this.init();
  },
  puck: function(container, options) {
    this.container = container;
    this.options = options || {};
    this.dynamics = false;
    this.boings = [];
    this.numboings = 6;
    this.boingnum = 0;
    //this.pos = [10, 10];
    //this.vel = [0, 0, 0];

    this.init = function() {
      this.element = document.createElement("DIV");
      this.element.className = "airhockey_puck";
      this.container.appendChild(this.element);
      this.lastmove = new Date();
      this.radius = this.element.offsetWidth / 2;
      this.startpos = this.options.pos || [0, 0, 0];
      this.maxspeed = this.options.maxspeed || 1000;

      var dynamicsopts = {
        mass: 10,
        friction: 0,
        position: this.startpos,
        radius: this.radius,
        elasticity: this.options.elasticity || 1,
        //velocity: this.options.vel || [0,0],
        colliders: this.options.colliders || []
      };

      // FIXME - these should be bound with elation.events.add, but I need to get custom event stuff working first...
      (function(self) {
        dynamicsopts['onmove'] = function() { self.render(); };
        dynamicsopts['onbounce'] = function() { self.onbounce(); };
      })(this);
      this.dynamics = new elation.utils.dynamics(this, dynamicsopts);
      this.render();
      // Don't start moving until 1/2 second after everything's initialized
      (function(self) {
        setTimeout(function() { self.reset(); }, 500);
      })(this);
      for (var i = 0; i < this.numboings; i++) {
        this.initSound(i);
      }
      this.go();
    }
    this.go = function() {
      var thistime = new Date();
      var tdiff = thistime - this.lastmove;
      if (tdiff > 0)
        this.dynamics.iterate(tdiff / 1000);
      this.lastmove = thistime;
      (function(self) {
        self.timer = setTimeout(function() { self.go(); }, 10);
      })(this);
    }
    this.render = function() {
      if (this.dynamics && this.dynamics.pos) {
        this.element.style.WebkitTransform = 'translate3d(' + this.dynamics.pos.e(1) + 'px, ' + this.dynamics.pos.e(2) + 'px, ' + this.dynamics.pos.e(3) + 'px)';
        //this.element.style.WebkitTransform = 'translate(' + this.dynamics.pos.e(1) + 'px, ' + this.dynamics.pos.e(2) + 'px)';
        this.element.style.MozTransform = 'translate(' + this.dynamics.pos.e(1) + 'px, ' + this.dynamics.pos.e(2) + 'px)';
      } else {
        console.log('something broke');
      }
    }
    this.reset = function(pos, vel) {
      if (typeof pos == 'undefined') pos = this.startpos;
      if (typeof vel == 'undefined') vel = [(Math.random() * this.maxspeed * 2) - this.maxspeed, (Math.random() * this.maxspeed * 2) - this.maxspeed, 0];
      this.dynamics.setPosition(pos);
      this.dynamics.setVelocity(vel);
      console.log('Reset puck');
    }
    this.initSound = function(boingnum) {
      if (typeof this.boings[boingnum] != 'undefined') {
        delete this.boings[boingnum];
      }
      this.boings[boingnum] = document.createElement("AUDIO");
      this.boings[boingnum].autobuffer = true;
      this.boings[boingnum].src = "/boing.ogg";
      this.boings[boingnum].currentPosition = 0;
    }
    this.playSound = function(volume) {
      if (volume)
        this.boings[this.boingnum].volume = volume;
      this.boings[this.boingnum].play();
      this.initSound(this.boingnum);
      if (++this.boingnum >= this.numboings) 
        this.boingnum = 0;
    }
    this.onbounce = function() {
      var vel = this.dynamics.vel.modulus();
      if (vel > this.options.maxspeed) {
        this.dynamics.vel = this.dynamics.vel.multiply(this.options.maxspeed / vel);
        vel = this.options.maxspeed;
      }
      if (this.options.sound)
        this.playSound(vel / this.options.maxspeed);
    }
    
    this.init();
  },
  paddle: function(container, options) {
    this.container = container;
    this.options = options;
    this.pos = [0, 0, 0];
    this.vel = $V([0, 0, 0]);
    this.elasticity = .25;
    this.moves = [];
    this.allowskipcollisions = true;

    this.init = function() {
      this.element = document.createElement("DIV");
      this.element.className = "airhockey_paddle";
      this.element.innerHTML = '<div class="airhockey_paddle_stick"></div>';
      this.container.appendChild(this.element);
      this.radius = this.element.offsetWidth / 2;
      this.mass = 10;
      this.moves = new elation.utils.ringbuffer();

      this.position(this.options.pos || [0,0,0]);
    }
    this.position = function(pos) {
      if (typeof pos != 'undefined') 
        this.pos = pos;
      if (this.pos[0] < this.options.restrict[0][0] + this.radius) this.pos[0] = this.options.restrict[0][0] + this.radius;
      if (this.pos[0] > this.options.restrict[1][0] - this.radius) this.pos[0] = this.options.restrict[1][0] - this.radius;
      if (this.pos[1] < this.options.restrict[0][1] + this.radius) this.pos[1] = this.options.restrict[0][1] + this.radius;
      if (this.pos[1] > this.options.restrict[1][1] - this.radius) this.pos[1] = this.options.restrict[1][1] - this.radius;
      this.element.style.left = 0;
      this.element.style.top = 0;
      this.element.style.WebkitTransform = 'translate3d(' + this.pos[0] + 'px, ' + this.pos[1] + 'px, ' + this.pos[2] + 'px)';
      //this.element.style.WebkitTransform = 'translate(' + this.pos[0] + 'px, ' + this.pos[1] + 'px)';
      this.element.style.MozTransform = 'translate(' + this.pos[0] + 'px, ' + this.pos[1] + 'px)';
    }
    this.updateVelocity = function(ev) {
      this.moves.add([new Date(), ev.clientX, ev.clientY]);

      var inorder = this.moves.unravel();
//console.log(inorder);
      if (inorder.length > 2) {
        //console.log([inorder[0][1] - inorder[1][1], inorder[0][2] - inorder[1][2], 0], inorder[0][0] - inorder[1][0]);
        var t = (inorder[0][0] - inorder[1][0]) / 1000;
        this.vel = [(inorder[0][1] - inorder[1][1]) / t, (inorder[0][2] - inorder[1][2]) / t, 0]
      }
    }
    this.resetVelocity = function() {
      this.moves.clear();
      this.vel = [0, 0, 0];
    }
    this.init();
  }
});
elation.extend("utils.ringbuffer", function(args) {
  this.elements = [];
  this.pos = 0;
  this.args = args || {};
  this.num = this.args.num || 5;

  this.add = function(el) {
    this.elements[this.pos] = el;
    if (++this.pos > this.num)
      this.pos = 0;
  }
  this.unravel = function(num) {
    if (typeof num == 'undefined')
      num = this.num;

    var ret = [];
    var i = (this.pos == 0 ? this.num : this.pos - 1);
    while (i != this.pos) {
      if (typeof this.elements[i] == 'undefined')
        break;
      ret.push(this.elements[i]);
      if (--i < 0) 
        i = this.num;
    }
    return ret;
  }
  this.clear = function() {
    this.elements = [];
    this.pos = 0;
  }
});
