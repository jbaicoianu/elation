/** 
 * Simple spinner UI component
 * Displays a fancy spinner while content is loading
 *
 * @class spinner
 * @augments elation.ui.base
 * @memberof elation.ui
 *
 * @param {object} args
 * @param {string} args.type
 */
elation.require("ui.base", function() {
  elation.component.add('ui.spinner', function() {
    this.defaultcontainer = { tag: 'div', classname: 'ui_spinner' };

    this.types = {
      'default': '<div class="loading-container"><div class="loading"></div><div class="loading-text">loading</div></div>',
      'dark': '<div class="loading-container dark"><div class="loading"></div><div class="loading-text">loading</div></div>'
    };

    this.init = function() {
      elation.html.addclass(this.container, 'ui_spinner');
      if (this.args.classname) {
        elation.html.addclass(this.container, this.args.classname);
      }
      this.settype(this.args.type);
    }
    this.settype = function(type) {
      if (!type) type = 'default';
      if (this.type) {
        elation.html.removeclass(this.container, 'ui_spinner_' + this.type);
      }

      this.type = type;
      elation.html.addclass(this.container, 'ui_spinner_' + this.type);
      this.container.innerHTML = this.types[this.type];
    }
  }, elation.ui.base);
});
