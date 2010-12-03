{component name="html.header"}
<div id="tf_container">
 <div id="tf_container_inner">
<style type="text/css">
{literal}
* { padding: 0; margin: 0; }
.tf_utils_panel_content_item {
  border:1px solid red;
  padding: 1em;
}
.tf_utils_panel_content.tf_utils_panel_horizontal>li.tf_utils_panel_content_item {
  display: inline-block;
}
.tf_utils_panel_content.tf_utils_panel_vertical>li.tf_utils_panel_content_item {
  display: block;
}
{/literal}
</style>

{* component name="utils.panel" type="frontpage" *}


<style type="text/css">
{literal}
#dostuff {
  background: cornflowerblue;
  padding: 10px;
}
.a {
  position: relative;
  xbackground: purple;
  xpadding: 10px;
  white-space: nowrap;
  background: cornflowerblue;
}
.b {
  min-height: 20px;
  border: 2px solid black;
  padding: 8px;
  xpadding: 1em;
  white-space: normal;
  -moz-border-radius: 5px;
}
.b.tf_utils_state_droppable {
  border: 2px solid yellow;
  background: #ffca73 !important;
}
.b.tf_utils_state_self {
  border: 2px solid lightgreen;
  background: #95ee6b !important;
}
.a.tf_utils_panel_vertical>.b {
  background: lightblue;
  display: block;
  
}
.a.tf_utils_panel_horizontal>.b {
  background: lightskyblue;
  display: inline-block;
  vertical-align: top;
}
.a .b:hover {
  border: 2px solid white;
}
.e {
  border: 1px solid red;
  position: absolute;
  background: white;
  top: 0;
  right: 0;
  padding: .2em;
  white-space: nowrap;
  display: none;
  z-index: 500;
  -moz-border-radius: 5px;
}
.e button {
  min-width: 1.8em;
  text-align: center;
}
.e button:hover {
  color: #900;
}
.a:hover>.e {
  display: block;
}
#tf_utils_toolkit {
  position: fixed;
  bottom: 0;
  left: 0;
  background: #ccc;
  min-width: 20em;
  border-top: 2px solid black;
  border-right: 2px solid black;
  -moz-border-radius: 0 5px 0 0;
}
#tf_utils_toolkit .tf_toolkit_contextmenu {
  position: absolute; 
  top: -1.8em;
  left: 0;
  min-width: 100%;
  background: #ccc;
  border: 2px solid black;
  white-space: nowrap;
  -moz-border-radius: 5px;
  display: none;
}
#tf_utils_toolkit .tf_utils_button_draggable:hover .tf_toolkit_contextmenu {
  display: block;
}
.tf_utils_button_draggable {
  display: inline-block;
  padding: .5em;
  margin: .5em;
  border: 1px solid blue;
  -moz-border-radius: 5px;
  cursor: move;
}
.tf_utils_button_draggable:hover {
  background: #99c;
}
</style>
<div id="dostuff"></div>
<script type="text/javascript">
function TFPanel(args) {
  this.init = function(args) {
    this.orientation = args.orientation || 'horizontal';
    this.root = args.root || false;
    //console.log("INIT panel:", args);
    this.elementtype = args.elementtype || 'DIV';
    //this.container = args.container || document.createElement(this.elementtype);
    this.container = document.createElement(this.elementtype);
    this.container.className = 'a tf_utils_panel_' + this.orientation;
    if (args.parentid)
      document.getElementById(args.parentid).appendChild(this.container);
    this.createEditPanel();
    this.slots = [];
    if (args.slots) {
      for (var i = 0; i < args.slots.length; i++) {
        this.addSlot(args.slots[i]);
      }
    } else {
      this.addSlot();
    }
  }
  this.addSlot = function(slotargs) {
    //console.log("panel::addSlot:", slotargs);
    if (typeof slotargs == 'undefined')
      slotargs = {panelorientation: this.orientation};
    var slot = new TFPanelSlot(slotargs)
    this.slots.push(slot);
    this.container.appendChild(slot.container);
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
    this.editpanel.className = 'e';
    this.buttons = {
      'epminus': new TFUtilsButton({label: '-', events: { click: this }}),
      'epplus': new TFUtilsButton({label: '+', events: { click: this }}),
      'flip': new TFUtilsButton({label: this.orientation, events: { click: this }})
    };

    this.buttons['epminus'].addTo(this.editpanel);
    this.buttons['epplus'].addTo(this.editpanel);
    this.buttons['flip'].addTo(this.editpanel);

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
    }
  }
  this.toggleOrientation = function() {
    if (this.orientation == 'horizontal') {
      thefind.utils.removeClass(this.container, 'tf_utils_panel_horizontal');
      thefind.utils.addClass(this.container, 'tf_utils_panel_vertical');
      this.orientation = 'vertical';
    } else {
      thefind.utils.removeClass(this.container, 'tf_utils_panel_vertical');
      thefind.utils.addClass(this.container, 'tf_utils_panel_horizontal');
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
        } else if (this.slots[k].itemtype == "component") {
          console.log("COMPONENT:", this.slots[k].item);
        } else if (this.slots[k].itemtype != false) {
          console.log("Unknown item type:", this.slots[k]);
        }
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
    this.container.className = "b";
    this.container.draggable = true;
    this.itemtype = args.itemtype || false;
    this.item = false;

    this.resetContent();

    if (args.item) {
      if (args.itemtype == 'panel')
        this.setAsPanel(args.item);
      else if (args.itemtype == 'component')
        this.setAsComponent(args.item);
    }

/*
    if (args.panel.container)
      args.panel.container.appendChild(this.container);
*/

    thefind.func.bind(this.container, 'dragstart', this);
    thefind.func.bind(this.container, 'dragend', this);
    thefind.func.bind(this.container, 'dragover', this);
    thefind.func.bind(this.container, 'dragenter', this);
    thefind.func.bind(this.container, 'dragleave', this);
    thefind.func.bind(this.container, 'drop', this);
    //this.setAsPanel();
  }
  this.addButton = function(name, label) {
    this.buttons[name] = new TFUtilsButton({label: label, events: {click: this}});
    this.buttons[name].addTo(this.container);
  }
  this.setAsPanel = function(panelargs) {
    //console.log('panelslot::setAsPanel:', panelargs);
    if (typeof panelargs == 'undefined') 
      panelargs = {};
    this.container.innerHTML = '';
    this.item = new TFPanel(panelargs);
    this.itemtype = 'panel';
    this.container.appendChild(this.item.container);
  }
  this.setAsComponent = function(componentargs) {
    //console.log('panelslot::setAsComponent:', componentargs);
    if (typeof componentargs == 'undefined') 
      componentargs = {};
    this.container.innerHTML = '';
    this.item = new TFComponent(componentargs)
    this.itemtype = 'component';
    //this.container.innerHTML = this.item.getContent(function(self) {self.contentCallback(data); );
    (function(self) {
      self.item.getContent(function(data) {self.contentCallback(data)});
    })(this);
  }
  this.contentCallback = function(data) {
    var content = data;
    if (typeof data['content'] != 'undefined')
      content = data['content'];
    this.container.innerHTML = content;
  }
  this.resetContent = function() {
    this.item = false;
    this.itemtype = false;
    this.buttons = {};
    this.container.innerHTML = '';
    this.addButton('subdivide', 'Subdivide');
    //this.addButton('content', 'Set Content');
  }

  this.handleEvent = function(ev) {
    switch (ev.type) {
      case 'click':
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
        break;
      case 'dragstart':
        var el = ev.target || ev.currentTarget;
        ev.dataTransfer.setData('text/html', el.innerHTML);
        ev.dataTransfer.setData('thefind/panelslot', JSON.stringify(this));
        ev.effectAllowed = 'move'; // only allow moves
        ev.stopPropagation();
        break;
      case 'dragenter':
      case 'dragover':
        var state = '';
        if (ev.dataTransfer.types.contains('thefind/panelslot')) {
          var panelobj = ev.dataTransfer.getData('thefind/panelslot')
          if (panelobj == thefind.JSON.stringify(this))
            state = 'self';
          else
            state = 'droppable';
        } else if (ev.dataTransfer.types.contains('text/html')) {
          if (ev.target.innerHTML == ev.dataTransfer.getData('text/html'))
            state = 'self';
          else
            state = 'droppable';
        }
        if (state == '') {
          this.clearContainerStates(['droppable', 'self']);
        } else {
          thefind.utils.addClass(this.container, 'tf_utils_state_' + state);
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
        console.log('plop');
        var accept = false;
console.log('dataTransfer types:', ev.dataTransfer.types);
        if (ev.dataTransfer.types.contains('thefind/panelslot')) {
          var panelslot = ev.dataTransfer.getData('thefind/panelslot')
          if (panelslot != thefind.JSON.stringify(this)) {
            this.clone(thefind.JSON.parse(panelslot));
          }
          accept = true;
        } else if (ev.dataTransfer.types.contains('thefind/component')) {
          var component = ev.dataTransfer.getData('thefind/component');
          this.setAsComponent(thefind.JSON.parse(component));
          accept = true;
        } else if (ev.dataTransfer.types.contains('text/html')) {
          var data = ev.dataTransfer.getData('text/html');
          this.setAsComponent({name: 'page.content', content: data});
          accept = true;
        } else if (ev.dataTransfer.types.contains('text/plain')) {
          var data = ev.dataTransfer.getData('text/plain');
          this.setAsComponent({name: 'page.content', content: data});
          accept = true;
        }
        this.clearContainerStates(['droppable', 'self']);
        if (accept) {
          ev.preventDefault();
          ev.stopPropagation();
        }
        break;
    }
  }
  this.clearContainerStates = function(types) {
    for (var i = 0; i < types.length; i++) {
      while (thefind.utils.hasClass(this.container, 'tf_utils_state_' + types[i]))
        thefind.utils.removeClass(this.container, 'tf_utils_state_' + types[i]);
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
function TFComponent(args) {
  this.init = function(args) {
    //console.log("INIT component", args);
    this.name = args.name;
    this.componentargs = args.componentargs || {};
    this.content = args.content || false;
  }

  this.getContent = function(contentcallback) {
    var ret;
    if (!this.content) {
      //console.log('getcontent:', this);
      (function(self, contentcallback) {
        ajaxlib.Queue({
          method: "SCRIPT",
          url: "/" + self.name.replace(".","/") + ".json",
          args: thefind.utils.encodeURLParams(self.componentargs),
          callback: function(data) { self.content = data.content; if (typeof contentcallback == 'function') { contentcallback(data.content); } }
        });
      })(this, contentcallback);
      ret = '<img src="/images/misc/plugin-icon-180x120.png"/>';
    } else {
      ret = this.content;
      if (typeof contentcallback == 'function')
        contentcallback(this.content);
    }

    return ret;
  }
  this.init(args);
}

function TFUtilsPanelToolkit() {
  this.components = {};
  this.buttons = {};

  this.init = function() {
    this.addComponents([
      {name:'page.header'},
      {name:'page.logo'},
      {name:'page.footer'},
      //{name:'page.ads', content: '<h6>sponsored links</h6><a href="#">Shoes at Macy\'s</a><p>Shop Shoes at Macy\'s. Save 25-50% On Select Shoes.</p><em>Macys.com/Shoes</em>'},
      {name:'user.login'},
      {name:'user.register'},
      {name:'user.infobox'},
      {name:'search.input', componentargs: {enabled: 1}},
      {name:'search.info', content: 'Found 60,847 stores with 3,734,773 products matching <strong>shoes</strong>'},
      {name:'search.results', content: '[search results go here]'},
      {name:'search.filters', content: '[search filters go here]'},
      {name:'catmap.map_browse'},
      //{name:'catmap.map_breadcrumbs'},
      //{name:'catmap.map_items'},
      {name:'catmap.tf100'},
      {name:'corporate.navigation'},
      //{name:'coupons.directory'},
      {name:'debug.abtests'},
      {name:'debug.performance'},
      {name:'feedback.view'},
      //{name:'hotsearches.frontpage'},
      {name:'hotsearches.live'},
      {name:'hotsearches.map'},
      {name:'local.console'},
      //{name:'local.settings'},
      //{name:'marketing.about_results'},
      {name:'marketing.bookmark'},
      //{name:'marketing.browsecloud'},
      {name:'marketing.browsemap'},
      //{name:'marketing.browsesearches'},
      {name:'marketing.discoverytext'},
      {name:'marketing.familylinks', componentargs: {placement: 'frontpage.bottom'}},
      {name:'marketing.goodguide'},
      {name:'marketing.likeoursite'},
      {name:'marketing.line'},
      {name:'myfinds.recent_products'},
      {name:'myfinds.recent_searches'},
      {name:'myfinds.saved_products'}
    ]);
    

    this.container = document.createElement('DIV');
    this.container.id = 'tf_utils_toolkit';
    this.container.innerHTML = '<h3>Drag content types to place above</h3>';
    document.body.appendChild(this.container);

    for (var k in this.components) { 
      if (this.components.hasOwnProperty(k)) {
        this.addButton(k, k);
      }
    }
  }

  this.addComponent = function(args) {
    if (typeof args != 'undefined' && args.name) {
      thefind.utils.arraySet(this.components, args.name, new TFComponent(args));
    }
  }
  this.addComponents = function(components) {
    for (var i = 0; i < components.length; i++) {
      this.addComponent(components[i]);
    }
  }
  this.addButton = function(name, label, container) {
    this.buttons[name] = new TFUtilsButton({
      label: label,
      draggable: true,
      tag: 'DIV',
      events: { 
        mouseover: this,
        dragstart: this
      }
    });
    if (typeof container == 'undefined')
      container = this.container;
    this.buttons[name].addTo(container);
  }
  this.showContextMenu = function(menuname, items, parent) {
    if (typeof parent == 'undefined')
      parent = this.container;
    var contextmenuclass = 'tf_toolkit_contextmenu';
    var contextmenus = thefind.utils.getElementsByClassName(parent, "DIV", contextmenuclass);
    if (!contextmenus || !contextmenus[0] || contextmenus[0].length == 0) {
      contextmenu = document.createElement('DIV');
      contextmenu.className = contextmenuclass;
      parent.appendChild(contextmenu);
      for (var k in items) {
        if (items.hasOwnProperty(k)) {
          var fullname = menuname+'.'+k;
          this.addButton(fullname, fullname, contextmenu);
        }
      }
    }
  }
  this.handleEvent = function(ev) {
    switch(ev.type) {
      /*
      case 'click':
        var el = ev.target || ev.currentTarget;
        break;
      */
      case 'mouseover':
        var el = ev.target || ev.currentTarget;
        if (el) {
          var name = el.innerHTML;
          var component = thefind.utils.arrayGet(this.components, name);
          if (typeof component != 'undefined' && component != null) {
            if (component instanceof TFComponent) {
              component.getContent();
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

          var component = thefind.utils.arrayGet(this.components, name);
          if (typeof component != 'undefined') {
            ev.dataTransfer.setDragImage(this.getPreview(component), 0, 0);
            ev.dataTransfer.setData('text/html', component.content);
            ev.dataTransfer.setData('thefind/component', JSON.stringify(component));
            ev.effectAllowed = 'move'; // only allow moves
          }
        }
        break;
      case 'dragend':
//        this.clearPreview();
        break;
    }
  }
  this.getPreview = function(component) {
    if (!this.previewcontainer) {
      this.previewcontainer = document.createElement('DIV');
      this.previewcontainer.id = 'tf_toolbox_preview';
      this.previewcontainer.style.position = 'absolute';
      this.previewcontainer.style.left = '-50000px';
      this.previewcontainer.style.top = '-50000px';
      document.body.appendChild(this.previewcontainer);
    }
    var content = component.getContent();
    this.previewcontainer.innerHTML = '<div id="tf_toolbox_preview_content">'+content+'</div>';
    return this.previewcontainer.childNodes[0];
  }
  this.clearPreview = function() {
    document.body.removeChild(this.previewcontainer);
    delete this.previewcontainer;
    this.previewcontainer = false;
  }
  this.init();
}
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
function TFUtilsButton(args, container) {
  this.init = function(args, container) {
    this.tag = args.tag || "BUTTON";
    this.classname = args.classname || "";
    this.label = args.label || "Submit";
    this.draggable = args.draggable || false;
    this.events = args.events || {}
    this.create();

    if (typeof(container) != 'undefined')
      this.addTo(container);
  }
  this.create = function() {
    this.element = document.createElement(this.tag);
    this.element.innerHTML = this.label;
    var classname = '';
    if (this.draggable) {
      classname = 'tf_utils_button_draggable';
      this.element.draggable = true;
    }
    classname += this.classname;
    this.element.className = classname;

    for (var k in this.events) {
      thefind.func.bind(this.element, k, this.events[k]);
    }
  }
  this.addTo = function(container) {
    if (typeof container != 'undefined') {
      container.appendChild(this.element);
      return true;
    }
    return false;
  }
  this.setLabel = function(label) {
    this.label = label;
    if (this.element)
      this.element.innerHTML = label;
  }
  this.init(args, container);
}


function TFPanelEditor() {
  this.init = function() {
    this.toolkit = new TFUtilsPanelToolkit();
    this.base = new TFPanel({parentid: 'dostuff', orientation: 'vertical', 'root':true});
    this.base.addSlot();
    this.base.addSlot();

    this.savebutton = new TFUtilsButton({label: 'Save', events: { click: this }}, this.toolkit.container);
    //thefind.func.bind(window, 'resize', base);
  }
  this.handleEvent = function(ev) {
    switch(ev.type) {
      case 'click':
        this.base.getConfig();
        break;
    }
  }
  this.init();
}
TFPanelEditor();

</script>


{/literal}

 </div>
</div>
{component name="html.footer"}
