elation.require("ui.base", function() {
  elation.requireCSS("ui.list");

  /** 
   * List UI element
   *
   * @class list
   * @augments elation.ui.base
   * @memberof elation.ui
   * @alias elation.ui.list
   *
   * @param {object}    args
   * @param {string}    args.tag
   * @param {string}    args.classname
   * @param {string}    args.title
   * @param {boolean}   args.draggable
   * @param {boolean}   args.selectable
   * @param {boolean}   args.hidden
   * @param {string}    args.orientation
   * @param {string}    args.sortbydefault
   * @param {array}     args.items
   * @param {elation.collection.simple} args.itemcollection
   *
   * @param {object}    args.attrs
   * @param {object}    args.attrs.name
   * @param {object}    args.attrs.children
   * @param {object}    args.attrs.label
   * @param {object}    args.attrs.disabled
   * @param {object}    args.attrs.itemtemplate
   * @param {object}    args.attrs.itemcomponent
   * @param {object}    args.attrs.itemplaceholder
   *
   */

  /**
   * ui_list_select event
   * @event elation.ui.list#ui_list_select
   * @type {object}
   */
  elation.component.add('ui.list', function() {
    this.defaultcontainer = {tag: 'ul', classname: 'ui_list'};

    this.init = function(name, container, args) {
      elation.ui.list.extendclass.init.call(this);

      this.tag = this.args.tag || this.container.tagName || 'DIV';
      this.classname = this.args.classname || "";
      this.title = this.args.title || false;
      this.draggable = this.args.draggable || false;
      this.selectable = elation.utils.any(this.args.selectable, true);
      this.multiselect = elation.utils.any(this.args.multiselect, false);
      this.spinner = this.args.spinner || false;
      this.events = this.args.events || {}
      this.orientation = this.args.orientation || 'vertical';
      this.items = [];
      this.listitems = [];
      this.selection = [];

      this.dirty = false;

      this.animatetime = 850;

      if (this.classname) {
        this.addclass(this.classname);
      }
      if (this.selectable) {
        this.addclass('state_selectable');
      }

      this.setOrientation(this.orientation);

      if (this.args.sortbydefault) {
        this.setSortBy(this.args.sortbydefault);
      }
      if (this.args.hidden) {
        this.hide();
      }
      if (this.args.itemcollection) {
        this.setItemCollection(this.args.itemcollection);
      } else if (this.args.items) {
        this.setItems(this.args.items);
      } else {
        this.extractItems();
      }
      Object.defineProperty(this, 'itemcount', { get: function() { return this.getItemCount(); } });
    }
    /**
     * Returns the UL element for this component, or create a new one if it doesn't exist yet
     * @function getListElement
     * @memberof elation.ui.list#
     * @returns {HTMLUListElement}
     */
    this.getListElement = function() {
      if (this.container instanceof HTMLUListElement) {
        return this.container;
      } else if (!this.listul) {
        this.listul = elation.html.create({tag: 'ul', append: this.container});
      }
      return this.listul;
    }
    /**
     * Combine passed-in attributes with built-in defaults
     * @function getDefaultAttributes
     * @memberof elation.ui.list#
     * @returns {Object}
     */
    this.getDefaultAttributes = function() {
      var attrs = this.args.attrs || {};
      if (elation.utils.isEmpty(attrs.name)) attrs.name = 'name';
      if (elation.utils.isEmpty(attrs.children)) attrs.children = 'items';
      if (elation.utils.isEmpty(attrs.label)) attrs.label = 'label';
      if (elation.utils.isEmpty(attrs.disabled)) attrs.disabled = 'disabled';
      return attrs;
    }
    this.getItemCount = function() {
      if (this.itemcollection) {
        return this.itemcollection.length;
      }
      return this.items.length;
    }
    /**
     * Update the items associated with this list
     * @function setItems
     * @memberof elation.ui.list#
     */
    this.setItems = function(items) {
      //this.clear();
      if (elation.utils.isArray(items)) {
        this.items = items;
      } else if (elation.utils.isString(items)) {
        var attrs = this.getDefaultAttributes();
        this.items = items.split('|').map(function(x) {
            return { value: x, attrs: attrs };
          });
      } else {
        for (var k in items) {
          this.items.push(items[k]);
        }
      }
      this.refresh();
    }
    /**
     * Links this list component with a collection to automatically handle updates when data changes
     * @function setItemCollection
     * @memberof elation.ui.list#
     * @param {elation.collection.simple} itemcollection  
     */
    this.setItemCollection = function(itemcollection) {
      if (this.itemcollection) {
        elation.events.remove(this.itemcollection, "collection_add,collection_remove,collection_move", this);
      }
      //this.clear();
      this.itemcollection = itemcollection;
      elation.events.add(this.itemcollection, "collection_add,collection_remove,collection_move,collection_load,collection_load_begin,collection_clear", this);
      //this.setItems(this.itemcollection.items);
      if (this.hasOwnProperty('items')) {
        delete this.items;
      }

      // FIXME - some interaction between this.items, this.listitems, and this.sort is causing problems when you swap out collections for a list
      Object.defineProperty(this, 'items', { get: function() { return this.itemcollection.items; }, configurable: true });
      Object.defineProperty(this, 'count', { configurable: true, get: function() { return this.itemcollection.length; }, configurable: true });
      this.refresh();
    }
    /**
     * Extracts items out of the list's existing HTML structure
     * @function extractItems
     * @memberof elation.ui.list#
     */
    this.extractItems = function() {
      var items = [];
      var attrs = this.getDefaultAttributes();
      for (var i = 0; i < this.container.childNodes.length; i++) {
        var node = this.container.childNodes[i];
        if (node instanceof HTMLLIElement) {
          items.push({label: node.innerHTML});
          node.parentNode.removeChild(node);
        }
      }
      this.setItems(items);
    }
    /**
     * Add a new item to this list
     * @function addItem
     * @memberof elation.ui.list#
     * @param {Object} item
     */
    this.addItem = function(item) {
      this.items.push(item);
      this.refresh();
    }
    /**
     * Add a new item to a specific position in this list
     * @function addItemAtPosition
     * @memberof elation.ui.list#
     * @param {Object} item
     * @param {integer} position
     */
    this.addItemAtPosition = function(item, position) {
      this.items.splice(position, 0, item);
      this.listitems.splice(position, 0, null);
      this.refresh();
    }
    /**
     * Resets the list to empty
     * @function clear
     * @memberof elation.ui.list#
     */
    this.clear = function() {
      var ul = this.getListElement();
      for (var i = 0; i < this.items.length; i++) {
        if (this.listitems[i]) {
          ul.removeChild(this.listitems[i].container);
          delete this.listitems[i];
          delete this.items[i];
        }
      }
      this.listitems = [];
      delete this.items;
      //ul.innerHTML = '';
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
      var item = this.items[itemnum];
      for (var i = 0; i < this.listitems.length; i++) {
        if (this.listitems[i].value === item) {
          return this.listitems[i];
        }
      }
      
      if (item) {
        // no existing listitem, allocate a new one
        var newlistitem = this.createlistitem({item: item, attrs: attrs, selectable: this.selectable});
        elation.events.add(newlistitem, 'ui_list_item_select', this);
        this.listitems.push(newlistitem);
      }
      return newlistitem;
    }

    /**
     * Creates a new instance of an elation.ui.listitem
     * Can be overridden by inheriting classes to override the listitem type
     * @param {Object} args
     */
    this.createlistitem = function(args) {
      return elation.ui.listitem(args);
    }

    /**
     * Updates the listitem objects and the HTML representation of this list with any new or removed items
     * @function render
     * @memberof elation.ui.list#
     */
    this.render = function() {
        var ul = this.getListElement();

        // FIXME - this could be made more efficient in two ways:
        //   1) instead of removing all elements and then re-adding them in order, we should be
        //      able to figure out deletions, additions, and moves and apply them separately
        //   2) currently when we remove listitems, we still keep a reference to the old object which gets
        //      reused if the same item is re-added.  this can be a performance optimization in some
        //      cases (automatic object reuse reduces gc if the same objects are added and removed repeatedly
        //      over the lifetime of the list), but can be a memory leak in cases where lots of 
        //      non-repeating data is added and removed.

        for (var i = 0; i < this.listitems.length; i++) {
          if (this.listitems[i].container.parentNode == ul) {
            ul.removeChild(this.listitems[i].container); 
          }
        }
        for (var i = 0; i < this.items.length; i++) {
          var listitem = this.getlistitem(i);
          if (listitem.container.parentNode != ul) {
            ul.appendChild(listitem.container);
          }
          listitem.refresh();
        }
        elation.component.init();
    }

    /**
     * Sorts the items in the list by the specified key
     * @function sort
     * @memberof elation.ui.list#
     * @param {string} sortby
     * @param {boolean} reverse
     */
    this.sort = function(sortby, reverse) {
      if (!reverse) reverse = false; // force to bool
      var ul = this.getListElement();

      // First, get the existing position of each item's listitem
      // Then get a sorted item list, and resort the listitems in the DOM
      // Next, apply a transform to place the listitems back in their old positions
      // Finally, set animation parameters and transform each item to its (0,0,0) position

      // Resort list items
      // FIXME - should also update this.items to reflect new order
      if (typeof sortby == 'function') {
        this.sortfunc = sortby;
        this.listitems.sort(sortby.bind(this));
      } else {
        this.listitems.sort(function(a, b) {
          var val1 = elation.utils.arrayget(a.value, sortby),
              val2 =  elation.utils.arrayget(b.value, sortby);
          if ((val1 < val2) ^ reverse) return -1;
          else if ((val1 > val2) ^ reverse) return 1;
          else return 0;
        });
      }


      // First calculate existing position of all items
      var items = [];
      for (var i = 0; i < this.listitems.length; i++) {
        items[i] = {};
        items[i].value = this.listitems[i].value;
        items[i].container = this.listitems[i].container;
        items[i].oldpos = [this.listitems[i].container.offsetLeft, this.listitems[i].container.offsetTop];
        items[i].oldlistpos = this.items.indexOf(this.listitems[i].value);
      }

      // Remove and re-add all items from list, so DOM order reflects item order
      // FIXME - this could be much more efficient, and is probably the slowest part of the whole process
      for (var i = 0; i < items.length; i++) {
        elation.html.removeclass(items[i].container, 'state_animating');
        if (items[i].container.parentNode == ul) {
          ul.removeChild(items[i].container);
        }
        ul.appendChild(items[i].container);
      }
      // Calculate new item positions, and set transform
      var maxdist = 0;
      for (var i = 0; i < items.length; i++) {
        items[i].newpos = [items[i].container.offsetLeft, items[i].container.offsetTop];
        items[i].diff = [items[i].oldpos[0] - items[i].newpos[0], items[i].oldpos[1] - items[i].newpos[1]],
        items[i].dist = Math.sqrt(items[i].diff[0]*items[i].diff[0] + items[i].diff[1] * items[i].diff[1]);
        if (items[i].dist > maxdist) maxdist = items[i].dist;
      }

      for (var i = 0; i < items.length; i++) {
        // FIXME - zooming is exaggerated and the animation feels slow on lists with fewer items.  need to scale this value somehow
        var ratio = items[i].dist / maxdist;
        items[i].z = 100 * ratio;
        items[i].animatetime = this.animatetime * ratio;
        items[i].container.style.zIndex = parseInt(items[i].z);

        // Start transform at item's old position, z=0
        elation.html.transform(items[i].container, 'translate3d(' + items[i].diff[0] + 'px, ' + items[i].diff[1] + 'px, 0px)', '50% 50%', 'none');

        // Animate halfway to the new position while zooming out
        setTimeout(elation.bind(items[i], function() {
          elation.html.transform(this.container, 'translate3d(' + (this.diff[0]/2) + 'px,' + (this.diff[1]/2) + 'px, ' + this.z + 'px)', '50% 50%', 'all ' + (this.animatetime / 2) + 'ms ease-in');
        }), 0);

        // Finish animating to the new position, and zoom back in
        setTimeout(elation.bind(items[i], function() {
          elation.html.transform(this.container, 'translate3d(0, 0, 0)', '50% 50%', 'all ' + (this.animatetime / 2) + 'ms ease-out');
        }), items[i].animatetime / 2);

        this.items[i] = items[i].value;
      }
      if (i < this.items.length) {
        this.items.splice(i, this.items.length);
      }

      // Set classname based on sortby parameter
      this.setSortBy(sortby);
    }
    /**
     * Sets the current sorting mode for this class
     * @function setSortBy
     * @memberof elation.ui.list#
     * @param {string} sortby
     */
    this.setSortBy = function(sortby) {
      if (this.sortby && elation.utils.isString(this.sortby)) {
        this.removeclass('ui_list_sortby_' + this.sortby);
      }
      this.sortby = sortby;
      if (elation.utils.isString(this.sortby)) {
        this.addclass('ui_list_sortby_' + this.sortby);
      }
    }
    /**
     * Returns a list of which items are currently visible in this list
     * @function getVisibleItems
     * @memberof elation.ui.list#
     * @returns {array}
     */
    this.getVisibleItems = function() {
      var visible = [];
      for (var i = 0; i < this.listitems.length; i++) { 
        var li = this.listitems[i];
        if (li.container.offsetTop + li.container.offsetHeight >= this.container.scrollTop && li.container.offsetTop <= this.container.scrollTop + this.container.offsetHeight) { 
          //console.log('visible:', i, li.args.item.label); 
          visible.push(i);
        } 
      }
      return visible;
    }
    /**
     * Sets the selection state of all items in the list
     * @function selectall
     * @memberof elation.ui.list#
     * @param {bool} state
     * @param {Array} exclude
     */
    this.selectall = function(state, exclude) {
      if (state === undefined) state = true;
      if (exclude === undefined) exclude = [];

      if (state) {
        // select all
        for (var i = 0; i < this.listitems.length; i++) {
          var li = this.listitems[i];
          if (exclude.indexOf(li) == -1 && this.selection.indexOf(li) == -1) {
            li.select(false);
            this.selection.push(li);
          }
        }
      } else {
        // deselect all
        while (this.selection.length > 0) {
          var li = this.selection.pop();
          if (exclude.indexOf(li) == -1) {
            li.unselect();
          }
        }
      }
    }
    /**
     * Sets the specified selection as being the last one clicked
     * @function setlastselection
     * @memberof elation.ui.list#
     * @param {elation.ui.listitem} selection
     */
    this.setlastselection = function(selection) {
      if (this.lastselection) {
        this.lastselection.setlastselected(false);
      }
      this.lastselection = selection;
      this.lastselection.setlastselected(true);
    }
    /**
     * Scrolls to the bottom of the list
     * @function scrollToBottom
     * @memberof elation.ui.list#
     */
    this.scrollToBottom = function() {
      this.container.scrollTop = this.container.scrollHeight;
    }
    /**
     * Is the list currently scrolled to the bottom?
     * @function isScrollAtBottom
     * @memberof elation.ui.list#
     */
    this.isScrollAtBottom = function() {
      return this.container.scrollTop + this.container.offsetHeight >= this.container.scrollHeight;
    }
    /**
     * Event handler: elation.ui.listitem#ui_list_item_select
     * @function ui_list_item_select
     * @memberof elation.ui.list#
     * @param {event} ev
     */
    this.ui_list_item_select = function(ev) {
      var newselection = ev.element;

      if (!ev.ctrlKey && this.selection.length > 0) {
        // If ctrl key wasn't down, unselect all selected items in the list
        this.selectall(false, [newselection]);
      }

      if (this.multiselect && ev.shiftKey && this.lastselection) {
        // If shift key was down and we had a previous item selected, perform a range-select
        var idx1 = this.listitems.indexOf(this.lastselection);
        var idx2 = this.listitems.indexOf(newselection);
        if (idx1 != -1 && idx2 != -1) {
          var start = Math.min(idx1, idx2);
          var end = Math.max(idx1, idx2);
          for (var i = start; i <= end; i++) {
            if (this.selection.indexOf(this.listitems[i]) == -1) {
              this.listitems[i].select(false);
              this.selection.push(this.listitems[i]);
            }
          }
        }
      } else {
        // Otherwise, perform a single selection
        var idx = this.selection.indexOf(newselection);
        if (idx == -1) {
          this.selection.push(newselection);
        } else {
          this.selection.splice(idx, 1);
          newselection.unselect();
        }
      }

      if (this.multiselect) {
        // Make note of the most recently-clicked list item, for future interaction
        this.setlastselection(newselection);
      }
      elation.events.fire({type: 'ui_list_select', element: this, target: ev.element, data: ev.data});
    }
    /**
     * Event handler: elation.collection.simple#collection_add
     * @function collection_add
     * @memberof elation.ui.list#
     * @param {event} ev
     */
    this.collection_add = function(ev) {
      this.refresh();
    }
    /**
     * Event handler: elation.collection.simple#collection_remove
     * @function collection_remove
     * @memberof elation.ui.list#
     * @param {event} ev
     */
    this.collection_remove = function(ev) {
      this.refresh();
    }
    /**
     * Event handler: elation.collection.simple#collection_move
     * @function collection_move
     * @memberof elation.ui.list#
     * @param {event} ev
     */
    this.collection_move = function(ev) {
      this.refresh();
    }
    /**
     * Event handler: elation.collection.simple#collection_load_begin
     * @function collection_load_begin
     * @memberof elation.ui.list#
     * @param {event} ev
     */
    this.collection_load_begin = function(ev) {
      if (this.spinner) {
        this.container.appendChild(this.spinner.container);
        this.spinner.show();
      }
    }
    /**
     * Event handler: elation.collection.simple#collection_load
     * @function collection_load
     * @memberof elation.ui.list#
     * @param {event} ev
     */
    this.collection_load = function(ev) {
      if (this.spinner) {
        this.container.removeChild(this.spinner.container);
      }
      this.refresh();
    }
    /**
     * Event handler: elation.collection.simple#collection_clear
     * @function collection_clear
     * @memberof elation.ui.list#
     * @param {event} ev
     */
    this.collection_clear = function(ev) {
      this.refresh();
    }

  }, elation.ui.base);

  /** 
   * ListItem UI element
   * Represents an individual item in a ui.list
   *
   * @class listitem
   * @augments elation.ui.base
   * @memberof elation.ui
   * @alias elation.ui.listitem
   *
   * @param {object}  args
   * @param {object}  args.item
   * @param {object}  args.attrs
   * @param {boolean} args.selectable
   */
  elation.component.add('ui.listitem', function() {
    this.defaultcontainer = {tag: 'li', classname: 'ui_list_item'};

    this.init = function() {
      elation.ui.listitem.extendclass.init.call(this);

      this.value = this.args.item;
      this.attrs = this.args.attrs || {};
      this.selectable = this.args.selectable || false;
      this.placeholder = false;
      elation.events.add(this.container, 'click', this);

      this.render();
    }
    this.setValue = function(value) {
      this.value = value;
      this.render();
    }
    this.render = function() {
      // reset classname to default
      this.container.className = this.defaultcontainer.classname;
      if (typeof this.value != 'undefined') {
        if (this.placeholder) {
          this.placeholder = false;
        }
        if (this.value.classname) {
          this.addclass(this.value.classname);
        }

        if (this.value) {
          this.setcontent(this.value);
        }

        if (this.selected) {
          this.addclass("state_selected");
        }
        if (this.lastselected) {
          this.addclass("state_lastselected");
        }
        if (!elation.utils.isEmpty(this.attrs.disabled) && !elation.utils.isEmpty(this.value[this.attrs.disabled])) {
          this.addclass("state_disabled");
        }
      } else {
        if (!this.placeholder) {
          this.placeholder = true;
          this.setcontent(elation.utils.any(this.attrs.itemplaceholder, ''));
        }
      }
    }
    this.setcontent = function(value) {
      this.container.innerHTML = '';
      var filled = false;
      if (this.attrs.itemcomponent) {
        var itemcomponentclass = elation.utils.arrayget(elation, this.attrs.itemcomponent);
        if (itemcomponentclass) {
          var itemcomponent = itemcomponentclass(null, this.container, value);
          this.itemcomponent = itemcomponent;
          filled = true;
        }
      } else if (value instanceof elation.component.base) {
        this.container.appendChild(value.container);
        filled = true;
      } else if (this.attrs.itemtemplate) {
        this.container.innerHTML = elation.template.get(this.attrs.itemtemplate, value);
        filled = true;
      } 
      if (!filled) {
        if (elation.utils.isString(value)) {
          this.container.innerHTML = value;
        } else if (this.attrs.label) {
          var attrval = elation.utils.arrayget(value, this.attrs.label);
          if (attrval !== null) {
            this.container.innerHTML = attrval;
          }
        }
      }
    }
    /**
     * Set this list item as being selected
     * @function select
     * @memberof elation.ui.listitem#
     * @fires elation.ui.listitem#ui_list_item_select
     */
    this.select = function(extra) {
      this.selected = true;
      elation.html.addclass(this.container, 'state_selected');
      // FIXME - 'extra' has two meanings here; if you pass false it doesn't emit events, but if you
      //          pass an object, it's treated as an event, and its properties are cloned
      if (extra !== false) {
        elation.events.fire({type: 'ui_list_item_select', element: this, data: this.value, event: extra});
      }
    }
    /**
     * Set this list item as being unselected
     * @function unselect
     * @memberof elation.ui.listitem#
     * @fires elation.ui.listitem#ui_list_item_unselect
     */
    this.unselect = function() {
      this.selected = false;
      elation.html.removeclass(this.container, 'state_selected');
      elation.events.fire({type: 'ui_list_item_unselect', element: this, data: this.value});
    }
    /**
     * Set this list item as being the last item selected in its list
     * @function setlastselected
     * @memberof elation.ui.listitem#
     */
    this.setlastselected = function(state) {
      this.lastselected = state;
      var hasclass = this.hasclass('state_lastselected');
      if (state && !hasclass) {
        this.addclass('state_lastselected');
      } else if (!state && hasclass) {
        this.removeclass('state_lastselected');
      }
    }
    /**
     * Event handler: HTML element click
     * @function click
     * @memberof elation.ui.listitem#
     * @param {event} ev
     */
    this.click = function(ev) {
      if (this.selectable) {
        this.select(ev);
      }
    }
  }, elation.ui.base);
});
