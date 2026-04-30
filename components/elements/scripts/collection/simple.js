elation.require(['elements.base'], function() {
  /**
   * Fired when new objects are added to this collection
   * @event elation.elements.collection.simple#collection_add
   * @type {Object}
   */
  /**
   * Fired when new objects are removed from this collection
   * @event elation.elements.collection.simple#collection_remove
   * @type {Object}
   */
  /**
   * Fired when an object is moved to a new position within this collection
   * @event elation.elements.collection.simple#collection_move
   * @type {Object}
   */
  /**
   * Fired when this collection is cleared
   * @event elation.elements.collection.simple#collection_clear
   * @type {Object}
   */

  /**
   * In-memory data collection. Holds an ordered array of items and emits
   * `collection_add` / `collection_remove` / `collection_move` /
   * `collection_clear` events when the contents change. Bind a list-style
   * UI element (`ui.list`, `ui.grid`, `ui.tabs`, …) to a collection by
   * setting its `collection` attribute and the UI element will keep itself
   * in sync with the data automatically.
   *
   * Base class for every other collection in the library — REST-backed
   * (`api`, `jsonapi`, `jsonpapi`), index-enforced (`indexed`,
   * `localindexed`, `sqlite`), and derivers (`filter`, `subset`, `custom`).
   *
   * @class simple
   * @hideconstructor
   * @category Collections
   * @augments elation.elements.base
   * @memberof elation.elements.collection
   * @example
   * const people = elation.elements.create('collection-simple', {
   *   items: [{ name: 'Ada' }, { name: 'Grace' }]
   * });
   * people.add({ name: 'Hedy' });
   * elation.events.add(people, 'collection_add', ev => console.log('+', ev.data.item));
   *
   * @param {object} args
   * @param {array} args.items
   * @param {boolean} args.allowduplicates
   * @param {object} args.datatransform
   */
  elation.elements.define('collection.simple', class extends elation.elements.base {
    init() {
      super.init();
      this.defineAttributes({
        items: { type: 'array', default: [] },
        length: { type: 'integer', get: this.getlength },
        allowduplicates: { type: 'boolean', default: false },
        datatransform: { type: 'object', default: {} }
      });

      //this.items = [];
    }

    /**
     * Add an item, optionally at a specified position
     * @function add
     * @memberof elation.elements.collection.simple#
     * @param {object} item
     * @param {integer} pos
     * @returns {boolean}
     * @emits collection_add
     */
    add(item, pos) {
      if (this.allowduplicates || !this.contains(item)) {
        if (pos == undefined || pos >= this.items.length) {
          this.items.push(item);
        } else {
          this.items.splice(pos, 0, item);
        }
        elation.events.fire({type: 'collection_add', element: this, data: {item: item}, itemcount: this.items.length});
        return true;
      }
      return false;
    }
    /**
     * Remove an item
     * @function remove
     * @memberof elation.elements.collection.simple#
     * @param {object} item
     * @returns {boolean}
     * @emits collection_remove
     */
    remove(item) {
      var idx = this.find(item);
      if (idx != -1) {
        this.items.splice(idx, 1);
        elation.events.fire({type: 'collection_remove', element: this, data: {item: item}, itemcount: this.items.length});
        return true;
      }
      return false;
    }
    /**
     * Move an item to a new position
     * @function move
     * @memberof elation.elements.collection.simple#
     * @param {object} item
     * @param {integer} pos
     * @returns {boolean}
     * @emits collection_move
     */
    move(item, pos) {
      var idx = this.items.indexOf(item);
      if (idx != -1 && idx != pos) {
        this.items.splice(idx, 1);
        this.items.splice(pos, 0, item);
        elation.events.fire({type: 'collection_move', element: this, data: {item: item, from: idx, to: pos}, itemcount: this.items.length});
        return true;
      }
      return false;
    }
    /**
     * Return the item index of the specified item
     * @function find
     * @memberof elation.elements.collection.simple#
     * @param {object} item
     * @returns {integer}
     */
    find(item) {
      return this.items.indexOf(item);
    }
    /**
     * Check whether the specified item exists in this dataset
     * @function contains
     * @memberof elation.elements.collection.simple#
     * @param {object} item
     * @returns {boolean}
     */
    contains(item) {
      return this.find(item) != -1;
    }
    /**
     * Get a reference to the specified item
     * @function get
     * @memberof elation.elements.collection.simple#
     * @returns {object}
     */
    get(item) {
      var idx = this.find(item);
      if (idx != -1) {
        return this.items[idx];
      }
      return null;
    }
    /**
     * Returns the number of items contained in this collection
     * @function getlength
     * @memberof elation.elements.collection.simple#
     * @returns {integer}
     */
    getlength() {
      return this.items.length;
    }
    /**
     * Clear all items from the list
     * @function clear
     * @memberof elation.elements.collection.simple#
     * @returns {boolean}
     * @emits collection_clear
     */
    clear() {
      this.items.splice(0, this.items.length);
      elation.events.fire({type: "collection_clear", element: this});
    }
    filter(filterfunc, filterargs) {
      //return elation.collection.filter({parent: this, filterfunc: filterfunc, filterargs: filterargs});
      var filtered = elation.elements.create('collection-filter', {
        append: this,
        filterfunc: filterfunc,
        filterargs: filterargs
      });
      return filtered;
    }
    subset(datatransform) {
      return elation.collection.subset({parent: this, datatransform: datatransform});
    }
    transformData(data) {
      var transformed = {};
      if (this.datatransform.items) {
        transformed.items = this.datatransform.items(data);
      } else {
        transformed.items = data;
      }
      if (this.datatransform.count) {
        transformed.count = this.datatransform.count(data);
      } else {
        transformed.count = (transformed.items ? transformed.items.length : 0);
      }
      return transformed;
    }
  });
});

