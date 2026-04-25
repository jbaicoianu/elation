elation.require(['elements.collection.api'], function() {
  /**
   * REST-backed data collection that parses responses as JSON. Identical
   * to `collection.api` except the body is deserialized via `JSON.parse`
   * before reaching `datatransform`. Use this for any JSON API; the parent
   * `api` class hands raw response text to the transform.
   *
   * @class jsonapi
   * @hideconstructor
   * @category Collections
   * @augments elation.elements.collection.api
   * @memberof elation.elements.collection
   * @example
   * const projects = elation.elements.create('collection-jsonapi', {
   *   host: 'https://api.example.com',
   *   endpoint: '/projects',
   *   itempath: 'results'
   * });
   *
   * @param {object} args
   * @param {string} args.host
   * @param {string} args.endpoint
   * @param {object} args.apiargs
   * @param {string} args.itempath
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
