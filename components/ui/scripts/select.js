elation.component.add('ui.select', {
  init: function(name, container, args) {
  },
  setItems: function(items) {
    if (typeof items == 'array') {
      this.set('args.items', items.join(';'));
    } else {
      this.set('args.items', items);
    }
  }
});

