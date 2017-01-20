elation.require(['ui.base'], function() {
  elation.component.add('ui.link', function() {
    this.defaultcontainer = { tag: 'a', classname: 'ui_link' };
    this.postinit = function() {
      elation.ui.link.extendclass.postinit.call(this);
      this.defineProperties({
        href: { type: 'string', set: this.updateLink }
      });
    }
    this.updateLink = function() {
alert(this.href);
      this.container.href = this.href;
    }
  }, elation.ui.base);
});
