elation.require(['elements.collection.simple'], function() {
  /**
   * Derived collection that exposes a subset of a parent's items selected
   * by a user-supplied predicate. Re-evaluates `filterfunc` against every
   * parent item on each read; bind it to a list and the list updates as
   * the parent's data changes.
   *
   * @class filter
   * @hideconstructor
   * @category Collections
   * @augments elation.elements.collection.simple
   * @memberof elation.elements.collection
   * @example
   * const activeUsers = elation.elements.create('collection-filter', {
   *   parent: users,
   *   filterfunc: u => u.active && !u.archived
   * });
   *
   * @param {object} args
   * @param {elation.elements.collection.simple} args.parent collection to filter
   * @param {function} args.filterfunc predicate `(item) => boolean`
   */
  /**
   * Fired when this collection has fetched items
   * @event elation.elements.collection.filter#collection_load
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
        var items = this.parentNode.items;
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
