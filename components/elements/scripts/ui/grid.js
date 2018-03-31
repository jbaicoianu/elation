/** 
 * Grid UI element
 *
 * @class grid
 * @augments elation.ui.list
 * @memberof elation.ui
 * @alias elation.ui.grid
 *
 * @param {object}    args
 * @param {string}    args.tag
 * @param {string}    args.classname
 * @param {string}    args.title
 * @param {boolean}   args.draggable
 * @param {boolean}   args.hidden
 * @param {string}    args.orientation
 * @param {string}    args.sortbydefault
 * @param {array}     args.items
 * @param {object}    args.attrs
 * @param {elation.collection.simple} args.itemcollection
 */
elation.require(['elements.ui.list'], function() {
  elation.requireCSS('ui.grid');

  elation.elements.define('ui.grid', class extends elation.elements.ui.list {
    init() {
      super.init();
    }
  });
});

