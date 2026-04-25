elation.require(['elements.collection.simple'], function() {
  /**
   * Derived collection produced by transforming a parent's raw response
   * data. Where `filter` operates on already-parsed items via a predicate,
   * `subset` runs on `parent.rawdata` (typically a fresh server response)
   * and is meant for cases where a single API call backs multiple list
   * views — e.g. one collection holds the response, several subsets each
   * pull out a different slice.
   *
   * Configure the slice via `datatransform.items` / `datatransform.count`
   * inherited from `simple`, the same way you'd shape a non-flat API
   * response in `collection.api`.
   *
   * @class subset
   * @hideconstructor
   * @category Collections
   * @augments elation.elements.collection.simple
   * @memberof elation.elements.collection
   * @example
   * const admins = elation.elements.create('collection-subset', {
   *   parent: users,
   *   datatransform: {
   *     items: data => data.users.filter(u => u.role === 'admin'),
   *     count: data => data.users.filter(u => u.role === 'admin').length
   *   }
   * });
   *
   * @param {object} args
   * @param {elation.elements.collection.simple} args.parent source collection
   * @param {object} args.datatransform
   * @param {function} args.datatransform.items
   * @param {function} args.datatransform.count
   */
  /**
   * Fired when this collection has fetched items
   * @event elation.elements.collection.subset#collection_load
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

