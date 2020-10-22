/** 
 * Simple spinner UI component
 * Displays a fancy spinner while content is loading
 *
 * @class spinner
 * @augments elation.elements.base
 * @memberof elation.elements.ui
 *
 * @param {object} args
 * @param {string} args.type
 */
elation.require(['elements.elements'], function() {
  elation.requireCSS("elements.ui.spinner");

  elation.elements.define('ui.spinner', class extends elation.elements.base {
    init() {
      super.init();

      this.defaultcontainer = { tag: 'div', classname: 'ui_spinner' };
      this.defineAttributes({
        label: { type: 'string', default: 'loading' },
        type: { type: 'string', default: 'default' },
        full: { type: 'boolean', default: false }
      });

      this.types = {
        'default': '<div class="loading-container"><div class="loading"></div><div class="loading-text">{label}</div></div>',
        'dark': '<div class="loading-container dark"><div class="loading"></div><div class="loading-text">{label}</div></div>'
      };
    }

    create() {
      this.settype(this.type);
    }
    settype(type) {
      if (!type) type = 'default';
      if (this.type) {
        elation.html.removeclass(this.container, 'ui_spinner_' + this.type);
      }

      elation.template.add('ui.spinner.types.' + type, this.types[type]);
      this.type = type;
      elation.html.addclass(this.container, 'ui_spinner_' + this.type);
      //this.innerHTML = this.types[this.type];
      this.innerHTML = elation.template.get('ui.spinner.types.' + type, this);
    }
    setlabel(label) {
      this.label = label;
      this.innerHTML = elation.template.get('ui.spinner.types.' + this.type, this);
    }
  });
});

