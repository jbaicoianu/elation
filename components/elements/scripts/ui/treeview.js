/** 
 * TreeView UI component
 *
 * @class treeview
 * @augments elation.elements.base
 * @memberof elation.elements.ui
 * @todo this could probably inherit from ui.list to be more generalized
 *
 * @param {object} args
 * @param {array} args.items
 * @param {object} args.attrs
 */
elation.require(["elements.elements", "elements.ui.item"], function() {
  //elation.requireCSS('ui.treeview');

  elation.elements.define('ui.treeview', class extends elation.elements.base {
    init() {
      super.init();
      this.defineAttributes({
        items: { type: 'object' },
        attrs: { type: 'object' },
        draggable: { type: 'boolean', default: false }
      });
    }
    create() {
      if (this.items) {
        this.setItems(this.items);
      }
    }
    getDefaultAttributes() {
      var attrs = this.attrs || {};
      if (elation.utils.isEmpty(attrs.name)) attrs.name = 'name';
      if (elation.utils.isEmpty(attrs.label)) attrs.label = 'name';
      if (elation.utils.isEmpty(attrs.children)) attrs.children = 'items';
      return attrs;
    }
    setItems(items) {
      var attrs = this.getDefaultAttributes();
      //console.log('new items', items, this);
      // FIXME - this is inefficient.  instead of removing and readding everything, we should just find the diffs
      if (this.items) {
        for (var k in this.items) {
          this.items[k].remove();
        }
      }
      this.items = [];
      this.innerHTML = '';
      this.add(items, this, attrs);
    }
    add(items, root, attrs) {
      if (!root) root = this;

      //var ul = elation.html.create({tag: 'ul', append: root});
      //var list = elation.elements.create('ui-list', {append: root});

      // alphabetize the keys
      var keys = Object.keys(items);
      keys.sort();

      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        var visible = true;
        if (attrs['visible']) {
          visible = elation.utils.arrayget(items[k], attrs['visible']);
        }
        if (visible) {
          //var li = elation.html.create({tag: 'li', append: ul});
          var tvitem = elation.elements.create('ui-treeviewitem', {
            item: items[k],
            attrs: attrs,
            append: root,
          });
          if (this.draggable) {
            tvitem.draggable = true;
          }
          // maintain selected item
          if (this.selected && this.selected.value === items[k]) {
            elation.html.addclass(tvitem, 'state_selected');
            tvitem.lastclick = this.selected.lastclick;
            this.selected = tvitem;
          }
          this.items.push(tvitem);
          elation.events.add(tvitem, 'ui_treeviewitem_hover', (ev) => this.ui_treeviewitem_hover(ev));
          elation.events.add(tvitem, 'ui_treeviewitem_select', (ev) => this.ui_treeviewitem_select(ev));
          if (items[k][attrs.children] && Object.keys(items[k][attrs.children]).length > 0) {
            tvitem.addclass('haschildren');
            this.add(items[k][attrs.children], tvitem, attrs);
            elation.html.addclass(tvitem, 'state_expanded');
          }
        }
      }
    }
    sort(items, sortby) {
      var attrs = this.getDefaultAttributes();
      if (elation.utils.isNull(items)) items = this.items;
      if (elation.utils.isNull(sortby)) sortby = attrs.name;
      items.sort(function(a, b) {
        var na = a.value[sortby],
            nb = b.value[sortby];
        if (na === nb) return 0;
        else if (na < nb) return -1;
        else if (na > nb) return 1;
      });
      return items;
    }
    enable() {
      elation.ui.treeview.extendclass.enable.call(this);
      for (var i = 0; i < this.items.length; i++) {
        this.items[i].enable();
      }
    }
    disable() {
      elation.ui.treeview.extendclass.disable.call(this);
      for (var i = 0; i < this.items.length; i++) {
        this.items[i].disable();
      }
    }
    ui_treeviewitem_hover(ev) {
      if (this.hover && this.hover != ev.target) {
        this.hover.unhover();
      }
      this.hover = ev.target;
      elation.events.fire({type: 'ui_treeview_hover', element: this, data: this.hover});
    }
    ui_treeviewitem_select(ev) {
      if (this.selected && this.selected != ev.target) {
        this.selected.unselect();
      }
      this.selected = ev.target;
      elation.events.fire({type: 'ui_treeview_select', element: this, data: this.selected});
    }
  });

  elation.elements.define('ui.treeviewitem', class extends elation.elements.base {
    create() {
      this.value = this.item;
      this.attrs = this.attrs || {};
      if (!this.attrs.label) this.attrs.label = 'label';

      this.label = elation.elements.create('ui-text', { append: this});

      if (this.value) {
        if (this.attrs.itemtemplate) {
          this.label.settext(elation.template.get(this.attrs.itemtemplate, this.value));
        } else if (this.value[this.attrs.label]) {
          this.label.settext(this.value[this.attrs.label]);
        }

        if (!elation.utils.isEmpty(this.attrs.disabled) && !elation.utils.isEmpty(this.value[this.attrs.disabled])) {
          elation.html.addclass(this, "state_disabled");
        }

        elation.events.add(this, "mouseover", (ev) => this.mouseover(ev));
        elation.events.add(this, "mouseout", (ev) => this.mouseout(ev));
        elation.events.add(this, "click", (ev) => this.click(ev));
        //elation.events.add(this.value, "mouseover,mouseout,click", this);
        this.refresh();
      }
    }
    render() {
      if (this.value) {
        if (this.attrs.itemtemplate) {
          this.label.settext(elation.template.get(this.attrs.itemtemplate, this.value));
        } else if (this.value[this.attrs.label]) {
          this.label.settext(this.value[this.attrs.label]);
        }

        if (!elation.utils.isEmpty(this.attrs.disabled) && !elation.utils.isEmpty(this.value[this.attrs.disabled])) {
          elation.html.addclass(this, "state_disabled");
        }

        elation.events.add(this, "mouseover,mouseout,click", this);
        elation.events.add(this.value, "mouseover,mouseout,click", this);
      }
    }
    remove() {
      elation.events.remove(this, "mouseover,mouseout,click", this);
      elation.events.remove(this.value, "mouseover,mouseout,click", this);
    }
    hover() {
      elation.html.addclass(this, 'state_hover');
      elation.events.fire({type: 'ui_treeviewitem_hover', element: this});
      //this.scrollIntoView();
    }
    unhover() {
      elation.html.removeclass(this, 'state_hover');
      elation.events.fire({type: 'ui_treeviewitem_unhover', element: this});
    }
    select() {
      elation.events.fire({type: 'ui_treeviewitem_select', element: this});
      //this.scrollIntoView();
      elation.html.addclass(this, 'state_selected');
    }
    unselect() {
      elation.html.removeclass(this, 'state_selected');
      elation.events.fire({type: 'ui_treeviewitem_unselect', element: this});
    }
    mouseover(ev) {
      if (this.enabled) {
        this.hover();
        //ev.stopPropagation();
      }
    }
    mouseout(ev) {
      if (this.enabled) {
        this.unhover();
        //ev.stopPropagation();
      }
    }
    mousedown(ev) {
      //if (this.enabled) ev.stopPropagation();
    }
    mouseup(ev) {
      //if (this.enabled) ev.stopPropagation();
    }
    click(ev) {
        if (this.lastclick && ev.timeStamp - this.lastclick < 250) {
        }
        this.lastclick = ev.timeStamp;
        this.select();
        ev.stopPropagation();
    }
    doubleclick(ev) {
    }
  });
});

