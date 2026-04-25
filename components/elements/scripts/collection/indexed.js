elation.require(['elements.collection.simple'], function() {
  /**
   * Collection that enforces uniqueness on a per-item key. Adding an item
   * whose `index` value already exists merges the new properties into the
   * existing item rather than creating a duplicate, making this useful as
   * a primary-key store for incremental updates from an API.
   *
   * Set `indextransform` to normalize keys before lookup — e.g. lowercase
   * a username or strip whitespace.
   *
   * Base class for `localindexed` (localStorage persistence) and `sqlite`
   * (Node.js sqlite3 persistence).
   *
   * @class indexed
   * @hideconstructor
   * @category Collections
   * @augments elation.elements.collection.simple
   * @memberof elation.elements.collection
   * @example
   * const products = elation.elements.create('collection-indexed', { index: 'sku' });
   * products.add({ sku: 'A100', name: 'Widget' });
   * products.add({ sku: 'A100', price: 9.99 });
   * // → { sku: 'A100', name: 'Widget', price: 9.99 }
   *
   * @param {object}   args
   * @param {string}   args.index          property name used as the unique key
   * @param {function} args.indextransform optional `(key) => normalizedKey`
   */
  elation.elements.define('collection.indexed', class extends elation.elements.collection.simple {
    /**
     * @function init
     * @memberof elation.elements.collection.indexed#
     */
    init() {
      super.init();
      this.defineAttributes({
        index: { type: 'string' },
        indextransform: { type: 'function' },
      });
      this.itemindex = {};
    }
    add(item, pos) {
      var idx = this.getindex(item);
      if (!(idx in this.itemindex)) {
        this.itemindex[idx] = item;
        return super.add(item, pos);
      } else if (!elation.utils.isNull(pos)) {
        var realitem = this.itemindex[idx];
        if (this.items[pos] != realitem) {
          this.move(realitem, pos);
        }
        var changed = false;
        // Update with new properties
        for (var k in item) {
          if (realitem[k] != item[k]) {
            realitem[k] = item[k];
            changed = true;
          }
        }
        if (changed) return true;
      } else {
        var i = this.find(this.itemindex[idx]);
        this.itemindex[idx] = item;
        if (i != -1) {
          this.items[i] = item;
        } else {
          this.items.push(item);
        }
        return true;
      }
      return false;
    }
    remove(item) {
      var idx = this.getindex(item);
      if (idx in this.itemindex) {
        var realitem = this.itemindex[idx];
        delete this.itemindex[idx];
        return super.remove(realitem);
      }
      return false;
    }
    find(item) {
      var idx = this.getindex(item);
      if (!elation.utils.isNull(this.itemindex[idx])) {
        return super.find(this.itemindex[idx]);
      }
      return super.find(item);
    }
    getlength() {
      return Object.keys(this.itemindex).length;
    }
    getindex(idx) {
      if (!elation.utils.isString(idx)) {
        idx = idx[this.index];
      }
      if (this.indextransform) {
        idx = this.indextransform(idx);
      }
      return idx;
    }
    save(key) {
    }
  });
});

