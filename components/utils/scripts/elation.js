/** @namespace elation */
/** @namespace elation.utils */
/** @namespace elation.html */

if (typeof window == 'undefined') var window = {}; // compatibility for nodejs/worker threads
var elation = window.elation = new function(selector, parent, first) {
  if (typeof selector == 'string' && typeof elation.find == 'function')
    elation.find(selector, parent, first);
  
  this.extend = function(name, func, clobber, inheritfrom) {
		var ptr = this,
				xptr = (typeof exports != 'undefined' ? exports : {}),
				parts = name.split("."),
				i;
		
		for (i = 0; i < parts.length-1; i++) {
			if (typeof ptr[parts[i]] == 'undefined')
				ptr[parts[i]] = xptr[parts[i]] = {};
			
			ptr = xptr = ptr[parts[i]];
		}
		
		if (typeof ptr[parts[i]] == 'undefined' || ptr[parts[i]] === null || clobber == true) {
			ptr[parts[i]] = xptr[parts[i]] = func;
		} else {
			console.log("elation: tried to clobber existing component '" + name + "'");
		}
		if (typeof inheritfrom == 'function') {
			ptr.prototype = xptr.prototype = new inheritfrom;
			ptr.prototype.constructor = xptr.prototype.constructor = ptr;
		}
	  if (typeof exports != 'undefined') exports.extend = this.extend;
	}
  this.implement = function(obj, iface, ifaceargs) {
		if (typeof iface == 'function') {
      var foo = new iface(ifaceargs);
      for (var k in foo) {
        obj[k] = foo[k];
      }
		}
  }
}

elation.extend("component", new function() {
  this.init = function(root) {
    if (root == undefined) {
      root = document;
    }

    // Find all elements which have a data-elation-component attribute
    var elements = elation.find('[data-elation-component]');

    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];
      var componentid = this.parseid(element);
      if (componentid.type) {
        var componentinitialized = element.dataset['elationInitialized'] || false;
        if (!componentinitialized) { 
          var componentargs = {}, events = {};
          var componentdata = this.parseargs(element);
          // Instantiate the new component with all parsed arguments
          elation.component.create(componentid.name, componentid.type, element, componentdata.args, componentdata.events);
        }
      }
    }
  }
  this.add = function(type, classdef, extendclass) {
    // At the top level, a component is just a function which checks to see if
    // an instance with the given name exists already.  If it doesn't we create
    // it, and then we return a reference to the specified instance.
    var component = function(name, container, args, events) {
      /* handling for any default values if args are not specified */
      var mergeDefaults = function(args, defaults) {
        var args = args || {};

        if (typeof defaults == 'object') {
          for (var key in defaults) {
            if (elation.utils.isNull(args[key])) {
              args[key] = defaults[key];
            }
          }
        }
        
        return args;
      };

      var realname = name;
      if (elation.utils.isObject(name)) {
        // Simple syntax just takes an object with all arguments
        args = name;
        realname = elation.utils.any(args.id, args.name, null);
        container = (!elation.utils.isNull(args.container) ? args.container : null);
        events = (!elation.utils.isNull(args.events) ? args.events : null);
      }

      // If no args were passed in, we're probably being used as the base for another 
      // component's prototype, so there's no need to go through full init
      if (elation.utils.isNull(realname) && !container && !args) {
        obj = new component.base(type);
        
        // apply default args
        obj.args = mergeDefaults(obj.args, elation.utils.clone(obj.defaults));
        
        return obj;
      }

      // If no name was passed, use the current object count as a name instead ("anonymous" components)
      if (elation.utils.isNull(realname) || realname === "") {
        realname = component.objcount;
      }

      if (!component.obj[realname] && !elation.utils.isEmpty(args)) {
        component.obj[realname] = obj = new component.base(type);
        component.objcount++;
      //}
      // TODO - I think combining this logic would let us use components without needing HTML elements for the container
      //if (component.obj[realname] && container !== undefined) {
        component.obj[realname].componentinit(type, realname, container, args, events);

/*
        if (component.extendclass) {
          component.obj[realname].initSuperClass(component.extendclass);
        }
*/
        // apply default args
        if (typeof obj.defaults == 'object')
          args = mergeDefaults(args, elation.utils.clone(obj.defaults));

        var parentclass = component.extendclass;

        // recursively apply inherited defaults
        while (parentclass) {
          if (typeof parentclass.defaults == 'object')
            elation.utils.merge(mergeDefaults(args, elation.utils.clone(parentclass.defaults)),args);

          parentclass = parentclass.extendclass;
        }

        if (typeof obj.init == 'function') {
          obj.init(realname, container, args, events);
        }
      }
      return component.obj[realname];
    };
    component.objcount = 0;
    component.obj = {}; // this is where we store all the instances of this type of component
    (function() { 
      var elation = {};
      window.elation.utils.arrayset(elation, type, null);
      var namehack = "elation." + type + " = function () { }; component.base = elation." + type;
      eval(namehack); // FIXME - weirdness to force usable names while console.logging components
    })();
    component.base.prototype = new this.base(type);
    if (extendclass) {
      component.extendclass = new extendclass();
      component.base.prototype.extend(component.extendclass);
    }
    if (classdef) {
      component.base.prototype.extend((typeof classdef == 'function' ? new classdef() : classdef));
      component.classdef = classdef;
    }
    elation.extend(type, component); // inject the newly-created component wrapper into the main elation object
  }
  this.create = function(id, type, container, args, events) {
    var componentclass = elation.utils.arrayget(elation, type);
    if (typeof componentclass == 'function') {
      var instance = componentclass.call(componentclass, id, container, args, events);
    } 
    //console.error("elation: tried to instantiate unknown component type '" + type + "', id '" + id + "'");
  }
  this.get = function(id, type, container, args, events) {
    var componentclass = elation.utils.arrayget(elation, type);
    if (componentclass && typeof componentclass == 'function') {
      return componentclass.call(componentclass, id, container, args, events);
    } else {
      console.log('no way buddy');
      this.add(type);
      return this.create(id, type, container, args, events);
    }
  }
  this.load = function(componentname, callback) {
    // Loads the dependency script/css for the specified component, and execute callback if supplied
    var componentbase = componentname.replace('.', '/');
    var root = elation.file.root()
    var batch = new elation.file.batch();
    batch.add(root + '/scripts/' + componentbase + '.js', 'javascript');
    //batch.add(root + '/css/' + componentbase + '.css', 'css');
    // FIXME - batch loading seems to not load css files reliably
    elation.file.get('css', root + '/css/' + componentbase + '.css');
    if (callback) batch.callback(callback);
  }
  this.info = function(type) {
    var componentclass = elation.utils.arrayget(elation, type);
    if (componentclass && typeof componentclass == 'function') {
      return {objcount: componentclass.objcount};
    }
  }
  this.base = function(component) {
    this.componentinit = function(name, id, container, args, events) {
      this.name = name;
      this.id = id;
      this.componentname = name; // FIXME - redundant with this.name above, but this.name is very likely to be clobbered by the user
      this.args = args || {};
      if (container) {
        this.container = container;
      } else if (this.args.containertag) {
        this.container = elation.html.create(this.args.containertag);
      } else if (this.defaultcontainer) {
        this.container = elation.html.create(this.defaultcontainer);
      } else {
        this.container = null;
      }
      this.events = events || {};
      for (var k in this.events) {
        if (typeof this.events[k] == 'string') {
          (function(self, type, blub) {
            self[type] = function(ev) { eval(blub); }
            elation.events.add(self, type, self);
          })(this, k, this.events[k]);
        } else {
          elation.events.add(this, k, this.events[k]);
        }
      }
      if (this.container) {
        this.container.dataset['elationComponent'] = name;
        this.container.dataset['elationName'] = id;
        this.container.dataset['elationInitialized'] = 1;

        if (this.defaultcontainer && this.defaultcontainer.classname && !elation.html.hasclass(this.container, this.defaultcontainer.classname)) {
          elation.html.addclass(this.container, this.defaultcontainer.classname);
        }

        if (this.args.setContent) {
          elation.html.setContent(this.container, this.args.setContent);
        }

        if (this.args.append) {
          elation.html.attach(this.args.append, this.container, this.args.before || false);
        }
      }

      elation.events.fire({type: "init", fn: this, data: this, element: this.container});
    }
    this.initSuperClass = function(classdef) {
      var _super = {};
      if (classdef) {
        for (var k in classdef) {
          if (typeof classdef[k] == 'function') {
            _super[k] = elation.bind(this, classdef[k]);
          }
        }
      }
      return _super;
    }

    this.extend = function(from) {
      for (var k in from) {
        if (k != 'constructor' && k != 'prototype') {
          this[k] = from[k];
        }
      }
    }
    this.set = function(sets, value) {
      // special set function to send update notifications when the object (or eventually, individual values) change
      if (typeof sets == 'string' && value) {
        var k = sets;
        sets = {};
        sets[k] = value;
      } 
      var changes = 0;
      for (var k in sets) {
        if (elation.utils.arrayget(this, k) != sets[k]) {
          elation.utils.arrayset(this, k, sets[k]);
          changes++;
        }
      }
      if (changes > 0) {
        // TODO - if we supported bindings, we could send updates directly to specific observers when specific attributes are updated
        elation.events.fire({type:'update', origin: this, data: this, element: this.container});
        return true;
      }
      return false;
    }
    this.setevents = function(events) {
      for (var k in events) {
        this.events[k] = events[k];
      }
    }
    this.fetch = function(type, callback, force) {
      var ret;
      //var urlbase = "/~bai/"; // FIXME - stupid stupid stupid!  move this to the right place asap!
      var urlbase = '/';
      if (force || !this.content) {
        (function(self, callback) {
          console.log(urlbase + self.name.replace(".","/") + "." + type);
          var args = self.args;
          args.events = self.events;
          console.log('stupid dumb args is', args);
          ajaxlib.Queue({
            method: "GET",
            url: urlbase + self.name.replace(".","/") + "." + type,
            args: elation.utils.encodeURLParams(args),
            callback: function(data) { self.content = data; if (typeof callback == 'function') { callback(data); } }
          });
        })(this, callback);
        ret = '<img src="/images/misc/plugin-icon-180x120.png"/>';
      } else {
        ret = this.content;
        if (typeof callback == 'function')
          callback(this.content);
      }

      return ret;
    }
    this.reparent = function(newparent) {
      if (this.container && this.container.parentNode && this.container.parentNode !== newparent) {
        this.container.parentNode.removeChild(this.container);
      }
      if (newparent) {
        newparent.appendChild(this.container);
        elation.component.init();
      }
    }
    this.handleEvent = function(ev) {
      if (typeof this[ev.type] == 'function') {
        this[ev.type](ev);
      }
    }
    this.destroy  = function() {
      var componentclass = elation.utils.arrayget(elation, this.componentname);
      if (componentclass && componentclass.obj[this.id]) {
        delete componentclass.obj[this.id];
      }
    }
/*
    this.addEventListener = function(type, listener, useCapture) {
      elation.events.add(this, type, listener);
    }
    this.dispatchEvent = function(event) {
      elation.events.fire(event);
    }
*/
  }
  this.parseid = function(element) {
    // Parse out the data-elation-component and data-elation-name attributes, if set.  Fall back on HTML id if no name specified
    var componentid = {
      type: element.dataset['elationComponent'],
      name: element.dataset['elationName'] || element.id
    }
    return componentid;
  }
  this.parseargs = function(element) {
    if (element.children) {
      // Pull out all <data> blocks
      var dataresult = elation.find("data", element);
      var componentargs = {}, events = {};
      for (var j = 0; j < dataresult.length; j++) {
        var dataelement = dataresult[j];
        if (elation.html.hasclass(dataelement, 'elation-args')) {
          // JSON-encoded args inside of <data class="elation-args">...</data>
          var argtext = dataelement.textContent || dataelement.innerText;
          var argname = (dataelement.attributes['name'] ? dataelement.attributes['name'].value : false);
          try {
            var content = dataelement.innerHTML.trim();

            // if elation-name parameter is specified, merge this data into the appropriate place
            var mergeto = componentargs;
            if (argname) {
              var tmpmergeto = elation.utils.arrayget(componentargs, argname);
              if (tmpmergeto === null) { // requested key is new, create it and get a reference to the new object
                elation.utils.arrayset(componentargs, argname, {});
                mergeto = elation.utils.arrayget(componentargs, argname);
              } else {
                mergeto = tmpmergeto; // key already exists, store reference
              }
            }
            if (content.length > 0) {
              var newcomponentargs = '';
              try {
                newcomponentargs = JSON.parse(content);
              } catch (e) {
                newcomponentargs = content;
                // Simple string, so set the value directly rather than using merge-by-reference
                elation.utils.arrayset(componentargs, argname, content);
              }
              //dataelement.parentNode.removeChild(dataelement);
              if (componentargs != null) { // empty JSON could cause errors later, so reset null to an empty hash
                elation.utils.merge(newcomponentargs, mergeto);
              }
            }
          } catch(e) {
            // Probably JSON syntax error
            console.log("Could not parse args: " + argtext + ": " + e.stack);
          }
        } else if (elation.html.hasclass(dataelement, "elation-events")) { 
          try {
            var content = dataelement.innerHTML.trim();
            if (content.length > 0) {
              events = JSON.parse(content);
              element.removeChild(dataelement);
              if (events == null) { // empty JSON could cause errors later, so reset null to an empty hash
                events = {};
              }
            }
          } catch(e) {
            // Probably JSON syntax error
            console.log("Could not parse " + eventsattr + ": " + element.children[j].innerHTML);
          }
        }
      }
    }
    // Then, loop through the attributes and parse out any individual arguments which can be specified as attributes
    var argprefix = 'elationArgs.';
    var eventprefix = 'elationEvents.';
    for (var k in element.dataset) {
      if (k.substring(0, argprefix.length) == argprefix) {
        elation.utils.arrayset(componentargs, k.substring(argprefix.length), element.dataset[k]);
        //componentargs[k.substring(argprefix.length)] = element.dataset[k];
      } else if (k.substring(0, eventprefix.length) == eventprefix) {
        events[k.substring(eventprefix.length)] = element.dataset[k];
      }
    }
    return {args: componentargs, events: events};
  }
  this.fetch = function(type, name) {
    if (type instanceof elation.component.base) {
      // If we were passed an already-existing component, just return it
      return type;
    }

    var id;
    if (!elation.utils.isNull(type) && elation.utils.iselement(type)) {
      // If an HTML element was passed in, find the associated component id
      id = this.parseid(type);
    } else if (elation.utils.isArray(type)) {
      id = { type: type[0], name: type[1] };
    } else {
      id = { type: type, name: name };
    }
    if (id.type && id.name) {
      var componentclass = elation.utils.arrayget(elation, id.type);
      if (componentclass && typeof componentclass == 'function') {
        return componentclass(id.name);
      }
    }

  }
});

