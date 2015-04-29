/** 
 * TreeView UI component
 *
 * @class treeview
 * @augments elation.ui.base
 * @memberof elation.ui
 * @todo this could probably inherit from ui.list to be more generalized
 *
 * @param {object} args
 * @param {array} args.items
 * @param {object} args.attrs
 */
elation.require(['ui.base','utils.template'], function() {
  elation.requireCSS('ui.treeview');

  elation.component.add("ui.treeview2", function() {
    this.defaults = {
      properties: true,
      folders: true,
      attrs: {
        name: 'name',
        children: 'items',
        visible: true,
        label: 'label',
        disabled: false,
        itemtemplate: false
      }
    };

    this.init = function() {
      elation.html.addclass(this.container, 'ui_treeview');
      this.items = [];

      if (this.args.items) {
        this.setItems(this.args.items);
      }
    }

    this.setItems = function(items) {
      var attrs = this.args.attrs;
      //console.log('new items', items, this);
      // FIXME - this is inefficient.  instead of removing and readding everything, we should just find the diffs
      if (this.items) {
        for (var k in this.items) {
          this.items[k].remove();
        }
      }
      this.items = [];
      this.container.innerHTML = '';
      this.add(items, this.container, attrs);
      elation.component.init();
    }
    this.add = function(items, root, attrs) {
      if (!root) root = this.container;

      var ul = elation.html.create({tag: 'ul', append: root});

      // alphabetize the keys
      //console.log('keys',items, root);
      if (items && typeof items == 'object') {
        var keys = Object.keys(items);
        keys.sort();
      } else {
        return;
      }

      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        var visible = true;
        if (attrs['visible']) {
          visible = elation.utils.arrayget(items[k], attrs['visible']);
        }
        if (visible && (this.args.folders && items[k] && typeof items[k] == 'object' || this.args.properties)) {
          var parent = elation.utils.getParent(ul, 'li', 'ui_treeview_folder');
              path = parent ? parent.id + ';' : '',
              isFolder = typeof items[k] == 'object',
              classname = isFolder
                          ? 'ui_treeview_folder state_collapsed'
                          : 'ui_treeview_property',
              li = elation.html.create({
                tag: 'li',
                classname: classname,
                id: path + k,
                append: ul
              }),
              tvitem = elation.ui.treeviewitem2(null, li, {
                key: k, 
                item: items[k], 
                attrs: attrs,
                parent: this
              });
          
          // maintain selected item
          if (this.selected && this.selected.value === items[k]) {
            elation.html.addclass(li, 'state_selected');
            tvitem.lastclick = this.selected.lastclick;
            this.selected = tvitem;
          }

          this.items.push(tvitem);
          elation.events.add(tvitem, 'ui_treeviewitem_hover,ui_treeviewitem_select', this);
        }
      }
    }

    this.sort = function(items, sortby) {
      var attrs = this.args.attrs;

      if (elation.utils.isNull(items)) 
        items = this.items;

      if (elation.utils.isNull(sortby)) 
        sortby = attrs.name;

      items.sort(function(a, b) {
        var na = a.value[sortby],
            nb = b.value[sortby];

        if (na === nb) 
          return 0;

        else if (na < nb) 
          return -1;

        else if (na > nb) 
          return 1;
      });
      return items;
    }

    this.ui_treeviewitem_hover = function(ev) {
      if (this.hover && this.hover != ev.target) {
        this.hover.unhover();
      }

      this.hover = ev.target;
      //elation.events.fire({type: 'ui_treeview_hover', element: this, data: this.hover});
    }

    this.ui_treeviewitem_select = function(ev) {
      if (this.selected && this.selected != ev.target) {
        this.selected.unselect();
      }

      this.selected = ev.target;
      elation.events.fire({type: 'ui_treeview_select', element: this, data: this.selected});
    }

    this.setPath = function(path) {
      var path = path.join(';'),
          items = this.items,
          obj;

      for (var i=0,item; i<items.length; i++) 
        if (items[i].container.id == path)
          obj = items[i];
      
      //console.log('treeview setPath', path, this, obj);
      if (obj)
        obj.select(true);
    }
  }, elation.ui.base);

  elation.component.add("ui.treeviewitem2", function() {
    this.init = function() {
      this.value = this.args.item;
      this.attrs = this.args.attrs || {};
      this.key = this.args.key;

      switch (typeof this.value) {
        case 'object': this.type = 'folder'; break;
        default: this.type = 'property';
      }

      this.children = this.hasChildren();

      if (typeof this.value != 'undefined') {
        if (this.attrs.itemtemplate) {
          this.container.innerHTML = elation.template.get(this.attrs.itemtemplate, { 
            type: this.type, 
            children: this.children,
            key: this.key, 
            value: this.value 
          });
        } else if (this.value[this.attrs.label]) {
          this.container.innerHTML = this.value[this.attrs.label];
        }

        if (!elation.utils.isEmpty(this.attrs.disabled) && !elation.utils.isEmpty(this.value[this.attrs.disabled])) {
          elation.html.addclass(this.container, "state_disabled");
        }

        elation.events.add(this.container, "mouseover,mouseout,click", this);
        elation.events.add(this.value, "mouseover,mouseout,click", this);
      }
    }
    this.hasChildren = function() {
      if (this.value && typeof this.value == 'object') {
        for (var key in this.value) {
          var item = this.value[key];

          if (item && typeof item == 'object')
            return true;
        }
      }
      
      return false;
    }
    this.remove = function() {
      elation.events.remove(this.container, "mouseover,mouseout,click", this);
      elation.events.remove(this.value, "mouseover,mouseout,click", this);
    }
    this.hover = function() {
      elation.html.addclass(this.container, 'state_hover');
      //elation.events.fire({type: 'ui_treeviewitem_hover', element: this});
      //this.container.scrollIntoView();
    }
    this.unhover = function() {
      elation.html.removeclass(this.container, 'state_hover');
      //elation.events.fire({type: 'ui_treeviewitem_unhover', element: this});
    }
    this.select = function(only_select) {
      console.log('select', this);
      if (!this.expanded && !only_select) {
        this.expanded = true;
        this.args.parent.add(this.value, this.container, this.attrs);
      }

      if (!only_select) {
        elation.html.toggleclass(this.container, 'state_collapsed');
        elation.html.toggleclass(this.container, 'state_expanded');
      }

      elation.events.fire({
        type: 'ui_treeviewitem_select', 
        element: this
      });
      
      //this.container.scrollIntoView();

      var lis = elation.find('li.state_selected', this.args.parent.container);

      elation.html.removeclass(lis,'state_selected');
      elation.html.addclass(this.container, 'state_selected');
    }
    this.unselect = function() {
      elation.html.removeclass(this.container, 'state_selected');
      //elation.events.fire({type: 'ui_treeviewitem_unselect', element: this});
    }
    this.mouseover = function(ev) {
      this.hover();
      ev.stopPropagation();
    }
    this.mouseout = function(ev) {
      this.unhover();
      ev.stopPropagation();
    }
    this.mousedown = function(ev) {
    }
    this.mouseup = function(ev) {
    }
    this.click = function(ev) {
      if (this.lastclick && ev.timeStamp - this.lastclick < 250) {
        console.log('doubleclick');
      }
      this.lastclick = ev.timeStamp;
      this.select();
      ev.stopPropagation();
    }
    this.doubleclick = function(ev) {
      console.log('doubleclicky');
    }
  }, elation.ui.base);

  elation.component.add("ui.treeview", function() {
    this.init = function() {
      elation.html.addclass(this.container, 'ui_treeview');
      this.items = [];

      if (this.args.items) {
        this.setItems(this.args.items);
      }
    }
    this.getDefaultAttributes = function() {
      var attrs = this.args.attrs || {};
      if (elation.utils.isEmpty(attrs.name)) attrs.name = 'name';
      if (elation.utils.isEmpty(attrs.children)) attrs.children = 'items';
      return attrs;
    }
    this.setItems = function(items) {
      var attrs = this.getDefaultAttributes();
      //console.log('new items', items, this);
      // FIXME - this is inefficient.  instead of removing and readding everything, we should just find the diffs
      if (this.items) {
        for (var k in this.items) {
          this.items[k].remove();
        }
      }
      this.items = [];
      this.container.innerHTML = '';
      this.add(items, this.container, attrs);
      elation.component.init();
    }
    this.add = function(items, root, attrs) {
      if (!root) root = this.container;

      var ul = elation.html.create({tag: 'ul', append: root});

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
          var li = elation.html.create({tag: 'li', append: ul});
          var tvitem = elation.ui.treeviewitem(null, li, {item: items[k], attrs: attrs});
          // maintain selected item
          if (this.selected && this.selected.value === items[k]) {
            elation.html.addclass(li, 'state_selected');
            tvitem.lastclick = this.selected.lastclick;
            this.selected = tvitem;
          }
          this.items.push(tvitem);
          elation.events.add(tvitem, 'ui_treeviewitem_hover,ui_treeviewitem_select', this);
          if (items[k][attrs.children] && Object.keys(items[k][attrs.children]).length > 0) {
            this.add(items[k][attrs.children], li, attrs);
            elation.html.addclass(li, 'state_expanded');
          }
        }
      }
    }
    this.sort = function(items, sortby) {
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
    this.ui_treeviewitem_hover = function(ev) {
      if (this.hover && this.hover != ev.target) {
        this.hover.unhover();
      }
      this.hover = ev.target;
      elation.events.fire({type: 'ui_treeview_hover', element: this, data: this.hover});
    }
    this.ui_treeviewitem_select = function(ev) {
      if (this.selected && this.selected != ev.target) {
        this.selected.unselect();
      }
      this.selected = ev.target;
      elation.events.fire({type: 'ui_treeview_select', element: this, data: this.selected});
    }
  }, elation.ui.base);

  elation.component.add("ui.treeviewitem", function() {
    this.init = function() {
      this.value = this.args.item;
      this.attrs = this.args.attrs || {};
      if (!this.attrs.label) this.attrs.label = 'label';

      if (this.value) {
        if (this.attrs.itemtemplate) {
          this.container.innerHTML = elation.template.get(this.attrs.itemtemplate, this.value);
        } else if (this.value[this.attrs.label]) {
          this.container.innerHTML = this.value[this.attrs.label];
        }

        if (!elation.utils.isEmpty(this.attrs.disabled) && !elation.utils.isEmpty(this.value[this.attrs.disabled])) {
          elation.html.addclass(this.container, "state_disabled");
        }

        elation.events.add(this.container, "mouseover,mouseout,click", this);
        elation.events.add(this.value, "mouseover,mouseout,click", this);
      }
    }
    this.remove = function() {
      elation.events.remove(this.container, "mouseover,mouseout,click", this);
      elation.events.remove(this.value, "mouseover,mouseout,click", this);
    }
    this.hover = function() {
      elation.html.addclass(this.container, 'state_hover');
      elation.events.fire({type: 'ui_treeviewitem_hover', element: this});
      //this.container.scrollIntoView();
    }
    this.unhover = function() {
      elation.html.removeclass(this.container, 'state_hover');
      elation.events.fire({type: 'ui_treeviewitem_unhover', element: this});
    }
    this.select = function() {
      elation.events.fire({type: 'ui_treeviewitem_select', element: this});
      //this.container.scrollIntoView();
      elation.html.addclass(this.container, 'state_selected');
    }
    this.unselect = function() {
      elation.html.removeclass(this.container, 'state_selected');
      elation.events.fire({type: 'ui_treeviewitem_unselect', element: this});
    }
    this.mouseover = function(ev) {
      this.hover();
      ev.stopPropagation();
    }
    this.mouseout = function(ev) {
      this.unhover();
      ev.stopPropagation();
    }
    this.mousedown = function(ev) {
    }
    this.mouseup = function(ev) {
    }
    this.click = function(ev) {
      if (this.lastclick && ev.timeStamp - this.lastclick < 250) {
        console.log('doubleclick');
      }
      this.lastclick = ev.timeStamp;
      this.select();
      ev.stopPropagation();
    }
    this.doubleclick = function(ev) {
      console.log('doubleclicky');
    }
  }, elation.ui.base);
});