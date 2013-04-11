elation.component.add('ui.buttonbar', function() {
  this.init = function() {
    /*
    this.defineProperties({
      'buttons': { type: 'list' }
    });
    */
console.log('new buttonbar', this.args.buttons);
    if (this.args.buttons) {
      for (var i in this.args.buttons) {
        var buttonargs = this.args.buttons[i];
        var button = elation.ui.button(null, elation.html.create({tag: 'button', append: this.container}), buttonargs, buttonargs.events);
console.log('\t-', button);
      }
    }
  }
});
