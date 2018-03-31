elation.require(['elements.collection.simple'], function() {
  /** 
   * Subset collection
   * Subset the data from the parent collection
   *
   * @class subset
   * @augments elation.collection.simple
   * @memberof elation.collection
   * @alias elation.collection.subset
   *
   * @param {object} args
   * @param {elation.collection.simple} args.parent List to subset
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
  elation.elements.define('collection.subset', class extends elation.elements.collection.simple {
    init() {
      super.init();
      this.defineAttributes({
        parent: { type: 'object' },
        items: { type: 'array', get: this.getsubsetitems }
      });
      // TODO - probably need to proxy the rest of the collection events as well
      elation.events.add(this.parent, 'collection_load,collection_clear', elation.bind(this, this.proxyevent));
    }
    getsubsetitems() {
      // TODO - we should cache this so we don't have to transform multiple times for the same dataser
      var subset = this.transformData(this.parent.rawdata);
      return subset.items || [];
    }
    getlength() {
      var subset = this.transformData(this.parent.rawdata);
      return subset.count || 0
    }
    update() {
      elation.events.fire({type: "collection_load", element: this});
    }
    proxyevent(ev) {
      console.log('proxy it!', ev.type, ev);
      elation.events.fire({type: ev.type, element: this});
    }
  });
});

