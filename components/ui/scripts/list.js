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
 * @param {boolean}   args.hidden
 * @param {string}    args.orientation
 * @param {string}    args.sortbydefault
 * @param {array}     args.items
 * @param {object}    args.attrs
 * @param {elation.container.simple} args.itemcontainer
 */
elation.component.add('ui.list', function() {
  this.defaultcontainer = {tag: 'ul', classname: 'ui_list'};

  this.init = function(name, container, args) {
    this.tag = this.args.tag || this.container.tagName || 'DIV';
    this.classname = this.args.classname || "";
    this.title = this.args.title || false;
    this.draggable = this.args.draggable || false;
    this.events = this.args.events || {}
    this.orientation = this.args.orientation || 'vertical';
    this.items = [];
    this.listitems = [];

    this.dirty = false;

    this.animatetime = 850;

    if (this.classname) {
      elation.html.addclass(this.container, this.classname);
    }

    this.setOrientation(this.orientation);

    if (this.args.sortbydefault) {
      this.setSortBy(this.args.sortbydefault);
    }
    if (this.args.hidden) {
      this.hide();
    }
    if (this.args.itemcontainer) {
      this.setItemContainer(this.args.itemcontainer);
    } else if (this.args.items) {
      this.setItems(this.args.items);
    } else {
      this.extractItems();
    }
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
    return attrs;
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
    } else {
      for (var k in items) {
        this.items.push(items[k]);
      }
    }
    this.refresh();
  }
  /**
   * Links this list component with a container to automatically handle updates when data changes
   * @function setItemContainer
   * @memberof elation.ui.list#
   * @param {elation.collection.simple} itemcontainer  
   */
  this.setItemContainer = function(itemcontainer) {
    if (this.itemcontainer) {
      elation.events.remove(this.itemcontainer, "container_add,container_remove,container_move", this);
    }
    this.itemcontainer = itemcontainer;
    this.setItems(this.itemcontainer.items);
    elation.events.add(this.itemcontainer, "container_add,container_remove,container_move,container_load,container_clear", this);
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
        items.push({label: node.innerText});
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
    this.items = [];
    ul.innerHTML = '';
  }
  /**
   * Get the elation.ui.listitem for a specified item, allocating as needed
   * @function getlistitem
   * @memberof elation.ui.list#
   * @param {Object} item
   * @returns {elation.ui.listitem}
   */
  this.getlistitem = function(item) {
    var attrs = this.getDefaultAttributes();
    for (var i = 0; i < this.listitems.length; i++) {
      if (this.listitems[i].value === item) {
        return this.listitems[i];
      }
    }
    
    // no existing listitem, allocate a new one
    var newlistitem = elation.ui.listitem(null, elation.html.create({tag: 'li'}), {item: item, attrs: attrs});
    this.listitems.push(newlistitem);
    elation.events.add(newlistitem, 'ui_list_item_select', this);
    return newlistitem;
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
        var listitem = this.getlistitem(this.items[i]);
        if (listitem.container.parentNode != ul) {
          ul.appendChild(listitem.container);
        }
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

    // Resort list items
    // FIXME - should also update this.items to reflect new order
    this.listitems.sort(function(a, b) {
      var val1 = elation.utils.arrayget(a.value, sortby),
          val2 =  elation.utils.arrayget(b.value, sortby);
      if ((val1 < val2) ^ reverse) return -1;
      else if ((val1 > val2) ^ reverse) return 1;
      else return 0;
    });
    var items = [];
    // First calculate existing position of all items
    for (var i = 0; i < this.listitems.length; i++) {
      items[i] = {
        container: this.listitems[i].container,
        oldpos: [this.listitems[i].container.offsetLeft, this.listitems[i].container.offsetTop]
      };
    }

    // Remove and re-add all items from list, so DOM order reflects item order
    // FIXME - this could be much more efficient, and is probably the slowest part of the whole process
    for (var i = 0; i < items.length; i++) {
      elation.html.removeclass(items[i].container, 'state_animating');
      ul.removeChild(items[i].container);
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
    if (this.sortby) {
      elation.html.removeclass(this.container, 'ui_list_sortby_' + this.sortby);
    }
    this.sortby = sortby;
    elation.html.addclass(this.container, 'ui_list_sortby_' + this.sortby);
  }
  /**
   * Event handler: elation.ui.listitem#ui_list_item_select
   * @function ui_list_item_select
   * @memberof elation.ui.list#
   * @param {event} ev
   */
  this.ui_list_item_select = function(ev) {
    if (this.selecteditem) {
      this.selecteditem.unselect();
    }
    this.selecteditem = ev.target;
    elation.events.fire({type: 'ui_list_select', element: this, data: ev.data});
  }
  /**
   * Event handler: elation.container.simple#container_add
   * @function container_add
   * @memberof elation.ui.list#
   * @param {event} ev
   */
  this.container_add = function(ev) {
    this.refresh();
  }
  /**
   * Event handler: elation.container.simple#container_remove
   * @function container_remove
   * @memberof elation.ui.list#
   * @param {event} ev
   */
  this.container_remove = function(ev) {
    this.refresh();
  }
  /**
   * Event handler: elation.container.simple#container_move
   * @function container_move
   * @memberof elation.ui.list#
   * @param {event} ev
   */
  this.container_move = function(ev) {
    this.refresh();
  }
  /**
   * Event handler: elation.container.simple#container_load
   * @function container_load
   * @memberof elation.ui.list#
   * @param {event} ev
   */
  this.container_load = function(ev) {
    this.refresh();
  }
  /**
   * Event handler: elation.container.simple#container_clear
   * @function container_clear
   * @memberof elation.ui.list#
   * @param {event} ev
   */
  this.container_clear = function(ev) {
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
 * @param {object} args
 * @param {object} args.item
 * @param {object} args.attrs
 */
elation.component.add('ui.listitem', function() {
  this.init = function() {
    this.value = this.args.item;
    this.attrs = this.args.attrs || {};

    elation.html.addclass(this.container, 'ui_list_item');
    if (this.value) {
      if (this.value.classname) {
        elation.html.addclass(this.container, this.value.classname);
      }

      var filled = false;
      if (this.value instanceof elation.component.base) {
        this.container.appendChild(this.value.container);
        filled = true;
      } else if (this.attrs.itemtemplate) {
        this.container.innerHTML = elation.template.get(this.attrs.itemtemplate, this.value);
        filled = true;
      } else if (this.attrs.itemcomponent) {
        var itemcomponentclass = elation.utils.arrayget(elation, this.attrs.itemcomponent);
        if (itemcomponentclass) {
          var itemcomponent = itemcomponentclass(null, this.container, this.value);
          filled = true;
        }
      } 
      if (!filled) {
        if (elation.utils.isString(this.value)) {
          this.container.innerHTML = this.value;
        } else if (this.value[this.attrs.label]) {
          this.container.innerHTML = this.value[this.attrs.label];
        }
      }

      if (!elation.utils.isEmpty(this.attrs.disabled) && !elation.utils.isEmpty(this.value[this.attrs.disabled])) {
        elation.html.addclass(this.container, "state_disabled");
      }
    }
    elation.events.add(this.container, 'click', this);
  }
  /**
   * Set this list item as being selected
   * @function select
   * @memberof elation.ui.listitem#
   * @emits elation.ui.listitem#ui_list_item_select
   */
  this.select = function() {
    elation.html.addclass(this.container, 'state_selected');
    elation.events.fire({type: 'ui_list_item_select', element: this, data: this.value});
  }
  /**
   * Set this list item as being unselected
   * @function unselect
   * @memberof elation.ui.listitem#
   * @emits elation.ui.listitem#ui_list_item_unselect
   */
  this.unselect = function() {
    elation.html.removeclass(this.container, 'state_selected');
    elation.events.fire({type: 'ui_list_item_unselect', element: this, data: this.value});
  }
  /**
   * Event handler: HTML element click
   * @function click
   * @memberof elation.ui.listitem#
   * @param {event} ev
   */
  this.click = function(ev) {
    this.select();
  }
});