elation.extend('onloads',new function() {
  this.done = false;
  this.onloads = [];

  this.add = function(expr) {
    this.onloads.push(expr);
    
    // if DOM already loaded, execute immediately
    if (this.done) this.execute();
  }
  this.init = function() {
    /* for Safari */
    //if (/WebKit/i.test(navigator.userAgent)) { // sniff
      this.timer = setInterval(function() {
        if (/loaded|complete/.test(document.readyState)) {
          elation.onloads.execute(); // call the onload handler
        }
      }, 10);
    //  return;
    //}

    /* for Mozilla/Opera9 */
    if (document.addEventListener) {
      document.addEventListener("DOMContentLoaded", elation.onloads.execute, false);
      return;
    }
    /* for Internet Explorer */
    /*@cc_on @*/
    /*@if (@_win32)
     document.write("<scr"+"ipt id=\"__ie_onload\" defer src=\"/blank.fhtml\"><\/scr"+"ipt>");
      var script = document.getElementById("__ie_onload");
      script.onreadystatechange = function() {
        if (this.readyState == "complete") {
          elation.onloads.execute(); // call the onload handler
        }
      };
      return;
    /*@end @*/
    
    window.onload = elation.onloads.execute;
  }
  this.execute = function() {
    // quit if this function has already been called
    // ^--- no dont do that or else we cant execute after dom load
    //if (elation.onloads.done) return;

    // flag this function so we don't do the same thing twice
    elation.onloads.done = true;

    // kill the timer
    if (elation.onloads.timer) clearInterval(elation.onloads.timer);

    var script = '';
    var expr;
    while (expr = elation.onloads.onloads.shift()) {
      if (typeof expr == 'function') {
        expr(); // FIXME - this causes all function references to be executed before all strings
      } else {
        script += expr + (expr.charAt(expr.length - 1) != ';' ? ';' : '');
      }
    }

    eval(script);
  }
});
//elation.onloads.init();

/** 
 * Bind a function to a specified context, so "this" maps correctly within callbacks
 *
 * @function elation.bind
 * @param {object}   ctx Context to bind to
 * @param {function} fn  Function to bind
 */ 
elation.extend("bind", function(ctx, fn) {
  if (typeof fn == 'function') {
    var fnargs = Array.prototype.splice.call(arguments, 2);
    fnargs.unshift(ctx);
    return (typeof fn.bind == 'function' ? 
        Function.prototype.bind.apply(fn, fnargs) : // modern browsers have fn.bind() built-in
        function() { fn.apply(ctx, arguments); }    // older browsers just need a closure to carry the context through
      );
  } else if (typeof ctx == 'function') {
    return ctx;
  }
});

elation.extend("html.dimensions", function(element, ignore_size) {
  if (!element)
    return;
  
	if (typeof element != 'object' || element === window) {
		var	w = window.innerWidth		|| document.documentElement.clientWidth		|| document.body.clientWidth,
				h = window.innerHeight	|| document.documentElement.clientHeight	|| document.body.clientHeight;
		
		return {
			0 : w,
			1 : h,
			x : 0,
			y : 0,
			w : w,
			h : h,
			s : elation.html.getscroll()
		};
	}
	
  if ('getBoundingClientRect' in element) {
    var rect = element.getBoundingClientRect(),
        top = rect.top,
        left = rect.left,
        width = rect.width,
        height = rect.height,
        r = Math.round,
        x = r(left),
        y = r(top),
        w = r(width),
        h = r(height);
  } else {
    var w = ignore_size ? 0 : element.offsetWidth,
  			h = ignore_size ? 0 : element.offsetHeight,
  			x = element.offsetLeft,
  			y = element.offsetTop;
  }
	var scrollleft = element.scrollLeft || 0,
			scrolltop = element.scrollTop || 0,
			id = element.id || '';
	
  try {
    while (element = element.offsetParent) {
      x += element.offsetLeft - element.scrollLeft;
      y += element.offsetTop - element.scrollTop;
    }
  } catch(e) { 
    console.log('html.dimensions: '+e.message); 
  }
  
	if (document.body.scrollTop == window.scrollY)
		y += window.scrollY;
	
  return {
		0: x,
		1: y,
		'x': x, 
		'y': y, 
		'w': w, 
		'h': h,
    's': [scrollleft, scrolltop],
    'scrollTop': scrolltop,
		'scrollLeft': scrollleft,
    'width': width || w,
    'height': height || h,
    'top': top || y,
    'left': left || x
	};
});

