elation.require(['ui.base'], function() {
  elation.component.add('ui.iframe', function() {
    this.defaultcontainer = { tag: 'iframe', classname: 'ui_iframe' };
    this.init = function() {
      elation.ui.iframe.extendclass.init.call(this);
      this.addPropertyProxies(['src']);
    }

    this.setcontent = function(content) {
      this.container.contentDocument.body.innerHTML = content;
    }
  }, elation.ui.base);
});
