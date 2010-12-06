elation.extend("zoom", {
  replace: function(container, options) {
    var newzoom = new elation.zoom.deepzoom(container, options);
  },

  deepzoom: function(container, options) {
    this.container = container;
    this.options = options || {};
    this.tilelayers = [];
    this.tiles = [];
    this.level = 1;
  
    this.init = function() {
      if (typeof this.options.eventparent == 'undefined') {
        if (elation.browser.type == "msie") { // IE wants its events on a different element, and ie8 has a bug with zooming
          this.options.eventparent = document.body;
          this.options.offsetscale = (elation.browser.version == 8);
        } else {
          this.options.eventparent = window;
        }
      }
      if (typeof this.options.showlevels == 'undefined')
        this.options.showlevels = 5;
  
      if (typeof this.container == 'string') {
        this.container = document.getElementById(this.container);
      }
  
      if (this.container) {
          console.log(this.container.style);
          /*
        if (this.container.style.position == 'static' || this.container.style.position == '')
          this.container.style.position = 'relative';
          */
        this.zoomable = document.createElement("DIV");
        this.zoomable.style.width = this.options.size[0] + 'px';
        this.zoomable.style.height = this.options.size[1] + 'px';
        this.zoomable.style.outline = 0;
        this.container.appendChild(this.zoomable);
        this.zoomable.style.position = 'absolute';
        this.zoomable.style.top = '0';
        this.zoomable.style.left = '0';
        this.container.style.overflow = 'hidden';
  
        this.container.style.WebkitUserSelect = 'none';
        this.container.draggable = false;
        this.zoomable.style.WebkitUserSelect = 'none';
        this.zoomable.draggable = false;
  
        if (document.location.hash)
          this.hashargs = document.location.hash.replace(/^#/, '').split('.');
  
        this.maxlevel = this.getMaximumLevel(this.options.size[0], this.options.size[1]);
        /*
        this.scaler = new ImageScale(this.container, {
          zoomable: this.zoomable,
          eventparent: this.options.eventparent,
          offsetscale: this.options.offsetscale
        });
        */
        // FIXME - panzoom/panend should be handled via elation.events.add()
        (function(self) {
          self.scaler = new ImageScale(self.container, {
            zoomable: self.zoomable,
            eventparent: self.options.eventparent,
            offsetscale: self.options.offsetscale,
            onpanend: function() { self.handlePanEnd() },
            onzoomend: function() { self.handleZoomEnd(); }
          });
        })(this);
        if (this.options.defaultlevel) {
          this.level = this.options.defaultlevel;
        } else if (this.hashargs && this.hashargs[0]) {
          console.log(this.hashargs);
          this.level = this.hashargs[0];
          var levelinfo = this.levelInfo(this.level);
          this.scaler.scale = levelinfo.scale;
          var col = this.hashargs[1];
          var row = this.hashargs[2];
        } else {
          this.level = this.options.defaultlevel = this.bestLevel(false);
        }
  
        this.showControls();
        this.setLevel(this.level, row, col);
      }
    }
    this.showControls = function() {
        this.controls = {};
        this.buttons = {};
        this.controls['zoom'] = document.createElement('DIV');
        this.controls['zoom'].id = 'multizoom_controls_zoom';
        this.controls['zoom'].className = 'multizoom_controls';
        this.controls['zoom'].style.position = 'absolute';
        this.controls['zoom'].style.bottom = '5px';
        this.controls['zoom'].style.right = '5px';
  
        this.buttons['zoom_out'] = new elation.ui.button({label: '&#8211;', title: 'Zoom Out', events: { click: this, touchstart: this, mousedown: this }}, this.controls['zoom']);
        this.buttons['zoom_in'] = new elation.ui.button({label: '+', title: 'Zoom In', events: { click: this, touchstart: this, mousedown: this }}, this.controls['zoom']);
  
        // FIXME - ugly.
        this.container.appendChild(this.controls['zoom']);
    }
    this.handleEvent = function(ev) {
      var ret = true;
      switch(ev.type) {
        case 'mousedown':
        case 'touchstart':
          if (ev.target == this.buttons['zoom_in'].element || ev.target == this.buttons['zoom_out'].element) {
            ev.preventDefault();
            ev.stopPropagation();
          }
          break;
        case 'click':
          if (ev.target == this.buttons['zoom_in'].element) {
              this.scaler.zoomBy(10/8);
            this.bestLevel(true);
          } else if (ev.target == this.buttons['zoom_out'].element) {
              this.scaler.zoomBy(8/10);
            this.bestLevel(true);
          }
          ev.preventDefault();
          ev.stopPropagation();
          ret = false;
          break;
        case 'selectstart':
      }
      return ret;
    }
    this.handlePanEnd = function(ev) {
      this.calculateVisibilities();
    }
    this.handleZoomEnd = function(ev) {
      if (this.zoomtimer) clearTimeout(this.zoomtimer);
      (function(self) {

        self.zoomtimer = setTimeout(function() {
          self.bestLevel(true);
          self.calculateVisibilities();
        }, 400);
      })(this);
    }
    this.bestLevel = function(update) {
      //console.log('well, it worked', this.scaler.scale);        
      var level = this.maxlevel - Math.floor((Math.log(1/this.scaler.scale) / Math.LN2));
      if (level > this.maxlevel)
        level = this.maxlevel;
      //console.log('new level: ' + level);
      if (update) {
        this.setLevel(level);
      }
      //this.calculateVisibilities();
      return level;
    }
    this.setLevel = function(level, row, col) {
      this.level = level;
  
      if (typeof row != 'undefined' && typeof col != 'undefined') {
        var levelinfo = this.levelInfo(level);
        console.log(level, row, col, levelinfo);
        this.scaler.pos[0] = -1 * (col * (levelinfo.width / levelinfo.columns)) * levelinfo.scale;
        this.scaler.pos[1] = -1 * (row * (levelinfo.height / levelinfo.rows)) * levelinfo.scale;
        this.scaler.updateImage();
        console.log(this.scaler.pos);
      }
  
      var bounds = this.scaler.getViewportBounds();
      for (var i = 0; i <= this.maxlevel; i++) {
        if (i == this.level) {
          //console.log('show ' + i);
          this.showLevel(i, bounds);
        } else if ((i > this.level || i < this.level - this.options.showlevels) && i != this.options.defaultlevel) {
          //console.log('hide ' + i);
          this.hideLevel(i);
        }
      }
    }
    this.calculateVisibilities = function() {
      var bounds = this.scaler.getViewportBounds();
      this.showLevel(this.level, bounds);
    }
    this.getMaximumLevel = function(width, height) {
      return Math.ceil(Math.log(Math.max(width, height)) / Math.LN2)
    }
    this.levelInfo = function(level) {
      var ret = {
        maxlevel: this.getMaximumLevel(this.options.size[0], this.options.size[1]),
      };
      ret.scale = 1 / Math.pow(2, ret.maxlevel - level);
      ret.width = Math.ceil(this.options.size[0] / Math.pow(2, ret.maxlevel - level)),
      ret.height = Math.ceil(this.options.size[1] / Math.pow(2, ret.maxlevel - level)),
      ret.columns = Math.ceil(ret.width / this.options.tilesize),
      ret.rows = Math.ceil(ret.height / this.options.tilesize)
      return ret;
    }
    this.createLevel = function(level) {
      var maxlevel = this.getMaximumLevel(this.options.size[0], this.options.size[1]);
      var lwidth = Math.ceil(this.options.size[0] / Math.pow(2, maxlevel - level));
      var lheight = Math.ceil(this.options.size[1] / Math.pow(2, maxlevel - level));
      var columns = Math.ceil(lwidth / this.options.tilesize);
      var rows = Math.ceil(lheight / this.options.tilesize);
      var layeroptions = {
        size: this.options.size,
        rows: rows,
        columns: columns,
        tilesize: this.options.tilesize,
        level: level,
        maxlevel: maxlevel,
        visible: false,
        url: this.options.url,
        overlap: this.options.overlap,
        transformtype: this.scaler.transformtype
      };
  
      this.tilelayers[level] = new MultiZoomTileLayer(this.zoomable, layeroptions);
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
        this.tilelayers[level].destroy();
        delete this.tilelayers[level];
      }
    }
    this.init();
  }
});
function MultiZoomTileLayer(container, options) {
  this.container = container;
  this.options = options || [];
  this.tiles = [];

  this.init = function() {
    this.visible = this.options.visible || false;
    this.scale = Math.pow(2, (this.options.maxlevel - this.options.level));
    this.element = document.createElement("DIV");
    this.element.style.webkitUserSelect = 'none';
    this.element.className = "multizoom_tilelayer layer" + this.options.level;

    this.element.style.position = 'absolute';
    this.element.style.top = 0;
    this.element.style.left = 0;
    this.element.style.zIndex = this.options.level;
    this.element.style.display = (this.visible ? 'block' : 'none');
    this.element.style.width = ((this.options.size[0] / this.container.offsetWidth) * Math.pow(2, this.options.level)) + 'px';
    this.element.style.height = ((this.options.size[1] / this.container.offsetWidth) * Math.pow(2, this.options.level)) + 'px';
    this.element.style.outline = 0;

    if (this.options.transformtype == 'zoom') {
      this.element.style.zoom = (100 * this.scale) + "%";
    } else {
      this.element.style[this.options.transformtype+'Origin'] = '0 0';
      this.element.style[this.options.transformtype] = 'scale(' + this.scale + ')';
    }
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
    // FIXME - IE7 wants the opposite of IE8, and the same thing as firefox/webkit.  stupid.
    if (this.options.transformtype == 'zoom' && this.options.offsetscale)
        this.element.style.paddingTop = (Math.max((tlpos[1] - this.scaler.viewportoffset[0]), 0) * this.options.tilesize / this.scale) + "px";
    else
      this.element.style.paddingTop = (Math.max(tlpos[1], 0) * this.options.tilesize) + "px";
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
    if (this.rows[row]) {
      this.rows[row].hide();
      this.rows[row].destroy();
      delete this.rows[row];
    }
  }
  this.createRow = function(row) {
    var rowoptions = {
      level: this.options.level,
      tilesize: this.options.tilesize,
      row: row,
      columns: this.options.columns,
      url: this.options.url,
      overlap: this.options.overlap,
      transformtype: this.options.transformtype,
      scale: this.scale
    };
    for (var i = row; i < this.options.rows; i++) {
      if (typeof this.rows[i] != 'undefined') {
        rowoptions['insertbefore'] = this.rows[i].element;
        break;
      }
    }

    //console.log(rowoptions);
    this.rows[row] = new MultiZoomTileRow(this.element, rowoptions);
  }
  this.destroy = function() {
    this.container.removeChild(this.element);
    this.element = null;
    for (var i = 0; i < this.options.rows; i++) {
      if (typeof this.rows[i] != 'undefined') {
        this.rows[i].destroy();
        delete this.rows[i];
      }
    }
  }
  this.init();
}
function MultiZoomTileRow(container, options) {
  this.container = container;
  this.options = options;

  this.init = function() {
    this.element = document.createElement('DIV');
    this.element.className = 'multizoom_row';
    this.element.style.webkitUserSelect = 'none';
    this.element.style.height = this.options.tilesize + "px";
    this.element.style.outline = 0;
    //this.element.style.marginBottom = (-1 * this.options.overlap) + "px";
    if (this.options.insertbefore) {
      this.container.insertBefore(this.element, this.options.insertbefore);
    } else if (this.options.insertafter) {
      this.container.insertBefore(this.element, this.options.insertafter.nextSibling);
    } else {
      this.container.appendChild(this.element);
    }

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

    //alert(startcol + "*  (" + this.options.tilesize + " - " + this.options.overlap + ")");
    this.element.style.paddingLeft = (Math.max(startcol, 0) * (this.options.tilesize - this.options.overlap)) + "px";
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
        this.hideTile(i);
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
      this.tiles[tile].destroy();
      delete this.tiles[tile];
    }
  }
  this.createTile = function(tile) {
    var imgurl = this.getImageURL(tile);
    var tileoptions = {
      size: this.options.tilesize,
      pos: [tile, this.options.row],
      elementargs: { innerHTML: '<img src="' + imgurl + '" />' },
      overlap: this.options.overlap,
      max: [this.options.rows, this.options.columns],
      transformtype: this.options.transformtype,
      scale: this.options.scale
    };

    for (var i = tile; i < this.options.columns; i++) {
      if (typeof this.tiles[i] != 'undefined') {
        tileoptions['insertbefore'] = this.tiles[i].element;
        break;
      }
    }
    this.tiles[tile] = new MultiZoomTile(this.element, tileoptions);
  }
  this.getImageURL = function(tile) {
    var replace = {
      'row': this.options.row,
      'column': tile,
      'level': this.options.level,
      'collection': 0,
      'random': Math.ceil(Math.random() * 5)
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
  this.destroy = function() {
    this.container.removeChild(this.element);
    this.element = null;
    for (var i = 0; i < this.options.columns; i++) {
      if (typeof this.tiles[i] != 'undefined') {
        this.tiles[i].destroy();
        delete this.tiles[i];
      }
    }
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
    this.element.style.webkitUserSelect = 'none';
    this.element.style.outline = 0;
    if (this.options.pos[0] != 0)
      this.element.style.marginLeft = (-1 * this.options.overlap) + "px";
    if (this.options.pos[0] != this.options.max[0])
      this.element.style.marginRight = (-1 * this.options.overlap) + "px";

    // IE8 seems to have a bug with absolute positioned tiles and zooming, so we use relative positioning for this method
    // Interestingly, IE7 works fine with absolute positioning, but it's fine with relative too
    if (this.options.transformtype == 'zoom') {
      this.element.style.position = 'relative';
    } else {
      this.element.style.position = 'absolute';
      this.element.style.left = (((this.options.pos[0] * this.options.size) - this.options.overlap)) + "px";
      this.element.style.top = (((this.options.pos[1] * this.options.size) - this.options.overlap)) + "px";
    }

    if (this.options.insertbefore) {
      this.container.insertBefore(this.element, this.options.insertbefore);
    } else if (this.options.insertafter) {
      this.container.insertBefore(this.element, this.options.insertafter.nextSibling);
    } else {
      this.container.appendChild(this.element);
    }
  }
  this.show = function() {
    this.element.style.display = 'inline-block';
    this.element.style.visibility = 'visible';
  }
  this.hide = function() {
    this.element.style.display = 'none';
    this.element.style.visibility = 'hidden';
  }

  this.destroy = function() {
    this.container.removeChild(this.element);
    this.element = null;
  }

  this.init();
}
