elation.require(["elements.elements", "elements.ui.item"], function() {
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
   * @param {boolean}   args.autoscroll
   * @param {number}    args.autoscrollmargin
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
  elation.elements.define('ui.list', class extends elation.elements.base {
    init() {
      super.init();
      this.defineAttributes({
        title: { type: 'string' },
        hidden: { type: 'boolean' },
        draggable: { type: 'boolean' },
        selectable: { type: 'boolean' },
        sortbydefault: { type: 'string' },
        multiselect: { type: 'boolean' },
        spinner : { type: 'boolean' },
        orientation: { type: 'string' },
        autoscroll: { type: 'boolean' },
        autoscrollmargin: { type: 'integer', default: 100 },
        //items: { type: 'object' },
        itemcount: { type: 'number', get: this.getItemCount },
        nameattr: { type: 'string', default: 'name' },
        childattr: { type: 'string', default: 'items' },
        labelattr: { type: 'string', default: 'label' },
        titleattr: { type: 'string', default: 'title' },
        disabledattr: { type: 'string', default: 'disabled' },
        collection: { type: 'object', default: null },
        itemtemplate: { type: 'string', default: '' },
        itemcomponent: { type: 'object', default: 'ui.item' },
        itemplaceholder: { type: 'object', default: null },
        emptytemplate: { type: 'string' },
        emptycontent: { type: 'string' },
      });
      this.items = [];
      this.listitems = [];
      this.selection = [];

      this.dirty = false;

      this.animatetime = 850;

    }
    create() {
      if (this.preview) {
        this.items = [{value: 1, label: 'One'}, {value: 2, label: 'Two'}, {value: 2, label: 'Three'}];
      }
      if (this.collection) {
        this.setItemCollection(this.collection);
      } else if (this.items && this.items.length > 0) {
        this.setItems(this.items);
      } else {
        this.extractItems();
      }

      if (this.selectable) {
        this.addclass('state_selectable');
        this.setAttribute('tabindex', 0);
        this.addEventListener('keydown', (ev) => this.handleKeydown(ev));
      }
      this.setAttribute('role', (this.selectable ? 'listbox' : 'list'));

      if (this.orientation) {
        this.setOrientation(this.orientation);
      }

      if (this.sortbydefault) {
        this.setSortBy(this.sortbydefault);
      }
      if (this.hidden) {
        this.hide();
      }

      let emptycontent = this.emptycontent;
      if (this.emptytemplate) {
        emptycontent = elation.templates.get(this.emptytemplate, this);
      }
      if (emptycontent) {
        this.emptyitem = this.createlistitem({
          value: emptycontent,
          innerHTML: emptycontent,
          selectable: false,
          disabled: true
        });
      }
    }
    /**
     * Returns the UL element for this component, or create a new one if it doesn't exist yet
     * @function getListElement
     * @memberof elation.ui.list#
     * @returns {HTMLUListElement}
     */
    getListElement() {
/*
      if (this instanceof HTMLUListElement) {
        return this;
      } else if (!this.listul) {
        this.listul = elation.html.create({tag: 'ul', append: this});
      }
      return this.listul;
*/
      return this;
    }
    getItemCount() {
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
    setItems(items) {
      this.clear();
      if (elation.utils.isArray(items)) {
        this.items = items;
      } else if (elation.utils.isString(items)) {
        this.items = items.split('|').map((x) => {
          return { 
            value: x, 
            nameattr: this.nameattr,
            childattr: this.childattr,
            labelattr: this.labelattr,
            disabledattr: this.disabledattr,
            itemtemplate: this.itemtemplate,
            itemcomponent: this.itemcomponent,
            itemplaceholder: this.itemplaceholder,
          };
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
    setItemCollection(itemcollection) {
      if (this.itemcollection) {
        elation.events.remove(this.itemcollection, "collection_add,collection_remove,collection_move", this);
      }
      //this.clear();
      if (itemcollection instanceof elation.elements.collection.simple) {
        this.itemcollection = itemcollection;
      } else if (elation.utils.isString(itemcollection)) {
        this.itemcollection = document.getElementById(itemcollection);
      }
      if (this.itemcollection) {
        elation.events.add(this.itemcollection, "collection_add,collection_remove,collection_move,collection_load,collection_load_begin,collection_clear", this);
        //this.setItems(this.itemcollection.items);
        if (this.hasOwnProperty('items')) {
          delete this.items;
        }

        // FIXME - some interaction between this.items, this.listitems, and this.sort is causing problems when you swap out collections for a list
        Object.defineProperty(this, 'items', { get: function() { return this.itemcollection.items; }, configurable: true });
        Object.defineProperty(this, 'count', { configurable: true, get: function() { return this.itemcollection.length; }, configurable: true });
      }
      this.refresh();
    }
    /**
     * Extracts items out of the list's existing HTML structure
     * @function extractItems
     * @memberof elation.ui.list#
     */
    extractItems() {
      var items = [];
      for (var i = 0; i < this.childNodes.length; i++) {
        var node = this.childNodes[i];
        if (node instanceof HTMLLIElement) {
          var item = this.createlistitem({
            value: node.innerHTML,
            innerHTML: node.innerHTML,
            selectable: this.selectable,
            draggable: this.draggable,
            nameattr: this.nameattr,
            childattr: this.childattr,
            labelattr: this.labelattr,
            titleattr: this.titleattr,
            disabledattr: this.disabledattr,
            itemtemplate: this.itemtemplate,
            itemcomponent: this.itemcomponent,
            itemplaceholder: this.itemplaceholder
          });
          node.parentNode.removeChild(node);
          i--;
          items.push(item);
        } else if (node instanceof elation.elements.ui.item) {
          items.push(node);
          node.value = node.firstChild;
          node.selectable = this.selectable;
          node.draggable = this.draggable;
          elation.events.add(node, 'select', (ev) => this.handleSelect(ev));
          node.parentNode.removeChild(node);
          i--;
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
    addItem(item) {
      let wasScrollAtBottom = this.isScrollAtBottom(this.autoscrollmargin);
      this.items.push(item);
      this.refresh();
      this.applyAutoscroll(wasScrollAtBottom);
    }
    /**
     * Add a new item to a specific position in this list
     * @function addItemAtPosition
     * @memberof elation.ui.list#
     * @param {Object} item
     * @param {integer} position
     */
    addItemAtPosition(item, position) {
      this.items.splice(position, 0, item);
      //this.listitems.splice(position, 0, null);
      this.refresh();
    }
    /**
     * Resets the list to empty
     * @function clear
     * @memberof elation.ui.list#
     */
    clear() {
      var ul = this.getListElement();
      var items = this.items;
      for (var i = 0; i < items.length; i++) {
        if (items[i]) {
          var item = this.getlistitem(i);
          if (item.parentNode) {
            item.parentNode.removeChild(item);
          
            delete this.listitems[i];
            delete items[i];
          }
        }
      }
      this.listitems = [];
      //delete this.items;
      //ul.innerHTML = '';
    }
    /**
     * Get the elation.ui.listitem for a specified item, allocating as needed
     * @function getlistitem
     * @memberof elation.ui.list#
     * @param {Object} item
     * @returns {elation.ui.listitem}
     */
    getlistitem(itemnum) {
      if (this.items[itemnum] instanceof elation.elements.ui.item) {
        return this.items[itemnum];
      }
      var item = this.items[itemnum];
      for (var i = 0; i < this.listitems.length; i++) {
        if (this.listitems[i] && this.listitems[i].value === item) {
          return this.listitems[i];
        }
      }
      
      //if (!item) {
        // no existing listitem, allocate a new one
        item = this.createlistitem({
          value: item,
          selectable: this.selectable,
          draggable: this.draggable,
          nameattr: this.nameattr,
          childattr: this.childattr,
          labelattr: this.labelattr,
          titleattr: this.titleattr,
          disabledattr: this.disabledattr,
          itemtemplate: this.itemtemplate,
          itemcomponent: this.itemcomponent,
          itemplaceholder: this.itemplaceholder
        });
        elation.events.add(item, 'select', (ev) => this.handleSelect(ev));
        this.listitems.push(item);
      //}
      return item;
    }

    /**
     * Creates a new instance of an elation.ui.item
     * Can be overridden by inheriting classes to override the ui.item type
     * @param {Object} args
     */
    createlistitem(args) {
      let listitem = elation.elements.create(this.itemcomponent, args);
      listitem.setAttribute('role', (this.selectable ? 'option' : 'listitem'));
      //listitem.setAttribute('aria-label', 'test');
      return listitem;
    }

    /**
     * Updates the list item objects and the HTML representation of this list with any new or removed items
     * @function render
     * @memberof elation.ui.list#
     */
    render() {
      super.render();
      var ul = this.getListElement();

      // FIXME - this could be made more efficient in two ways:
      //   1) instead of removing all elements and then re-adding them in order, we should be
      //      able to figure out deletions, additions, and moves and apply them separately
      //   2) currently when we remove list items, we still keep a reference to the old object which gets
      //      reused if the same item is re-added.  this can be a performance optimization in some
      //      cases (automatic object reuse reduces gc if the same objects are added and removed repeatedly
      //      over the lifetime of the list), but can be a memory leak in cases where lots of 
      //      non-repeating data is added and removed.

      var items = this.items;

      if (!items) return;

/*
      for (var i = 0; i < items.length; i++) {
        if (items[i].parentNode == ul) {
          ul.removeChild(items[i]); 
        }
      }
*/
      if (items.length > 0) {
        if (this.emptyitem && this.emptyitem.parentNode == ul) {
          ul.removeChild(this.emptyitem);
        }
        for (var i = 0; i < items.length; i++) {
          var listitem = this.getlistitem(i);
          if (listitem.parentNode != ul) {
            ul.appendChild(listitem);
          }
          listitem.refresh();
        }
      } else if (this.emptyitem) {
        ul.appendChild(this.emptyitem);
      }
    }

    /**
     * Sorts the items in the list by the specified key
     * @function sort
     * @memberof elation.ui.list#
     * @param {string} sortby
     * @param {boolean} reverse
     */
    sort(sortby, reverse) {
      if (!reverse) reverse = false; // force to bool
      var ul = this.getListElement();

      // First, get the existing position of each item's element
      // Then get a sorted item list, and resort the elements in the DOM
      // Next, apply a transform to place the items back in their old positions
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
        items[i].container = this.listitems[i];
        items[i].oldpos = [this.listitems[i].offsetLeft, this.listitems[i].offsetTop];
        items[i].oldlistpos = this.items.indexOf(this.listitems[i].value);
      }

      // Remove and re-add all items from list, so DOM order reflects item order
      // FIXME - this could be much more efficient, and is probably the slowest part of the whole process
      for (var i = 0; i < items.length; i++) {
        elation.html.removeclass(items[i], 'state_animating');
        if (items[i].parentNode == ul) {
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
          elation.html.transform(this, 'translate3d(' + (this.diff[0]/2) + 'px,' + (this.diff[1]/2) + 'px, ' + this.z + 'px)', '50% 50%', 'all ' + (this.animatetime / 2) + 'ms ease-in');
        }), 0);

        // Finish animating to the new position, and zoom back in
        setTimeout(elation.bind(items[i], function() {
          elation.html.transform(this, 'translate3d(0, 0, 0)', '50% 50%', 'all ' + (this.animatetime / 2) + 'ms ease-out');
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
    setSortBy(sortby) {
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
    getVisibleItems() {
      var visible = [];
      for (var i = 0; i < this.listitems.length; i++) { 
        var li = this.listitems[i];
        if (li.offsetTop + li.offsetHeight >= this.scrollTop && li.offsetTop <= this.scrollTop + this.offsetHeight) { 
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
    selectall(state, exclude) {
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
     * @param {elation.ui.item} selection
     */
    setlastselection(selection) {
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
    scrollToBottom() {
      this.scrollTop = this.scrollHeight;
    }
    /**
     * Is the list currently scrolled to the bottom?
     * @function isScrollAtBottom
     * @memberof elation.ui.list#
     */
    isScrollAtBottom(margin=0) {
      return this.scrollTop + this.offsetHeight >= this.scrollHeight - margin;
    }
    applyAutoScroll(wasScrollAtBottom=true) {
      if (this.autoscroll && wasScrollAtBottom) {
        // Only autoscroll if the list was already near the bottom
        this.scrollToBottom();
        setTimeout(() => this.scrollToBottom(), 10);
      }
    }
    /**
     * Event handler: elation.ui.item#ui_list_item_select
     * @function ui_list_item_select
     * @memberof elation.ui.list#
     * @param {event} ev
     */
    handleSelect(ev) {
      var newselection = ev.element;

      // Ignore select events that bubble up from unrelated elements (eg, <textarea>)
      if (!(ev.element instanceof elation.elements.ui.item)) return;

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

      //if (this.multiselect) {
        // Make note of the most recently-clicked list item, for future interaction
        this.setlastselection(newselection);
      //}
      if (elation.events.wasDefaultPrevented(elation.events.fire({type: 'select', element: this, target: ev.element, data: ev.data}))) {
        ev.preventDefault();
      }
    }
    /**
     * Event handler: elation.collection.simple#collection_add
     * @function oncollection_add
     * @memberof elation.ui.list#
     * @param {event} ev
     */
    oncollection_add(ev) {
      let wasScrollAtBottom = this.isScrollAtBottom(this.autoscrollmargin);
      this.refresh();
      this.applyAutoScroll(wasScrollAtBottom);
    }
    /**
     * Event handler: elation.collection.simple#collection_remove
     * @function oncollection_remove
     * @memberof elation.ui.list#
     * @param {event} ev
     */
    oncollection_remove(ev) {
      let wasScrollAtBottom = this.isScrollAtBottom(this.autoscrollmargin);
      this.refresh();
      this.applyAutoScroll(wasScrollAtBottom);
    }
    /**
     * Event handler: elation.collection.simple#collection_move
     * @function oncollection_move
     * @memberof elation.ui.list#
     * @param {event} ev
     */
    oncollection_move(ev) {
      this.refresh();
    }
    /**
     * Event handler: elation.collection.simple#collection_load_begin
     * @function oncollection_load_begin
     * @memberof elation.ui.list#
     * @param {event} ev
     */
    oncollection_load_begin(ev) {
      this.clear();
      var ul = this.getListElement();
      ul.innerHTML = '';
      if (this.spinner) {
        this.appendChild(this.spinner);
        this.spinner.show();
      }
    }
    /**
     * Event handler: elation.collection.simple#collection_load
     * @function oncollection_load
     * @memberof elation.ui.list#
     * @param {event} ev
     */
    oncollection_load(ev) {
      let wasScrollAtBottom = this.isScrollAtBottom(this.autoscrollmargin);
      if (this.spinner) {
        this.removeChild(this.spinner);
      }
      this.refresh();
      this.applyAutoScroll(wasScrollAtBottom);
    }
    /**
     * Event handler: elation.collection.simple#collection_clear
     * @function oncollection_clear
     * @memberof elation.ui.list#
     * @param {event} ev
     */
    oncollection_clear(ev) {
      this.clear();
      var ul = this.getListElement();
      ul.innerHTML = '';
      this.refresh();
      this.applyAutoScroll(true);
    }

    /**
     * Event handler: keydown
     * @param {event} ev
     */
    handleKeydown(ev) {
      let dir = 0;
      if (ev.key == 'ArrowUp') {
        dir = -1;
        ev.stopPropagation();
        ev.preventDefault();
      } else if (ev.key == 'ArrowDown') {
        dir = 1;
        ev.stopPropagation();
        ev.preventDefault();
      }
      if (dir != 0) {
        if (this.lastselection) {
          let idx = this.listitems.indexOf(this.lastselection);
          let newidx = (idx + this.listitems.length + dir) % this.listitems.length;
          let newselection = this.listitems[newidx];
          this.selectall(false, [newselection]);
          newselection.select();
        } else {
          let newselection = this.listitems[0];
          this.selectall(false, [newselection]);
          newselection.select();
        }
      }
    }
  });
});

