elation.require(['ui.base'], function() {
  elation.component.add('ui.iframe', function() {
    this.defaultcontainer = { tag: 'iframe', classname: 'ui_iframe' };
    this.init = function() {
      elation.ui.iframe.extendclass.init.call(this);
      this.addPropertyProxies(['src']);
    }

    this.addcss = function(url) {
      var iframecss = elation.html.create('link');
      iframecss.rel = 'stylesheet';
      iframecss.href = url;
      if (this.container.contentDocument) {
        if (!this.container.contentDocument.head) {
          this.container.contentDocument.appendChild(elation.html.create('head'));
        }
        this.container.contentDocument.head.appendChild(iframecss);
      }
    }
    this.setcontent = function(content) {
      if (this.container.contentDocument) {
        this.container.contentDocument.body.innerHTML = content;
      } else {
        console.log('wtf no', this.container);
      }
    }
  }, elation.ui.base);
});
