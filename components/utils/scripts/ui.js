elation.extend("ui.panel", function(parent, args, extras) {
  this.parent = parent;
  this.args = args;
  this.extras = extras;
  this.items = {};

  this.initialize = function(parent, args) {
    this.container = document.createElement('DIV');
    this.content = document.createElement('UL');
    //this.orientation = 'left'; // FIXME - this should be determined from the "anchor" parameter, or specified separately
    this.orientation = args.orientation || 'vertical';
    this.attach = args.attach || 'left';
    this.parentid = args.parentid || null;
    this.size = args.size || 'normal';
    this.type = args.type || 'slideout';
    this.collapsible = args.collapsible || false;
    this.content.className = 'ui_panel_content';
    this.classname = this.getClass();
    this.container.className = this.classname;
    this.container.appendChild(this.content);


    if (args) {
      this.anchor = args.anchor || 'top_left';
      this.offset = args.offset || [10, 10];

      if (args.id) {
        this.container.id = this.id = args.id;
      }

      if (this.collapsible) {
        this.handle = new elation.ui.panel.handle(this, args.handle);
      }

      if (args.items) {
        for (var k in args.items) {
          this.items[k] = new elation.ui.panel.item(this, args.items[k], {name: k});
        };
      }
    }

    return this.container;
  }
  this.getClass = function() {
    var classname = 'ui_panel';
    if (this.collapsible)
      classname += ' ui_panel_collapsible';
    if (this.orientation)
      classname += ' orientation_' + this.orientation;
    if (this.attach)
      classname += ' attach_' + this.attach;
    if (this.size)
      classname += ' size_' + this.size;
    if (this.type)
      classname += ' ui_panel_type_' + this.type;

    return classname;
  }

  this.initialize(parent, args);
});
elation.extend("ui.panel.handle", function (parent, args, extras) {
  this.parent = parent;
  this.args = args || {};
  this.extras = extras;

  // defaults
  this.togglestate = 1;
  this.gutter = 0;
  this.collapsetime = 350;
  this.collapsestyle = 'swing';
  this.label = '';
  this.type = 'slideout';
  this.attach = 'left';

    //this.orientation = this.orientations[this.parent.orientation];
  
  this.orientations = { 
    'left':   { 'margin': 'marginLeft',   'dimension': 'width' },
    'right':  { 'margin': 'marginRight',  'dimension': 'width' },
    'top':    { 'margin': 'marginTop',    'dimension': 'height' },
    'bottom': { 'margin': 'marginBottom', 'dimension': 'height' } // FIXME - bottom attachment doesn't work right
  };

  this.initialize = function(parent, args) {
    if (args) {
      this.gutter = args.gutter || this.gutter;
      this.collapsetime = args.collapsetime || this.collapsetime;
      this.collapsestyle = args.collapsestyle || this.collapsestyle;
      this.label = args.label || this.label;
      this.type = args.type || this.type;
      this.attach = args.attach || this.parent.attach || this.attach;
    }
    this.classname = this.getClass();
    this.element = document.createElement('DIV');
    this.element.className = this.classname;
    this.element.innerHTML = this.label;

    $(this.element).bind("mousedown", this, function (ev) {
    });
    $(this.element).bind("click", this, function (ev) {
      ev.data.toggle();
    });
    // FIXME - this doesn't work on the touchscreen
    if (this.args.autocollapse) {
      $(this.parent.container).bind("mouseleave", this, function (ev) {
        ev.data.collapse();
      });
    }

    this.parent.container.appendChild(this.element);
    if (this.args.collapsed) {
      var self = this;
      $(document).ready(function() {
        self.collapse(true);
      });
    }
  }
  this.getClass = function() {
    var classname = this.args.classname || 'ui_panel_handle';
    return classname;
  }
  this.toggle = function(instant) {
    if (this.togglestate)
      this.collapse(instant);
    else
      this.expand(instant);
  }
  this.collapse = function(instant) {
    if (this.togglestate != 0) {
      var element;
      if (this.parent.type == "slidein")
        element = this.parent.content;
      else
        element = this.parent.container;
      var panelelement = $(element);

      var dims = {'width': panelelement.width(), 'height': panelelement.height() };
      var orient = this.orientations[this.attach];
      var size = dims[orient.dimension];
      
      var css = {};
      css[orient.margin] = '-' + (size - this.gutter) + 'px';
//css.width = 0;
      if (instant) {
        if (elation.browser.type == "iphone" || elation.browser.type == "android")
          element.style.webkitTransform = "translateX(" + css[orient.margin] + ")";
        else 
          panelelement.css(css);
      } else {
        if (elation.browser.type == "iphone" || elation.browser.type == "android") {
          element.style.webkitTransition = "-webkit-transform " + this.collapsetime + "ms ease";
          element.style.webkitTransform = "translateX(" + css[orient.margin] + ")";
        } else {
          panelelement.animate(css, this.collapsetime, this.collapsestyle);
        }
      }
      this.togglestate = 0;
    }
  }
  this.expand = function(instant) {
    if (this.togglestate != 1) {
      var element;
      if (this.parent.type == "slidein")
        element = this.parent.content;
      else
        element = this.parent.container;
      var panelelement = $(element);
      var orient = this.orientations[this.attach];

      var css = {};
      css[orient.margin] = 0;

      if (instant) {
        if (elation.browser.type == "iphone" || elation.browser.type == "android")
          element.style.webkitTransform = "translateX(0)";
        else
          panelelement.css(css);
      } else {
        if (elation.browser.type == "iphone" || elation.browser.type == "android") {
          element.style.webkitTransition = "-webkit-transform " + this.collapsetime + "ms ease";
          element.style.webkitTransform = "translateX(0)";
        } else {
          panelelement.animate(css, this.collapsetime, this.collapsestyle);
        }
      }
      this.togglestate = 1;
    }
  }
  this.initialize(parent, args);
});

