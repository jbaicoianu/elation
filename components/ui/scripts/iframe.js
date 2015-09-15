elation.require(['ui.base'], function() {
  elation.component.add('ui.iframe', function() {
    this.defaultcontainer = { tag: 'iframe', classname: 'ui_iframe' };
    this.init = function() {
      elation.ui.iframe.extendclass.init.call(this);
      this.addPropertyProxies(['src', 'contentWindow']);
      elation.events.add(this.container, 'load', elation.bind(this, this.handle_load));
      elation.events.add(this.container, 'error', elation.bind(this, this.handle_error));

      if (this.args.src) {
        this.src = this.args.src;
      }
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
    this.handle_load = function(ev) {
      if (ev.target !== this) {
        elation.events.fire({target: this, type: ev.type, event: ev });
      }
    }
    this.handle_error = function(ev) {
      if (ev.target !== this) {
        elation.events.fire({target: this, type: ev.type, event: ev });
      }
    }
  }, elation.ui.base);
});
