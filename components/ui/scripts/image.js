/** 
 * Simple IMG wrapper
 *
 * @class image
 * @augments elation.ui.base
 * @memberof elation.ui
 *
 * @param {object} args
 * @param {string} args.src
 */
elation.require("ui.base", function() {
  elation.component.add("ui.image", function() {
    this.defaultcontainer = {tag: 'img', classname: 'ui_image'};

    this.init = function() {
      this.addPropertyProxies(['src', 'width', 'height']);
      if (this.args.src) {
        this.src = this.args.src;
      }
      if (this.args.classname) {
        elation.html.addclass(this.container, this.args.classname);
      }

      if (this.args.hidden) {
        this.hide();
      }
    }
  }, elation.ui.base);
});
