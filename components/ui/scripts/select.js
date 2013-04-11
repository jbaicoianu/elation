elation.component.add('ui.select', {
  init: function() {
    elation.events.add(this.container, "change", this);
    this.value = this.container.value;
    if (this.args.items) {
      this.setItems(this.args.items, this.args.selected);
    }
  },
  setItems: function(items, selected) {
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
      if (selected && selected == option.value) {
        option.selected = "selected";
      }
      option.innerHTML = items[i];
      this.container.appendChild(option);
    }
  },
  change: function(ev) {
    this.value = this.container.value;
    elation.events.fire({type: "ui_select_change", data: this.container.value, element: this});
  }
});

