elation.require(['elements.collection.simple'], function() {
  /** 
   * Filter collection
   * Apply the specified filter to the parent list, and present it as its own collection
   *
   * @class filter
   * @augments elation.collection.simple
   * @memberof elation.collection
   * @alias elation.collection.filter
   *
   * @param {object} args
   * @param {elation.collection.simple} args.parent List to filter
   * @param {function} args.filterfunc Callback function for filtering list 
   *
   * @member {object}   parent
   * @member {function} filterfunc
   *
   */
  /**
   * Fired when this collection has fetched items
   * @event elation.collection.filter#collection_load
   * @type {Object}
   */
  elation.elements.define('collection.filter', class extends elation.elements.collection.simple {
    init() {
      super.init();
      this.defineAttributes({
        parent: { type: 'object' },
        filterfunc: { type: 'function' },
        items: { type: 'array', get: this.getfiltereditems }
      });
      // TODO - attach events to the parent, so we can respond to its events and emit our own as necessary
    }
    getfiltereditems() {
      //if (!this.filtered) {
        var items = this.parent.items;
        var filtered = [];
        for (var i = 0; i < items.length; i++) {
          if (this.filterfunc(items[i])) {
            filtered.push(items[i]);
          }
        }
        this.filtered = filtered;
      //}
      return this.filtered;
    }
    update() {
      elation.events.fire({type: "collection_load", element: this});
    }
    clear() {
      this.filtered = false;
      elation.events.fire({type: "collection_clear", element: this});
    }
  });
});
