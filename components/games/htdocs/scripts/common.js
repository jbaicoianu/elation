elation.extend("games.common", {
  board: function(container, options) {
    this.container = container;
    this.options = options || {};
    this.slots = [];
    this.size = [0, 0];

    this.init = function() {
      if (typeof this.container == "string")
        this.container = document.getElementById(this.container);
      this.size = this.options.size || [1, 1];
      this.bonussquares = this.options.bonussquares || false;

      this.createBoard();
      console.log(this);
    }
    this.createBoard = function() {
      this.element = document.createElement("TABLE");
      this.element.className = "game_board" + (this.options.className ? " " + this.options.className : "");
      this.element.cellSpacing = 1;
      for (var i = 0; i < this.size[1]; i++) {
        this.slots[i] = [];
        var row = document.createElement("TR");
        for (var j = 0; j < this.size[0]; j++) {
          this.slots[i][j] = new elation.games.common.boardslot(row, {board: this, type: this.getTileType(i, j, this.size[0])});
        }
        this.element.appendChild(row);
      }
      this.container.appendChild(this.element);
      this.tilesize = [this.slots[0][0].element.offsetWidth + parseInt(this.element.cellSpacing), this.slots[0][0].element.offsetHeight + parseInt(this.element.cellSpacing)];
      console.log(this.tilesize);
    }
    this.getTileType = function(row, col, totalsize) {
      var ret;
      if (this.bonussquares) {
        var middle = (totalsize % 2 == 1 ? [Math.floor(totalsize / 2), Math.floor(totalsize / 2)] : [(totalsize / 2)-1, totalsize / 2]);
        //console.log(totalsize % 2, middle);
        var something = (Math.abs(row - middle[0]) + Math.abs(col - middle[0]));
        if ((row == middle[0] || row == middle[1]) && (col == middle[0] || col == middle[1])) {
          ret = "start";
        } else if (something == 4 || something == 8 || something == 11) {
          ret = "tripleword";
          //console.log(middle, row, col, something, ret);
        }
      }
      return ret;
    }
    this.getSlot = function(x, y) {
      var pos = elation.html.position(this.element);
      var size = elation.html.size(this.element);
      if ((x > pos[0] && x < pos[0] + size[0]) && (y > pos[1] && y < pos[1] + size[1])) {
        var tilepos = [Math.floor((x - pos[0]) / this.tilesize[0]), Math.floor((y - pos[1]) / this.tilesize[1])];
        return this.slots[tilepos[1]][tilepos[0]];
      }
    }
    this.init();
  },
  boardslot: function(container, options) {
    this.container = container;
    this.options = options || {};

    this.init = function() {
      this.type = this.options.type || 'normal'; 
      this.element = document.createElement("TD");
      this.element.className = 'game_boardslot game_boardslot_' + this.type;
      this.container.appendChild(this.element);

      elation.events.add(this.element, "dragenter,dragover,dragleave,dragend,drop", this);
    }
    this.handleEvent = function(ev) {
        switch(ev.type) {
          case 'dragenter':
          case 'dragover':
              if (!this.tile && ev.dataTransfer.types.contains('-elation/scrapple-tile')) {
                  ev.dataTransfer.dropEffect = 'all';
                  ev.preventDefault();
                  elation.html.addclass(this.element, "scrapple_tileslot_droppable");
              }
              break;
          case 'dragleave':
          case 'dragend':
              elation.html.removeclass(this.element, "scrapple_tileslot_droppable");
              break;
          case 'drop':
              if (!this.tile && ev.dataTransfer.types.contains('-elation/scrapple-tile')) {
                  var letter = ev.dataTransfer.getData('-elation/scrapple-tile');
                  this.setTile(new elation.games.scrapple.tile(this.element, {letter: letter}));
                  ev.preventDefault();
              }
              break;
        }
    }
    this.setTile = function(tile) {
      this.tile = tile;
      tile.setSlot(this);
    }
    this.init();
  },
  paddle: function(container, options) {
    this.container = container;
    this.options = options;
    this.pos = [0, 0, 0];
    this.vel = $V([0, 0, 0]);
    this.elasticity = 1;
    this.moves = [];
    this.allowskipcollisions = true;

    this.init = function() {
      this.element = document.createElement("DIV");
      this.element.className = this.options.className || "game_paddle";
      this.element.innerHTML = this.options.content || "";
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
    this.handleEvent = function(ev) {
      switch(ev.type) {
      }
    }
    this.handleTouchStart = function(ev) {
    }
    this.handleTouchMove = function(ev) {
    }
    this.handleTouchEnd = function(ev) {
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
