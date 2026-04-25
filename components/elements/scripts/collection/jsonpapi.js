elation.require(['elements.collection.api'], function() {
  /**
   * JSONP-backed data collection. Loads via a `<script>` tag and a global
   * callback, which sidesteps CORS for cross-origin endpoints that don't
   * set the right headers. The callback URL parameter name defaults to
   * `callback`; set `callbackarg` if the API uses a different name.
   *
   * @class jsonpapi
   * @hideconstructor
   * @category Collections
   * @augments elation.elements.collection.api
   * @memberof elation.elements.collection
   * @example
   * const photos = elation.elements.create('collection-jsonpapi', {
   *   host: 'https://photos.example.com',
   *   endpoint: '/feed',
   *   apiargs: { tag: 'sunset' },
   *   callbackarg: 'jsonp'
   * });
   *
   * @param {object} args
   * @param {string} args.host
   * @param {string} args.endpoint
   * @param {object} args.apiargs
   * @param {string} args.callbackarg
   * @param {object} args.datatransform
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
