elation.require(['elements.collection.api'], function() {
  /** 
   * JSONP API-backed data collection
   * Provides a collection interface to a JSONP REST API
   *
   * @class jsonpapi
   * @augments elation.collection.api
   * @memberof elation.collection
   * @alias elation.collection.jsonpapi
   *
   * @param {object} args
   * @param {string} args.host
   * @param {string} args.endpoint
   * @param {object} args.apiargs
   * @param {object} args.callbackarg
   * @param {function} args.datatransform.items
   * @param {function} args.datatransform.count
   */
  elation.elements.define('collection.jsonpapi', class extends elation.elements.collection.api {
    load() {
      if (this.loading) {
        this.cancel();
      }
      this.loading = true;

      var callbackarg = this.args.callbackarg || 'callback';
      this.apiargs[callbackarg] = 'elation.' + this.componentname + '("' + this.id + '").processResponse';

      var url = this.getURL();
      elation.events.fire({type: "collection_load_begin", element: this});

      this.script = elation.html.create('SCRIPT');
      this.script.src = url;

      document.head.appendChild(this.script);
    }
  });
});
