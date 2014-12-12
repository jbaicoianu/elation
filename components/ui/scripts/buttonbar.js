/** 
 * ButtonBar UI element
 *
 * @class buttonbar
 * @augments elation.ui.base
 * @memberof elation.ui
 *
 * @param {object} args
 * @param {object} args.buttons
 */
elation.require(['ui.base', 'ui.button', 'ui.togglebutton'], function() {
  elation.component.add('ui.buttonbar', function() {
    this.defaultcontainer = { tag: 'div', classname: 'ui_buttonbar' };
    this.init = function() {
      elation.ui.buttonbar.extendclass.init.call(this);
      if (this.args.classname) {
        this.addclass(this.args.classname);
      }
      /*
      this.defineProperties({
        'buttons': { type: 'list' }
      });
      */
      //console.log('new buttonbar', this.args.buttons);
      this.buttons = {};
      if (this.args.buttons) {
        for (var i in this.args.buttons) {
          var buttonargs = this.args.buttons[i];
          //var button = elation.ui.button(null, elation.html.create({tag: 'button', append: this.container}), buttonargs, buttonargs.events);
          var button = (buttonargs.toggle ? elation.ui.togglebutton(buttonargs) : elation.ui.button(buttonargs));
          button.reparent(this.container);
          this.buttons[i] = button;
          //console.log('\t-', button);
        }
      }
    }
    this.enable = function() {
      for (var k in this.buttons) {
        this.buttons[k].disabled = false;
      }
    }
    this.disable = function() {
      for (var k in this.buttons) {
        this.buttons[k].disabled = true;
      }
    }
  }, elation.ui.base);
});
