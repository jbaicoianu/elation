elation.require(['ui.list'], function() {
  elation.requireCSS('ui.keyvaluelist');

  elation.component.add('ui.keyvaluelist', function() {
    this.init = function() {
      elation.ui.keyvaluelist.extendclass.init.call(this);
    }
    /**
     * Combine passed-in attributes with built-in defaults
     * @function getDefaultAttributes
     * @memberof elation.ui.list#
     * @returns {Object}
     */
    this.getDefaultAttributes = function() {
      var attrs = this.args.attrs || {};
      if (elation.utils.isEmpty(attrs.name)) attrs.name = 'name';
      if (elation.utils.isEmpty(attrs.children)) attrs.children = 'items';
      if (elation.utils.isEmpty(attrs.label)) attrs.label = 'label';
      if (elation.utils.isEmpty(attrs.itemcomponent)) attrs.itemcomponent = 'ui.keyvaluelistitem';
      return attrs;
    }
  }, elation.ui.list);

  elation.component.add('ui.keyvaluelistitem', function() {
    this.init = function() {
      this.addclass('ui_keyvaluelistitem');

      if (this.args.key instanceof elation.component.base) {
        this.key = this.args.key;
        this.container.appendChild(this.key.container);
        elation.html.addclass(this.key.container, 'ui_keyvaluelistitem_key');
      } else {
        this.key = elation.ui.label({
          append: this,
          classname: 'ui_keyvaluelistitem_key',
          label: this.args.key
        });
      }
      if (this.args.value instanceof elation.component.base) {
        this.value = this.args.value;
        this.container.appendChild(this.value.container);
        elation.html.addclass(this.value.container, 'ui_keyvaluelistitem_value');
      } else {
        this.value = elation.ui.label({
          append: this,
          classname: 'ui_keyvaluelistitem_value',
          label: this.args.value
        });
      }

      if (elation.utils.isEmpty(this.args.key)) {
        this.key.addclass('state_empty');
      }
    }
  }, elation.ui.base);
});
