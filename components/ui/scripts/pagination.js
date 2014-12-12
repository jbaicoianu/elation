elation.require(['ui.list'], function() {
  elation.component.add('ui.pagination', function() {
    this.defaultcontainer = {tag: 'ul', classname: 'ui_list ui_pagination'};

    this.init = function() {
      elation.ui.pagination.extendclass.init.call(this);
      items = [];
      items.push({label: '&laquo;', disabled: true});
      for (var i = 1; i <= 5; i++) {
        items.push({label: i});
      }
      items.push({label: '&raquo;'});
      this.setItems(items);
      this.setOrientation('horizontal');
    }
  }, elation.ui.list);
});

