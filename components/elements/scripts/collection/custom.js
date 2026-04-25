elation.require(['elements.collection.simple'], function() {
  /**
   * Collection whose items come from a user-supplied callback rather than
   * an internal array. Useful for exposing a non-array data structure as
   * a collection — e.g. a list of an object's properties, the entries of
   * a `Map`, or a computed view over some other application state.
   *
   * `itemcallback` is invoked on every read of `.items` and should return
   * the current array of items.
   *
   * @class custom
   * @hideconstructor
   * @category Collections
   * @augments elation.elements.collection.simple
   * @memberof elation.elements.collection
   * @example
   * // Expose Object.keys(window) as a live-updating collection
   * const globals = elation.elements.create('collection-custom', {
   *   itemcallback: () => Object.keys(window).map(k => ({ name: k }))
   * });
   *
   * @param {object} args
   * @param {function} args.itemcallback returns the current items array
   */
  elation.elements.define('collection.custom', class extends elation.elements.collection.simple {
    init() {
      super.init();
      this.defineAttributes({
        items: { type: 'array', get: this.getItemsFromCallback },
        itemcallback: { type: 'function' }
      });
console.log('INIT THE COLLECTION', this.itemcallback, this.getAttribute('itemcallback'));
    }
    create() {
console.log('CREATE THE COLLECTION', this.itemcallback, this.getAttribute('itemcallback'));
    }
    getItemsFromCallback() {
console.log('I need to call the callback', this.itemcallback, this);
      if (this.itemcallback && typeof this.itemcallback == 'function') {
        return this.itemcallback();
      }
      return [];
    }
  });
});

