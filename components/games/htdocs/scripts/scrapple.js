elation.extend("games.scrapple", {
  letterscores: {A: 1, B: 4, C: 3, D: 2, E: 1, F: 4, G: 3, H: 2, I: 1, J: 10, K: 4, L: 1, M: 2, N: 1, O: 1, P: 4, Q: 10, R: 1, S: 1, T: 1, U: 1, V: 5, W: 4, X: 10, Y: 3, Z: 10, ' ': 0},
  zindexcounter: 10,
  games: [],
  init: function(container, options) {
    this.games.push(new this.game(container, options));
  },

  game: function(container, options) {
    this.container = container;
    this.options = options || {};
    this.boards = [];

    this.init = function() {
      if (typeof this.container == "string")
        this.container = document.getElementById(this.container);
      this.tilepool = new elation.games.scrapple.tilepool(this.container, {game: this, numtiles: 50});
      this.boards['main'] = new elation.games.scrapple.board(this.container, {game: this, size: [15, 15], className: 'scrapple_board_main', bonussquares: true});
      this.boards['tileholder'] = new elation.games.scrapple.board(this.container, {game: this, size: [8, 1], className: 'scrapple_board_tileholder', bonussquares: false});
      this.offset = elation.html.position(this.container);
      this.size = [this.container.offsetWidth, this.container.offsetHeight];
      for (var i = 0; i < 8; i++) {
        this.boards['tileholder'].slots[0][i].setTile(this.tilepool.getTile());
      }
    }
    this.getSlotAtPos = function(x, y) {
      var slot = this.boards['tileholder'].getSlot(x, y);
      if (!slot)
        slot = this.boards['main'].getSlot(x, y);
      return slot;
    }
    this.init();
  },

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
    }
    this.createBoard = function() {
      this.element = document.createElement("TABLE");
      this.element.className = "scrapple_board" + (this.options.className ? " " + this.options.className : "");
      this.element.cellSpacing = 1;
      for (var i = 0; i < this.size[1]; i++) {
        this.slots[i] = [];
        var row = document.createElement("TR");
        for (var j = 0; j < this.size[0]; j++) {
          this.slots[i][j] = new elation.games.scrapple.tileslot(row, {board: this, type: this.getTileType(i, j, this.size[0])});
        }
        this.element.appendChild(row);
      }
      this.container.appendChild(this.element);
      this.tilesize = [this.slots[0][0].element.offsetWidth + parseInt(this.element.cellSpacing), this.slots[0][0].element.offsetHeight + parseInt(this.element.cellSpacing)];
      console.log(this.tilesize);

      /*
      this.tileholder = document.createElement("DIV");
      this.tileholder.className = "scrapple_tileholder";
      this.container.appendChild(this.tileholder);
      */
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
  tileslot: function(container, options) {
    this.container = container;
    this.options = options || {};

    this.init = function() {
      this.type = this.options.type || 'normal'; 
      this.element = document.createElement("TD");
      this.element.className = 'scrapple_tileslot scrapple_tileslot_' + this.type;
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
  tile: function(container, options) {
    this.container = container;
    this.options = options || {};

    this.init = function() {
      this.element = document.createElement("DIV");
      this.element.className = 'scrapple_tile';
      this.element.draggable = true;
      this.letter = this.options.letter || String.fromCharCode((Math.random() * 26) + 65); // FIXME - use word frequencies
      this.element.innerHTML = "<strong>" + this.letter + "</strong><sub>" + elation.games.scrapple.letterscores[this.letter] + "</sub>";

      elation.events.add(this.element, "mousedown,touchstart", this);
      //elation.events.add(this.element, "dragstart,dragend", this);
    }
    this.handleEvent = function(ev) {
      switch(ev.type) { 
        case 'dragstart':
          var scale = 1.4;
          var newcenter = [(this.element.offsetWidth * scale) / 2, (this.element.offsetHeight * scale) / 2];
          this.element.style.MozTransformOrigin = newcenter[0] + " " + newcenter[1];
          this.element.style.WebkitTransformOrigin = newcenter[0] + " " + newcenter[1];
          this.element.style.MozTransform = 'scale(' + scale + ')';
          this.element.style.WebkitTransform = 'scale(' + scale + ')';
          ev.dataTransfer.setDragImage(this.element, newcenter[0], newcenter[1]);
          ev.dataTransfer.setData("-elation/scrapple-tile", this.letter);
          ev.effectAllowed = 'move'; // only allow moves
          (function(self) {
            setTimeout(function() { self.element.style.visibility = 'hidden'; }, 0);
          })(this);
          break;
        case 'dragend':
          if (ev.dataTransfer.dropEffect == 'move') {
            this.destroy();
          } else {
            this.element.style.visibility = 'visible';
            this.element.style.MozTransform = 'scale(1)';
            this.element.style.WebkitTransform = 'scale(1)';
          }
      
          break;
        case 'touchstart':
        case 'mousedown':
          window.scrollTo(0, 1);
          var click = ev;
          if (ev.touches)
            click = ev.touches[0];
          elation.events.add(document.body, "mousemove,mouseup,mouseleave,touchmove,touchend", this);
          this.element.style.position = 'absolute';
          var size = elation.html.size(this.element);
          this.element.style.MozTransformOrigin = (size[0] / 2) + " " + (size[1] / 2);
          this.element.style.WebkitTransformOrigin = (size[0] / 2) + " " + (size[1] / 2);
          this.element.style.MozTransform = 'scale(1.4)';
          this.element.style.WebkitTransform = 'scale(1.4)';
          this.element.style.zIndex = ++elation.games.scrapple.zindexcounter;
          this.moveTo((click.clientX) - (size[0] / 2), (click.clientY) - (size[1] / 2));
          if (this.element.parentNode == this.container) {
            this.container.removeChild(this.element);
            document.body.appendChild(this.element);
          }
          ev.preventDefault();
          break;
        case 'touchmove':
        case 'mousemove':
          var move = ev;
          if (ev.touches)
            move = ev.touches[0];
          this.moveTo((move.clientX) - (this.element.offsetWidth / 2), (move.clientY) - (this.element.offsetHeight / 2));
          break;
        case 'touchend':
        case 'mouseup':
          var up = ev;
          if (ev.changedTouches)
            up = ev.changedTouches[0];
          this.element.style.MozTransform = 'scale(1)';
          this.element.style.WebkitTransform = 'scale(1)';
          elation.events.remove(document.body, "mousemove,mouseup,mouseleave,touchmove,touchend", this);
          var slot = this.slot.options.board.options.game.getSlotAtPos(up.clientX, up.clientY);
          if (slot && !slot.tile) {
            slot.setTile(this);
            this.element.style.position = 'relative';
            this.element.style.top = 0;
            this.element.style.left = 0;
          } else {
            if (this.element.parentNode == document.body) {
              document.body.removeChild(this.element);
              this.container.appendChild(this.element);
              this.element.style.position = 'relative';
              this.element.style.top = 0;
              this.element.style.left = 0;
            }
          }
          break;
      }
    }
    this.setSlot = function(slot) {
      if (this.slot && this.slot.tile == this) {
          this.slot.tile = false;
      }
      this.slot = slot;
      this.container = slot.element;
      this.slot.element.appendChild(this.element);
    }
    this.destroy = function() {
      if (this.slot && this.slot.tile == this) {
        this.slot.tile = false;
        this.slot.element.removeChild(this.element);
        this.slot = false;
      }
    }
    this.moveTo = function(x, y) {
      this.element.style.left = x + 'px';
      this.element.style.top = y + 'px';
    }
    this.init();
  },
  tilepool: function(container, options) {
    this.container = container;
    this.options = options || {};
    this.tiles = [];

    this.init = function() {
      this.numtiles = this.options.numtiles || 10;
      for (var i = 0; i < this.numtiles; i++) {
        this.createTile();
        
      }
    }
    this.createTile = function() {
      this.tiles.push(new elation.games.scrapple.tile(this.container));
    }
    this.getTile = function() {
      return this.tiles.pop();
    }
    this.init();
  }
});
