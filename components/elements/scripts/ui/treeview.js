/** 
 * TreeView UI component
 *
 * @class treeview
 * @hideconstructor
 * @category UI
 * @augments elation.elements.base
 * @memberof elation.elements.ui
 * @todo this could probably inherit from ui.list to be more generalized
 *
 * @param {object} args
 * @param {array} args.items
 * @param {object} args.attrs
 */
elation.require(["elements.elements", "elements.ui.item"], function() {
  elation.requireCSS('ui.treeview');

  elation.elements.define('ui.treeview', class extends elation.elements.base {
    init() {
      super.init();
      this.defineAttributes({
        items: { type: 'object' },
        attrs: { type: 'object' },
        draggable: { type: 'boolean', default: false },
        tabindex: { type: 'integer' }
      });
    }
    create() {
      if (this.items) {
        this.setItems(this.items);
      }
      elation.events.add(this, 'keydown', ev => this.handleKeyDown(ev));
      this.tabindex = 0;
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
      this._itemsByKey = {};
      this.innerHTML = '';
      this.add(items, this, attrs);
    }
    add(items, root, attrs) {
      if (!root) root = this;
      if (!attrs) attrs = this.getDefaultAttributes();

      //var ul = elation.html.create({tag: 'ul', append: root});
      //var list = elation.elements.create('ui-list', {append: root});

      // alphabetize the keys
      var keys = Object.keys(items);
      keys.sort((a, b) => a.localeCompare(b));

      for (var i = 0; i < keys.length; i++) {
        this.createItem(items[keys[i]], root, attrs);
      }
    }
    // Create a single tvitem under root (appending at the end), wire its events,
    // index it, and recurse into its existing children. Returns the tvitem, or
    // null if the item is filtered out by the `visible` attribute.
    createItem(itemData, root, attrs) {
      if (!root) root = this;
      if (!attrs) attrs = this.getDefaultAttributes();
      if (attrs['visible'] && !elation.utils.arrayget(itemData, attrs['visible'])) {
        return null;
      }
      var tvitem = elation.elements.create('ui-treeviewitem', {
        item: itemData,
        attrs: attrs,
        append: root,
      });
      if (this.draggable) {
        tvitem.draggable = 'true';
      }
      // maintain selected item
      if (this.selected && this.selected.value === itemData) {
        elation.html.addclass(tvitem, 'state_selected');
        tvitem.lastclick = this.selected.lastclick;
        this.selected = tvitem;
      }
      this.items.push(tvitem);
      if (!this._itemsByKey) this._itemsByKey = {};
      this._itemsByKey[itemData[attrs.name]] = tvitem;
      elation.events.add(tvitem, 'ui_treeviewitem_hover', (ev) => this.ui_treeviewitem_hover(ev));
      elation.events.add(tvitem, 'ui_treeviewitem_select', (ev) => this.ui_treeviewitem_select(ev));
      var children = itemData[attrs.children];
      if (children && Object.keys(children).length > 0) {
        tvitem.addclass('haschildren');
        this.add(children, tvitem, attrs);
        //elation.html.addclass(tvitem, 'state_expanded');
        tvitem.collapsed = true;
      }
      return tvitem;
    }
    // Incrementally insert a single node under parentEl (default this), keeping
    // all other nodes' collapse/selection/scroll state intact. Idempotent: a node
    // whose key already exists is returned unchanged rather than duplicated.
    addItem(itemData, parentEl) {
      if (!parentEl) parentEl = this;
      var attrs = this.getDefaultAttributes();
      var key = itemData[attrs.name];
      if (this._itemsByKey && this._itemsByKey[key]) {
        return this._itemsByKey[key];
      }
      if (attrs['visible'] && !elation.utils.arrayget(itemData, attrs['visible'])) {
        return null;
      }
      var parentIsItem = parentEl instanceof elation.elements.ui.treeviewitem;
      var parentHadChildren = parentIsItem && parentEl.classList.contains('haschildren');
      var tvitem = this.createItem(itemData, parentEl, attrs);
      if (!tvitem) return null;
      // move it to the correct alphabetical slot among its siblings
      var siblings = parentEl.children;
      for (var i = 0; i < siblings.length; i++) {
        var sib = siblings[i];
        if (sib === tvitem) continue;
        if (sib instanceof elation.elements.ui.treeviewitem && sib.value &&
            sib.value[attrs.name] != null &&
            String(sib.value[attrs.name]).localeCompare(String(key)) > 0) {
          parentEl.insertBefore(tvitem, sib);
          break;
        }
      }
      // give the parent an expand affordance only on the empty -> non-empty
      // transition, so adding into an already-open folder doesn't snap it shut
      if (parentIsItem && !parentHadChildren) {
        parentEl.addclass('haschildren');
        parentEl.collapsed = true;
      }
      return tvitem;
    }
    // Incrementally remove a node (and its descendants) by data object or key.
    // Tolerant: a no-op if the key isn't present.
    removeItem(itemDataOrKey) {
      var attrs = this.getDefaultAttributes();
      var key = (itemDataOrKey != null && typeof itemDataOrKey === 'object')
                ? itemDataOrKey[attrs.name] : itemDataOrKey;
      var tvitem = this._itemsByKey && this._itemsByKey[key];
      if (!tvitem) {
        for (var i = 0; i < this.items.length; i++) {
          if (this.items[i].value === itemDataOrKey ||
              (this.items[i].value && this.items[i].value[attrs.name] === key)) {
            tvitem = this.items[i];
            break;
          }
        }
      }
      if (!tvitem) return;

      var parentEl = tvitem.parentNode;
      var toRemove = [tvitem];
      var descendants = tvitem.getElementsByTagName('ui-treeviewitem');
      for (var i = 0; i < descendants.length; i++) toRemove.push(descendants[i]);

      for (var i = 0; i < toRemove.length; i++) {
        var t = toRemove[i];
        t.remove();
        var idx = this.items.indexOf(t);
        if (idx != -1) this.items.splice(idx, 1);
        if (this._itemsByKey && t.value) delete this._itemsByKey[t.value[attrs.name]];
        if (this.selected === t) this.selected = null;
        if (this.hover === t) this.hover = null;
      }

      if (parentEl) parentEl.removeChild(tvitem);

      if (parentEl instanceof elation.elements.ui.treeviewitem &&
          parentEl.getElementsByTagName('ui-treeviewitem').length === 0) {
        parentEl.removeclass('haschildren');
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
    find(search) {
      if (typeof search != 'function' && this._itemsByKey && this._itemsByKey[search]) {
        return this._itemsByKey[search];
      }
      for (let i = 0; i < this.items.length; i++) {
        let item = this.items[i];
        if (typeof search == 'function' && search(item)) {
          return item;
        } else if (item.item[this.attrs.name] == search) {
          return item;
        }
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
    handleKeyDown(ev) {
      if (!this.selected) {
        this.firstChild.select();
        ev.preventDefault();
      } else if (ev.key == 'ArrowUp') {
        if (this.selected && this.selected.parentNode !== this) {
          if (this.selected.previousSibling) {
            if (!(this.selected.previousSibling instanceof elation.elements.ui.treeviewitem)) {
              this.selected.parentNode.select();
              ev.preventDefault();
            } else if (!this.selected.previousSibling.collapsed) {
              // recursively select the last file from uncollapsed directories
              let lastnode = this.selected.previousSibling;
              let lastnodechildren = lastnode.getElementsByTagName('ui-treeviewitem');
              while (lastnodechildren.length > 0 && !lastnodechildren[lastnodechildren.length-1].collapsed) {
                lastnode = lastnodechildren[lastnodechildren.length-1];
                lastnodechildren = lastnode.getElementsByTagName('ui-treeviewitem');
              }
              lastnode.select();
              ev.preventDefault();
            } else {
              this.selected.previousSibling.select();
              ev.preventDefault();
            }
          } else if (this.selected.parentNode instanceof elation.elements.ui.treeviewitem) {
            this.selected.parentNode.select();
            ev.preventDefault();
          }
        }
      } else if (ev.key == 'ArrowDown') {
        if (this.selected && !(this.selected === this && this.collapsed)) {
          let children = this.selected.getElementsByTagName('ui-treeviewitem');
          if (this.selected instanceof elation.elements.ui.treeviewitem && !this.selected.collapsed && children.length > 0) {
            // Currently selecting an uncollapsed directory which has some children, descend into it
            children[0].select();
            ev.preventDefault();
          } else if (this.selected.nextSibling && this.selected.nextSibling instanceof elation.elements.ui.treeviewitem) {
            // If we still have a next sibling, select it
            this.selected.nextSibling.select();
            ev.preventDefault();
          } else {
              // recursively select the next file from our parents' next sibling
              let nextnode = this.selected;
              while (nextnode !== this) {
                if (nextnode.parentNode === this) {
                  nextnode = null;
                  break;
                } else {
                  nextnode = nextnode.parentNode;
                  if (nextnode.nextSibling) {
                    nextnode = nextnode.nextSibling;
                    break;
                  }
                }
              }
              if (nextnode && nextnode instanceof elation.elements.ui.treeviewitem) {
                nextnode.select();
                ev.preventDefault();
              }
          }
        }
      } else if (ev.key == 'ArrowLeft') {
        if (this.selected instanceof elation.elements.ui.treeviewitem && this.selected.childNodes.length > 1 && !this.selected.collapsed) {
          this.selected.collapsed = true;
        } else if (this.selected !== this && this.selected.parentNode instanceof elation.elements.ui.treeviewitem) {
          this.selected.parentNode.select();
          ev.preventDefault();
        }
      } else if (ev.key == 'ArrowRight') {
        if (this.selected) {
          let children = this.selected.getElementsByTagName('ui-treeviewitem');
          if (children.length > 0) {
            this.selected.collapsed = false;
            children[0].select();
            ev.preventDefault();
          }
        }
      } else if (ev.key == 'Escape') {
        //this.preview.set(null);
      }
    }
  });

  elation.elements.define('ui.treeviewitem', class extends elation.elements.base {
    init() {
      super.init();
      this.defineAttributes({
        items: { type: 'object' },
        attrs: { type: 'object' },
        draggable: { type: 'string' },
        collapsed: { type: 'boolean', default: false },
      });
    }
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
    select(skipevent) {
      elation.html.addclass(this, 'state_selected');
      if (!skipevent) {
        elation.events.fire({type: 'ui_treeviewitem_select', element: this});
      }
      //this.scrollIntoView();
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
        if (this.item[this.attrs.children]) {
          if (this.collapsed) {
            this.collapsed = false;
          } else {
            this.collapsed = true;
          }
        }
        ev.preventDefault();
        ev.stopPropagation();
    }
    doubleclick(ev) {
    }
  });
});