elation.extend("html.size", function(obj) {
  return [obj.offsetWidth, obj.offsetHeight];
});

elation.extend("html.position", function(obj) {
  var curleft = curtop = 0;
  if (obj.offsetParent) {
    curleft = obj.offsetLeft;
    curtop = obj.offsetTop;
    while (obj = obj.offsetParent) {
      curleft += obj.offsetLeft;
      curtop += obj.offsetTop;
    }
  }
  return [curleft,curtop];
});

// html.preloader will fire events and/or callback when all elements have onload'd
elation.extend('html.preloader', function(elements, args) {
  this.elements = elements;
  this.args = args || { timeout: 2000, callback: false };
  this.index = 0;
  
  this.init = function() {
    for (var i=0; i<this.elements.length; i++) {
      if (this.elements[i].complete)
        this.index++;
      else
        elation.events.add(this.elements[i], 'load', this);
    }
    
    if (!this.validate())
      (function(self) {
        self.timer = setTimeout(function() {
          if (!self.items) {
            console.log('2s timeout reached, forcing load.');
            self.done();
          }
        }, self.args.timeout || 2000);
      })(this);
  }
  
  this.load = function(event, target) {
    elation.events.fire('preloader_load', this);
    
    this.validate(true);
  }
  
  this.validate = function(increment) {
    if (increment) this.index++;
    
    //console.log('validate', increment, this.index, this.elements.length);
    if (this.index == this.elements.length) {
      this.done();
      
      return true;
    }
    
    return false;
  }
  
  this.done = function() {
    (function(self) {
      setTimeout(function() { elation.events.fire('preloader_done', self); }, 1);
    })(this);
    
    if (typeof this.args.callback == 'function')
      this.args.callback();
    
    clearTimeout(this.timer);
  }
  
	this.handleEvent = function(event) {
		var event = event || window.event,
				target = elation.events.getTarget(event),
				type = event.type == 'DOMMouseScroll' ? 'mousewheel' : event.type;
		
		if (typeof this[type] == 'function')
			return this[type](event, target);
	}
  
  this.init();
});

// methods for css classname information and manipulation
elation.extend("html.hasclass", function(element, className) {
  if(element && element.className) {
    var re = new RegExp("(^| )" + className + "( |$)", "g");
    return element.className.match(re);
  }
  return false;
});

elation.extend("html.addclass", function(elements, className) {
  if (!elation.utils.isArray(elements)) {
    elements = [elements];
  }
  for (var i = 0; i < elements.length; i++) {
    if (elements[i] && !elation.html.hasclass(elements[i], className)) {
      elements[i].className += (elements[i].className ? " " : "") + className;
    }
  }
}); 

elation.extend("html.removeclass", function(elements, className) {
  var re = new RegExp("(^| )" + className + "( |$)", "g");
  if (elements) {
    if (!elation.utils.isArray(elements)) {
      elements = [elements];
    }
    for (var i = 0; i < elements.length; i++) {
      if (elements[i] && elements[i].className && elements[i].className.match(re)) {
        elements[i].className = elements[i].className.replace(re, " ");
      }
    }
  } 
});

elation.extend("html.toggleclass", function(element, className) {
  if (this.hasclass(element, className))
    this.removeclass(element, className)
  else
    this.addclass(element, className);
});

// for great justice
elation.extend("html.hasClass", elation.html.hasClass);
elation.extend("html.addClass", elation.html.addClass);
elation.extend("html.removeClass", elation.html.removeClass);
elation.extend("html.toggleClass", elation.html.toggleClass);

/**
 * Create a new html element
 *
 * @function elation.html.create
 * @param {object} parms
 * @param {string} parms.tag
 * @param {string} parms.classname
 * @param {string} parms.id
 * @param {string} parms.content
 * @param {HTMLElement|elation.ui.component} parms.append
 * @param {boolean} parms.before
 * @param {object} parms.style
 * @param {object} parms.additional
 *
 * @example
 * elation.html.create({ 
 *      tag:'div', 
 *      classname:'example',
 *      style: { width:'30px', height:'20px' },
 *      attributes: { innerHTML: 'Test!' },
 *      append: elementObj
 *    });
 */
elation.extend('html.create', function(parms, classname, style, attr, append, before) {
  if (typeof parms == 'object') {
    var tag = parms.tag || 'div',
        classname = parms.classname,
        id = parms.id,
        attr = parms.attributes || parms.attr,
        style = parms.style || parms.css,
        content = parms.content,
        append = parms.append,
        before = parms.before;
  }
  
  var element = document.createElement(tag || parms || 'div');
  
  if (id)
    element.id = id;

  if (classname)
    element.className = classname;
  
  if (style)
    elation.html.css(element, style);

  if (content)
    elation.html.setContent(element, content);
  
  if (typeof attr == 'object') {
    for (var property in attr) {
      element[property] = attr[property];
    }
  }
  
	if (append)
		elation.html.attach(append, element, before);
	
  return element;
});

// will do appendChild or insertBefore where appropriate
// will sanitize for elation components to return their containers
elation.extend("html.attach", function(container, element, before) {
  if (!container || !element || typeof container == 'string')
    return;

  var container = elation.utils.getContainerElement(container),
      element = elation.utils.getContainerElement(element),
      before = elation.utils.getContainerElement(before);

  if (before) {
    container.insertBefore(element, before);
  } else {
    container.appendChild(element);
  }
});

// determines how best to inject content into container
// automatically used in components with this.args.content
elation.extend("html.setContent", function(element, content, append) {
  if (!element || !content)
    return;

  var element = elation.utils.getContainerElement(element);

  if (elation.utils.isString(content)) {
    if (!append) element.innerHTML = content;
    else element.innerHTML += content;
  } else if (content.container instanceof HTMLElement) {
    if (!append) element.innerHTML = '';
    element.appendChild(content.container);
  } else if (content instanceof HTMLElement) {
    if (!append) element.innerHTML = '';
    element.appendChild(content);
  }
});

elation.extend('html.getscroll', function(shpadoinkle) {
  if (elation.iphone && elation.iphone.scrollcontent)
    var pos = [0,0];//elation.iphone.scrollcontent.getPosition();
	else if (typeof pageYOffset != 'undefined') 
		var pos = [ 
			pageXOffset, 
			pageYOffset 
		];
	else 
		var	QuirksObj = document.body,
				DoctypeObj = document.documentElement,		
				element = (DoctypeObj.clientHeight) 
					? DoctypeObj 
					: QuirksObj,
				pos = [ 
					element.scrollLeft, 
					element.scrollTop 
				];

	switch (shpadoinkle) {
		case 0:
			return pos[0];
		
		case 1:
			return pos[1];
		
		default:
			return [ 
				pos[0], 
				pos[1] 
			];
	}
});
elation.extend("html.get_scroll", elation.html.getscroll);
elation.extend("html.getScroll", elation.html.getscroll);

elation.extend("html.styleget", function(el, styles) {
  if (typeof styles == 'string') {
    styles = [styles];
  }
  var ret = {};
  var computed = window.getComputedStyle(el, null);
  for (var k = 0; k < styles.length; k++) {
    for (var i = computed.length; i--;) {
      var property = elation.utils.camelize(computed[i]);
      if (property.indexOf(styles[k]) > -1) {
        ret[property] = computed[property];
      }
    }
  }
  return ret;
});

elation.extend("html.css", function(el, styles) {
  for (var k in styles) {
    el.style[k] = styles[k];
  }
});
// Cross-browser transform wrapper
elation.extend("html.transform", function(el, transform, origin, transition) {
  if (transition) { // Set transition first, if supplied
    el.style.webkitTransition = el.style.MozTransition = el.style.msTransition = el.style.transition = transition;
  }

  if (transform) {
    el.style.webkitTransform = el.style.MozTransform = el.style.msTransform = el.style.transform = transform;
  }

  if (origin) { // Optionally, set transform origin
    el.style.webkitTransformOrigin = el.style.MozTransformOrigin = el.style.msTransformOrigin = el.style.transformOrigin = origin;
  }

  return {
    transform: el.style.webkitTransform || el.style.MozTransform || el.style.msTransform || el.style.transform,
    transformorigin: el.style.webkitTransformOrigin || el.style.MozTransformOrigin || el.style.msTransformOrigin || el.style.transformOrigin,
    transition: el.style.webkitTransition || el.style.MozTransition || el.style.msTransition || el.style.transition
  };
});
elation.extend("html.stylecopy", function(dst, src, styles) {
  if (typeof styles == 'string') {
    styles = [styles];
  }
  var computed = window.getComputedStyle(src, null);
  for (var k = 0; k < styles.length; k++) {
    for (var i = computed.length; i--;) {
      var property = elation.utils.camelize(computed[i]);
      if (property.indexOf(styles[k]) > -1) {
        dst.style[property] = computed[property];
      }
    }
  }
});
elation.extend("utils.camelize", function(text) {
  return text.replace(/[-\.]+(.)?/g, function (match, chr) {
    return chr ? chr.toUpperCase() : '';
  });
});

