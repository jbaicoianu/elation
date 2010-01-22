function MultiZoom(container, options) {
  this.container = container;
  this.options = options;
  this.tilelayers = [];
  this.tiles = [];
  this.level = 1;
  
  this.init = function() {
    this.zoomable = document.createElement("DIV");
    this.zoomable.style.width = this.options.size[0] + 'px';
    this.zoomable.style.height = this.options.size[1] + 'px';
    this.container.appendChild(this.zoomable);

    addEvent(this.zoomable, 'mousewheel', this); 
    addEvent(this.zoomable, 'mousedown', this); 
    addEvent(window, 'mouseup', this);
    addEvent(window, 'mouseleave', this);
    addEvent(window, 'touchstart', this);
    addEvent(window, 'touchend', this);
    addEvent(this.zoomable, 'dblclick', this); 

    this.maxlevel = this.getMaximumLevel(this.options.size[0], this.options.size[1]);
    this.scaler = new ImageScale(this.container, {zoomable: this.zoomable});
    if (this.options.defaultlevel) {
      this.level = this.options.defaultlevel;
    } else {
      this.level = this.bestLevel(false);
    }
    this.showLevel(this.level);
  }
  this.handleEvent = function(ev) {
    switch(ev.type) {
      case 'mousewheel':
      case 'DOMMouseScroll':
        this.handleMousewheel(ev);
        break;
      case 'mousedown':
        /*
        addEvent(window, 'mouseup', this);
        addEvent(window, 'mouseleave', this);
        */
        break;
      case 'touchstart':
        if (this.lasttouch) {
          if (ev.timeStamp - this.lasttouch.timeStamp < 250) {
            this.scaler.zoomBy(1);
            this.level = this.bestLevel(true);
          }
        }
        this.lasttouch = ev;
        break;
      case 'mouseup':
      case 'mouseleave':
      case 'touchend':
        this.calculateVisibilities();
        /*
        removeEvent(window, 'mouseup', this);
        removeEvent(window, 'mouseleave', this);
        */
        break;
      case 'dblclick':
        this.scaler.zoomBy(1);
        this.bestLevel(true);
    }
  }
  this.handleMousewheel = function(ev) {
    if (this.timer) clearTimeout(this.timer);
    var timeout = this.options.zoomtimeout || 500;
    (function(self, timeout) {
      self.timer = setTimeout(function() { self.bestLevel(true); }, timeout);
    })(this, timeout);
  }
  this.bestLevel = function(update) {
    //console.log('well, it worked', this.scaler.scale);        
    var level = this.maxlevel - Math.floor((Math.log(1/this.scaler.scale) / Math.LN2));
    if (level > this.maxlevel)
      level = this.maxlevel;
    console.log('new level: ' + level);
    if (update) {
      this.level = level;
      var bounds = this.scaler.getViewportBounds();
      for (var i = 0; i <= this.maxlevel; i++) {
        if (i == this.level) {
          this.showLevel(i, bounds);
        } else if (i > this.level || (this.options.singlelevel && i < this.level)) {
          this.hideLevel(i);
        }
      }
    }
    //this.calculateVisibilities();
    return level;
  }
  this.calculateVisibilities = function() {
    var bounds = this.scaler.getViewportBounds();
    this.showLevel(this.level, bounds);
  }
  this.getMaximumLevel = function(width, height) {
    return Math.ceil(Math.log(Math.max(width, height)) / Math.LN2)
  }
  this.createLevel = function(level) {
    var maxlevel = this.getMaximumLevel(this.options.size[0], this.options.size[1]);
    var lwidth = Math.ceil(this.options.size[0] / Math.pow(2, maxlevel - level));
    var lheight = Math.ceil(this.options.size[1] / Math.pow(2, maxlevel - level));
    var columns = Math.ceil(lwidth / this.options.tilesize);
    var rows = Math.ceil(lheight / this.options.tilesize);
    this.tilelayers[level] = new MultiZoomTileLayer(this.zoomable, {size: this.options.size, rows: rows, columns: columns, tilesize: this.options.tilesize, level: level, maxlevel: maxlevel, visible: false, url: this.options.url, overlap: this.options.overlap});
    console.log('Created level ' + level + ': ' + lwidth + ' x ' + lheight + ' (' + columns + ' columns, ' + rows + ' rows)');
  }
  this.showLevel = function(level, bounds) {
    if (typeof this.tilelayers[level] == 'undefined') {
      this.createLevel(level);
    }
    if (typeof bounds == 'undefined')
      bounds = this.scaler.getViewportBounds();
    this.tilelayers[level].show(bounds[0], bounds[1]);
  }
  this.hideLevel = function(level) {
    if (typeof this.tilelayers[level] != 'undefined') {
      this.tilelayers[level].hide();
    }
  }
  this.init();
}
function MultiZoomTileLayer(container, options) {
  this.container = container;
  this.options = options || [];
  this.tiles = [];

  this.init = function() {
    this.visible = this.options.visible || false;
    this.scale = Math.pow(2, (this.options.maxlevel - this.options.level));
    this.element = document.createElement("DIV");
    this.element.className = "multizoom_tilelayer layer" + this.options.level;
    this.element.style.zIndex = this.options.level;
    this.element.style.display = (this.visible ? 'block' : 'none');
    this.element.style.width = ((this.options.size[0] / this.container.offsetWidth) * Math.pow(2, this.options.level)) + 'px';
    this.element.style.height = ((this.options.size[1] / this.container.offsetWidth) * Math.pow(2, this.options.level)) + 'px';
    this.element.style.MozTransformOrigin = '0 0';
    this.element.style.MozTransform = 'scale(' + this.scale + ')';
    this.element.style.WebkitTransformOrigin = '0 0';
    this.element.style.WebkitTransform = 'scale(' + this.scale + ')';
    this.element.style.zoom = (2.65 * this.scale) + "%";
    this.container.appendChild(this.element);
    var numtiles = [Math.ceil(this.options.size[0] / this.options.tilesize), Math.ceil(this.options.size[1] / this.options.tilesize)];
    
    this.rows = [];
    /*
    for (var j = 0; j < this.options.rows; j++) {
      this.createRow(j);
    }
    */
  }
  this.show = function(tl, br) {
    this.element.style.display = 'block';
    this.element.style.visibility = 'visible';


    var mult = Math.pow(2, this.options.maxlevel - this.options.level) * this.options.tilesize;
    var tlpos = [Math.floor(tl[0] / mult), Math.floor(tl[1] / mult)];
    var brpos = [Math.floor(br[0] / mult), Math.floor(br[1] / mult)];
    //console.log("(" + tl + ", " + tl[1] + ") to (" + br[0] + ", " + br[1] + "), show rows " + tlpos[1] + " to " + brpos[1] + " ( " + this.options.rows);
    for (var i = 0; i < this.options.rows; i++) {
      if (i < tlpos[1] || i > brpos[1])
        this.hideRow(i);
      else
        this.showRow(i, [tlpos[0], brpos[0]]);
    }
  }
  this.hide = function() {
    this.element.style.display = 'none';
    this.element.style.visibility = 'hidden';

    for (var i = 0; i < this.options.rows; i++) {
      this.hideRow(i);
    }
  }
  this.showRow = function(row, cols) {
    if (typeof this.rows[row] == 'undefined') {
      this.createRow(row);
    }
    this.rows[row].show(cols[0], cols[1]);
  }
  this.hideRow = function(row) {
    if (typeof this.rows[row] != 'undefined') {
      this.rows[row].hide();
    }
  }
  this.createRow = function(row) {
    this.rows[row] = new MultiZoomTileRow(this.element, {level: this.options.level, tilesize: this.options.tilesize, row: row, columns: this.options.columns, url: this.options.url, overlap: this.options.overlap, scale: this.scale});
  }
  this.init();
}
function MultiZoomTileRow(container, options) {
  this.container = container;
  this.options = options;

  this.init = function() {
    this.element = document.createElement('DIV');
    this.element.className = 'multizoom_row';
    this.container.appendChild(this.element);
    this.tiles = [];
/*
    for (var k = 0; k < this.options.columns; k++) {
      this.createTile(k);
    }
*/
  }
  this.show = function(startcol, endcol) {
    this.element.style.display = 'block';
    this.element.style.visibility = 'visible';

    //console.log("show row" + this.options.row + ": " + startcol + ", " + endcol);
    for (var i = 0; i < this.options.columns; i++) {
      if (i < startcol || i > endcol+1) {
        //console.log("hide row " + this.options.row + ", tiles " + i);
        this.hideTile(i);
      } else {
        //console.log("show row " + this.options.row + ", tiles " + i);
        this.showTile(i);
      }
    }
  }
  this.hide = function() {
    //console.log('hide row ' + this.options.row);
    this.element.style.display = 'none';
    this.element.style.visibility = 'hidden';
    // TODO - reclaim tiles, put them back into the pool
    for (var i = 0; i < this.options.columns; i++) {
      if (typeof this.tiles[i] != 'undefined') {
        this.tiles[i].destroy();
        delete this.tiles[i];
      }
    }
  }
  this.showTile = function(tile) {
    if (typeof this.tiles[tile] == 'undefined') {
      this.createTile(tile);
    }
    this.tiles[tile].show();
  }
  this.hideTile = function(tile) {
    if (typeof this.tiles[tile] != 'undefined') {
      this.tiles[tile].hide();
    }
  }
  this.createTile = function(tile) {
    var imgurl = this.getImageURL(tile);
    this.tiles[tile] = new MultiZoomTile(this.element, {size: this.options.tilesize, pos: [tile, this.options.row], elementargs: {innerHTML: '<img src="' + imgurl + '" />'}, overlap: this.options.overlap, max: [this.options.rows, this.options.columns], scale: this.options.scale});
  }
  this.getImageURL = function(tile) {
    var replace = {
      'row': this.options.row,
      'column': tile,
      'level': this.options.level,
      'collection': 0
    };
    var ret = this.options.url;
    for (var k in replace) {
      if (replace.hasOwnProperty(k)) {
        ret = ret.replace('\{'+k+'\}', replace[k]);
      }
    }
    return ret;
    //return this.options.urlbase + '/' + this.options.level + '/' + tile + '_' + this.options.row + '.' + this.options.urlext;
  }
  this.init();
}
function MultiZoomTile(container, options) {
  this.container = container;
  this.options = options || [];

  this.init = function() {
    this.elementtype = this.options.elementtype || 'DIV';
    this.element = document.createElement(this.elementtype);
    if (this.options.elementargs) {
      for (var k in this.options.elementargs) {
        if (this.options.elementargs.hasOwnProperty(k)) {
          this.element[k] = this.options.elementargs[k];
        }
      }
    }

    this.realsize = [];
    for (i = 0; i < 2; i++) {
      this.realsize[i] = this.options.size;
      if (this.options.pos[i] != 0) this.realsize[i] += this.options.overlap;
      //if (this.options.pos[i] != this.options.max[i]) this.realsize[i] += this.options.overlap;
    }

    this.element.className = "multizoom_tile";
    this.element.style.width = this.realsize[0] + "px";
    this.element.style.height = this.realsize[1] + "px";
    this.element.style.left = (((this.options.pos[0] * this.options.size) - this.options.overlap)) + "px";
    this.element.style.top = (((this.options.pos[1] * this.options.size) - this.options.overlap)) + "px";
    this.container.appendChild(this.element);
  }
  this.show = function() {
    this.element.style.display = 'block';
    this.element.style.visibility = 'visible';
  }
  this.hide = function() {
    this.element.style.display = 'none';
    this.element.style.visibility = 'hidden';
  }

  this.destroy = function() {
    this.container.removeChild(this.element);
    this.element = null;
    //console.log('deleted a tile');
  }

  this.init();
}