elation.extend("ui.panel.item", function(parent, args, extras) {
  this.parent = parent;
  this.args = args;
  this.extras = extras;

  this.initialize = function(parent, args) {
    this.id = args.id || null;
    this.tag = args.tag || 'a';
    this.href = args.href || '';
    this.type = args.type || 'none';
    this.label = args.label || '';
    this.status = args.status || 'default';
    this.component = args.component || null;
    this.classname = this.getClass();
    this.container = document.createElement("LI");
    this.element = document.createElement(this.tag);
    this.container.className = this.classname;

    if (this.href != '')
      this.element.href = this.href;

    this.element.innerHTML = this.label;

    if (this.type == "component" && this.component) {
      if (!this.id)
        this.id = this.parent.id + "_" + this.extras.name;
      ajaxlib.Get('/'+this.component.replace(/\./g, '/') + '.ajax?targetid=' + this.id); 
    }

    if (args.click) { 
      $(this.element).bind("click", this, args.click);
    }

    if (this.id)
      this.container.id = this.id;

    this.container.appendChild(this.element);
    if (parent.content) {
      parent.content.appendChild(this.container);
    }
//console.log('created new UIPanelItem:', this);
    return this.element;
  }
  this.getClass = function() {
    var classname = args.classname || 'ui_panel_item';
    if (this.type)
      classname += " ui_panel_item_" + this.type;

    return classname;
  }

  this.setStatus = function(status) {
    if (status != this.status) {
      $(this.element).removeClass('status_'+this.status);
      this.status = status;
      $(this.element).addClass('status_'+this.status);
    }
  }
  this.initialize(parent, args);
});
elation.extend("ui.panel.slideout", function(parentdiv, args) {
  var template = '<div class="ui_panel_slideout"><div class="ui_panel_slideout_handle"></div><div class="ui_panel_slideout_content"></div></div>';

  this.init = function (parentdiv, args) {
    this.parent = parent;
    this.args = args;
    this.div = $(this.template);
    parentdiv.appendChild(this.div);
  }
  this.expand = function () {
    
  }

  this.init(parentdiv, args);
});

/*
 * This function will checkall / uncheckall the checkboxes in a form.
 * state: true (check), false (uncheck)
 */
elation.extend("ui.checkall", function checkall(link, state) {
  while (link.tagName != 'FORM')
    link = link.parentNode;

  var	form = link,
			inputs = form.getElementsByTagName('input'),
			checkboxes = new Array();

	for (i=0; i<inputs.length; i++)
		if (inputs[i].type == 'checkbox')
			inputs[i].checked = state;
});