elation.extend("utils.isElement", function(obj) {
  try {
    //Using W3 DOM2 (works for FF, Opera and Chrome)
    return obj instanceof HTMLElement;
  }
  catch(e){
    //Browsers not supporting W3 DOM2 don't have HTMLElement and
    //an exception is thrown and we end up here. Testing some
    //properties that all elements have. (works on IE7)
    return (typeof obj==="object") &&
      (obj.nodeType===1) && (typeof obj.style === "object") &&
      (typeof obj.ownerDocument ==="object");
  }
});

elation.extend("utils.encodeURLParams", function(obj) {
  var value,ret = '';
  
  if (typeof obj == "string") {
    ret = obj;
  } else {
    var flattened = elation.utils.flattenURLParams(obj);
    for (var key in flattened) {
      if (typeof flattened[key] != 'undefined') {
        ret += (ret != '' ? '&' : '') + key + '=' + encodeURIComponent(flattened[key]); 
      }
    }
  }
  
  return ret;
});
elation.extend("utils.flattenURLParams", function(obj, prefix) {
  var ret = {};
  for (var k in obj) {
    var key = (prefix ? prefix + '[' + k + ']' : k);
    if (typeof obj[k] == 'object') {
      var flattened = elation.utils.flattenURLParams(obj[k], key);
      elation.utils.merge(flattened, ret);
    } else {
      ret[key] = obj[k];
    }
  }
  return ret;
});
elation.extend("utils.parseURL", function(str) {
  var ret = {uri: str, args: {}};
  var hashparts = str.split('#');
  var parts = hashparts[0].split("?");
  if (parts[0]) {
    var fileparts = parts[0].split(/:\/\//, 2);
    if (fileparts[1]) {
      ret.scheme = fileparts[0];
      if (fileparts[1][0] == '/') {
        ret.host = document.location.host;
        ret.path = fileparts[1];
      } else {
        var pathparts = fileparts[1].split("/");
        ret.host = pathparts.shift();
        ret.path = '/' + pathparts.join("/");
      }
    } else {
      ret.scheme = document.location.protocol.slice(0, -1);
      ret.host = document.location.host;
      ret.path = fileparts[0];
    }
  }
  if (parts[1]) {
    var args = parts[1].split("&");
    ret.args = {};
    for (var i = 0; i < args.length; i++) {
      var argparts = args[i].split("=", 2);
      ret.args[argparts[0]] = decodeURIComponent(argparts[1]);
    }
  }
  if (hashparts[1]) {
    var hashargs = hashparts[1].split("&");
    ret.hashargs = {};
    for (var i = 0; i < hashargs.length; i++) {
      var hashargparts = hashargs[i].split("=", 2);
      ret.hashargs[hashargparts[0]] = decodeURIComponent(hashargparts[1]);
    }
  }
  return ret;
});
elation.extend("utils.makeURL", function(obj) {
  var argstr = elation.utils.encodeURLParams(obj.args);
  return obj.scheme + "://" + obj.host + obj.path + (argstr ? '?' + argstr : '');
});

elation.extend("utils.merge", function(entities, mergeto) {
  if (typeof entities == 'object' && !(mergeto instanceof HTMLElement)) {
    if (typeof mergeto == 'undefined' || mergeto === null) mergeto = {}; // Initialize to same type as entities
    for (var i in entities) {
      if (entities[i] !== null) {
        if (entities[i] instanceof Array) {
          if (mergeto[i] instanceof Array) {
            //console.log('concat array: ' + i + ' (' + mergeto[i].length + ' + ' + entities[i].length + ')');
            mergeto[i] = mergeto[i].concat(entities[i]);
          } else {
            //console.log('assign array: ', i, typeof mergeto[i]);
            mergeto[i] = entities[i];
          }
        } else if (entities[i] instanceof Object) {
          if (mergeto[i] instanceof Object) {
            //console.log('merge object: ', i);
            elation.utils.merge(entities[i], mergeto[i]);
          } else {
            //console.log('assign object: ', i, typeof mergeto[i]);
            mergeto[i] = entities[i];
          }
        } else {
          mergeto[i] = entities[i];
        }
      }
    }
  }
  return mergeto;
});

/**
 * Sets value in a multilevel object element 
 *
 * @function elation.utils.arrayset
 * @param {object} obj
 * @param {string} element
*/
elation.extend("utils.arrayset", function(obj, element, value) {
  var ptr = obj;
  var x = element.split(".");
  for (var i = 0; i < x.length - 1; i++) {
    if (ptr==null || (typeof ptr[x[i]] != 'array' && typeof ptr[x[i]] != 'object' && i != x.length-1)) {
      ptr[x[i]] = {};
    }
    ptr = ptr[x[i]];
  }
  if (typeof ptr == "object") {
    ptr[x[x.length-1]] = value;
  }
});
/**
 * Retrieves specified dot-separated value from a multilevel object element 
 *
 * @function elation.utils.arrayget
 * @param {object} obj
 * @param {string} name
 * @param {object|number|string} [defval] default value if none found
*/
elation.extend("utils.arrayget", function(obj, name, defval) {
  var ptr = obj;
  var x = name.split(".");
  for (var i = 0; i < x.length; i++) {
    if (ptr==null || (!elation.utils.isArray(ptr[x[i]]) && !elation.utils.isObject(ptr[x[i]]) && i != x.length-1)) {
      ptr = null;
      break;
    }
    ptr = ptr[x[i]];
  }
  if (typeof ptr == "undefined" || ptr === null) {
    return (typeof defval == "undefined" ? null : defval);
  }
  return ptr;
});
elation.extend("utils.arraymin", function(array) {
	var value=ret=0;
	
	for (var i=total=0; i<array.length; i++) {
		value = array[i];
		if (ret == 0 || value < ret) 
			ret = value;
	}
	
	return ret; 
});
elation.extend("utils.arraymax", function(array) {
	var value=ret=0;

	for (var i=total=0; i<array.length; i++) {
		value = array[i];
		if (value > ret) ret = value;
	}
	
	return ret; 
});
elation.extend("utils.arrayavg", function(array) {
	return (arraySum(array) / array.length); 
});
elation.extend("utils.arraysum", function(array) {
	for (var i=total=0; i<array.length; i++) 
    total += array[i];
	
  return total;
});

//Returns true if it is a DOM node
elation.extend("utils.isnode", function(obj) {
  return (
    typeof Node === "object" ? obj instanceof Node : 
    typeof obj === "object" && typeof obj.nodeType === "number" && typeof obj.nodeName==="string"
  );
});

//Returns true if it is a DOM element    
elation.extend("utils.iselement", function(obj) {
  return (
    typeof HTMLElement === "object" ? obj instanceof HTMLElement : //DOM2
    typeof obj === "object" && obj.nodeType === 1 && typeof obj.nodeName==="string"
  );
});
elation.extend("utils.isTrue", function(obj) {
  if (obj == true || obj == 'true') 
    return true;
  
  return false;
});
	
elation.extend("utils.isNull", function(obj) {
  if (obj == null || typeof obj == 'undefined') 
    return true;
  
  return false;
});
	
elation.extend("utils.isEmpty", function(obj) {
  if (obj !== null && 
      obj !== "" && 
      obj !== 0 && 
      typeof obj !== "undefined" && 
      obj !== false) 
    return false;
  
  return true;
});
elation.extend("utils.isObject", function(obj) {
  return (obj instanceof Object);
});
elation.extend("utils.isArray", function(obj) {
  var objclass = Object.prototype.toString.call(obj),
      allow = {
        '[object Array]': true,
        '[object NodeList]': true,
        '[object HTMLCollection]': true
      };
  
  if (elation.browser && elation.browser.type == 'msie' && objclass == '[object Object]') {
    return !elation.utils.isNull(elation.utils.arrayget(obj, 'length'));
  } else {
    return allow[objclass] || false;
  }
});

elation.extend("utils.isString", function(obj) {
  return (typeof obj == "string");
});

// use when unsure if element is a HTMLElement or Elation Component
elation.extend("utils.getContainerElement", function(element) {
  return (element instanceof elation.component.base)
    ? element.container : (elation.utils.isElement(element))
    ? element : false;
});

// runs through direct children of obj and 
// returns the first matching <tag> [className]
elation.extend("utils.getFirstChild", function(obj, tag, className) {
  for (var i=0; i<obj.childNodes.length; i++)
    if (obj.childNodes[i].nodeName == tag.toUpperCase())
      if (className && this.hasclass(obj, className))
        return obj.childNodes[i];
      else if (!className)
        return obj.childNodes[i];
  
  return null;
});

// runs through direct children of obj and 
// returns the last matching <tag> [className]
elation.extend("utils.getLastChild", function(obj, tag, className) {
  for (var i=obj.childNodes.length-1; i>=0; i--)
    if (obj.childNodes[i].nodeName == tag.toUpperCase())
      if (className && this.hasclass(obj, className))
        return obj.childNodes[i];
      else if (!className)
        return obj.childNodes[i];
  
  return null;
});

// runs through all children recursively and returns 
// all elements matching <tag> [className]
elation.extend("utils.getAll", function(obj, tag, className) {
  var	ret = [],
      all = obj.getElementsByTagName(tag);
  
  for (var i=0; i<all.length; i++)
    if (className && this.hasclass(all[i], className))
      ret.push(all[i]);
    else if (!className)
      ret.push(all[i]);
  
  return ret;
});

// runs through the direct children of obj and returns 
// all elements matching <tag> [className]
elation.extend("utils.getOnly", function(obj, tag, className) {
  if (!obj || !tag)
    return;
  
  var ret = [];
  
  for (var i=0; el=obj.childNodes[i]; i++)
    if (el.nodeName == tag.toUpperCase()) {
      if (className && this.hasclass(el, className))
        ret.push(el);
      else if (!className)
        ret.push(el);
    }
  
  return ret;
});

// Navigates up the DOM from a given element looking for match
elation.extend("utils.getParent", function(element, tag, classname, all_occurrences) {
  var ret = [];
  
  if (typeof classname != 'string' && elation.utils.isTrue(classname))
    all_occurances = true;
  
  while (element && element.nodeName != 'BODY') {
    if (element.nodeName == tag.toUpperCase() && (!classname || elation.html.hasclass(element, classname))) {
      if (all_occurrences)
        ret.push(element);
      else
        return element;
    }
    
    element = element.parentNode;
  }
  
  return (ret.length == 0 ? false : ret);
});

elation.extend("utils.isin", function(parent, element) {
  if (!parent || !element)
    return false;
  while (!elation.utils.isNull(element) && element != parent && element != document.body) {
    element = element.parentNode;
  }
  
  return (parent == element);
});

elation.extend("utils.indexOf", function(array, object) {
	if (typeof array == 'string')
		array = array.split("");
	
	for (var i=0; i<array.length; i++) {
		if (array[i] === object) {
			return i;
		}
	}
	
	return -1;
});

elation.extend("utils.fixPNG", function() {
  if (elation.browser.type == "msie" && elation.browser.version <= 6) {
    //FIXME this breaks fixpng, I'm commenting it out, if this breaks other things... well, if you happen to see this comment maybe it will inspire you to try uncommenting out the line below to see if that has an effect -- mac daddy
    document.execCommand("BackgroundImageCache",false,true);
    var imglist = document.getElementsByTagName("img");
    for (var i = 0; i < imglist.length; i++) {
      if(imglist[i].src.substr(imglist[i].src.length - 3, 3) == "png" && !imglist[i].style.filter) {
        var origsrc = imglist[i].src;
        imglist[i].src = '/images/utils/nothing.gif';
        imglist[i].style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + origsrc + "', sizingMethod='image')";
      }
    }
  }
});

elation.extend("utils.stringify", function(parms) {
  var value, ret = '';
  
  for (var key in parms) {
    value = parms[key];
    ret += key + '=' + value + '&'; 
  }
  
  return ret.substr(0,ret.length-1);
});

// some deep copy shit i got from stackoverflow
elation.extend("utils.clone", function(obj) {
  var copy;

  // Handle the 3 simple types, and null or undefined
  if (null == obj || "object" != typeof obj) 
    return obj;

  // Handle Date
  if (obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  // Handle Array
  if (obj instanceof Array) {
    return obj.slice(0);
  }

  // Handle Object
  if (obj instanceof Object) {
    copy = {};

    for (var attr in obj) {
      //console.log(attr, typeof obj[attr]);
      if (obj.hasOwnProperty(attr) && typeof obj[attr] != 'function') 
        copy[attr] = elation.utils.clone(obj[attr]);
    }

    return copy;
  }

  throw new Error("Unable to copy obj! Its type isn't supported.");
});

elation.extend("utils.htmlentities", function(string, quote_style) {
	// http://kevin.vanzonneveld.net
  var histogram = {}, symbol = '', tmp_str = '', entity = '';
	tmp_str = string.toString();
	
	if (false === (histogram = elation.utils.get_html_translation_table('HTML_ENTITIES', quote_style))) {
			return false;
	}
	
	for (symbol in histogram) {
			entity = histogram[symbol];
			tmp_str = tmp_str.split(symbol).join(entity);
	}
	
	return tmp_str;
});
elation.extend("utils.get_html_translation_table", function(table, quote_style) {
	// http://kevin.vanzonneveld.net
  var entities = {}, histogram = {}, decimal = 0, symbol = '';
	var constMappingTable = {}, constMappingQuoteStyle = {};
	var useTable = {}, useQuoteStyle = {};
	
	useTable      = (table ? table.toUpperCase() : 'HTML_SPECIALCHARS');
	useQuoteStyle = (quote_style ? quote_style.toUpperCase() : 'ENT_COMPAT');
	
	// Translate arguments
	constMappingTable[0]      = 'HTML_SPECIALCHARS';
	constMappingTable[1]      = 'HTML_ENTITIES';
	constMappingQuoteStyle[0] = 'ENT_NOQUOTES';
	constMappingQuoteStyle[2] = 'ENT_COMPAT';
	constMappingQuoteStyle[3] = 'ENT_QUOTES';
	
	// Map numbers to strings for compatibilty with PHP constants
	if (!isNaN(useTable)) {
			useTable = constMappingTable[useTable];
	}
	if (!isNaN(useQuoteStyle)) {
			useQuoteStyle = constMappingQuoteStyle[useQuoteStyle];
	}

	if (useTable == 'HTML_SPECIALCHARS') {
			// ascii decimals for better compatibility
			entities['38'] = '&amp;';
			if (useQuoteStyle != 'ENT_NOQUOTES') {
					entities['34'] = '&quot;';
			}
			if (useQuoteStyle == 'ENT_QUOTES') {
					entities['39'] = '&#039;';
			}
			entities['60'] = '&lt;';
			entities['62'] = '&gt;';
	} else if (useTable == 'HTML_ENTITIES') {
			// ascii decimals for better compatibility
		entities['38']  = '&amp;';
			if (useQuoteStyle != 'ENT_NOQUOTES') {
					entities['34'] = '&quot;';
			}
			if (useQuoteStyle == 'ENT_QUOTES') {
					entities['39'] = '&#039;';
			}
		entities['60']  = '&lt;';
		entities['62']  = '&gt;';
		entities['160'] = '&nbsp;';
		entities['161'] = '&iexcl;';
		entities['162'] = '&cent;';
		entities['163'] = '&pound;';
		entities['164'] = '&curren;';
		entities['165'] = '&yen;';
		entities['166'] = '&brvbar;';
		entities['167'] = '&sect;';
		entities['168'] = '&uml;';
		entities['169'] = '&copy;';
		entities['170'] = '&ordf;';
		entities['171'] = '&laquo;';
		entities['172'] = '&not;';
		entities['173'] = '&shy;';
		entities['174'] = '&reg;';
		entities['175'] = '&macr;';
		entities['176'] = '&deg;';
		entities['177'] = '&plusmn;';
		entities['178'] = '&sup2;';
		entities['179'] = '&sup3;';
		entities['180'] = '&acute;';
		entities['181'] = '&micro;';
		entities['182'] = '&para;';
		entities['183'] = '&middot;';
		entities['184'] = '&cedil;';
		entities['185'] = '&sup1;';
		entities['186'] = '&ordm;';
		entities['187'] = '&raquo;';
		entities['188'] = '&frac14;';
		entities['189'] = '&frac12;';
		entities['190'] = '&frac34;';
		entities['191'] = '&iquest;';
		entities['192'] = '&Agrave;';
		entities['193'] = '&Aacute;';
		entities['194'] = '&Acirc;';
		entities['195'] = '&Atilde;';
		entities['196'] = '&Auml;';
		entities['197'] = '&Aring;';
		entities['198'] = '&AElig;';
		entities['199'] = '&Ccedil;';
		entities['200'] = '&Egrave;';
		entities['201'] = '&Eacute;';
		entities['202'] = '&Ecirc;';
		entities['203'] = '&Euml;';
		entities['204'] = '&Igrave;';
		entities['205'] = '&Iacute;';
		entities['206'] = '&Icirc;';
		entities['207'] = '&Iuml;';
		entities['208'] = '&ETH;';
		entities['209'] = '&Ntilde;';
		entities['210'] = '&Ograve;';
		entities['211'] = '&Oacute;';
		entities['212'] = '&Ocirc;';
		entities['213'] = '&Otilde;';
		entities['214'] = '&Ouml;';
		entities['215'] = '&times;';
		entities['216'] = '&Oslash;';
		entities['217'] = '&Ugrave;';
		entities['218'] = '&Uacute;';
		entities['219'] = '&Ucirc;';
		entities['220'] = '&Uuml;';
		entities['221'] = '&Yacute;';
		entities['222'] = '&THORN;';
		entities['223'] = '&szlig;';
		entities['224'] = '&agrave;';
		entities['225'] = '&aacute;';
		entities['226'] = '&acirc;';
		entities['227'] = '&atilde;';
		entities['228'] = '&auml;';
		entities['229'] = '&aring;';
		entities['230'] = '&aelig;';
		entities['231'] = '&ccedil;';
		entities['232'] = '&egrave;';
		entities['233'] = '&eacute;';
		entities['234'] = '&ecirc;';
		entities['235'] = '&euml;';
		entities['236'] = '&igrave;';
		entities['237'] = '&iacute;';
		entities['238'] = '&icirc;';
		entities['239'] = '&iuml;';
		entities['240'] = '&eth;';
		entities['241'] = '&ntilde;';
		entities['242'] = '&ograve;';
		entities['243'] = '&oacute;';
		entities['244'] = '&ocirc;';
		entities['245'] = '&otilde;';
		entities['246'] = '&ouml;';
		entities['247'] = '&divide;';
		entities['248'] = '&oslash;';
		entities['249'] = '&ugrave;';
		entities['250'] = '&uacute;';
		entities['251'] = '&ucirc;';
		entities['252'] = '&uuml;';
		entities['253'] = '&yacute;';
		entities['254'] = '&thorn;';
		entities['255'] = '&yuml;';
	} else {
			throw Error("Table: "+useTable+' not supported');
			return false;
	}
	
	// ascii decimals to real symbols
	for (decimal in entities) {
			symbol = String.fromCharCode(decimal);
			histogram[symbol] = entities[decimal];
	}
	
	return histogram;
});

if (typeof window.JSON == 'undefined') {
  window.JSON=function(){function f(n){return n<10?'0'+n:n;}Date.prototype.toJSON=function(key){return this.getUTCFullYear()+'-'+f(this.getUTCMonth()+1)+'-'+f(this.getUTCDate())+'T'+f(this.getUTCHours())+':'+f(this.getUTCMinutes())+':'+f(this.getUTCSeconds())+'Z';};var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapeable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'},rep;function quote(string){escapeable.lastIndex=0;return escapeable.test(string)?'"'+string.replace(escapeable,function(a){var c=meta[a];if(typeof c==='string'){return c;}return'\\u'+('0000'+(+(a.charCodeAt(0))).toString(16)).slice(-4);})+'"':'"'+string+'"';}function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==='object'&&typeof value.toJSON==='function'){value=value.toJSON(key);}if(typeof rep==='function'){value=rep.call(holder,key,value);}switch(typeof value){case'string':return quote(value);case'number':return isFinite(value)?String(value):'null';case'boolean':case'null':return String(value);case'object':if(!value){return'null';}gap+=indent;partial=[];if(typeof value.length==='number'&&!(value.propertyIsEnumerable('length'))){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||'null';}v=partial.length===0?'[]':gap?'[\n'+gap+partial.join(',\n'+gap)+'\n'+mind+']':'['+partial.join(',')+']';gap=mind;return v;}if(rep&&typeof rep==='object'){length=rep.length;for(i=0;i<length;i+=1){k=rep[i];if(typeof k==='string'){v=str(k,value,rep);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}else{for(k in value){if(Object.hasOwnProperty.call(value,k)){v=str(k,value,rep);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}v=partial.length===0?'{}':gap?'{\n'+gap+partial.join(',\n'+gap)+'\n'+mind+'}':'{'+partial.join(',')+'}';gap=mind;return v;}}return{stringify:function(value,replacer,space){var i;gap='';indent='';if(typeof space==='number'){for(i=0;i<space;i+=1){indent+=' ';}}else if(typeof space==='string'){indent=space;}rep=replacer;if(replacer&&typeof replacer!=='function'&&(typeof replacer!=='object'||typeof replacer.length!=='number')){throw new Error('JSON.stringify');}return str('',{'':value});},parse:function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==='object'){for(k in value){if(Object.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v;}else{delete value[k];}}}}return reviver.call(holder,key,value);}cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return'\\u'+('0000'+(+(a.charCodeAt(0))).toString(16)).slice(-4);});}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,'@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,']').replace(/(?:^|:|,)(?:\s*\[)+/g,''))){j=eval('('+text+')');return typeof reviver==='function'?walk({'':j},''):j;}throw new SyntaxError('JSON.parse');}};}();
}

