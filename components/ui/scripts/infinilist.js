elation.require(['ui.list'], function() {
  elation.requireCSS('ui.infinilist');

  elation.component.add('ui.infinilist', function() {
    this.knownheights = [];
    this.offsets = [];
    this.listitempool = [];

    this.init = function() {
      elation.ui.infinilist.extendclass.init.call(this);

      this.placeholder_top = elation.ui.listplaceholder({append: this, orientation: 'top'});
      this.placeholder_bottom = elation.ui.listplaceholder({append: this, orientation: 'bottom'});


      this.addclass('ui_infinilist');

      elation.events.add(this.container, 'scroll', elation.bind(this, this.handlescroll));
      elation.events.add(window, 'scroll', elation.bind(this, this.handlescroll));

      this.refresh();
    }
    this.handlescroll = function(ev) {
      this.refresh();
    }
    this.getOffsetTo = function(num) {
      var sum = 0, known = 0, estimate = 0;
      var keys = Object.keys(this.knownheights);
      for (var i = 0; i < keys.length; i++) {
        if (keys[i] >= num) break;
        if (this.knownheights[keys[i]]) {
          sum += this.knownheights[keys[i]];
          known++;
        }
      }
      estimate = sum;
      if (known < num) {
        var avg = this.getAverageHeight();
        estimate = sum + (num - known) * avg;
      }
      return estimate;
    }
    this.getAverageHeight = function() {
      var sum = 0, known = 0, avg = 30;
      var keys = Object.keys(this.knownheights);
      for (var i = 0; i < keys.length; i++) {
        if (this.knownheights[keys[i]]) {
          sum += this.knownheights[keys[i]];
          known++;
        }
      }
//console.log(sum, known, this.itemcount);
      if (known > 0) {
        avg = sum / known;
      }
      return avg;
    }
    /**
     * Returns a list of which items are currently visible in this list
     * @function getVisibleItems
     * @memberof elation.ui.infinilist#
     * @returns {array}
     */
    this.getVisibleItems = function(buffer) {
      var visible = [];

      if (!buffer) buffer = 0;
      var buffsize = buffer * this.container.offsetHeight;

      var itemheight = this.getAverageHeight();
      var firstitem = Math.max(0, Math.floor((this.container.scrollTop - buffsize) / itemheight));
      var lastitem = Math.min(this.itemcount, firstitem + Math.ceil(((1 + buffer * 2) * this.container.offsetHeight) / itemheight));
//console.log('vis', itemheight, firstitem, lastitem, this.container.scrollTop, this.container.offsetHeight, this.itemcount);
      return [firstitem, lastitem];
    }
    /**
     * Get the elation.ui.listitem for a specified item, allocating as needed
     * @function getlistitem
     * @memberof elation.ui.list#
     * @param {Object} item
     * @returns {elation.ui.listitem}
     */
    this.getlistitem = function(itemnum) {
      var attrs = this.getDefaultAttributes();
      
      if (!this.listitems[itemnum]) {
        if (this.listitempool.length > 0) {
          var newlistitem = this.listitempool.pop();
          this.container.appendChild(newlistitem.container);
        } else {
          // no existing listitem, allocate a new one
          var newlistitem = elation.ui.listitem({append: this, attrs: attrs, selectable: this.selectable});
          elation.events.add(newlistitem, 'ui_list_item_select', this);
        }
        this.listitems[itemnum] = newlistitem;
      }
      return this.listitems[itemnum];
    }
    /**
     * Updates the listitem objects and the HTML representation of this list with any new or removed items
     * @function render
     * @memberof elation.ui.infinilist#
     */
    this.render = function() {
      var ul = this.getListElement();

      var visible = this.getVisibleItems(1);

      var offset = this.getOffsetTo(visible[0]);
      var totalheight = this.getOffsetTo(this.itemcount);
      var lastheight = this.getOffsetTo(visible[1]);
//console.log(visible, totalheight);

/*
      if (this.placeholder_top.container.parentnode == this.container.parentNode) {
        this.container.removeChild(this.placeholder_top.container);
      }
      if (this.placeholder_bottom.container.parentnode == this.container.parentNode) {
        this.container.removeChild(this.placeholder_bottom.container);
      }
*/
      var items = this.items;
      var listitems = [];
      for (var i = visible[0], j = 0; i < visible[1]; i++) {
        var li = this.getlistitem(j);
        listitems[j] = li;
        j++;
        li.setValue(items[i]);
        //if (this.knownheights[i] === undefined) {
          //this.knownheights[i] = li.container.offsetHeight;
        //}
      }
      while (j < this.listitems.length) {
        var extrali = this.listitems.pop();
        this.container.removeChild(extrali.container);
        this.listitempool.push(extrali);
      }
      for (var i = 0; i < listitems.length; i++) {
        if (this.knownheights[i] === undefined) {
          this.knownheights[i] = listitems[i].container.offsetHeight;
        }
      }
      if (this.placeholder_top) {
        this.placeholder_top.setheight(offset);
        this.container.insertBefore(this.placeholder_top.container, this.container.firstChild);
      }
      if (this.placeholder_bottom) {
        this.placeholder_bottom.setheight(totalheight - lastheight);
        this.container.insertBefore(this.placeholder_bottom.container, null);
      }
    }
  }, elation.ui.list);
  elation.component.add('ui.listplaceholder', function() {
    this.defaultcontainer = {tag: 'li', classname: 'ui_list_item ui_list_item_placeholder'};

    this.init = function() {
      elation.ui.listplaceholder.extendclass.init.call(this);
      this.addclass('orientation_' + this.args.orientation);
    }
    this.setheight = function(height) {
      this.container.style.height = height + 'px';
    }
  }, elation.ui.listitem);
});
