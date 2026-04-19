elation.require(['elements.collection.api'], function() {
  /** 
   * JSON API-backed data collection
   * Provides a collection interface to a JSON REST API
   *
   * @class jsonapi
   * @category Collections
   * @augments elation.elements.collection.api
   * @memberof elation.elements.collection
   *
   * @param {object} args
   * @param {string} args.host
   * @param {string} args.endpoint
   * @param {object} args.apiargs
   * @param {object} args.datatransform
   * @param {function} args.datatransform.items
   * @param {function} args.datatransform.count
   */
  elation.elements.define('collection.jsonapi', class extends elation.elements.collection.api {
    parseData(data) {
      return JSON.parse(data);
    }
  });
});