elation.extend('JSON', new function() {
  this.parse = function(text) {
    return this.JSON(['decode', 'parse'], text);
  }
  
  this.stringify = function(text) {
    return this.JSON(['encode', 'stringify'], text);
  }
  
  this.JSON = function(parms, text) {
		var key = (typeof JSON[parms[0]] == 'function' ? parms[0] : parms[1]);
    
		return (key == 'parse' ? JSON.parse(text) : JSON.stringify(text));
  }

  this.clone = function(obj) {
    if (!obj)
      return false;

    return JSON.parse(JSON.stringify(obj));
  }
});
elation.extend('cookie', {
	set: function(parms, value, expires, domain, secure, path, date) {
		name = parms.name || parms;
		expires = parms.expires || expires || '';
    domain = parms.domain || domain || '';
    secure = parms.secure || secure || '';
    path = parms.path || path || '/';
		date = parms.date || new Date();
		
		if (date instanceof Date)
			date = date.getDate() + "/" + (date.getMonth() + 1) + "/" + (date.getFullYear() + 1);
		
    var curCookie = name + "=" + escape(value) + "; expires=" + date + " 00:00:00" +
        ((path) ? "; path=" + path : "") +
        ((domain) ? "; domain=" + domain : "") +
        ((secure) ? "; secure" : "");
		
    document.cookie = curCookie;
    return curCookie;
	},
	
	get: function(name) {
    var theCookies = document.cookie.split(/[; ]+/);
    
		for (var i = 0 ; i < theCookies.length; i++) {
			var aName = theCookies[i].substring(0, elation.utils.indexOf(theCookies[i], '='));
			
			if (aName == name) 
				return theCookies[i];
    }
	}
});
elation.extend("url", function(hash) {
  this.hash = {};
  var hash = hash || window.location.hash;
  
  if (hash)
    hash = hash.split('#')[1].split('&');
  
  for (var i=0; i<hash.length; i++) {
    var parm = hash[i].split('=');
    
    this.hash[parm[0]] = parm[1];
  }
  
  return this.hash;
});
elation.extend("id", function(id) {
  return elation.find(id, true);
});
elation.extend("find", function(selectors, parent, first) {
  /*
    selector engine can use commas, spaces, and find classnames via period or id's via hash.
    need to add multiple classname on single tag support
    this code is used for browsers which dont have their own selector engines
    this could be made a lot better.
  */
  this.findCore = function(selectors, oparent) {
    if (!selectors)
      return;
    
    var	selectors = selectors.split(','),
        elements = [],
        selector, section, tag, tags, classname, isParent, parent, parents;
    
    for (var s=0; s<selectors.length; s++) {
      parent = oparent || document.getElementsByTagName('BODY')[0];
      parents = [parent];
      section = selectors[s].split(' ');
      
      for (var p=0; parent = parents[p]; p++) {
        for (var q=0; q<section.length; q++) {
          isParent = (q = section.length - 1);
          id = section[q].split('#');
          selector = section[q].split('.');
          tag = selector[0] || '*';
          tags = parent.getElementsByTagName(tag);
          classname = selector.length > 1 ? selector[1] : false;
          
          if (id.length > 1) {
            elements.push(document.getElementById(id[1]));
            
            continue;
          }
          
          for (var i=0; i<tags.length; i++) {
            if (classname) {
              if (elation.html.hasclass(tags[i], classname))
                if (isParent)
                  parents.push(tags[i]);
                else
                  elements.push(tags[i]);
            } else
              if (isParent)
                parents.push(tags[i]);
              else
                elements.push(tags[i]);
          }
        }
      }
    }
    
    return elements;
  }
  
  var result;
  
  // first returns the first element only.
  // the parent parm can also act as first parm if boolean true
  if (elation.utils.isTrue(parent)) {
    first = true;
    parent = null;
  }
  
  // use browsers native selector engine if available
  if (document.querySelectorAll) 
    result = (parent) 
      ? parent.querySelectorAll(selectors) 
      : document.querySelectorAll(selectors);
  else
    result = this.findCore(selectors, parent);
  
  if (first && (typeof result == 'object' || typeof result == 'function'))
    if (result.length > 0)
      result = result[0];
    else
      result = null;
  
  return result;
});

