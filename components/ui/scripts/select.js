elation.component.add('ui.select', {
  init: function() {
    elation.events.add(this.container, "change", this);
  },
  setItems: function(items) {
    if (items instanceof Array) {
      this.set('args.items', items.join(';'));
    } else {
      this.set('args.items', items);
      items = items.split(';');
    }
    this.container.innerHTML = '';
    for (var i = 0; i < items.length; i++) {
      var option = elation.html.create({tag: 'option'});
      option.value = items[i];
      option.innerHTML = items[i];
      this.container.appendChild(option);
    }
  },
  change: function(ev) {
    elation.events.fire({type: "ui_select_change", data: this.container.value, element: this});
  }
});

