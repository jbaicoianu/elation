/** 
 * Simple content UI element
 *
 * @class content
 * @augments elation.ui.base
 * @memberof elation.ui
 *
 * @param {object} args
 * @param {string} args.content
 */
elation.require("ui.base", function() {
  elation.component.add("ui.contentlist", function() {
    this.defaultcontainer = { tag: 'ul', classname: 'ui_contentlist' };

    this.init = function() {
      var items = this.args.items, lis = [];

      for (var i=0; i<items.length; i++) {
        var item = items[i];

        lis.push(elation.html.create({
          tag: 'li', 
          append: this,
          content: item.content,
          classname: 'ui_contentlist_item ui_item_' + item.name + (this.args.animation ? ' animation_' + this.args.animation : '')
        }));
      }

      this.items = lis;
    }

    this.setcontent = function(name) {
      var li = elation.find('li.ui_item_' + name, this.container, true),
          animation = this.args.animation,
          delay = animation ? 200 : 1;

      if (li == this.li)
        return;

      if (this.li) {
        var old = this.li,
            oi = elation.utils.indexOf(this.items, old),
            ni = elation.utils.indexOf(this.items, li),
            el = oi > ni ? li : old;

        elation.html.addClass(old, 'animation_' + animation);
        el.style.position = 'absolute';

        setTimeout(function() {
          elation.html.removeClass(old, 'state_selected');
          el.style.position = '';
        }, delay);
      }

      elation.html.addClass(li, 'state_selected');

      setTimeout(function() {
        elation.html.removeClass(li, 'animation_' + animation);
      }, 1);

      this.li = li;
    }
  }, elation.ui.base);

  elation.component.add("ui.content", function() {
    this.defaultcontainer = { tag: 'div', classname: 'ui_content' };

    this.content = '';

    this.init = function() {
      elation.ui.content.extendclass.init.call(this);

      if (this.args.content) {
        this.setcontent(this.args.content);
      }
    }

    this.setcontent = function(content) {
      this.content = content;
      this.refresh();
    }

    this.render = function() {
      elation.html.setContent(this, this.content);
    }
  }, elation.ui.base);
});

