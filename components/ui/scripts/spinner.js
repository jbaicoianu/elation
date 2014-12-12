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
elation.require(["ui.base", "utils.template"], function() {
  elation.requireCSS("ui.spinner");

  elation.component.add('ui.spinner', function() {
    this.defaultcontainer = { tag: 'div', classname: 'ui_spinner' };

    this.types = {
      'default': '<div class="loading-container"><div class="loading"></div><div class="loading-text">{label}</div></div>',
      'dark': '<div class="loading-container dark"><div class="loading"></div><div class="loading-text">{label}</div></div>'
    };

    this.init = function() {
      this.addclass('ui_spinner');
      if (this.args.classname) {
        this.addclass(this.args.classname);
      }
      if (this.args.full) {
        this.addclass('state_full');
      }
      this.label = this.args.label || 'loading';
      this.settype(this.args.type);
    }
    this.settype = function(type) {
      if (!type) type = 'default';
      if (this.type) {
        elation.html.removeclass(this.container, 'ui_spinner_' + this.type);
      }

      elation.template.add('ui.spinner.types.' + type, this.types[type]);
      this.type = type;
      elation.html.addclass(this.container, 'ui_spinner_' + this.type);
      //this.container.innerHTML = this.types[this.type];
      this.container.innerHTML = elation.template.get('ui.spinner.types.' + type, this);
    }
  }, elation.ui.base);
});
