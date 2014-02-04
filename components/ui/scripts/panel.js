elation.component.add("ui.panel", function() {
  this.init = function() {
    this.items = [];
    this.orientation = this.args.orientation || 'vertical';

    elation.html.addclass(this.container, 'ui_panel');
    elation.html.addclass(this.container, 'orientation_' + this.orientation);
    if (this.args.classname) {
      elation.html.addclass(this.container, this.args.classname);
    }
  }
  this.add = function(component) {
    if (component) {
      this.container.appendChild(component.container);
      this.items.push(component);
      return component;
    } else {
      console.log('Error: invalid component passed in to ui.panel.add');
    }
    return false;
  }
});
