elation.require(['elements.collection.simple'], function() {
  /** 
   * API-backed data collection
   * Provides a collection interface to a REST API
   *
   * @class api
   * @augments elation.collection.simple
   * @memberof elation.collection
   * @alias elation.collection.api
   *
   * @param {object} args
   * @param {string} args.host
   * @param {string} args.endpoint
   * @param {object} args.apiargs
   * @param {object} args.datatransform
   * @param {function} args.datatransform.items
   * @param {function} args.datatransform.count
   *
   * @member {string}    host
   * @member {string}    endpoint
   * @member {object}    apiargs
   * @member {object}    datatransform
   * @member {function}  datatransform.items
   * @member {function}  datatransform.count
   * @member {object}    data
   */
  /**
   * Fired when this collection starts fetching items
   * @event elation.collection.api#collection_load_begin
   * @type {Object}
   */
  /**
   * Fired when this collection has fetched items
   * @event elation.collection.api#collection_load
   * @type {Object}
   */

  elation.elements.define('collection.api', class extends elation.elements.collection.simple {
    init() {
      super.init();
      this.defineAttributes({
        host: { type: 'string', default: '' },
        endpoint: { type: 'string' },
        apiargs: { type: 'object' },
        itempath: { type: 'string' },
        items: { type: 'array', get: this.getitems }
      });
    }
    getURL() {
      var url = this.host + this.endpoint;
      if (this.apiargs) {
        url += (url.indexOf('?') == -1 ? '?' : '&') + elation.utils.encodeURLParams(this.apiargs);
      }
      return url;
    }
    load() {
      if (this.loading) {
        this.cancel();
      }
      this.loading = true;
      var url = this.getURL();
      elation.events.fire({type: "collection_load_begin", element: this});
      this.xhr = elation.net.get(url, null, { callback: elation.bind(this, function(d) { this.clear(); this.processResponse(d); }) });
    }
    clear() {
      if (this.data) {
        this.data.items.splice(0, this.items.length);
        this.data.count = 0;
      }
      this.rawdata = null;
      elation.events.fire({type: "collection_clear", element: this});
    }
    cancel() {
      if (this.xhr) {
        console.log('stop it!', this.xhr);
        this.xhr.abort();
      }
    }
    append() {
      var url = this.getURL();
      elation.net.get(url, this.apiargs, { callback: elation.bind(this, this.processResponse) });
    }
    getitems() {
      if (!this.data) {
        this.data = { items: [], count: 0 };
        this.load();
      }
      return this.data.items;
    }
    getlength() {
      if (!this.data) {
        this.data = { items: [], count: 0 };
        this.load();
      }
      return this.data.count;
    }
    processResponse(data, args) {
      this.rawdata = this.parseData(data);
      var newdata = this.transformData(this.rawdata);
      if (!this.data) {
        this.data = { items: [], count: 0 };
      }
      if (newdata.items) {
        Array.prototype.push.apply(this.data.items, newdata.items);
      }
      if (newdata.count) {
        this.data.count = newdata.count;
      }
      this.loading = false;
      elation.events.fire({type: "collection_load", element: this});
    }
    parseData(data) {
      return data;
    }
    transformData(data) {
      var transformed = {};
      if (this.datatransform.items) {
        transformed.items = this.datatransform.items(data);
      } else if (this.itempath) {
        transformed.items = elation.utils.arrayget(data, this.itempath);
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