// grabs a js or css file and adds to document
elation.extend('file.get', function(type, file, func) {
  if (!type || !file || typeof document == 'undefined')
    return false;
  
  var	head = document.getElementsByTagName("HEAD")[0],
      element = document.createElement((type == 'javascript' || type == 'js' ? "SCRIPT" : "LINK"));
  
  if (type == 'javascript' || type == 'js') {
    element.type = "text/javascript";
    element.src = file;
  } else {
    element.type = "text/css";
    element.rel = "stylesheet";
    element.href = file;
  }
  if (func)
    element.onload = func;
  
  head.appendChild(element);
  
  return element;
});

// create file.batch object for grabbing multiple files
elation.extend('file.batch', function() {
	this.callbacks = [];
	this.files = [];
	
	this.add = function(url, type, component) {
		if (typeof url == 'string') {
      var dependency = elation.file.dependencies.add(url, this, type, component)
      
			if (dependency) 
        this.files.push(dependency);
    }
	}
	
	this.callback = function(script) {
		this.callbacks.push(script);
		
		if (this.files.length == 0)
			this.done(true);
	}
  this.executecallbacks = function() {
		for (var i=0; i<this.callbacks.length; i++) 
			switch (typeof this.callbacks[i]) {
				case "string":
					eval(this.callbacks[i]); 
					break;
				
				case "function":
					this.callbacks[i](); 
					break;
			}
		
		this.callbacks = [];
  }
	
	this.done = function(url) {
		if (url)
			for (var i=0; i<this.files.length; i++) 
				if (!this.files[i].loaded && this.files[i].type != 'css') 
					return;
		
    setTimeout(elation.bind(this, this.executecallbacks), 0);
	}
});

