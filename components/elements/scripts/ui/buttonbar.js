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
elation.require(['elements.ui.list', 'elements.ui.button', 'elements.ui.togglebutton'], function() {
  elation.elements.define('ui.buttonbar', class extends elation.elements.ui.list {
    init() {
      super.init();
      this.defineAttributes({
        'label': { type: 'string' },
        'itemcomponent': { type: 'string', default: 'ui.button' }
      });
    }
    create() {
      //this.buttonelements = [];
      if (this.preview) {
        this.items = [{value: 1, label: 'One'}, {value: 2, label: 'Two'}, {value: 2, label: 'Three'}];
      }
      if (this.collection) {
        this.setItemCollection(this.collection);
      } else if (this.buttons) {
        this.createButtons(this.buttons);
      } else if (this.items && this.items.length > 0) {
        this.createButtons(this.items);
      } else {
        this.extractButtons();
      }
      if (this.label) {
        this.labelobj = elation.elements.create('ui.label', {
          append: this,
          before: this.firstChild,
          label: this.label
        });
      }
    }
    createButton(buttonargs) {
      return elation.elements.create(this.itemcomponent, buttonargs);
    }
    createButtons(buttons) {
      for (var i in buttons) {
        var buttonargs = buttons[i];
        //var button = elation.ui.button(null, elation.html.create({tag: 'button', append: this.container}), buttonargs, buttonargs.events);
        //var button = (buttonargs.toggle ? elation.ui.togglebutton(buttonargs) : elation.ui.button(buttonargs));
        var button = (buttonargs instanceof elation.elements.ui.button ? buttonargs : this.createButton(buttons[i]));
        this.appendChild(button);
        this.items[i] = button;
      }
    }
    setButtons(buttons) {
      this.items = [];
      for (var i = 0; i < buttons.length; i++) {
        var button = this.createButton(buttons[i]);
        if (!this.items[i]) {
          this.appendChild(button);
        } else if (this.items[i] !== button) {
          this.insertBefore(button, this.items[i]);
          this.removeChild(this.items[i]);
        }
        this.items[i] = button;
      }
      while (buttons.length < this.items.length) {
        var olditem = this.items.pop();
        this.removeChild(olditem);
      }
    }
    extractButtons() {
      var buttons = [];
      for (var i = 0; i < this.childNodes.length; i++) {
        var node = this.childNodes[i];
        if (node instanceof elation.elements.ui.button) {
          //items.push({label: node.innerHTML});
          this.items.push(node);
        }
      }
      //this.buttons = buttons;
    }
    add(name, button) {
      this.buttons[name] = button;
      button.reparent(this.container);
    }
    enable() {
      super.enable();
      for (var k in this.buttons) {
        this.buttons[k].disabled = false;
      }
    }
    disable() {
      super.disable();
      for (var k in this.buttons) {
        this.buttons[k].disabled = true;
      }
    }
  });
});

