elation.component.add("ui.toolbox", function() {
  this.init = function() {
    this.tools = {};
    this.ul = elation.html.create({tag: 'ul', classname: 'ui_toolbox', append: this.container});
  }
  this.addtool = function(name, func) {
    this.tools[name] = {
      component: elation.ui.button(null, elation.html.create({tag: 'li', classname: 'ui_toolbox_tool', append: this.ul}), {label: name}),
      callback: func
    };
    elation.events.add(this.tools[name].component, 'ui_button_click', this);
  }
  this.selecttool = function(tool) {
    if (this.tools[tool]) {
      elation.events.fire({type: 'ui_toolbox_select', element: this, data: this.tools[tool]});
    }
  }
  this.ui_button_click = function(ev) {
    for (var k in this.tools) {
      if (ev.target == this.tools[k].component) {
        this.tools[k].callback();
      }
    }
  }
});
