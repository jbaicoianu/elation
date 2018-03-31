elation.require(['elements.collection.simple'], function() {
  /** 
   * Indexed data collection
   * Uses the specified index parameter to enforce uniqueness
   *
   * @class indexed
   * @augments elation.collection.simple
   * @memberof elation.collection
   * @alias elation.collection.indexed
   *
   * @param {object}   args
   * @param {string}   args.index          Name of property to use for indexing
   * @param {function} args.indextransform Transform function for normalizing index keys
   *
   */
  elation.elements.define('collection.indexed', class extends elation.elements.collection.simple {
    /**
     * @member {string}   index
     * @member {function} indextransform
     * @member {Array}    itemindex
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
  });
});