// ajaxlib uses this to keep track of which css/js files are loaded and fetch ones that arent.
elation.extend('file.dependencies', new function() {
	this.host = '';
	this.files = {};
	this.registered = { 
		javascript: {}, 
		css: {} 
	};
	this.waiting = { 
		javascript: {}, 
		css: {} 
	};
	
	this.register = function(sFile, check, type) {
    var	type = type || 'javascript',
				registered = this.registered[type],
				waiting = this.waiting[type];
		
		if (registered[sFile])
			return;
		
    if (typeof check == 'undefined')
      check = true;
		
		registered[sFile] = true;
		
		if (waiting[sFile]) {
			var	url = waiting[sFile],
					file = this.files[url],
					components = this.getComponents(url);
			
			delete waiting[sFile];
      
      this.checkWaiting(file, components, type);
		}
	}
  
	this.registerMany = function(components, type) {
    for (var k in components) 
      if (components.hasOwnProperty(k) && components[k].length > 0) 
        for (var i = 0; i < components[k].length; i++) 
          if (components[k][i] != null)
            this.register(k + '.' + components[k][i], false, type);
  }
  
  this.checkWaiting = function(file, components, type) {
		var	type = type || 'javascript',
				waiting = this.waiting[type],
				flag = true;
    
		for (var i=0; i<components.length; i++) {
			if (waiting[components[i]]) {
				flag = false;
				
				break;
			}
		}
		
		if (flag) 
			this.done(file);
  }
	
	this.getComponents = function(url) {
		var	ret = [],
				url = url.split('?'),
				page = url[0],
				parms = url.length > 1
					? url[1].split('&')
					: [];
		
		for (var i=0; i<parms.length; i++) {
			var parm = parms[i].split('='),
					files = parm[1].split('+');
			
			for (var f=0; f<files.length; f++) {
				file = parm[0] +'.'+ files[f];
				
				ret.push(file);
			}
		}
		
		return ret;
	}
	
	this.wait = function(url, type) {
		var	type = type || 'javascript',
				registered = this.registered[type],
				waiting = this.waiting[type],
				components = this.getComponents(url);
		
		for (var i=0; i<components.length; i++)
			if (!registered[components[i]]) 
				waiting[components[i]] = true;
		
		url = this.url(waiting);
		
		for (var key in waiting)
			waiting[key] = '/' + (type == 'css' ? 'css' : 'scripts') + '/main' + url;
		
		return url;
	}
	
	this.url = function(oParms) {
		var	parms = {},
				ret = '';
		
		for (var key in oParms) {
			parm = key.split('.');
			
			if (!parms[parm[0]])
				parms[parm[0]] = [];
			
			parms[parm[0]].push(parm[1]);
		}
		
		for (var key in parms) {
			ret += (ret == '' ? '?' : '&') + key + '=';
			
			for (var i=0; i<parms[key].length; i++) {
				if (parms[key][i] != 'map')
					ret += parms[key][i] + (i == parms[key].length-1?'':'+');
				else if (i == parms[key].length-1)
					ret = ret.substr(0,ret.length-1);
			}
		}
		
		if (ret.indexOf("=") < 0)
			ret = '';
		
		return ret;
	}
	
	this.done = function(oFile) {
    if (typeof oFile != 'undefined') {
  		oFile.loaded = true;
			
	  	if (oFile.batch)
		  	oFile.batch.done(oFile.url);
    }
	}
	
	this.add = function(url, batch, type, component) {
		var	file = this.files[url] || {},
				type = type || 'javascript';
		
		if (!elation.utils.isNull(file.url)) {
			if (batch) {
				batch.done(url);
				
				return file;
			}
		}
		
		if (component || type == 'css') {
			url = this.wait(url, type);
			
			if (url) 
				url = '/' + (type == 'css' ? 'css' : 'scripts') + '/main' + url;
			else 
				return false;
		}
		
		file.batch = batch;
		file.loaded = false;
		file.url = url;
		file.type = type;
		file.element = elation.file.get(type, this.host + url, (
			(component)
				? null
				: (function(self) { 
						self.done(file); 
					})(this)
		));
		
		this.files[url] = file;
		
		return file;
	}
});
elation.extend('file.root', function() {
  // Determines the base URL for the currently active Elation instance
  var scripts = elation.find('script');
  var re = /^(.*?)\/scripts\/utils\/elation.js$/;
  for (var i = 0; i < scripts.length; i++) {
    var matches = scripts[i].src.match(re);
    if (matches !== null) {
      return matches[1];
    }
  }
  return '';
});
elation.extend('require', function(modules, callback) {
  //console.log('require:', modules, this.requireactivebatch);
  if (!elation.utils.isArray(modules)) modules = [modules];
  if (!this.requireactivebatchjs) {
    this.requireactivebatchjs = new elation.require.batch('js', '/scripts');
  }
  this.requireactivebatchjs.addrequires(modules, callback);
});
elation.extend('requireCSS', function(modules, callback) {
  if (!elation.utils.isArray(modules)) modules = [modules];
  if (!this.requireactivebatchcss) {
    this.requireactivebatchcss = new elation.require.batch('css', '/css');
  }
  this.requireactivebatchcss.addrequires(modules, callback);
});
elation.extend('require.batch', function(type, webroot) {

  // Handles asynchronous batch loading for dependencies
  // Loads multiple files, then fires a single callback when all are finished loading
  // TODO - needs timeout and better error handling

  this.type = type;
  this.webroot = webroot;

  this.pending = [];

  this.nodes = {};
  this.rootnode = false;
  
  this.init = function() {
    if (!this.rootnode) {
      this.rootnode = new elation.require.node('root', function() { elation.component.init(); });
    }
  }
  this.getcurrentmodule = function() {
    if (typeof document == 'undefined')
      return;

    var modname = false;
    // Gets the currently-executing script, (hopefully) in a cross-browser way
    var script = (typeof document != 'undefined' ? document.currentScript : false);
    if (typeof script == 'undefined') {
      var scripts = document.getElementsByTagName('script');
      script = scripts[scripts.length - 1];
    }
    if (script) {
      var scriptsrc = script.src,
          webroot = '/scripts', // FIXME - hardcode script webroot, because this method only works for JS
          start = scriptsrc.indexOf(webroot) + webroot.length + 1,
          end = scriptsrc.lastIndexOf('.js');
      
      modname = scriptsrc.substring(start, end).replace(/\//g, '.');
      //console.log(modname, scriptsrc, start, end, this.webroot);
      //console.log('current script:', script, modname);
    }
    return modname;
  }
  this.getnode = function(module) {
    var mod = this.nodes[module];
    if (!module || module == 'ANONYMOUS') {
      mod = new elation.require.node(module); 
    } else if (!this.nodes[module]) {
      mod = this.nodes[module] = new elation.require.node(module); 
    }
    return mod;
  }
  this.addrequires = function(requires, callback) {
    var modname = this.getcurrentmodule() || 'ANONYMOUS';
    //console.log('ADDREQ', modname, "=>", requires);
    var modulenode = (modname != 'ANONYMOUS' ? this.getnode(modname) : new elation.require.node('ANONYMOUS', callback));
    if (!modulenode.callback) modulenode.callback = callback;

    if (!this.batchnode) {
      this.batchnode = new elation.require.node('batchnode', function() { elation.component.init(); });
    }

    for (var i = 0; i < requires.length; i++) {
      var depname = requires[i];
      this.pushqueue(depname);

      // Add node dependency, creating node if it doesn't exist yet
      var node = this.getnode(depname);
      if (node !== modulenode) {
        modulenode.addEdge(node);
      }
    }

    this.batchnode.addEdge(modulenode);
    this.rootnode.addEdge(modulenode);

    if (this.pending.length == 0) {
      this.finished();
    }
  }
  this.pushqueue = function(module) {
    if (!this.isfulfilled(module) && !this.ispending(module)) {
      this.setpending(module);

      elation.file.get(this.type, this.webroot + '/' + module.replace(/\./g, '/') + '.' + this.type, elation.bind(this, function(ev) { this.finished(module); }));
    }
  }
  this.isfulfilled = function(module) {
    var existing = elation.utils.arrayget(elation, module) || elation.utils.arrayget(this, module);
    return (existing !== null);
  }
  this.ispending = function(module) {
    return (this.pending.indexOf(module) != -1);
  }
  this.setpending = function(module) {
    elation.utils.arrayset(this, module, true); // prevent us from trying to load this module again
    this.pending.push(module);
  }
  this.resolve = function(node, resolved, unresolved) {
    // Figure out the dependency callback order based on the dependency graph
    if (typeof resolved == 'undefined') resolved = [];
    if (typeof unresolved == 'undefined') unresolved = [];

    // Keep track of seen/unseen nodes to avoid circular dependencies
    unresolved.push(node);
    for (var i = 0; i < node.edges.length; i++) {
      if (resolved.indexOf(node.edges[i]) == -1) {
        if (unresolved.indexOf(node.edges[i]) != -1) {
          console.log('circular dependency!', node, node.edges[i]);
          return resolved;
        }
        this.resolve(node.edges[i], resolved, unresolved);
      }
    }
    // Mark as resolved, and remove from unresolved list
    resolved.push(node);
    unresolved.splice(unresolved.indexOf(node), 1);
    return resolved;
  }
  this.finished = function(module) {
    //console.log('Finished loading file:', module, this.pending);
    var node = this.nodes[module];

    // Remove from pending list
    var idx = this.pending.indexOf(module);
    if (idx != -1) {
      this.pending.splice(idx, 1);
    }

    // If nothing is pending, execute callbacks
    if (this.pending.length == 0) {
      // Resolve dependency graph
      var callbacks = this.resolve(this.batchnode);
      var failed = [];

      // Execute callbacks, in order
      while (callbacks.length > 0) {
        var callback = callbacks.shift();
        if (!callback.exec()) {
          failed.push(callback);
        }
      }

      if (this.resettimer) {
        clearTimeout(this.resettimer);
        this.resettimer = false;
      }
      this.resettimer = setTimeout(elation.bind(this, function() { if (this.pending.length == 0) { this.reset(); } }), 0);
    }
  }
  this.reset = function() {
    this.batchnode = false;
  }
  this.init();
});
elation.extend('require.node', function(name, callback) {
  this.init = function() {
    this.name = name;
    this.callback = callback;
    this.done = false;
    this.str = (callback ? callback.toString() : false);
    this.edges = [];
  }
  this.addEdge = function(node) {
    this.edges.push(node);
  }
  this.addEdges = function(nodes) {
    this.edges = this.edges.concat(nodes);
  }
  this.exec = function() {
    var success = true;
    if (!this.done && this.callback) {
      try {
        if (this.callback) {
          this.callback();
        }
        this.done = true;
      } catch (e) {
        console.error(e.stack);
        success = false;
      }
    }
    return success;
  }
  this.init();
});
elation.extend('require.debug', function() {
  this.init = function() {
    if (!this.debuggraph) {
      this.debuggraph = elation.graph.force({});
    }
    this.debuggraph.update(elation.requireactivebatchjs.rootnode); 
    if (!this.debugwin) {
      this.debugwin = elation.ui.window({append: document.body, title: 'dependencies', content: this.debuggraph}); 
    } else {
      this.debugwin.show();
    }
  }
  elation.require(['graph.force', 'ui.window'], elation.bind(this, this.init));
});

elation.extend("utils.escapeHTML", function(str) {
   var div = document.createElement('div');
   var text = document.createTextNode(str);
   div.appendChild(text);
   return div.innerHTML;
});

elation.extend("utils.isnumeric", function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
});

