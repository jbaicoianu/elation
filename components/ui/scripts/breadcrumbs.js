elation.require([], function() {
  elation.template.add('ui.breadcrumbs.item', '<a href="#">{value}</a>');

  elation.component.add('ui.breadcrumbs', function() {
    this.defaultcontainer = {tag: 'ul', classname: 'ui_list ui_breadcrumbs'};

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
