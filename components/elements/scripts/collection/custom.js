elation.require(['elements.collection.simple'], function() {
  /** 
   * Custom data collection
   * Emits events when items are read, added, removed, etc. to allow arbitrary user-specified item backends
   * (For example, a collection which lists all the properties an object contains)
   *
   * @class custom
   * @augments elation.collection.simple
   * @memberof elation.collection
   * @alias elation.collection.custom
   *
   * @param {object} args
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

