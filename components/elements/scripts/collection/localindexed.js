elation.require(['elements.collection.indexed'], function() {

  /**
   * localStorage-backed indexed collection
   * Auto-save changes to localStorage, loads on init.
   * 
   * @class localindexed
   * @augments elation.collection.indexed
   * @memberof elation.collection
   *
   * @alias elation.collection.indexed
   * @param {object} args
   * @param {string} args.index
   * @param {string} args.storagekey
   *
   * @member {string}    storagekey
   */
  /**
   * Fired when this collection is saved
   * @event elation.collection.localindexed#collection_save
   * @type {Object}
   */
  /**
   * Fired when this collection starts fetching items
   * @event elation.collection.localindexed#collection_load_begin
   * @type {Object}
   */
  /**
   * Fired when this collection has fetched items
   * @event elation.collection.localindexed#collection_load
   * @type {Object}
   */
  elation.elements.define('collection.localindexed', class extends elation.elements.collection.indexed {
    init() {
      super.init();
      this.defineAttributes({
        storagekey: { type: 'string' },
      });
      if (!elation.utils.isEmpty(this.storagekey)) {
        this.load(this.storagekey);
      }
      elation.events.add(window, 'storage', (ev) => { if (ev.key == this.storagekey) this.load() });
    }
    add(item, pos) {
      var changed = super.add(item, pos);
      if (changed) {
        this.save();
      }
    }
    move(item, pos) {
      var changed = super.move(item, pos);
      if (changed) {
        this.save();
      }
    }
    remove(item) {
      var changed = super.remove(item);
      if (changed) {
        this.save();
      }
    }
    save(key) {
      if (!key) key = this.storagekey;
      try {
        localStorage[this.storagekey] = JSON.stringify(this.items);
        elation.events.fire({type: "collection_save", element: this});
        return true;
      } catch (e) {
        console.error(e.stack);
      }
      return false;
    }
    load(key) {
      if (!key) key = this.storagekey;
      if (!elation.utils.isEmpty(localStorage[this.storagekey])) {
        try {
          elation.events.fire({type: "collection_load_begin", element: this});
          this.items = JSON.parse(localStorage[this.storagekey]);
          this.buildindex();
          elation.events.fire({type: "collection_load", element: this});
          return true;
        } catch (e) {
          console.error(e.stack);
        }
      }
      return false;
    }
    buildindex() {
      for (var i = 0; i < this.items.length; i++) {
        var idx = this.getindex(this.items[i]);
        this.itemindex[idx] = this.items[i];
      }
    }
  });
});
