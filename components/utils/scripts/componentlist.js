elation.component.add('utils.componentlist', {
  init: function(name, container, args) {
    this.name = name;
    this.container = container;
    this.args = args || {};
    this.components = {};
    this.buttons = {};
    if (this.args.components) {
      this.addComponents(this.args.components);
      this.drawButtons();
    }
  },

  addComponent: function(args) {
    if (typeof args != 'undefined' && args.name) {
      elation.utils.arrayset(this.components, args.name, new this.componentPlaceholder(args.name, args));
    }
  },
  addComponents: function(components) {
    for (var k in components) {
      this.addComponent(components[k]);
      if (components[k].components) {
        this.addComponents(components[k].components);
      }
    }

  },
  addButton: function(name, label, container) {
    var newdiv = elation.html.create({'tag': 'div'});
    this.buttons[name] = elation.ui.button(name, newdiv, {
        label: label,
        draggable: true,
        tag: 'DIV',
      },
      { 
        mouseover: this,
        dragstart: this
      }
    );
    if (typeof container == 'undefined')
      container = this.container;
    this.buttons[name].addTo(container);
  },
  drawButtons: function() {
    this.container.innerHTML = '';
    for (var k in this.components) { 
      if (this.components.hasOwnProperty(k)) {
        this.addButton(k, k);
      }
    }
  },
  showContextMenu: function(menuname, items, parent) {
    if (typeof parent == 'undefined')
      parent = this.container;
    var contextmenuclass = 'tf_toolkit_contextmenu';
    var contextmenus = elation.find("DIV." + contextmenuclass, parent);
    if (!contextmenus || !contextmenus[0] || contextmenus[0].length == 0) {
      var contextmenu = document.createElement('DIV');
      contextmenu.className = contextmenuclass;
      parent.appendChild(contextmenu);
      for (var k in items) {
        if (items.hasOwnProperty(k)) {
          var fullname = menuname+'.'+k;
          this.addButton(fullname, fullname, contextmenu);
        }
      }
    } else {
      var contextmenu = contextmenus[0];
    }

    // FIXME - this positioning code isn't perfect, too many levels of scroll and offset.
    // Should probably just move the contextmenu out to be a sibling of the this.container rather than a child

    var dims = elation.html.dimensions(contextmenu);
    var windims = elation.html.dimensions(window);
    var cdims = elation.html.dimensions(this.container);
    var pdims = elation.html.dimensions(parent);
    //if (dims.y + dims.h - cdims.s[1] > windims.h - windims.s[1]) {
    if (pdims.y + dims.h > windims.h) {
      contextmenu.style.top = Math.max(windims.h - dims.h, 0) + 'px';
    } else {
      contextmenu.style.top = (pdims.y) + 'px';
    }
  },
  handleEvent: function(ev) {
    switch(ev.type) {
      /*
      case 'click':
        var el = ev.target || ev.currentTarget;
        break;
      */
      case 'mouseover':
        var el = ev.target || ev.currentTarget;
        if (el) {
          var name = el.innerHTML.split('<')[0];
          var component = elation.utils.arrayget(this.components, name);
          if (typeof component != 'undefined' && component != null) {
            if (component instanceof this.componentPlaceholder) {
              //component.fetch('snip');
             // elation.utils.componentdetails('toolbox_detail').setComponent(name);
            } else if (typeof component == 'object'){
              this.showContextMenu(name, component, el);
            }
          }
        }
        break;
      case 'dragstart':
        var el = ev.target || ev.currentTarget || ev.srcElement || ev.originalTarget;
        if (el) {
          var name = el.innerHTML;

          var component = elation.utils.arrayget(this.components, name);
          if (typeof component != 'undefined') {
            ev.dataTransfer.setDragImage(this.getPreview(component), 0, 0);
            //ev.dataTransfer.setData('text/html', component.content);
            //ev.dataTransfer.setData('elation/component', JSON.stringify(component));
            ev.dataTransfer.setData('text/html', 'elation/component:' + JSON.stringify(component));
            ev.effectAllowed = 'move'; // only allow moves
            console.log("plip", ev.dataTransfer);
          }
        }
        break;
      case 'dragend':
//        this.clearPreview();
        break;
    }
  },
  getPreview: function(component) {
    if (!this.previewcontainer) {
      this.previewcontainer = document.createElement('DIV');
      this.previewcontainer.id = 'tf_toolbox_preview';
      this.previewcontainer.style.position = 'absolute';
      this.previewcontainer.style.left = '-50000px';
      this.previewcontainer.style.top = '-50000px';
      document.body.appendChild(this.previewcontainer);
    }
    //var content = component.fetch('snip');
    //this.previewcontainer.innerHTML = '<div id="tf_toolbox_preview_content">'+content+'</div>';
    this.previewcontainer.innerHTML = '<div id="tf_toolbox_preview_content">shit</div>';
    return this.previewcontainer.childNodes[0];
  },
  clearPreview: function() {
    document.body.removeChild(this.previewcontainer);
    delete this.previewcontainer;
    this.previewcontainer = false;
  },
  componentPlaceholder: function(name, args) {
    this.name = name;
    this.args = args;
  }
});

