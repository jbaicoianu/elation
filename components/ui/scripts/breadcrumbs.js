elation.require(['ui.list','utils.template'], function() {
  elation.requireCSS('ui.breadcrumbs');

  elation.template.add('ui.breadcrumbs.item', '<a href="#">{value}</a>');

  elation.component.add('ui.selectcrumbs', function() {
    this.defaultcontainer = { tag: 'ul', classname: 'ui_selectcrumbs' };
    this.init = function() {

    }

    this.setPath = function(paths) {
      elation.html.setContent(this, '');
      this.labels = [];
      this.selects = [];

      this.labels.push(elation.ui.button({
        append: this,
        path: '',
        label: this.args.root_icon || '☰'
      }).container);

      for (var i=0, fullpath=''; i<paths.length; i++) {
        var path = paths[i],
            label = path.split(';')[0];
        
        this.selects.push(elation.ui.select({
          append: this,
          path: fullpath,
          items: path
        }).container);

        fullpath += (fullpath?';':'') + label;

        this.labels.push(elation.ui.button({
          append: this,
          path: fullpath,
          label: label
        }).container);
      }
    }
  }, elation.ui.base);

  elation.component.add('ui.breadcrumbs', function() {
    this.defaultcontainer = { tag: 'ul', classname: 'ui_list ui_breadcrumbs' };

    this.init = function() {
      elation.ui.breadcrumbs.extendclass.init.call(this);
    }
    this.getDefaultAttributes = function() {
      var attrs = elation.ui.breadcrumbs.extendclass.getDefaultAttributes.call(this);
      if (elation.utils.isEmpty(attrs.itemtemplate)) attrs.itemtemplate = 'ui.breadcrumbs.item';
      if (elation.utils.isEmpty(attrs.children)) attrs.children = 'items';
      if (elation.utils.isEmpty(attrs.label)) attrs.label = 'label';
      return attrs;
    }
  }, elation.ui.list);
});