/**
 * Return first non-empty value from list of args, or null if all are empty.
 * Empty string, null and undefined are considered 'empty' and skipped over.
 * Numeric 0 is considered non-empty and returned
 *
 * @function elation.utils.any
 * @param {...Object} arguments
 */
elation.extend("utils.any", function() {
	var arg;
	for (var i=0; i<arguments.length; i++) {
		if (((arg=arguments[i]) !== null) && (arg !== "") && (typeof arg !== "undefined")) return arg;
	}
	return null;
})

/**
 * @function elation.timing.log
 * @function elation.timing.init
 * @function elation.timing.set
 * @function elation.timing.get
 * @function elation.timing.print
 *
 * JavaScript timing - Displays execution time of code blocks
 * @example
 *   elation.timing.log();
 *   elation.timing.log();
 *   elation.timing.log();
 *   elation.timing.print();
 */
elation.extend('timing', new function() {
	this.log = this.set;
  this.enabled = false;

	this.init = function() {
		this.l = [];
		this.i = 0;
	}
	
  // reset will reset timing from this point
	this.set = function(reset) {
    if (!this.enabled)
      return;
    
		if (reset)
			this.init();
		
		var	i = this.i,
				l = this.l;
		
		l[i] = new Date();
		l[i].ms = (l[i].getSeconds() * 1000) + l[i].getMilliseconds();
		
		this.i++;
	}
	
  // log will perform a set()
	this.get = function(log) {
		if (log)
			this.set();	
		
		var l = this.l,
				diff = l[l.length-1] - l[0];
		
		return diff;
	}
	
  // log will perform a set()
  // use_alert will use alert instead of console.log
	this.print = function(name, log, use_alert) {
    if (!this.enabled)
      return;
    
		if (log)
			this.set();
		
		var	l = this.l,
				prefix = name ? name : 'timing',
        times = '',
        debug = '';
		
		for (var i = 0; i < this.i; i++)
			if (i > 0) 
				times += (l[i] - l[(i-1)]) + 'ms, ';
		
		if (i == 2)
      debug = (l[l.length-1] - l[0]) + 'ms: ' + prefix;
    else
      debug = prefix + ': ' + times + 'total(' + (l[l.length-1] - l[0]) + 'ms)';
		
		if (use_alert)
			alert(debug);
		else
			console.log(debug);
  }
});
elation.extend("utils.parseXML", function(imgxml, leaf) {
  var node, root, parent;
  if (imgxml.nodeName) {
    node = imgxml;
  } else {
    if (window.DOMParser) {
      var parser = new DOMParser();
      node = parser.parseFromString(imgxml,"text/xml").firstChild;
    } else {
      node = new ActiveXObject("Microsoft.XMLDOM");
      node.async = "false";
      node.loadXML(imgxml).firstChild; 
    }
  }
  root = {};
  if (!leaf) {
    root[node.tagName] = {};
    parent = root[node.tagName];
    //node = parent[node.tagName];
  } else {
    parent = root;
  }
  if (node.attributes) {
    for (var i = 0; i < node.attributes.length; i++) {
      var name = node.attributes[i].nodeName;
      var value = node.attributes[i].nodeValue;
      parent[name] = value;
    }
  }
  if (node.childNodes) {
    for (var j = 0; j < node.childNodes.length; j++) {
      var child = node.childNodes[j];
      if (node.getElementsByTagName(child.tagName).length > 1) {
        if (!parent._children) parent._children = {};
        if (!parent._children[child.nodeName]) {
          parent._children[child.nodeName] = [];
        }
        parent._children[child.nodeName].push(elation.utils.parseXML(child, true));
      } else if (child.nodeName) {
        if (child.nodeName == "#text" || child.nodeName == "#cdata-section") {
          // this gets confused if you have multiple text/cdata nodes...
          if (!child.nodeValue.match(/^[\s\n]*$/m)) {
            parent._content = child.nodeValue;
          }
        } else {
          if (!parent._children) parent._children = {};
          parent._children[child.nodeName] = elation.utils.parseXML(child, true);
        }
      }
    }
  }
  return root;
});
elation.extend("utils.dateformat", function(format, date) {
  if (!(date instanceof Date)) date = new Date();
  var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
  var parts = {
    j: date.getDate(),
    n: date.getMonth(),
    Y: date.getFullYear(),
    G: date.getHours(),
    M: date.getMinutes(),
    s: date.getSeconds(),
    w: date.getDay()
  };
  parts.m = (parts.n < 10 ? "0" : "") + parts.n;
  parts.d = (parts.j < 10 ? "0" : "") + parts.j;
  parts.H = (parts.G < 10 ? "0" : "") + parts.G;
  parts.D = days[parts.w];
  parts.M = months[parts.n];
  
  var ret = "";
  for (var i = 0; i < format.length; i++) {
    ret += (parts[format[i]] ? parts[format[i]] : format[i]);
  } 
  return ret;
});
elation.extend('utils.isIdentical', function(a, b, sortArrays) {
  // https://github.com/prettycode/Object.identical.js
  function sort(object) {
    if (sortArrays === true && Array.isArray(object)) {
      return object.sort();
    } else if (typeof object !== "object" || object === null) {
      return object;
    }

    return Object.keys(object).sort().map(function(key) {
      return {
        key: key,
        value: sort(object[key])
      };
    });
  }
  return JSON.stringify(sort(a)) === JSON.stringify(sort(b));
});
elation.extend('net.get', function(url, params, args) {
  if (!args) args = {};
  var fullurl = url;
  if (!elation.utils.isEmpty(params)) {
    fullurl += (url.indexOf('?') == -1 ? '?' : '&') + elation.utils.encodeURLParams(params);
  }

  return elation.net.xhr('GET', fullurl, false, args);  
});
elation.extend('net.post', function(url, params, args) {
  var formdata = new FormData();
  for (var k in params) {
    formdata.append(k, params[k]);
  }

  return elation.net.xhr('POST', url, formdata, args);  
});
elation.extend('net.xhr', function(method, url, formdata, args) {
  if (!args) args = {};
  if (!formdata) formdata = null;

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = elation.bind(args, elation.net.handlereadystatechange);
  if (args.onload) xhr.onload = args.onload;
  if (args.onprogress) xhr.upload.onprogress = args.onprogress;
  if (args.onerror) xhr.onerror = args.onerror;

  xhr.open(method, url);
  if (args.nocache) xhr.setRequestHeader("If-Modified-Since", "Thu, 01 Jan 1970 00:00:00 GMT");
  xhr.send(formdata);

  return xhr;
});
elation.extend('net.handlereadystatechange', function(ev) {
  // "this" is bound to the args object that was passed when initiating the call
  var xhr = ev.target;
  if (xhr.readyState == 4) {
    if (xhr.status == 200) {
      if (xhr.responseText) {
        var response = xhr.responseText;
        if (this.parse) {
          try {
            switch (this.parse) {
              case 'json':
                response = JSON.parse(response);
                break;
            }      
          } catch (e) {
            console.log("elation.net: failed to parse response as '" + this.parse + "': " + response);
          }
        }
        if (this.callback) {
          //elation.ajax.executeCallback(obj.callback, xhr.responseText);
          this.callback(response);
        }
      }
    } else {
      if (this.failurecallback) {
        //elation.ajax.executeCallback(obj.failurecallback);
        this.failurecallback();
      }
    }
  }
});
elation.requireCSS('utils.elation');
