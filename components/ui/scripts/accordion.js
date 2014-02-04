elation.component.add("ui.accordion", function() {
  this.init = function() {
    elation.html.addclass(this.container, 'ui_accordion');
    this.items = {};
    this.elements = {};
    this.singular = false;
    this.shown = [];
    if (this.args.items) {
      this.setItems(this.args.items);
    }
  }
  this.setItems = function(items) {
    this.list = elation.html.create({tag: 'ul', classname: 'ui_accordion_list', append: this.container});
    this.items = items;
    for (var num in items) {
      this.createItem(num, items[num]);
    }
  }
  this.createItem = function(num, item) {
    var li = elation.html.create({tag: 'li', append: this.list});
    var title = elation.html.create({tag: 'h3', classname: 'ui_accordion_title', append: li, content: item.title});
    var content = elation.html.create({tag: 'section', classname: 'ui_accordion_content', append: li, content: item.content});
    this.elements[num] = {li: li, title: title, content: content};
    elation.events.add(title, "click", elation.bind(this, function(ev) { this.toggle(num); ev.preventDefault(); }));
    elation.events.add(title, "mousedown", function(ev) { ev.preventDefault(); });
    return li;
  }
  this.show = function(num) {
    if (this.shown.indexOf(num) == -1) {
      // Fire preshow event before starting animation
      var ev = elation.events.fire({type: 'ui_accordion_preshow', element: this, data: num});
      // Start animation
      elation.html.removeclass(this.elements[num].li, "state_animating")
      this.elements[num].content.style.maxHeight = 'none';
      var height = this.elements[num].content.offsetHeight;
      this.elements[num].content.style.maxHeight = 0;
      elation.html.addclass(this.elements[num].li, "state_animating")
      elation.html.addclass(this.elements[num].li, "state_open")
      this.elements[num].content.style.maxHeight = height + 'px';
      this.shown.push(num);
      // Fire show event
      elation.events.fire({type: 'ui_accordion_show', element: this, data: num});
    }
  }
  this.hide = function(num) {
    var idx = this.shown.indexOf(num);
    if (idx != -1) {
      elation.html.removeclass(this.elements[num].li, "state_open")
      this.elements[num].content.style.maxHeight = 0;
      this.shown.splice(idx, 1);
      elation.events.fire({type: 'ui_accordion_hide', element: this, data: num});
    }
  }
  this.toggle = function(num) {
    if (this.elements[num]) {
      var idx = this.shown.indexOf(num);
      if (idx != -1) {
        this.hide(num);
      } else {
        if (this.singular) {
          while (this.shown.length > 0) {
            this.hide(this.shown[0]);
          }
        }
        this.show(num);
      }
    }
  }
});
