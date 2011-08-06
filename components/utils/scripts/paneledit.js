function TFPanel(args) {
  this.init = function(args) {
    this.orientation = args.orientation || 'horizontal';
    this.root = args.root || false;
    //console.log("INIT panel:", args);
    this.elementtype = args.elementtype || 'DIV';
    this.container = args.container || document.createElement(this.elementtype);
    this.container.className = 'tf_utils_panel tf_utils_panel_' + this.orientation;
    this.createEditPanel();
    this.slots = [];
    if (args.items) {
      if (args.items) {
        var order = [];
        for (var k in args.items) {
          if (args.items[k].enabled != "0") {
            order.push({order: args.items[k].order, name: k});
          }
        }
        order.sort(function(a,b) { return a.order - b.order; });
        for (var i = 0; i < order.length; i++) {
          var k = order[i].name;
          //console.log(k, args.items[k]);
          var slotcfg = {item: args.items[k], itemtype: args.items[k].type || 'panel'};
          //console.log(slotcfg);
          this.addSlot(slotcfg);
        }
      }
    } else if (args.slots) {
      for (var i = 0; i < args.slots.length; i++) {
        this.addSlot(args.slots[i]);
      }
    } else {
      this.addSlot();
    }
    elation.events.add(this.container, "setactive", this);
  }
  this.addSlot = function(slotargs, pos) {
    //console.log("panel::addSlot:", slotargs);
    if (typeof slotargs == 'undefined')
      slotargs = {panelorientation: this.orientation};
    var slot = new TFPanelSlot(slotargs);
    if (typeof pos == 'undefined') {
      slot.order = this.slots.length;
      this.slots.push(slot);
      this.container.appendChild(slot.container);
    } else {
      slot.order = pos;
      this.slots.splice(pos, 0, slot);
      //console.log(this.slots, pos);
      if (this.slots[pos+1]) {
        this.container.insertBefore(slot.container, this.slots[pos+1].container);
      } else {
        this.container.appendChild(slot.container);
      }
    }
    for (var i = 0; i < this.slots.length; i++) {
      this.slots[i].order = i;
    }
    this.recalculateWidths();
  }
  this.removeSlot = function(slotnum) {
    var slot = (typeof slotnum != 'undefined' ? this.slots[slotnum] : this.slots.pop());
    if (slot) {
      this.container.removeChild(slot.container);
      delete slot;
    }
    this.recalculateWidths();
  }
  this.fillSlot = function(slotnum, slot) {
      
  }
  this.createEditPanel = function() {
    this.editpanel = document.createElement('DIV');
    this.editpanel.className = 'tf_utils_panel_edit';
    /*
    this.buttons = {
      'epminus': new TFUtilsButton({label: '-', events: { click: this }}),
      'epplus': new TFUtilsButton({label: '+', events: { click: this }}),
      'flip': new TFUtilsButton({label: this.orientation, events: { click: this }})
    };
    this.buttons['epminus'].addTo(this.editpanel);
    this.buttons['epplus'].addTo(this.editpanel);
    this.buttons['flip'].addTo(this.editpanel);
    */

    this.container.appendChild(this.editpanel);    
  }
  this.recalculateWidths = function() {
    var width = 'auto';
    if (this.orientation == 'vertical') {
    } else {
      // FIXME - overriding the fit-width algorithm for horizontal layout for now
      //width = ((this.container.offsetWidth  / this.slots.length) - 20) + 'px';
    }
    for (var i = 0; i < this.slots.length; i++) {
      this.slots[i].container.style.width = width;
      if (this.slots[i].item && this.slots[i].item.recalculateWidths)
        this.slots[i].item.recalculateWidths();
    }
  }
  this.handleEvent = function(ev) {
    switch (ev.type) {
      case 'click':
        switch (ev.target || ev.srcElement) {
          case this.buttons['epplus'].element:
            this.addSlot();
            break;
          case this.buttons['epminus'].element:
            this.removeSlot();
            break;
          case this.buttons['flip'].element:
            this.toggleOrientation();
            break;
        }
        break;
      case 'resize':
        this.recalculateWidths();
        break;
      case 'setactive':
        if (this.activepanel && ev.data != this.activepanel) {
          this.activepanel.setInactive();
        }
        this.activepanel = ev.data;
        break;
    }
  }
  this.toggleOrientation = function() {
    if (this.orientation == 'horizontal') {
      elation.html.removeclass(this.container, 'tf_utils_panel_horizontal');
      elation.html.addclass(this.container, 'tf_utils_panel_vertical');
      this.orientation = 'vertical';
    } else {
      elation.html.removeclass(this.container, 'tf_utils_panel_vertical');
      elation.html.addclass(this.container, 'tf_utils_panel_horizontal');
      this.orientation = 'horizontal';
    }
    this.buttons['flip'].setLabel(this.orientation);
    this.recalculateWidths();
  }
  this.getConfig = function() {
    var ret = []
    for (k in this.slots) {
      if (this.slots.hasOwnProperty(k)) {
        if (this.slots[k].itemtype == 'panel') {
          console.log('PANEL: ', this);
          this.slots[k].item.getConfig();
        } else if (this.slots[k].itemtype == "component" || this.slots[k].itemtype == "panelitem") {
          console.log("COMPONENT:", this.slots[k].item);
        } else if (this.slots[k].itemtype != false) {
          console.log("Unknown item type:", this.slots[k]);
        }
      }
    }
  }
  this.loadConfig = function(panelcfg) {
    if (panelcfg.items) {
      for (var k in panelcfg.items) {

      }
    }
  }

  this.init(args || {});
}
function TFPanelSlot(args) {
  this.init = function(args) {
    if (typeof args == 'undefined') var args = {};
    //console.log("INIT panelslot:", args);
    this.elementtype = args.elementtype || 'DIV';
    this.panelorientation = args.panelorientation || 'horizontal';
    this.container = document.createElement(this.elementtype);
    this.container.className = "tf_utils_panel_slot";
    this.container.draggable = true;
    this.itemtype = args.itemtype || false;
    this.item = false;

    if (this.itemtype == "panelitem") {
      this.flip = new elation.html.flippable("flipper_"+parseInt(Math.random() * 10000), this.container);
    }

    this.resetContent();
    (function(self) {
      elation.events.add(self.container, "update", function(ev) { 
        if (ev.data instanceof elation.component.base) {
          ev.data.fetch('snip', function(data) { self.contentCallback(data); }, true);
        }    
        //ev.stopPropagation();
      });
    })(this);

    if (args.item) {
      if (args.itemtype == 'panel')
        this.setAsPanel(args.item);
      else if (args.itemtype == 'component' || args.itemtype == 'panelitem')
        this.setAsComponent(args.item);
    }

/*
    if (args.panel.container)
      args.panel.container.appendChild(this.container);
*/

    elation.events.add(this.container, 'dragstart,dragend,dragover,dragenter,dragleave,drop,click', this);
    //this.setAsPanel();
  }
  /*
  this.addButton = function(name, label) {
    this.buttons[name] = new TFUtilsButton({label: label, events: {click: this}});
    this.buttons[name].addTo(this.container);
  }
  */
  this.setAsPanel = function(panelargs) {
    console.log('panelslot::setAsPanel:', panelargs);
    if (typeof panelargs == 'undefined') 
      panelargs = {};
    this.container.innerHTML = '';
    this.item = new TFPanel(panelargs);
    this.itemtype = 'panel';
    this.container.appendChild(this.item.container);
  }
  this.setAsComponent = function(componentargs) {
    console.log('panelslot::setAsComponent:', componentargs);
    if (typeof componentargs == 'undefined') 
      componentargs = {};
    componentargs.container = this.container;
    this.container.innerHTML = '';
    if (!componentargs.id) {
      var componentinfo = elation.component.info(componentargs.name); 
      componentargs.id = elation.utils.camelize(componentargs.name.replace('.','-')) + (componentinfo ? componentinfo.objcount : 0);
    }
    //this.item = new TFComponent(componentargs)
    this.item = elation.component.get(componentargs.id, componentargs.name, componentargs.container, componentargs.componentargs);
    //console.log('NEW ITEM', this.item);
    this.itemtype = 'component';
    //this.container.innerHTML = this.item.getContent(function(self) {self.contentCallback(data); );
    (function(self) {
      self.item.fetch('snip', function(data) {self.contentCallback(data)});
    })(this);
  }
  this.contentCallback = function(data) {
    var content = data;
    if (typeof data['content'] != 'undefined')
      content = data['content'];
    this.container.innerHTML = this.getInfoDiv() + content;
    /*
    for (var k in this.item.events) {
      if (this.item.events[k] && this.item.events[k].length > 0) {
        elation.events.add(this.item.container, k, this.item.events[k]);
      }
    }
    */
    elation.component.init();
  }
  this.resetContent = function() {
    this.item = false;
    this.itemtype = false;
    this.buttons = {};
    this.container.innerHTML = '';
    //this.addButton('subdivide', 'Split');
    //this.addButton('content', 'Set Content');
  }
  this.getInfoDiv = function() {
    var ret = '<div class="tf_utils_panel_slot_info">';
    if (this.itemtype == "component") {
      ret += '<h3>elation.' + this.item.name + "('" + (this.item.args.id || this.item.id) + "')</h3>";
    } else {
      ret += '<h3>elation.utils.panel</h3>';
    }
    /*
    ret += "<ul>";
    for (var k in this.item.componentargs) {
      ret += '<li>' + k + ' = ';
      if (typeof this.item.componentargs[k] == 'string' && this.item.componentargs[k].indexOf('\n') >= 0) {
        ret += '<textarea name="' + k + '">' + this.item.componentargs[k] + '</textarea>';
      } else {
        ret += '<input name="' + k + '" value="' + elation.utils.escapeHTML(this.item.componentargs[k]).replace('"', '&quot;') + '" />';
      }
      ret += '</li>';
    }
    ret += "</ul>";
    */
    ret += '</div>';
    return ret;
  }
  this.setActive = function() {
    elation.events.fire({type:'setactive', origin: this, data: this, element: elation.utils.paneledit('dostuff').container});
    elation.html.addclass(this.container, "tf_utils_state_active");
  }
  this.setInactive = function() {
    elation.events.fire({type:'setinactive', origin: this, data: this, element: elation.utils.paneledit('dostuff').container});
    elation.html.removeclass(this.container, "tf_utils_state_active");
  }

  this.handleEvent = function(ev) {
    switch (ev.type) {
      case 'click':
        if (this.itemtype == 'component') {
          //elation.utils.componentdetails('toolbox_detail').setComponent(this.item.name);
          this.setActive();
        }
        /*
        switch (ev.target || ev.srcElement) {
          case this.buttons['subdivide'].element:
            if (!this.item)
              this.setAsPanel({orientation: (this.panelorientation == 'horizontal' ? 'vertical' : 'horizontal')});
            break;
          case this.buttons['content'].element:
            var content = prompt();
            this.container.innerHTML = content;
            break;
        }
        */
        break;
      case 'dragstart':
        var el = ev.target || ev.currentTarget;
        //ev.dataTransfer.setData('text/html', el.innerHTML);
        //ev.dataTransfer.setData('elation/panelslot', JSON.stringify(this));
        ev.dataTransfer.setData('text/html', 'elation/panelslot:' + JSON.stringify(this));
        ev.effectAllowed = 'move'; // only allow moves
        ev.stopPropagation();
        break;
      case 'dragenter':
      case 'dragover':
        var state = '';
        if (this.dataTransferContains(ev.dataTransfer, 'elation/panelslot')) {
          var panelobj = elation.JSON.parse(ev.dataTransfer.getData('elation/panelslot'));
          if (this.equals(panelobj))
            state = 'self';
          else
            state = 'droppable';
        } else if (this.dataTransferContains(ev.dataTransfer, 'text/html')) {
          if (ev.target.innerHTML == ev.dataTransfer.getData('text/html'))
            state = 'self';
          else
            state = 'droppable';
        }
        if (state == '') {
          this.clearContainerStates(['droppable', 'self']);
        } else {
          elation.html.addclass(this.container, 'tf_utils_state_' + state);
          if (state == 'droppable') {
            ev.dataTransfer.dropEffect = 'all';
            ev.preventDefault();
            ev.stopPropagation();
          } else if (state == 'self') {
            ev.dataTransfer.dropEffect = 'none';
            ev.preventDefault();
            ev.stopPropagation();
          }
        }
        elation.html.dragdrop.dropcover("paneledit").show(this.container, [ev.pageX, ev.pageY]);
        break;
      case 'dragleave':
        this.clearContainerStates(['droppable', 'self']);
        break;
      case 'dragend':
        if (ev.dataTransfer.dropEffect == 'move') {
          this.resetContent();
          ev.preventDefault();
          ev.stopPropagation();
        }
        break;
      case 'drop':
        var region = elation.html.dragdrop.dropcover('paneledit').getRegion([ev.pageX, ev.pageY]);
        elation.html.dragdrop.dropcover('paneledit').hide();
        console.log('plop ', region, ev.dataTransfer.types);
        var accept = false;
        var component = false;
        if (this.dataTransferContains(ev.dataTransfer, 'elation/panelslot')) {
          var panelslot = ev.dataTransfer.getData('elation/panelslot');
          if (this.equals(panelslot)) {
            this.clone(elation.JSON.parse(panelslot));
          }
          accept = true;
        } else if (this.dataTransferContains(ev.dataTransfer, 'elation/component')) {
          component = elation.JSON.parse(ev.dataTransfer.getData('elation/component'));
          accept = true;
        } else if (this.dataTransferContains(ev.dataTransfer, 'text/html')) {
          var data = ev.dataTransfer.getData('text/html');
          var tmp = "elation/component:";
          if (data.substr(0, tmp.length) == tmp) {
            var component = elation.JSON.parse(data.substr(tmp.length));
          } else {
            component = {name: 'html.static', componentargs: {content: data} };
          }
          accept = true;
        } else if (this.dataTransferContains(ev.dataTransfer, 'text/plain')) {
          var data = ev.dataTransfer.getData('text/plain');
          component = {name: 'html.static', componentargs: {content: data} };
          accept = true;
        }
        if (component) {
          var orientation = '';
          var orientations = {
            'left': ['horizontal', 0],
            'right': ['horizontal', 1],
            'top': ['vertical', 0],
            'bottom': ['vertical', 1],
          };
          if (typeof orientations[region] == 'undefined') {
            this.setAsComponent(component);
            this.setActive();
          } else {
            var orientation = orientations[region][0];
            if (!this.itemtype) {
              this.setAsPanel({orientation: orientation, slots: []});
            } else if (this.itemtype == "component") {
              var olditem = this.item;
              this.setAsPanel({orientation: orientation, slots: []});
              this.item.addSlot({item: olditem, itemtype: 'component'});
            }
            if (this.itemtype == 'panel') {
              if (this.item.orientation == orientation) {
                var newpos = orientations[region][1] * this.item.slots.length;;
                var slotcfg = {item: component, itemtype: 'component'};
                this.item.addSlot(slotcfg, newpos);
                this.item.slots[newpos].setActive();
              } else {
                alert("no don't");
              }
            }
          }
        }
        this.clearContainerStates(['droppable', 'self']);
        if (accept) {
          ev.preventDefault();
          ev.stopPropagation();
        }
        break;
    }
  }
  this.dataTransferContains = function(dt, type) {
    // wrapper function since chrome and firefox handle event.dataTransfer.types differently
    if (typeof dt.types.contains == 'function') {
      return dt.types.contains(type);
    } else {
      return (dt.types.indexOf(type) >= 0);
    }
  }
  this.clearContainerStates = function(types) {
    for (var i = 0; i < types.length; i++) {
      while (elation.html.hasclass(this.container, 'tf_utils_state_' + types[i]))
        elation.html.removeclass(this.container, 'tf_utils_state_' + types[i]);
    }
  }
  this.clone = function(obj) {
//console.log("Cloning: ",obj);
    this.elementtype = obj.elementtype || this.elementtype || 'DIV';
    this.panelorientation = obj.panelorientation || this.panelorientation || 'horizontal';
    if (obj.itemtype == 'panel') {
      this.setAsPanel(obj.item);
    } else if (obj.itemtype == 'component') {
      this.setAsComponent(obj.item);
    }
  }
  this.init(args);
}
/*
function TFEventDatatransfer() {
  this.data = {};
  this.setData = function(type, content) {
    this.data[type] = content;
  }
  this.getData = function(type) {
    return this.data[type];
  }
  this.contains = function(type) {
    return (typeof this.data[type] != 'undefined');
  }
}
*/

elation.component.add("utils.paneledit", {
  init: function(name, container, args) {
    this.container = container;
    this.args = args;

    this.toolkit = elation.utils.componentlist('components');
    //this.base = new TFPanel({container: container, orientation: 'vertical', 'root':true});
    //this.base.addSlot();
    //this.base.addSlot();

    //this.savebutton = new TFUtilsButton({label: 'Save', events: { click: this }}, this.toolkit.container);
    //elation.func.bind(window, 'resize', base);
  },
  handleEvent: function(ev) {
    switch(ev.type) {
      case 'click':
        this.base.getConfig();
        break;
    }
  },
  setPanelConfig: function(panelcfg) {
    if (!panelcfg) panelcfg = {};
    panelcfg.container = this.container;
    panelcfg.root = true;
    if (!panelcfg.orientation) {
      panelcfg.orientation = "vertical";
    }
    this.base = new TFPanel(panelcfg);
  }
});

