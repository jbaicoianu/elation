elation.component.add('ui.list', {
  init: function(name, container, args) {
    this.tag = this.args.tag || this.container.tagName || 'DIV';
    this.classname = this.args.classname || "";
    this.title = this.args.title || false;
    this.draggable = this.args.draggable || false;
    this.events = this.args.events || {}
    this.items = this.args.items || [];

    //this.create();
  },
  setItems: function(items) {
    console.log('list set items', items);
    this.items = items;
    var html = '';
    for (var i = 0; i < this.items.length; i++) {
      html += '<li>' + this.items[i] + '</li>';
    }
    this.container.innerHTML = html;
  }
});
