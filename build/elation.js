// ===== BEGIN EXTERNAL FILE: utils.elation ====
/** @namespace elation */
/** @namespace elation.utils */
/** @namespace elation.html */
var ENV_IS_NODE = (typeof process === 'object' && typeof require === 'function') ? true : false,
    ENV_IS_BROWSER = (typeof window !== 'undefined') ? true : false,
    ENV_IS_WORKER = (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope);

if (typeof window == 'undefined') var window = {}; 
//  compatibility for nodejs/worker threads

"use strict";
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
			console.log("elation (warning): tried to clobber existing component '" + name + "'");
		}
		if (typeof inheritfrom == 'function') {
			ptr.prototype = xptr.prototype = new inheritfrom;
			ptr.prototype.constructor = xptr.prototype.constructor = ptr;
		}
	  if (typeof exports != 'undefined') exports.extend = this.extend;
	}
}

elation.extend('implement', function(obj, iface, ifaceargs) {
  if (typeof iface == 'function') {
    var foo = new iface(ifaceargs);
    for (var k in foo) {
      obj[k] = foo[k];
    }
  }
});
elation.extend('define', function(name, definition, extendclass) {
  var constructor = definition._construct;
  if (!constructor) {
    constructor = (extendclass ? extendclass.prototype.constructor : false);
  }
  // FIXME - need to figure out a non-horrible way of overriding the class name that's shown in console.log
  var func = false;
  var funcstr = "elation.utils.arrayset(elation, '" + name + "', false); elation." + name + " = function (args) { if (constructor) return constructor.apply(this, arguments); }; func = elation." + name + ";";
  eval(funcstr);
  var objdef = func;
  if (extendclass) {
    if (!constructor) {
      objdef = extendclass.prototype.constructor;
    }
    objdef.prototype = Object.create(extendclass.prototype);
    objdef.prototype.constructor = objdef;
  }
  var keys = Object.keys(definition);
  keys.forEach(function(key) { objdef.prototype[key] = definition[key]; });
  return objdef;
});
elation.extend('env', {
  isNode: (typeof process === 'object' && typeof require === 'function') ? true : false,
  isBrowser: (typeof window !== 'undefined' && typeof Window == 'function' && window instanceof Window) ? true : false,
  isWorker: (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope)
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
elation.extend('config', {
  data: {},
  set: function(name, value) {
    return elation.utils.arrayset(this.data, name, value);
  },
  get: function(name, defaultvalue) {
    return elation.utils.arrayget(this.data, name, defaultvalue);
  },
  merge: function(config) {
    elation.utils.merge(config, this.data);
  }
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
  /*
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
  */
  return Array.isArray(obj) || (typeof HTMLCollection != 'undefined' && obj instanceof HTMLCollection);
});

elation.extend("utils.isString", function(obj) {
  return (typeof obj == "string");
});
elation.define("class", {
  _construct: function(args) {
    if (args) {
      var keys = Object.keys(args);
      keys.forEach(elation.bind(this, function(k) { if (typeof args[k] != 'undefined') this[k] = args[k]; }));
    }
  },
  toJSON: function() {
    var keys = Object.keys(this).filter(function(n) { return n[0] != '_'; });
    var obj = {};
    keys.map(elation.bind(this, function(k, v) { obj[k] = this[k]; }));
    return obj;
  }
});

elation.extend("component", new function() {
  this.init = function(root) {
    // if (root == undefined) {
    //   root = document;
    // }
    if (!elation.env.isBrowser) return;
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
        var obj = new component.base(type);
        
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
        // fix handling for append component infinite recursion issue
        if (args.append instanceof elation.component.base) 
          args.append = args.append.container;

        if (args.before instanceof elation.component.base) 
          args.before = args.before.container;

        // apply default args
        try {
          if (typeof obj.defaults == 'object')
            args = mergeDefaults(args, elation.utils.clone(obj.defaults));

          var parentclass = component.extendclass;

          // recursively apply inherited defaults
          while (parentclass) {
            if (typeof parentclass.defaults == 'object')
              elation.utils.merge(mergeDefaults(args, elation.utils.clone(parentclass.defaults)),args);

            parentclass = parentclass.extendclass;
          }
        } catch (e) {
          console.log('-!- Error merging component args', e.msg);
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
      let utils = window.elation.utils;
      var elation = {};
      window.elation.utils.arrayset(elation, type, null);
      var namehack = "elation." + type + " = function () { }; component.base = elation." + type;
      if (type.indexOf('-') != -1) {
        namehack = "utils.arrayset(elation, '" + type + "', function() { }); component.base = utils.arrayget(elation, '" + type + "');";
      }
      eval(namehack); // FIXME - weirdness to force usable names while console.logging components
    })();
    component.base.prototype = new this.base(type);
    if (extendclass) {
      component.extendclassdef = extendclass;
      component.extendclass = new extendclass();
      
      if (!component.extendclass._inherited)
        component.extendclass._inherited = [];

      component.extendclass._inherited.push(component.extendclass);
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
    // execute superclass init function
    this.super = function(classname) {
      console.log('super',this.name, this);
      var self = self || this,
          componentclass = elation.utils.arrayget(elation, classname || this.name);
      
      if (componentclass) {
        var extendclass = elation.utils.arrayget(componentclass, 'extendclass.init');

        if (extendclass)
          extendclass.call(self);
      }

      //delete self;
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
      // Remove any events which reference this component
      var events = elation.events.getEventsByTargetOrOrigin(this);
      for (var i = 0; i < events.length; i++) {
        var ev = events[i];
        elation.events.remove(ev.target, ev.type, ev.origin);
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
	/*
  try {
    while (element = element.offsetParent) {
      x += element.offsetLeft - element.scrollLeft;
      y += element.offsetTop - element.scrollTop;
    }
  } catch(e) { 
    console.log('html.dimensions: '+e.message); 
  }
  */
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
  var curleft = 0, curtop = 0;
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
  if (element && element.className) {
    // ATTN:  do hasclass on individual classes, not multiple classes w/ spaces!
    var className = className.split(' ');

    if ("classList" in element) {
      return element.classList.contains(className[0]);
    } else {
      var re = new RegExp("(^| )" + className[0] + "( |$)", "g");
      return element.className.match(re);
    }
  }
  return false;
});

elation.extend("html.class", function(method, elements, className) {
  if (!elation.utils.isArray(elements)) {
    elements = [ elements ];
  }

  for (var i=0,element,classes; i<elements.length; i++) {
    element = elation.utils.getContainerElement(elements[i]);
    classes = className.split(' ');

    for (var n=0; n<classes.length; n++) {
      element.classList[method](classes[n]);
    }
  }
});

elation.extend("html.addclass", function(elements, className) {
  if (!elements || elements.length == 0)
    return;

  if ("classList" in elements || (typeof elements.length == 'number' && "classList" in elements[0])) {
    elation.html.class('add', elements, className);
  } else {
    if (elements && !elation.html.hasclass(elements, className)) {
      elements.className += (elements.className ? " " : "") + className;
    }
  }
}); 

elation.extend("html.removeclass", function(elements, className) {
  if (!elements || elements.length == 0)
    return;

  if ("classList" in elements || (typeof elements.length == 'number' && "classList" in elements[0])) {
    elation.html.class('remove', elements, className);
  } else {
    var re = new RegExp("(^| )" + className + "( |$)", "g");
    
    if (element && element.className && element.className.match(re)) {
      element.className = element.className.replace(re, " ");
    }
  }
});

elation.extend("html.toggleclass", function(elements, className) {
  if ("classList" in elements || (typeof elements.length == 'number' && "classList" in elements[0])) {
    elation.html.class('toggle', elements, className);
  } else {
    if (this.hasclass(element, className))
      this.removeclass(element, className)
    else
      this.addclass(element, className);
  }
});

// for great justice
elation.extend("html.hasClass", elation.html.hasclass);
elation.extend("html.addClass", elation.html.addclass);
elation.extend("html.removeClass", elation.html.removeclass);
elation.extend("html.toggleClass", elation.html.toggleclass);

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
  if (typeof document == 'undefined') {
    return;
  }
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
  if (!element || (!content && typeof content != 'string'))
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
        ret += (ret != '' ? '&' : '') + key + (flattened[key] !== null ? '=' + encodeURIComponent(flattened[key]) : '');
      }
    }
  }
  
  return ret;
});
elation.extend("utils.flattenURLParams", function(obj, prefix) {
  var ret = {};
  for (var k in obj) {
    var key = (prefix ? prefix + '[' + k + ']' : k);
    if (obj[k] !== null && typeof obj[k] == 'object') {
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
  if (typeof entities == 'object' && !entities.tagName && !(typeof HTMLElement != 'undefined' && mergeto instanceof HTMLElement)) {
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


// use when unsure if element is a HTMLElement or Elation Component
elation.extend("utils.getContainerElement", function(element) {
  return (element instanceof elation.component.base)
    ? element.container : (element && element.tagName)
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


elation.extend("utils.stringify", function(parms, eq, delimeter) {
  var value, ret = '', eq = eq || '=', delimeter = delimeter || '&';
  
  for (var key in parms) {
    value = parms[key];
    ret += key + eq + value + delimeter; 
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
    
    this.hash[parm[0]] = (typeof parm[1] != 'undefined' ? decodeURIComponent(parm[1]) : null);
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
  if (typeof document == 'undefined') {
    return [];
  }
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
    //element.crossOrigin = 'anonymous';
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
  if (!elation.env.isWorker) {
    if (!elation.utils.isArray(modules)) modules = [modules];
    if (!this.requireactivebatchcss) {
      this.requireactivebatchcss = new elation.require.batch('css', '/css');
    }
    this.requireactivebatchcss.addrequires(modules, callback);
  }
});
elation.extend('require.batch', function(type, webroot) {

  // Handles asynchronous batch loading for dependencies
  // Loads multiple files, then fires a single callback when all are finished loading
  // TODO - needs timeout and better error handling

  this.type = type;
  this.webroot = elation.utils.any(webroot, elation.config.get('dependencies.path', '/scripts'));

  this.pending = [];
  this.fulfilled = {};

  this.nodes = {};
  this.rootnode = false;
  
  this.init = function() {
    if (!this.rootnode) {
      this.rootnode = new elation.require.node('root', function() { elation.component.init(); });
    }
  }
  this.getcurrentmodule = function() {
    if (typeof document == 'undefined') {
      if (typeof module != 'undefined') {
        var mod = module.children[module.children.length-1];
        if (mod) {
          var modid = mod.id;

          var search = '/components/';
          var idx = modid.indexOf(search);
          modid = modid.substr(idx + search.length);
          modid = modid.replace('/scripts/', '.');
          modid = modid.replace(/\.js$/, '');
          modid = modid.replace(/\//g, '.');
          return modid;
        }
        return null;
      } else {
        return;
      }
    }

    var modname = false;
    var script = elation.utils.getCurrentScript();
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
    modulenode.callback = callback;

    if (!this.batchnode) {
      this.batchnode = new elation.require.node('batchnode', function() { elation.component.init(); });
    }

    for (var i = 0; i < requires.length; i++) {
      var depname = requires[i];
      if (!this.ispending(depname)) {
        this.pushqueue(depname);
      }
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
    //console.log('get it', module, this.isfulfilled(module), this.ispending(module), this.webroot);
    if (!this.isfulfilled(module) && !this.ispending(module)) {
      this.setpending(module);
      if (elation.env.isBrowser) {
        // browser
        if (module.match('^https?:')) {
          elation.file.get(this.type, module, elation.bind(this, function(ev) { this.finished(module); }));
        } else {
          elation.file.get(this.type, this.webroot + '/' + module.replace(/\./g, '/') + '.' + this.type, elation.bind(this, function(ev) { this.finished(module); }));
        }
      } else if (elation.env.isWorker && this.type == 'js') {
        //console.log('loading elation module: ', module);
        importScripts(this.webroot + '/' + module.replace(/\./g, '/') + '.' + this.type);
        this.finished(module);
      } else if (elation.env.isNode && this.type == 'js') {
        // running in node.js
        //console.log('loading elation module: ', module);
        try {
          require(module.replace(/\./g, '/'));
        } catch (e) {
          // FIXME - Many times this error is because of external scripts which work in the browser but not nodejs
          //         We should have some way of reporting errors which doesn't spam the console too much
          //console.log('ERROR ERROR', e);
        }
        this.finished(module);
      } else {
        //console.log('dunno, just run it', module);
        this.finished(module);
      }
    } else {
      this.finished(module);
    }
  }
  this.isfulfilled = function(module) {
    if (module == 'root' || module == 'ANONYMOUS') return false;
    //var existing = elation.utils.arrayget(elation, module) || elation.utils.arrayget(this, module) || this.fulfilled[module];
    var existing = this.fulfilled[module];
    return (existing !== null && existing !== undefined);
  }
  this.ispending = function(module) {
    return (this.pending.indexOf(module) != -1);
  }
  this.setpending = function(module) {
    //elation.utils.arrayset(this, module, true); // prevent us from trying to load this module again
    this.pending.push(module);
  }
  this.fulfill = function(modules, callback) {
    if (!elation.utils.isArray(modules)) {
      modules = [modules];
    }
    modules.forEach(elation.bind(this, function(module) {
      this.fulfilled[module] = true;
      var node = this.getnode(module);
      /*if (!node.callback) */node.callback = callback;
      if (callback && !node.callbackstr) node.callbackstr = callback.toString();
      if (!this.batchnode) {
        this.batchnode = new elation.require.node('batchnode', function() { elation.component.init(); });
      }
      this.setpending(module);
      this.batchnode.addEdge(node);
      //this.rootnode.addEdge(node);
      setTimeout(elation.bind(this, this.finished, module), 0);
      //this.finished(module);
    }));
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
    this.fulfilled[module] = true;

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
          this.callback(elation);
        }
        this.done = true;
      } catch (e) {
        //console.error(e.stack);
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
elation.extend('register', function(name, func) {
  elation.requireactivebatchjs.fulfill(name, func);
  return func;
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
 * JavaScript timing utilities — displays execution time of code blocks.
 * Exposes `log`, `init`, `set`, `get`, and `print` functions.
 *
 * @namespace elation.timing
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
elation.extend("utils.parseXML", function(imgxml, leaf, forceLower) {
  var node, root, parent;
  if (imgxml.nodeName) {
    node = imgxml;
  } else {
    if (window.DOMParser) {
      var parser = new DOMParser();
      node = parser.parseFromString(imgxml,"application/xml").firstChild;
    } else {
      node = new ActiveXObject("Microsoft.XMLDOM");
      node.async = "false";
      node.loadXML(imgxml).firstChild; 
    }
  }
  root = {};
  if (!leaf) {
    var rootname = node.tagName;
    if (forceLower) rootname = rootname.toLowerCase();
    root[rootname] = {};
    parent = root[rootname];
    //node = parent[node.tagName];
  } else {
    parent = root;
  }
  if (node.attributes) {
    for (var i = 0; i < node.attributes.length; i++) {
      var name = node.attributes[i].nodeName;
      if (forceLower) name = name.toLowerCase();
      var value = node.attributes[i].value;
      parent[name] = value;
    }
  }
  let children = node.children || node.childNodes;
  if (children) {
    for (var j = 0; j < children.length; j++) {
      var child = children[j];
      var nodename = child.nodeName;
      if (forceLower) nodename = nodename.toLowerCase();
      if (node.getElementsByTagName(child.tagName).length > 1) {
        if (!parent._children) parent._children = {};
        if (!parent._children[nodename]) {
          parent._children[nodename] = [];
        }
        parent._children[nodename].push(elation.utils.parseXML(child, true, forceLower));
      } else if (child.nodeName) {
        if (child.nodeName == "#text" || child.nodeName == "#cdata-section") {
          // this gets confused if you have multiple text/cdata nodes...
          if (!child.nodeValue.match(/^[\s\n]*$/m)) {
            parent._content = child.nodeValue;
          }
        } else {
          if (!parent._children) parent._children = {};
          parent._children[nodename] = elation.utils.parseXML(child, true, forceLower);
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
  var formdata = params;
  if (!(formdata instanceof Uint8Array || formdata instanceof ArrayBuffer || formdata instanceof Blob || formdata instanceof FormData || elation.utils.isString(formdata))) {
    formdata = new FormData();
    for (var k in params) {
      formdata.append(k, params[k]);
    }
  }

  return elation.net.xhr('POST', url, formdata, args);  
});
elation.extend('net.put', function(url, params, args) {
  var formdata = params;
  if (!(formdata instanceof Uint8Array || formdata instanceof ArrayBuffer || formdata instanceof Blob || formdata instanceof FormData || elation.utils.isString(formdata))) {
    formdata = new FormData();
    for (var k in params) {
      formdata.append(k, params[k]);
    }
  }

  return elation.net.xhr('PUT', url, formdata, args);  
});
elation.extend('net.xhr', function(method, url, formdata, args) {
  if (!args) args = {};
  if (!formdata) formdata = null;

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = elation.bind(args, elation.net.handlereadystatechange);
  if (args.onload) xhr.onload = args.onload;
  if (args.onprogress) {
    xhr.upload.onprogress = args.onprogress;
    xhr.onprogress = args.onprogress;
  }
  if (args.onerror) xhr.onerror = args.onerror;

  xhr.open(method, url);
  if (args.responseType) xhr.responseType = args.responseType;
  if (args.nocache) xhr.setRequestHeader("If-Modified-Since", "Thu, 01 Jan 1970 00:00:00 GMT");
  if (args.withCredentials) xhr.withCredentials = true;

  if (args.headers) {
    var headers = Object.keys(args.headers);
    for (var i = 0; i < headers.length; i++) {
      var header = headers[i];
      xhr.setRequestHeader(header, args.headers[header]);
    }
  }
  xhr.send(formdata);

  return xhr;
});
elation.extend('net.handlereadystatechange', function(ev) {
  // "this" is bound to the args object that was passed when initiating the call
  var xhr = ev.target;
  if (xhr.readyState == 4) {
    if (xhr.status == 200) {
      if (xhr.responseType == 'arraybuffer') {
        if (this.callback) {
          this.callback(xhr.response, xhr);
        }
      } else if (xhr.responseType == 'text' || xhr.responseType == '') {
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
          this.callback(response, xhr);
        }
      }
    } else {
      if (this.failurecallback) {
        //elation.ajax.executeCallback(obj.failurecallback);
        this.failurecallback(xhr);
      }
    }
  }
});
//elation.requireCSS('utils.elation');

elation.extend('utils.getCurrentScript', function() {
  // Gets the currently-executing script, (hopefully) in a cross-browser way
  var script = (typeof document != 'undefined' ? document.currentScript : false);
  if (typeof script == 'undefined') {
    var scripts = document.getElementsByTagName('script');
    script = scripts[scripts.length - 1];
  }
  return script;
});

// Element.scrollIntoViewIfNeeded polyfill
// From https://gist.github.com/hsablonniere/2581101
if (typeof Element != 'undefined' && !Element.prototype.scrollIntoViewIfNeeded) {
    Element.prototype.scrollIntoViewIfNeeded = function (centerIfNeeded) {
        "use strict";

        function makeRange(start, length) {
            return {"start": start, "length": length, "end": start + length};
        }

        function coverRange(inner, outer) {
            if (false === centerIfNeeded ||
                (outer.start < inner.end && inner.start < outer.end))
            {
                return Math.min(
                    inner.start, Math.max(outer.start, inner.end - outer.length)
                );
            }
            return (inner.start + inner.end - outer.length) / 2;
        }

        function makePoint(x, y) {
            return {
                "x": x, "y": y,
                "translate": function translate(dX, dY) {
                    return makePoint(x + dX, y + dY);
                }
            };
        }

        function absolute(elem, pt) {
            while (elem) {
                pt = pt.translate(elem.offsetLeft, elem.offsetTop);
                elem = elem.offsetParent;
            }
            return pt;
        }

        var target = absolute(this, makePoint(0, 0)),
            extent = makePoint(this.offsetWidth, this.offsetHeight),
            elem = this.parentNode,
            origin;

        while (elem instanceof HTMLElement) {
            // Apply desired scroll amount.
            origin = absolute(elem, makePoint(elem.clientLeft, elem.clientTop));
            elem.scrollLeft = coverRange(
                makeRange(target.x - origin.x, extent.x),
                makeRange(elem.scrollLeft, elem.clientWidth)
            );
            elem.scrollTop = coverRange(
                makeRange(target.y - origin.y, extent.y),
                makeRange(elem.scrollTop, elem.clientHeight)
            );

            // Determine actual scroll amount by reading back scroll properties.
            target = target.translate(-elem.scrollLeft, -elem.scrollTop);
            elem = elem.parentNode;
        }
    };
}


// ===== END EXTERNAL FILE: utils.elation =====

elation.requireactivebatchjs = new elation.require.batch("js", "/scripts"); elation.requireactivebatchjs.fulfill(["utils.elation","utils.events","utils.dust","utils.template","elements.elements","elements.base","elements.ui.text","elements.ui.label","elements.ui.item","elements.ui.button","elements.ui.togglebutton","elements.ui.list","elements.ui.dropdownbutton","elements.ui.popupbutton","elements.ui.indicator","elements.ui.notificationbutton","elements.ui.buttonbar","elements.ui.radiobuttonbar","elements.ui.buttonlist","elements.ui.input","elements.ui.textarea","elements.ui.toggle","elements.ui.checkbox","elements.ui.radio","elements.ui.select","elements.ui.slider","elements.ui.grid","elements.ui.checklist","elements.ui.panel","elements.ui.tabbutton","elements.ui.tabcountbutton","elements.ui.tabbar","elements.ui.tab","elements.ui.tabs","elements.ui.window","elements.ui.tooltip","elements.ui.formgroup","elements.ui.columnlayout","elements.ui.collapsiblepanel","elements.ui.content","elements.ui.treeview","elements.ui.scrollindicator","elements.ui.spinner","elements.ui.imagepicker","elements.ui.wizard","elements.ui.all","elements.collection.simple","elements.collection.indexed","elements.collection.localindexed","elements.collection.api","elements.collection.jsonapi","elements.collection.jsonpapi","elements.collection.custom","elements.collection.filter","elements.collection.subset","elements.collection.all","ANONYMOUS","root"]);
elation.requireactivebatchcss = new elation.require.batch("css", "/css"); elation.requireactivebatchcss.fulfill(["ui.input","elements.ui.input","ui.label","ui.button","ui.list","ui.dropdownbutton","ui.buttonbar","ui.toggle","ui.select","ui.slider","ui.grid","ui.panel","ui.tabbar","ui.tabs","ui.window","ui.tooltip","ui.formgroup","ui.columnlayout","ui.collapsiblepanel","ui.content","ui.treeview","ui.spinner","ui.imagepicker","ui.wizard","elements.ui.wizard","utils.elation","utils.events","elements.ui.all","elements.collection.all","elements.collection.subset","root"]);
// ===== BEGIN EXTERNAL FILE: utils.events ====
// if (typeof require == 'function') var elation = require("utils/elation");
elation.extend("events", {
  events: {},
  cloneattrs: ['type', 'bubbles', 'cancelable', 'view', 'detail', 'screenX', 'screenY', 'clientX', 'clientY', 'ctrlKey', 'shiftKey', 'altKey', 'metaKey', 'button', 'relatedTarget', 'target', 'element', 'data', 'origin', 'timeStamp', 'returnValue', 'cancelBubble', 'keyCode', 'dataTransfer', 'deltaX', 'deltaY', 'deltaZ', 'deltaMode', 'inputSource', 'inputSourceObject', 'touches', 'changedTouches'],

  eventstats: {},
  
  fire: function(type, data, target, element, fn) {
    var ev = this.getEvent(type, data, target, element, fn);

    //console.log('fire!', ev, type, data, target, element, fn);
    return elation.events.fireEvent(ev);
  },
  getEvent: function(type, data, target, element, fn) {
    var extras = {};

    if (typeof type == 'object') {
      data = elation.utils.any(type.data, data);
      target = type.target || target;
      element = type.element || element;
      fn = type.fn || fn;
      var cloneev = type.event || {};

      for (var i = 0; i < this.cloneattrs.length; i++) {
        var attr = this.cloneattrs[i];
        if (!elation.utils.isNull(type[attr])) extras[attr] = type[attr];
        else if (!elation.utils.isNull(cloneev[attr])) extras[attr] = cloneev[attr];
      }

      if (type.event) {
        var realevent = type.event;
        // If we have a real event, we want our synthesized event to pass stopPropagation and preventDefault calls through
        if (!extras.stopPropagation) {
          extras.stopPropagation = elation.bind(extras, function() {
            realevent.stopPropagation();
            this.cancelBubble = true;
          });
        }
        if (!extras.preventDefault) extras.preventDefault = elation.bind(type.event, type.event.preventDefault);
      }

      if (!elation.utils.isNull(type.clientX)) extras.clientX = type.clientX;
      if (!elation.utils.isNull(type.clientY)) extras.clientY = type.clientY;
      if (!elation.utils.isNull(type.button)) extras.button = type.button;
      if (!elation.utils.isNull(type.keyCode)) extras.keyCode = type.keyCode;

      extras.fn = fn;

      type = type.type;
    }

    extras.data = data;
    extras.target = target;
    extras.element = element;
    extras.fn = fn;
/*
    var ev = {
      type: type,
      element: element,
      fn: fn,
      extras: extras,
      data: data
    };
*/
    return extras;
  },
  fireEvent: function(realevent, element) {
    //console.log('fireEvent:',realevent);
    var type = realevent.type,
        data = realevent.data,
        element = element || realevent.element,
        target = realevent.target,
        fn = realevent.fn;

    if (!type)
      return false;

    if (!this.eventstats[type]) this.eventstats[type] = 0;
    this.eventstats[type]++;
    
    var list = this.events[type],
        original_events = [],
        events = [],
        event;
    
    if (!list) {
      this.events[type] = [];
      return [];
    }

    // gather all the events associated with this event type
    // filter by [element] and/or [fn] if present
    for (var i=0; i<list.length; i++) {
      event = list[i];
      if (fn || element) {
        if ((fn && event.origin == fn) || (element && event.target == element) || elation.utils.isNull(event.target)) {
          original_events.push(event);
        } else {
          continue;
        }
      } else {
        original_events.push(event);
      }
    }
    
    // fire each event
    var extrakeys = Object.keys(realevent);
    
    for (var i=0; i<original_events.length; i++) {
      var eventObj = original_events[i];
      
          // break reference to eventObj so original doesn't get overwritten
      var event = elation.events.clone(eventObj, {
            type: type, 
            target: target, 
            data: data, 
            timeStamp: new Date().getTime()
          });
      for (var j = 0; j < extrakeys.length; j++) {
        if (typeof realevent[extrakeys[j]] != 'undefined') {
          event[extrakeys[j]] = realevent[extrakeys[j]];
        }
      }
      if (!event.origin)
        continue;
      
      var cont = true;
      
      if (typeof event.origin == 'function') {
        cont = event.origin(event);
      } else if (typeof event.origin.handleEvent != 'undefined') {
        cont = event.origin.handleEvent(event);
      }

      events.push(event);

      if (cont === false || event.cancelBubble || realevent.cancelBubble) {
        // FIXME - I keep finding myself commenting this out, and then wondering why I've commented it out later
        //         Note to self - if you have to change this setting again, at least document why it needs to change!
        event.cancelBubble = true;
        break;
      }
    }
    
    // return all event objects that were fired
    return events;
  },
  
  register: function(types, fn, element) {
    var types = types.split(','),
        type;
    
    for (var i=0; i<types.length; i++) {
      type = types[i];
      
      if (!this.events[type]) {
        if (fn || element)
          this._register(element, type, fn);
        else
          this.events[type] = [];
      }
    }
  },
  
  _register: function(element, type, fn, options) {
    
    var event = { 
      type: type, 
      target: element, 
      origin: fn,
      preventDefault: function() { this.returnValue = false; return; },
      stopPropagation: function() { this.cancelBubble = true; return; },
      returnValue: true,
      cancelBubble: false
    };
    
    
    if (!elation.events.events[type])
      elation.events.events[type] = [];
    
    elation.events.events[type].push(event);
  },
  _unregister: function(element, type, fn) {
    if (elation.events.events[type]) {
      var remaining = [];
      for (var i = 0; i < elation.events.events[type].length; i++) {
        var ev = elation.events.events[type][i];
        if (ev.type == type && ev.target == element && ev.origin == fn) {
          //elation.events.events[type].splice(i--, 1);
        } else {
          remaining.push(ev);
        }
      }
      if (elation.events.events[type].length != remaining.length) {
        elation.events.events[type] = remaining;
      }
    }
  },
  
  // syntax: add(element || [ elements ], "type1,type2,type3", function || object);
  add: function(elements, types, fn, options) {
    if (!types || !fn || typeof types != "string")
      return;

    var elements = elation.utils.isNull(elements) 
          ? [null] 
          : !elation.utils.isArray(elements) || elements == window
            ? [ elements ] 
            : elements,
        types = types.split(',');
    
    if (typeof fn == "string") {
      fn = (function(func) { return function(ev) { eval(func); }; })(fn);
    }

    for (var e=0; e<elements.length; e++) {
      var element = elements[e];
      
      if (typeof element != 'object')
        continue;
      
      for (var i=0; i<types.length; i++) {
        var type = types[i];
        
        elation.events._register(element, type, fn);
        
        if (!element)
          continue;

        if (type.toLowerCase() == 'transitionend') {
          if ('onwebkittransitionend' in window) type = 'webkitTransitionEnd';
          else if ('onotransitionend' in element || navigator.appName == 'Opera') type = 'oTransitionEnd';
        }
        
        if ("addEventListener" in element) {
          //if (type == 'mousewheel' && elation.browser.type != 'safari')
          //  type = 'DOMMouseScroll';
          if (typeof fn == "object" && fn.handleEvent) {
            element[type+fn] = function(e) { 
              fn.handleEvent(e); 
            }
            element.addEventListener(type, element[(type + fn)], options);
          } else {
            element.addEventListener(type, fn, options);
          }
        } else if (element.attachEvent) {
          if (typeof fn == "object" && fn.handleEvent) { 
            element[type+fn] = function() { 
              fn.handleEvent(elation.events.fix(window.event)); 
            }
          } else {
            element["e" + type + fn] = fn;
            element[type + fn] = function() { 
              if (typeof element["e" + type + fn] == 'function') 
                element["e" + type + fn](elation.events.fix(window.event)); 
            }
          }
          
          element.attachEvent("on" + type, element[type + fn]);
        }
      }
    }
    
    return this;
  },
  
  // syntax: remove(element || [ elements ], "type1,type2,type3", reference);
  remove: function(elements, types, fn) {
    //if (!elements || !types || !fn || typeof types != "string")
    //  return;
    
    //var  elements = (!elation.utils.isNull(elements.nodeName) || elements == window) ? [ elements ] : elements;
    if (!elation.utils.isArray(elements)) {
      elements = [elements];
    }
    var types = types.split(',');
    
    for (var e=0; e<elements.length; e++) {
      var element = elements[e];
      
      if (typeof element != 'object')
        continue;
      
      for (var i=0; i<types.length; i++) {
        var type = types[i];
        
        elation.events._unregister(element, type, fn);

        if (element) {
          if (element.removeEventListener) {
            if (typeof fn == "object" && fn.handleEvent) {
              element.removeEventListener(type, element[type+fn], false);
              delete element[type + fn];
            } else {
              element.removeEventListener(type, fn, false);
            }
          } else if (element.detachEvent) {
            if (typeof element[type + fn] == "function")
              element.detachEvent("on" + type, element[type + fn]);
            
            element[type + fn] = null;
            element["e" + type + fn] = null;
          }
        }
      }
    }
    
    return this;
  },
  
  fix: function(event) {
    event.preventDefault = function() {
      this.returnValue = false;
    }
    
    event.stopPropagation = function() {
      this.cancelBubble = true;
    }

    //event.preventDefault = this.preventDefault;
    //event.stopPropagation = this.stopPropagation;
    
    return event;
  },
  
  getTarget: function(event) {
    return window.event ? event.srcElement : event.target;
  },
  
  getRelated: function(event) {
    var reltg;
    
    if (event.relatedTarget) {
      reltg = event.relatedTarget;
    } else {
      if (event.type == "mouseover")
        reltg = event.fromElement;
      else if (event.type == "mouseout")
        reltg = event.toElement;
      else
        reltg = document;
    }
    
    return reltg;
  },
  
  getEventTarget: function(event, parentClassName) {
    var target;
    
    if (!event) 
      var event = window.event;
    
    if (event.target) 
      target = event.target;
    else if (event.srcElement) 
      target = event.srcElement;
    
    if (target.nodeType == 3) 
      target = target.parentNode; // Defeat Safari bug
    
    if (parentClassName) {
      // Make sure we're working with the correct element
      var classUp, classDown;
      
      if (parentClassName.indexOf(">")) {
        var classes = parentClassName.split(">", 2);
        classDown = classes[0];
        classUp = classes[1];
      } else {
        classDown = parentClassName;
      }
      
      // First run DOWN the heirarchy to find the base class...
      while (!elation.html.hasclass(target,classDown) && target.parentNode) {
        target = target.parentNode;
      }
      
      // Now if we've specified a child to attach to, find it!
      if (classUp) {
        var elements;
        elements = elation.find("." + classUp, target);
        if (elements.length > 0) {
          target = elements[0];
        }
      }
    }
    
    return target;
  },
  isTransition: function(ev, parent) {
    var tg = this.getTarget(ev),
        reltg = this.getRelated(ev);
    return (elation.utils.isin(parent, tg) && !elation.utils.isin(parent, reltg));
  },

  // returns mouse or all finger touch coords
  coords: function(event) {
    if (typeof event.touches != 'undefined' && event.touches.length > 0) {
      var c = {
        x: event.touches[0].pageX, 
        y: event.touches[0].pageY
      };
    } else {
      var  c = {
        x: (event.pageX || (event.clientX + document.body.scrollLeft)),
        y: (event.pageY || (event.clientY + document.body.scrollTop))
      };
    }
    
    return c;
  },

  clone: function(ev,  overrides={}) {
    //var newev = new Event(ev.type);
    var newev = {};
    for (let i = 0; i < this.cloneattrs.length; i++) {
      let attr = this.cloneattrs[i];
      let foo = elation.utils.any(overrides[attr], ev[attr]);
      if (foo !== null) {
        newev[attr] = foo;
      }
    }
    return elation.events.fix(newev);
    //return newev;
  },

  handleEvent: function(ev) {
    if (typeof this[ev.type] == 'function') {
      this[ev.type](ev);
    }
  },

  schedule: function(args) {
    /*
    elation.events.schedule({ev: foo, in: 2000});
    elation.events.schedule({ev: foo, every: 200});
    elation.events.schedule({ev: foo, at: Date().getTime() + 3600});
    */
  },

  getEventsByTarget: function(target) {
    var results = [];
    for (var evname in this.events) {
      for (var i = 0; i < this.events[evname].length; i++) {
        var ev = this.events[evname][i];
        if (ev.target === target) {
          results.push(ev);
        }
      }
    }
    return results;
  },
  getEventsByOrigin: function(origin) {
    var results = [];
    for (var evname in this.events) {
      for (var i = 0; i < this.events[evname].length; i++) {
        var ev = this.events[evname][i];
        if (ev.origin === origin) {
          results.push(ev);
        }
      }
    }
    return results;
  },
  getEventsByTargetOrOrigin: function(target) {
    var results = [];
    for (var evname in this.events) {
      for (var i = 0; i < this.events[evname].length; i++) {
        var ev = this.events[evname][i];
        if (ev.target === target || ev.origin === target) {
          results.push(ev);
        }
      }
    }
    return results;
  },
  hasEventListener: function(target, type) {
    var allevents = elation.events.events[type];
    if (allevents) {
      for (var i = 0; i < allevents.length; i++) {
        var ev = allevents[i];
        if (ev.target === target || ev.origin === target) {
          return true;
        }
      }
    }
    return false;
  },
  wasDefaultPrevented: function(events) {
    let allowed = true;
    if (!elation.utils.isArray(events)) {
      events = [events];
    }
    for (let i = 0; i < events.length; i++) {
      allowed = allowed && (events[i].returnValue !== false);
    }
    return !allowed;
  },
  wasBubbleCancelled: function(events) {
    let cancelled = false;
    if (!elation.utils.isArray(events)) {
      events = [events];
    }
    for (let i = 0; i < events.length; i++) {
      cancelled = cancelled || events[i].cancelBubble;
    }
    return cancelled;
  }
});

// ===== END EXTERNAL FILE: utils.events =====

// ===== BEGIN EXTERNAL FILE: utils.dust ====
//
// Dust - Asynchronous Templating v1.0.0
// http://akdubya.github.com/dustjs
//
// Copyright (c) 2010, Aleksander Williams
// Released under the MIT License.
//

var dust = {};

function getGlobal(){	
  return (function(){	
    return this.dust;	
      }).call(null);
}

(function(dust) {

dust.cache = {};

dust.register = function(name, tmpl) {
  if (!name) return;
  dust.cache[name] = tmpl;
};

dust.render = function(name, context, callback) {
  var chunk = new Stub(callback).head;
  dust.load(name, chunk, Context.wrap(context)).end();
};

dust.stream = function(name, context) {
  var stream = new Stream();
  dust.nextTick(function() {
    dust.load(name, stream.head, Context.wrap(context)).end();
  });
  return stream;
};

dust.renderSource = function(source, context, callback) {
  return dust.compileFn(source)(context, callback);
};

dust.compileFn = function(source, name) {
  var tmpl = dust.loadSource(dust.compile(source, name));
  return function(context, callback) {
    var master = callback ? new Stub(callback) : new Stream();
    dust.nextTick(function() {
      tmpl(master.head, Context.wrap(context)).end();
    });
    return master;
  }
};

dust.load = function(name, chunk, context) {
  var tmpl = dust.cache[name];
  if (tmpl) {
    return tmpl(chunk, context);
  } else {
    if (dust.onLoad) {
      return chunk.map(function(chunk) {
        dust.onLoad(name, function(err, src) {
          if (err) return chunk.setError(err);
          if (!dust.cache[name]) dust.loadSource(dust.compile(src, name));
          dust.cache[name](chunk, context).end();
        });
      });
    }
    return chunk.setError(new Error("Template Not Found: " + name));
  }
};

dust.loadSource = function(source, path) {
  return eval(source);
};

if (Array.isArray) {
  dust.isArray = Array.isArray;
} else {
  dust.isArray = function(arr) {
    return Object.prototype.toString.call(arr) == "[object Array]";
  };
}

dust.nextTick = (function() {
  if (typeof process !== "undefined") {
    return process.nextTick;
  } else {
    return function(callback) {
      setTimeout(callback,0);
    }
  }
} )();

dust.isEmpty = function(value) {
  if (dust.isArray(value) && !value.length) return true;
  if (value === 0) return false;
  return (!value);
};

dust.filter = function(string, auto, filters) {
  if (filters) {
    for (var i=0, len=filters.length; i<len; i++) {
      var name = filters[i];
      if (name === "s") {
        auto = null;
      } else {
        string = dust.filters[name](string);
      }
    }
  }
  if (auto) {
    string = dust.filters[auto](string);
  }
  return string;
};

dust.filters = {
  h: function(value) { return dust.escapeHtml(value); },
  j: function(value) { return dust.escapeJs(value); },
  u: encodeURI,
  uc: encodeURIComponent,
  js: function(value) { if (!JSON) { return value; } return JSON.stringify(value); },
  jp: function(value) { if (!JSON) { return value; } return JSON.parse(value); },
  round: function(value) { return (+value).toFixed(4); }
};

function Context(stack, global, blocks) {
  this.stack  = stack;
  this.global = global;
  this.blocks = blocks;
}

dust.makeBase = function(global) {
  return new Context(new Stack(), global);
};

Context.wrap = function(context) {
  if (context instanceof Context) {
    return context;
  }
  return new Context(new Stack(context));
};

Context.prototype.get = function(key) {
  var ctx = this.stack, value;

  while(ctx) {
    if (ctx.isObject) {
      value = ctx.head[key];
      if (!(value === undefined)) {
        return value;
      }
    }
    ctx = ctx.tail;
  }
  return this.global ? this.global[key] : undefined;
};

Context.prototype.getPath = function(cur, down) {
  var ctx = this.stack,
      len = down.length;

  if (cur && len === 0) return ctx.head;
  ctx = ctx.head;
  var i = 0;
  while(ctx && i < len) {
    ctx = ctx[down[i]];
    i++;
  }
  return ctx;
};

Context.prototype.push = function(head, idx, len) {
  return new Context(new Stack(head, this.stack, idx, len), this.global, this.blocks);
};

Context.prototype.rebase = function(head) {
  return new Context(new Stack(head), this.global, this.blocks);
};

Context.prototype.current = function() {
  return this.stack.head;
};

Context.prototype.getBlock = function(key, chk, ctx) {
  if (typeof key === "function") {
    key = key(chk, ctx).data;
    chk.data = "";
  }

  var blocks = this.blocks;

  if (!blocks) return;
  var len = blocks.length, fn;
  while (len--) {
    fn = blocks[len][key];
    if (fn) return fn;
  }
};

Context.prototype.shiftBlocks = function(locals) {
  var blocks = this.blocks;

  if (locals) {
    if (!blocks) {
      newBlocks = [locals];
    } else {
      newBlocks = blocks.concat([locals]);
    }
    return new Context(this.stack, this.global, newBlocks);
  }
  return this;
};

function Stack(head, tail, idx, len) {
  this.tail = tail;
  this.isObject = !dust.isArray(head) && head && typeof head === "object";
  this.head = head;
  this.index = idx;
  this.of = len;
}

function Stub(callback) {
  this.head = new Chunk(this);
  this.callback = callback;
  this.out = '';
}

Stub.prototype.flush = function() {
  var chunk = this.head;

  while (chunk) {
    if (chunk.flushable) {
      this.out += chunk.data;
    } else if (chunk.error) {
      this.callback(chunk.error);
      this.flush = function() {};
      return;
    } else {
      return;
    }
    chunk = chunk.next;
    this.head = chunk;
  }
  this.callback(null, this.out);
};

function Stream() {
  this.head = new Chunk(this);
}

Stream.prototype.flush = function() {
  var chunk = this.head;

  while(chunk) {
    if (chunk.flushable) {
      this.emit('data', chunk.data);
    } else if (chunk.error) {
      this.emit('error', chunk.error);
      this.flush = function() {};
      return;
    } else {
      return;
    }
    chunk = chunk.next;
    this.head = chunk;
  }
  this.emit('end');
};

Stream.prototype.emit = function(type, data) {
  if (!this.events) return false;
  var handler = this.events[type];
  if (!handler) return false;
  if (typeof handler == 'function') {
    handler(data);
  } else {
    var listeners = handler.slice(0);
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i](data);
    }
  }
};

Stream.prototype.on = function(type, callback) {
  if (!this.events) {
    this.events = {};
  }
  if (!this.events[type]) {
    this.events[type] = callback;
  } else if(typeof this.events[type] === 'function') {
    this.events[type] = [this.events[type], callback];
  } else {
    this.events[type].push(callback);
  }
  return this;
};

Stream.prototype.pipe = function(stream) {
  this.on("data", function(data) {
    stream.write(data, "utf8");
  }).on("end", function() {
    stream.end();
  }).on("error", function(err) {
    stream.error(err);
  });
  return this;
};

function Chunk(root, next, taps) {
  this.root = root;
  this.next = next;
  this.data = '';
  this.flushable = false;
  this.taps = taps;
}

Chunk.prototype.write = function(data) {
  var taps  = this.taps;

  if (taps) {
    data = taps.go(data);
  }
  this.data += data;
  return this;
};

Chunk.prototype.end = function(data) {
  if (data) {
    this.write(data);
  }
  this.flushable = true;
  this.root.flush();
  return this;
};

Chunk.prototype.map = function(callback) {
  var cursor = new Chunk(this.root, this.next, this.taps),
      branch = new Chunk(this.root, cursor, this.taps);

  this.next = branch;
  this.flushable = true;
  callback(branch);
  return cursor;
};

Chunk.prototype.tap = function(tap) {
  var taps = this.taps;

  if (taps) {
    this.taps = taps.push(tap);
  } else {
    this.taps = new Tap(tap);
  }
  return this;
};

Chunk.prototype.untap = function() {
  this.taps = this.taps.tail;
  return this;
};

Chunk.prototype.render = function(body, context) {
  return body(this, context);
};

Chunk.prototype.reference = function(elem, context, auto, filters) {
  if (typeof elem === "function") {
    elem.isReference = true;
    // Changed the function calling to use apply with the current context to make sure that "this" is wat we expect it to be inside the function
    elem = elem.apply(context.current(), [this, context, null, {auto: auto, filters: filters}]);
    if (elem instanceof Chunk) {
      return elem;
    }
  }
  if (!dust.isEmpty(elem)) {
    return this.write(dust.filter(elem, auto, filters));
  } else {
    return this;
  }
};

Chunk.prototype.section = function(elem, context, bodies, params) {
  if (typeof elem === "function") {
    elem = elem.apply(context.current(), [this, context, bodies, params]);
    if (elem instanceof Chunk) {
      return elem;
    }
  }

  var body = bodies.block,
      skip = bodies['else'];

  if (params) {
    context = context.push(params);
  }

  if (dust.isArray(elem)) {
    if (body) {
      var len = elem.length, chunk = this;
      context.stack.head['$len'] = len;
      for (var i=0; i<len; i++) {
        context.stack.head['$idx'] = i;
        chunk = body(chunk, context.push(elem[i], i, len));
      }
      context.stack.head['$idx'] = undefined;
      context.stack.head['$len'] = undefined;
      return chunk;
    }
  } else if (elem === true) {
    if (body) return body(this, context);
  } else if (elem || elem === 0) {
    if (body) {
      context.stack.head['$idx'] = 0;
      context.stack.head['$len'] = 1;
      chunk = body(this, context.push(elem));
      context.stack.head['$idx'] = undefined;
      context.stack.head['$len'] = undefined;
      return chunk;
    }
  } else if (skip) {
    return skip(this, context);
  }
  return this;
};

Chunk.prototype.exists = function(elem, context, bodies) {
  var body = bodies.block,
      skip = bodies['else'];

  if (!dust.isEmpty(elem)) {
    if (body) return body(this, context);
  } else if (skip) {
    return skip(this, context);
  }
  return this;
};

Chunk.prototype.notexists = function(elem, context, bodies) {
  var body = bodies.block,
      skip = bodies['else'];

  if (dust.isEmpty(elem)) {
    if (body) return body(this, context);
  } else if (skip) {
    return skip(this, context);
  }
  return this;
};

Chunk.prototype.block = function(elem, context, bodies) {
  var body = bodies.block;

  if (elem) {
    body = elem;
  }

  if (body) {
    return body(this, context);
  }
  return this;
};

Chunk.prototype.partial = function(elem, context, params) {
  var ctx = context.stack, tempHead = ctx.head;
  if (params){
    //put the params context second to match what section does. {.} matches the current context without parameters
    //remove head
    context = context.rebase(ctx.tail);
    //put params on
    context = context.push(params);
    //reattach the head
    context = context.push(tempHead);
  }
  if (typeof elem === "function") {
    return this.capture(elem, context, function(name, chunk) {
      dust.load(name, chunk, context).end();
    });
  }
  return dust.load(elem, this, context);
};

Chunk.prototype.helper = function(name, context, bodies, params) {
  return dust.helpers[name](this, context, bodies, params);
};

Chunk.prototype.capture = function(body, context, callback) {
  return this.map(function(chunk) {
    var stub = new Stub(function(err, out) {
      if (err) {
        chunk.setError(err);
      } else {
        callback(out, chunk);
      }
    });
    body(stub.head, context).end();
  });
};

Chunk.prototype.setError = function(err) {
  this.error = err;
  this.root.flush();
  return this;
};

function Tap(head, tail) {
  this.head = head;
  this.tail = tail;
}

Tap.prototype.push = function(tap) {
  return new Tap(tap, this);
};

Tap.prototype.go = function(value) {
  var tap = this;

  while(tap) {
    value = tap.head(value);
    tap = tap.tail;
  }
  return value;
};

var HCHARS = new RegExp(/[&<>\"\']/),
    AMP    = /&/g,
    LT     = /</g,
    GT     = />/g,
    QUOT   = /\"/g,
    SQUOT  = /\'/g;

dust.escapeHtml = function(s) {
  if (typeof s === "string") {
    if (!HCHARS.test(s)) {
      return s;
    }
    return s.replace(AMP,'&amp;').replace(LT,'&lt;').replace(GT,'&gt;').replace(QUOT,'&quot;').replace(SQUOT, '&#39;');
  }
  return s;
};

var BS = /\\/g,
    CR = /\r/g,
    LS = /\u2028/g,
    PS = /\u2029/g,
    NL = /\n/g,
    LF = /\f/g,
    SQ = /'/g,
    DQ = /"/g,
    TB = /\t/g;

dust.escapeJs = function(s) {
  if (typeof s === "string") {
    return s
      .replace(BS, '\\\\')
      .replace(DQ, '\\"')
      .replace(SQ, "\\'")
      .replace(CR, '\\r')
      .replace(LS, '\\u2028')
      .replace(PS, '\\u2029')
      .replace(NL, '\\n')
      .replace(LF, '\\f')
      .replace(TB, "\\t");
  }
  return s;
};

})(dust);

// if (typeof exports !== "undefined") {
//   //TODO: Remove the helpers from dust core in the next release.
//   dust.helpers = require("./dust-helpers").helpers;
//   if (typeof process !== "undefined") {
//       require('./server')(dust);
//   }
//   module.exports = dust;
// }
(function(dust){

/* make a safe version of console if it is not available
 * currently supporting:
 *   _console.log
 * */
var _console = (typeof console !== 'undefined')? console: {
  log: function(){
     /* a noop*/
   }
};

function isSelect(context) {
  var value = context.current();
  return typeof value === "object" && value.isSelect === true;   
}

function filter(chunk, context, bodies, params, filter) {
  var params = params || {},
      actual,
      expected;
  if (params.key) {
    actual = helpers.tap(params.key, chunk, context);
  } else if (isSelect(context)) {
    actual = context.current().selectKey;
    if (context.current().isResolved) {
      filter = function() { return false; };
    }
  } else {
    throw "No key specified for filter and no key found in context from select statement";
  }
  expected = helpers.tap(params.value, chunk, context);
  if (filter(expected, coerce(actual, params.type, context))) {
    if (isSelect(context)) {
      context.current().isResolved = true;
    }
    return chunk.render(bodies.block, context);
  } else if (bodies['else']) {
    return chunk.render(bodies['else'], context);
  }

  return chunk.write('');
}

function coerce (value, type, context) {
  if (value) {
    switch (type || typeof(value)) {
      case 'number': return +value;
      case 'string': return String(value);
      case 'boolean': return Boolean(value);
      case 'date': return new Date(value);
      case 'context': return context.get(value);
    }
  }

  return value;
}

var helpers = {
  
  sep: function(chunk, context, bodies) {
    if (context.stack.index === context.stack.of - 1) {
      return chunk;
    }
    return bodies.block(chunk, context);
  },

  idx: function(chunk, context, bodies) {
    return bodies.block(chunk, context.push(context.stack.index));
  },
  
  contextDump: function(chunk, context, bodies) {
    _console.log(JSON.stringify(context.stack));
    return chunk;
  },
  
  // Utility helping to resolve dust references in the given chunk
  tap: function( input, chunk, context ){
    // return given input if there is no dust reference to resolve
    var output = input;
    // dust compiles a string to function, if there are references
    if( typeof input === "function"){
      if( ( typeof input.isReference !== "undefined" ) && ( input.isReference === true ) ){ // just a plain function, not a dust `body` function
        output = input();
      } else {
        output = '';
        chunk.tap(function(data){
          output += data;
          return '';
        }).render(input, context).untap();
        if( output === '' ){
          output = false;
        }
      }
    }
    return output;
  },

  /**
  if helper 
   @param cond, either a string literal value or a dust reference
                a string literal value, is enclosed in double quotes, e.g. cond="2>3"
                a dust reference is also enclosed in double quotes, e.g. cond="'{val}'' > 3"
    cond argument should evaluate to a valid javascript expression
   **/

  "if": function( chunk, context, bodies, params ){
    if( params && params.cond ){
      var cond = params.cond;
      cond = this.tap(cond, chunk, context);
      // eval expressions with given dust references
      if( eval( cond ) ){
       return chunk.render( bodies.block, context );
      }
      if( bodies['else'] ){
       return chunk.render( bodies['else'], context );
      }
    }
    // no condition
    else {
      _console.log( "No condition given in the if helper!" );
    }
    return chunk;
  },
  
   /**
   select/eq/lt/lte/gt/gte/default helper
   @param key, either a string literal value or a dust reference
                a string literal value, is enclosed in double quotes, e.g. key="foo"
                a dust reference may or may not be enclosed in double quotes, e.g. key="{val}" and key=val are both valid
   @param type (optiona), supported types are  number, boolean, string, date, context, defaults to string
   **/
  select: function(chunk, context, bodies, params) {
    if( params && params.key){
      // returns given input as output, if the input is not a dust reference, else does a context lookup
      var key = this.tap(params.key, chunk, context);
      return chunk.render(bodies.block, context.push({ isSelect: true, isResolved: false, selectKey: key }));
    }
    // no key
    else {
      _console.log( "No key given in the select helper!" );
    }
    return chunk;
  },

  eq: function(chunk, context, bodies, params) {
    return filter(chunk, context, bodies, params, function(expected, actual) { return actual === expected; });
  },

  lt: function(chunk, context, bodies, params) {
    return filter(chunk, context, bodies, params, function(expected, actual) { return actual < expected; });
  },

  lte: function(chunk, context, bodies, params) {
    return filter(chunk, context, bodies, params, function(expected, actual) { return actual <= expected; });
  },

  gt: function(chunk, context, bodies, params) {
    return filter(chunk, context, bodies, params, function(expected, actual) { return actual > expected; });
  },

  gte: function(chunk, context, bodies, params) {
    return filter(chunk, context, bodies, params, function(expected, actual) { return actual >= expected; });
  },

  "default": function(chunk, context, bodies, params) {
    return filter(chunk, context, bodies, params, function(expected, actual) { return true; });
  },
  size: function( chunk, context, bodies, params ) {
    var subject = params.subject; 
    var value   = 0;
    if (!subject) { //undefined, "", 0
      value = 0;  
    } else if(dust.isArray(subject)) { //array 
      value = subject.length;  
    } else if (!isNaN(subject)) { //numeric values  
      value = subject;  
    } else if (Object(subject) === subject) { //object test
      var nr = 0;  
      for(var k in subject) if(Object.hasOwnProperty.call(subject,k)) nr++;  
        value = nr;
    } else { 
      value = (subject + '').length; //any other value (strings etc.)  
    } 
    return chunk.write(value); 
  }
};

dust.helpers = helpers;

})(typeof exports !== 'undefined' ? exports : getGlobal());
(function(dust) {

dust.compile = function(source, name) {
  try {
    var ast = filterAST(dust.parse(source));
    return compile(ast, name);
  }
  catch(err)
  {
    if(!err.line || !err.column) throw err;    
    throw new SyntaxError(err.message + " At line : " + err.line + ", column : " + err.column);
  }
};

function filterAST(ast) {
  var context = {};
  return dust.filterNode(context, ast);
}

dust.filterNode = function(context, node) {
  return dust.optimizers[node[0]](context, node);
}

dust.optimizers = {
  body:      compactBuffers,
  buffer:    noop,
  special:   convertSpecial,
  format:    nullify,        // TODO: convert format
  reference: visit,
  "#":       visit,
  "?":       visit,
  "^":       visit,
  "<":       visit,
  "+":       visit,
  "@":       visit,
  "%":       visit,
  partial:   visit,
  context:   visit,
  params:    visit,
  bodies:    visit,
  param:     visit,
  filters:   noop,
  key:       noop,
  path:      noop,
  literal:   noop,
  comment:   nullify
}

dust.pragmas = {
  esc: function(compiler, context, bodies, params) {
    var old = compiler.auto;
    if (!context) context = 'h';
    compiler.auto = (context === 's') ? '' : context;
    var out = compileParts(compiler, bodies.block);
    compiler.auto = old;
    return out;
  }
}

function visit(context, node) {
  var out = [node[0]];
  for (var i=1, len=node.length; i<len; i++) {
    var res = dust.filterNode(context, node[i]);
    if (res) out.push(res);
  }
  return out;
}

// Compacts consecutive buffer nodes into a single node
function compactBuffers(context, node) {
  var out = [node[0]], memo;
  for (var i=1, len=node.length; i<len; i++) {
    var res = dust.filterNode(context, node[i]);
    if (res) {
      if (res[0] === 'buffer') {
        if (memo) {
          memo[1] += res[1];
        } else {
          memo = res;
          out.push(res);
        }
      } else {
        memo = null;
        out.push(res);
      }
    }
  }
  return out;
}

var specialChars = {
  "s": " ",
  "n": "\n",
  "r": "\r",
  "lb": "{",
  "rb": "}"
};

function convertSpecial(context, node) { return ['buffer', specialChars[node[1]]] }
function noop(context, node) { return node }
function nullify(){}

function compile(ast, name) {
  var context = {
    name: name,
    bodies: [],
    blocks: {},
    index: 0,
    auto: "h"
  }

  return "(function(){dust.register("
    + (name ? "\"" + name + "\"" : "null") + ","
    + dust.compileNode(context, ast)
    + ");"
    + compileBlocks(context)
    + compileBodies(context)
    + "return body_0;"
    + "})();";
}

function compileBlocks(context) {
  var out = [],
      blocks = context.blocks;

  for (var name in blocks) {
    out.push("'" + name + "':" + blocks[name]);
  }
  if (out.length) {
    context.blocks = "ctx=ctx.shiftBlocks(blocks);";
    return "var blocks={" + out.join(',') + "};";
  }
  return context.blocks = "";
}

function compileBodies(context) {
  var out = [],
      bodies = context.bodies,
      blx = context.blocks;

  for (var i=0, len=bodies.length; i<len; i++) {
    out[i] = "function body_" + i + "(chk,ctx){"
      + blx + "return chk" + bodies[i] + ";}";
  }
  return out.join('');
}

function compileParts(context, body) {
  var parts = '';
  for (var i=1, len=body.length; i<len; i++) {
    parts += dust.compileNode(context, body[i]);
  }
  return parts;
}

dust.compileNode = function(context, node) {
  return dust.nodes[node[0]](context, node);
}

dust.nodes = {
  body: function(context, node) {
    var id = context.index++, name = "body_" + id;
    context.bodies[id] = compileParts(context, node);
    return name;
  },

  buffer: function(context, node) {
    return ".write(" + escape(node[1]) + ")";
  },

  format: function(context, node) {
    return ".write(" + escape(node[1] + node[2]) + ")";
  },

  reference: function(context, node) {
    return ".reference(" + dust.compileNode(context, node[1])
      + ",ctx," + dust.compileNode(context, node[2]) + ")";
  },

  "#": function(context, node) {
    return compileSection(context, node, "section");
  },

  "?": function(context, node) {
    return compileSection(context, node, "exists");
  },

  "^": function(context, node) {
    return compileSection(context, node, "notexists");
  },

  "<": function(context, node) {
    var bodies = node[4];
    for (var i=1, len=bodies.length; i<len; i++) {
      var param = bodies[i],
          type = param[1][1];
      if (type === "block") {
        context.blocks[node[1].text] = dust.compileNode(context, param[2]);
        return '';
      }
    }
    return '';
  },

  "+": function(context, node) {
    if(typeof(node[1].text) === "undefined"  && typeof(node[4]) === "undefined"){
      return ".block(ctx.getBlock("
      + dust.compileNode(context, node[1])
      + ",chk, ctx)," + dust.compileNode(context, node[2]) + ", {},"
      + dust.compileNode(context, node[3])
      + ")";
    }else {
      return ".block(ctx.getBlock("
      + escape(node[1].text)
      + ")," + dust.compileNode(context, node[2]) + ","
      + dust.compileNode(context, node[4]) + ","
      + dust.compileNode(context, node[3])
      + ")";
    }
  },

  "@": function(context, node) {
    return ".helper("
      + escape(node[1].text)
      + "," + dust.compileNode(context, node[2]) + ","
      + dust.compileNode(context, node[4]) + ","
      + dust.compileNode(context, node[3])
      + ")";
  },

  "%": function(context, node) {
    // TODO: Move these hacks into pragma precompiler
    var name = node[1][1];
    if (!dust.pragmas[name]) return '';

    var rawBodies = node[4];
    var bodies = {};
    for (var i=1, len=rawBodies.length; i<len; i++) {
      var b = rawBodies[i];
      bodies[b[1][1]] = b[2];
    }

    var rawParams = node[3];
    var params = {};
    for (var i=1, len=rawParams.length; i<len; i++) {
      var p = rawParams[i];
      params[p[1][1]] = p[2][1];
    }

    var ctx = node[2][1] ? node[2][1].text : null;

    return dust.pragmas[name](context, ctx, bodies, params);
  },

  partial: function(context, node) {
    return ".partial("
      + dust.compileNode(context, node[1])
      + "," + dust.compileNode(context, node[2])
      + "," + dust.compileNode(context, node[3]) + ")";
  },

  context: function(context, node) {
    if (node[1]) {
      return "ctx.rebase(" + dust.compileNode(context, node[1]) + ")";
    }
    return "ctx";
  },

  params: function(context, node) {
    var out = [];
    for (var i=1, len=node.length; i<len; i++) {
      out.push(dust.compileNode(context, node[i]));
    }
    if (out.length) {
      return "{" + out.join(',') + "}";
    }
    return "null";
  },

  bodies: function(context, node) {
    var out = [];
    for (var i=1, len=node.length; i<len; i++) {
      out.push(dust.compileNode(context, node[i]));
    }
    return "{" + out.join(',') + "}";
  },

  param: function(context, node) {
    return dust.compileNode(context, node[1]) + ":" + dust.compileNode(context, node[2]);
  },

  filters: function(context, node) {
    var list = [];
    for (var i=1, len=node.length; i<len; i++) {
      var filter = node[i];
      list.push("\"" + filter + "\"");
    }
    return "\"" + context.auto + "\""
      + (list.length ? ",[" + list.join(',') + "]" : '');
  },

  key: function(context, node) {
    return "ctx.get(\"" + node[1] + "\")";
  },

  path: function(context, node) {
    var current = node[1],
        keys = node[2],
        list = [];

    for (var i=0,len=keys.length; i<len; i++) {
      list.push("\"" + keys[i] + "\"");
    }
    return "ctx.getPath(" + current + ",[" + list.join(',') + "])";
  },

  literal: function(context, node) {
    return escape(node[1]);
  }
}

function compileSection(context, node, cmd) {
  return "." + cmd + "("
    + dust.compileNode(context, node[1])
    + "," + dust.compileNode(context, node[2]) + ","
    + dust.compileNode(context, node[4]) + ","
    + dust.compileNode(context, node[3])
    + ")";
}

var escape = (typeof JSON === "undefined")
  ? function(str) { return "\"" + dust.escapeJs(str) + "\"" }
  : JSON.stringify;

})(typeof exports !== 'undefined' ? exports : getGlobal());
(function(dust){

var parser = (function(){
  /*
   * Generated by PEG.js 0.7.0.
   *
   * http://pegjs.majda.cz/
   */
  
  function quote(s) {
    /*
     * ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a
     * string literal except for the closing quote character, backslash,
     * carriage return, line separator, paragraph separator, and line feed.
     * Any character may appear in the form of an escape sequence.
     *
     * For portability, we also escape escape all control and non-ASCII
     * characters. Note that "\0" and "\v" escape sequences are not used
     * because JSHint does not like the first and IE the second.
     */
     return '"' + s
      .replace(/\\/g, '\\\\')  // backslash
      .replace(/"/g, '\\"')    // closing quote character
      .replace(/\x08/g, '\\b') // backspace
      .replace(/\t/g, '\\t')   // horizontal tab
      .replace(/\n/g, '\\n')   // line feed
      .replace(/\f/g, '\\f')   // form feed
      .replace(/\r/g, '\\r')   // carriage return
      .replace(/[\x00-\x07\x0B\x0E-\x1F\x80-\uFFFF]/g, escape)
      + '"';
  }
  
  var result = {
    /*
     * Parses the input with a generated parser. If the parsing is successfull,
     * returns a value explicitly or implicitly specified by the grammar from
     * which the parser was generated (see |PEG.buildParser|). If the parsing is
     * unsuccessful, throws |PEG.parser.SyntaxError| describing the error.
     */
    parse: function(input, startRule) {
      var parseFunctions = {
        "body": parse_body,
        "part": parse_part,
        "section": parse_section,
        "sec_tag_start": parse_sec_tag_start,
        "end_tag": parse_end_tag,
        "context": parse_context,
        "params": parse_params,
        "bodies": parse_bodies,
        "reference": parse_reference,
        "partial": parse_partial,
        "filters": parse_filters,
        "special": parse_special,
        "identifier": parse_identifier,
        "number": parse_number,
        "frac": parse_frac,
        "integer": parse_integer,
        "path": parse_path,
        "key": parse_key,
        "array": parse_array,
        "array_part": parse_array_part,
        "inline": parse_inline,
        "inline_part": parse_inline_part,
        "buffer": parse_buffer,
        "literal": parse_literal,
        "esc": parse_esc,
        "comment": parse_comment,
        "tag": parse_tag,
        "ld": parse_ld,
        "rd": parse_rd,
        "eol": parse_eol,
        "ws": parse_ws
      };
      
      if (startRule !== undefined) {
        if (parseFunctions[startRule] === undefined) {
          throw new Error("Invalid rule name: " + quote(startRule) + ".");
        }
      } else {
        startRule = "body";
      }
      
      var pos = { offset: 0, line: 1, column: 1, seenCR: false };
      var reportFailures = 0;
      var rightmostFailuresPos = { offset: 0, line: 1, column: 1, seenCR: false };
      var rightmostFailuresExpected = [];
      
      function padLeft(input, padding, length) {
        var result = input;
        
        var padLength = length - input.length;
        for (var i = 0; i < padLength; i++) {
          result = padding + result;
        }
        
        return result;
      }
      
      function escape(ch) {
        var charCode = ch.charCodeAt(0);
        var escapeChar;
        var length;
        
        if (charCode <= 0xFF) {
          escapeChar = 'x';
          length = 2;
        } else {
          escapeChar = 'u';
          length = 4;
        }
        
        return '\\' + escapeChar + padLeft(charCode.toString(16).toUpperCase(), '0', length);
      }
      
      function clone(object) {
        var result = {};
        for (var key in object) {
          result[key] = object[key];
        }
        return result;
      }
      
      function advance(pos, n) {
        var endOffset = pos.offset + n;
        
        for (var offset = pos.offset; offset < endOffset; offset++) {
          var ch = input.charAt(offset);
          if (ch === "\n") {
            if (!pos.seenCR) { pos.line++; }
            pos.column = 1;
            pos.seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            pos.line++;
            pos.column = 1;
            pos.seenCR = true;
          } else {
            pos.column++;
            pos.seenCR = false;
          }
        }
        
        pos.offset += n;
      }
      
      function matchFailed(failure) {
        if (pos.offset < rightmostFailuresPos.offset) {
          return;
        }
        
        if (pos.offset > rightmostFailuresPos.offset) {
          rightmostFailuresPos = clone(pos);
          rightmostFailuresExpected = [];
        }
        
        rightmostFailuresExpected.push(failure);
      }
      
      function parse_body() {
        var result0, result1;
        var pos0;
        
        pos0 = clone(pos);
        result0 = [];
        result1 = parse_part();
        while (result1 !== null) {
          result0.push(result1);
          result1 = parse_part();
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, p) { return ["body"].concat(p) })(pos0.offset, pos0.line, pos0.column, result0);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        return result0;
      }
      
      function parse_part() {
        var result0;
        
        result0 = parse_comment();
        if (result0 === null) {
          result0 = parse_section();
          if (result0 === null) {
            result0 = parse_partial();
            if (result0 === null) {
              result0 = parse_special();
              if (result0 === null) {
                result0 = parse_reference();
                if (result0 === null) {
                  result0 = parse_buffer();
                }
              }
            }
          }
        }
        return result0;
      }
      
      function parse_section() {
        var result0, result1, result2, result3, result4, result5, result6;
        var pos0, pos1;
        
        reportFailures++;
        pos0 = clone(pos);
        pos1 = clone(pos);
        result0 = parse_sec_tag_start();
        if (result0 !== null) {
          result1 = [];
          result2 = parse_ws();
          while (result2 !== null) {
            result1.push(result2);
            result2 = parse_ws();
          }
          if (result1 !== null) {
            result2 = parse_rd();
            if (result2 !== null) {
              result3 = parse_body();
              if (result3 !== null) {
                result4 = parse_bodies();
                if (result4 !== null) {
                  result5 = parse_end_tag();
                  if (result5 !== null) {
                    result6 = (function(offset, line, column, t, b, e, n) { return t[1].text === n.text;})(pos.offset, pos.line, pos.column, result0, result3, result4, result5) ? "" : null;
                    if (result6 !== null) {
                      result0 = [result0, result1, result2, result3, result4, result5, result6];
                    } else {
                      result0 = null;
                      pos = clone(pos1);
                    }
                  } else {
                    result0 = null;
                    pos = clone(pos1);
                  }
                } else {
                  result0 = null;
                  pos = clone(pos1);
                }
              } else {
                result0 = null;
                pos = clone(pos1);
              }
            } else {
              result0 = null;
              pos = clone(pos1);
            }
          } else {
            result0 = null;
            pos = clone(pos1);
          }
        } else {
          result0 = null;
          pos = clone(pos1);
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, t, b, e, n) { e.push(["param", ["literal", "block"], b]); t.push(e); return t })(pos0.offset, pos0.line, pos0.column, result0[0], result0[3], result0[4], result0[5]);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        if (result0 === null) {
          pos0 = clone(pos);
          pos1 = clone(pos);
          result0 = parse_sec_tag_start();
          if (result0 !== null) {
            result1 = [];
            result2 = parse_ws();
            while (result2 !== null) {
              result1.push(result2);
              result2 = parse_ws();
            }
            if (result1 !== null) {
              if (input.charCodeAt(pos.offset) === 47) {
                result2 = "/";
                advance(pos, 1);
              } else {
                result2 = null;
                if (reportFailures === 0) {
                  matchFailed("\"/\"");
                }
              }
              if (result2 !== null) {
                result3 = parse_rd();
                if (result3 !== null) {
                  result0 = [result0, result1, result2, result3];
                } else {
                  result0 = null;
                  pos = clone(pos1);
                }
              } else {
                result0 = null;
                pos = clone(pos1);
              }
            } else {
              result0 = null;
              pos = clone(pos1);
            }
          } else {
            result0 = null;
            pos = clone(pos1);
          }
          if (result0 !== null) {
            result0 = (function(offset, line, column, t) { t.push(["bodies"]); return t })(pos0.offset, pos0.line, pos0.column, result0[0]);
          }
          if (result0 === null) {
            pos = clone(pos0);
          }
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("section");
        }
        return result0;
      }
      
      function parse_sec_tag_start() {
        var result0, result1, result2, result3, result4, result5;
        var pos0, pos1;
        
        pos0 = clone(pos);
        pos1 = clone(pos);
        result0 = parse_ld();
        if (result0 !== null) {
          if (/^[#?^<+@%]/.test(input.charAt(pos.offset))) {
            result1 = input.charAt(pos.offset);
            advance(pos, 1);
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("[#?^<+@%]");
            }
          }
          if (result1 !== null) {
            result2 = [];
            result3 = parse_ws();
            while (result3 !== null) {
              result2.push(result3);
              result3 = parse_ws();
            }
            if (result2 !== null) {
              result3 = parse_identifier();
              if (result3 !== null) {
                result4 = parse_context();
                if (result4 !== null) {
                  result5 = parse_params();
                  if (result5 !== null) {
                    result0 = [result0, result1, result2, result3, result4, result5];
                  } else {
                    result0 = null;
                    pos = clone(pos1);
                  }
                } else {
                  result0 = null;
                  pos = clone(pos1);
                }
              } else {
                result0 = null;
                pos = clone(pos1);
              }
            } else {
              result0 = null;
              pos = clone(pos1);
            }
          } else {
            result0 = null;
            pos = clone(pos1);
          }
        } else {
          result0 = null;
          pos = clone(pos1);
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, t, n, c, p) { return [t, n, c, p] })(pos0.offset, pos0.line, pos0.column, result0[1], result0[3], result0[4], result0[5]);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        return result0;
      }
      
      function parse_end_tag() {
        var result0, result1, result2, result3, result4, result5;
        var pos0, pos1;
        
        reportFailures++;
        pos0 = clone(pos);
        pos1 = clone(pos);
        result0 = parse_ld();
        if (result0 !== null) {
          if (input.charCodeAt(pos.offset) === 47) {
            result1 = "/";
            advance(pos, 1);
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\"/\"");
            }
          }
          if (result1 !== null) {
            result2 = [];
            result3 = parse_ws();
            while (result3 !== null) {
              result2.push(result3);
              result3 = parse_ws();
            }
            if (result2 !== null) {
              result3 = parse_identifier();
              if (result3 !== null) {
                result4 = [];
                result5 = parse_ws();
                while (result5 !== null) {
                  result4.push(result5);
                  result5 = parse_ws();
                }
                if (result4 !== null) {
                  result5 = parse_rd();
                  if (result5 !== null) {
                    result0 = [result0, result1, result2, result3, result4, result5];
                  } else {
                    result0 = null;
                    pos = clone(pos1);
                  }
                } else {
                  result0 = null;
                  pos = clone(pos1);
                }
              } else {
                result0 = null;
                pos = clone(pos1);
              }
            } else {
              result0 = null;
              pos = clone(pos1);
            }
          } else {
            result0 = null;
            pos = clone(pos1);
          }
        } else {
          result0 = null;
          pos = clone(pos1);
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, n) { return n })(pos0.offset, pos0.line, pos0.column, result0[3]);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("end tag");
        }
        return result0;
      }
      
      function parse_context() {
        var result0, result1;
        var pos0, pos1, pos2;
        
        pos0 = clone(pos);
        pos1 = clone(pos);
        pos2 = clone(pos);
        if (input.charCodeAt(pos.offset) === 58) {
          result0 = ":";
          advance(pos, 1);
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\":\"");
          }
        }
        if (result0 !== null) {
          result1 = parse_identifier();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = clone(pos2);
          }
        } else {
          result0 = null;
          pos = clone(pos2);
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, n) {return n})(pos1.offset, pos1.line, pos1.column, result0[1]);
        }
        if (result0 === null) {
          pos = clone(pos1);
        }
        result0 = result0 !== null ? result0 : "";
        if (result0 !== null) {
          result0 = (function(offset, line, column, n) { return n ? ["context", n] : ["context"] })(pos0.offset, pos0.line, pos0.column, result0);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        return result0;
      }
      
      function parse_params() {
        var result0, result1, result2, result3, result4;
        var pos0, pos1, pos2;
        
        reportFailures++;
        pos0 = clone(pos);
        result0 = [];
        pos1 = clone(pos);
        pos2 = clone(pos);
        result2 = parse_ws();
        if (result2 !== null) {
          result1 = [];
          while (result2 !== null) {
            result1.push(result2);
            result2 = parse_ws();
          }
        } else {
          result1 = null;
        }
        if (result1 !== null) {
          result2 = parse_key();
          if (result2 !== null) {
            if (input.charCodeAt(pos.offset) === 61) {
              result3 = "=";
              advance(pos, 1);
            } else {
              result3 = null;
              if (reportFailures === 0) {
                matchFailed("\"=\"");
              }
            }
            if (result3 !== null) {
              result4 = parse_number();
              if (result4 === null) {
                result4 = parse_identifier();
                if (result4 === null) {
                  result4 = parse_inline();
                }
              }
              if (result4 !== null) {
                result1 = [result1, result2, result3, result4];
              } else {
                result1 = null;
                pos = clone(pos2);
              }
            } else {
              result1 = null;
              pos = clone(pos2);
            }
          } else {
            result1 = null;
            pos = clone(pos2);
          }
        } else {
          result1 = null;
          pos = clone(pos2);
        }
        if (result1 !== null) {
          result1 = (function(offset, line, column, k, v) {return ["param", ["literal", k], v]})(pos1.offset, pos1.line, pos1.column, result1[1], result1[3]);
        }
        if (result1 === null) {
          pos = clone(pos1);
        }
        while (result1 !== null) {
          result0.push(result1);
          pos1 = clone(pos);
          pos2 = clone(pos);
          result2 = parse_ws();
          if (result2 !== null) {
            result1 = [];
            while (result2 !== null) {
              result1.push(result2);
              result2 = parse_ws();
            }
          } else {
            result1 = null;
          }
          if (result1 !== null) {
            result2 = parse_key();
            if (result2 !== null) {
              if (input.charCodeAt(pos.offset) === 61) {
                result3 = "=";
                advance(pos, 1);
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("\"=\"");
                }
              }
              if (result3 !== null) {
                result4 = parse_number();
                if (result4 === null) {
                  result4 = parse_identifier();
                  if (result4 === null) {
                    result4 = parse_inline();
                  }
                }
                if (result4 !== null) {
                  result1 = [result1, result2, result3, result4];
                } else {
                  result1 = null;
                  pos = clone(pos2);
                }
              } else {
                result1 = null;
                pos = clone(pos2);
              }
            } else {
              result1 = null;
              pos = clone(pos2);
            }
          } else {
            result1 = null;
            pos = clone(pos2);
          }
          if (result1 !== null) {
            result1 = (function(offset, line, column, k, v) {return ["param", ["literal", k], v]})(pos1.offset, pos1.line, pos1.column, result1[1], result1[3]);
          }
          if (result1 === null) {
            pos = clone(pos1);
          }
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, p) { return ["params"].concat(p) })(pos0.offset, pos0.line, pos0.column, result0);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("params");
        }
        return result0;
      }
      
      function parse_bodies() {
        var result0, result1, result2, result3, result4, result5;
        var pos0, pos1, pos2;
        
        reportFailures++;
        pos0 = clone(pos);
        result0 = [];
        pos1 = clone(pos);
        pos2 = clone(pos);
        result1 = parse_ld();
        if (result1 !== null) {
          if (input.charCodeAt(pos.offset) === 58) {
            result2 = ":";
            advance(pos, 1);
          } else {
            result2 = null;
            if (reportFailures === 0) {
              matchFailed("\":\"");
            }
          }
          if (result2 !== null) {
            result3 = parse_key();
            if (result3 !== null) {
              result4 = parse_rd();
              if (result4 !== null) {
                result5 = parse_body();
                if (result5 !== null) {
                  result1 = [result1, result2, result3, result4, result5];
                } else {
                  result1 = null;
                  pos = clone(pos2);
                }
              } else {
                result1 = null;
                pos = clone(pos2);
              }
            } else {
              result1 = null;
              pos = clone(pos2);
            }
          } else {
            result1 = null;
            pos = clone(pos2);
          }
        } else {
          result1 = null;
          pos = clone(pos2);
        }
        if (result1 !== null) {
          result1 = (function(offset, line, column, k, v) {return ["param", ["literal", k], v]})(pos1.offset, pos1.line, pos1.column, result1[2], result1[4]);
        }
        if (result1 === null) {
          pos = clone(pos1);
        }
        while (result1 !== null) {
          result0.push(result1);
          pos1 = clone(pos);
          pos2 = clone(pos);
          result1 = parse_ld();
          if (result1 !== null) {
            if (input.charCodeAt(pos.offset) === 58) {
              result2 = ":";
              advance(pos, 1);
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\":\"");
              }
            }
            if (result2 !== null) {
              result3 = parse_key();
              if (result3 !== null) {
                result4 = parse_rd();
                if (result4 !== null) {
                  result5 = parse_body();
                  if (result5 !== null) {
                    result1 = [result1, result2, result3, result4, result5];
                  } else {
                    result1 = null;
                    pos = clone(pos2);
                  }
                } else {
                  result1 = null;
                  pos = clone(pos2);
                }
              } else {
                result1 = null;
                pos = clone(pos2);
              }
            } else {
              result1 = null;
              pos = clone(pos2);
            }
          } else {
            result1 = null;
            pos = clone(pos2);
          }
          if (result1 !== null) {
            result1 = (function(offset, line, column, k, v) {return ["param", ["literal", k], v]})(pos1.offset, pos1.line, pos1.column, result1[2], result1[4]);
          }
          if (result1 === null) {
            pos = clone(pos1);
          }
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, p) { return ["bodies"].concat(p) })(pos0.offset, pos0.line, pos0.column, result0);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("bodies");
        }
        return result0;
      }
      
      function parse_reference() {
        var result0, result1, result2, result3;
        var pos0, pos1;
        
        reportFailures++;
        pos0 = clone(pos);
        pos1 = clone(pos);
        result0 = parse_ld();
        if (result0 !== null) {
          result1 = parse_identifier();
          if (result1 !== null) {
            result2 = parse_filters();
            if (result2 !== null) {
              result3 = parse_rd();
              if (result3 !== null) {
                result0 = [result0, result1, result2, result3];
              } else {
                result0 = null;
                pos = clone(pos1);
              }
            } else {
              result0 = null;
              pos = clone(pos1);
            }
          } else {
            result0 = null;
            pos = clone(pos1);
          }
        } else {
          result0 = null;
          pos = clone(pos1);
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, n, f) { return ["reference", n, f] })(pos0.offset, pos0.line, pos0.column, result0[1], result0[2]);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("reference");
        }
        return result0;
      }
      
      function parse_partial() {
        var result0, result1, result2, result3, result4, result5, result6, result7;
        var pos0, pos1, pos2;
        
        reportFailures++;
        pos0 = clone(pos);
        pos1 = clone(pos);
        result0 = parse_ld();
        if (result0 !== null) {
          if (input.charCodeAt(pos.offset) === 62) {
            result1 = ">";
            advance(pos, 1);
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\">\"");
            }
          }
          if (result1 === null) {
            if (input.charCodeAt(pos.offset) === 43) {
              result1 = "+";
              advance(pos, 1);
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("\"+\"");
              }
            }
          }
          if (result1 !== null) {
            pos2 = clone(pos);
            result2 = parse_key();
            if (result2 !== null) {
              result2 = (function(offset, line, column, k) {return ["literal", k]})(pos2.offset, pos2.line, pos2.column, result2);
            }
            if (result2 === null) {
              pos = clone(pos2);
            }
            if (result2 === null) {
              result2 = parse_inline();
            }
            if (result2 !== null) {
              result3 = parse_context();
              if (result3 !== null) {
                result4 = parse_params();
                if (result4 !== null) {
                  result5 = [];
                  result6 = parse_ws();
                  while (result6 !== null) {
                    result5.push(result6);
                    result6 = parse_ws();
                  }
                  if (result5 !== null) {
                    if (input.charCodeAt(pos.offset) === 47) {
                      result6 = "/";
                      advance(pos, 1);
                    } else {
                      result6 = null;
                      if (reportFailures === 0) {
                        matchFailed("\"/\"");
                      }
                    }
                    if (result6 !== null) {
                      result7 = parse_rd();
                      if (result7 !== null) {
                        result0 = [result0, result1, result2, result3, result4, result5, result6, result7];
                      } else {
                        result0 = null;
                        pos = clone(pos1);
                      }
                    } else {
                      result0 = null;
                      pos = clone(pos1);
                    }
                  } else {
                    result0 = null;
                    pos = clone(pos1);
                  }
                } else {
                  result0 = null;
                  pos = clone(pos1);
                }
              } else {
                result0 = null;
                pos = clone(pos1);
              }
            } else {
              result0 = null;
              pos = clone(pos1);
            }
          } else {
            result0 = null;
            pos = clone(pos1);
          }
        } else {
          result0 = null;
          pos = clone(pos1);
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, s, n, c, p) { var key = (s ===">")? "partial" : s; return [key, n, c, p] })(pos0.offset, pos0.line, pos0.column, result0[1], result0[2], result0[3], result0[4]);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("partial");
        }
        return result0;
      }
      
      function parse_filters() {
        var result0, result1, result2;
        var pos0, pos1, pos2;
        
        reportFailures++;
        pos0 = clone(pos);
        result0 = [];
        pos1 = clone(pos);
        pos2 = clone(pos);
        if (input.charCodeAt(pos.offset) === 124) {
          result1 = "|";
          advance(pos, 1);
        } else {
          result1 = null;
          if (reportFailures === 0) {
            matchFailed("\"|\"");
          }
        }
        if (result1 !== null) {
          result2 = parse_key();
          if (result2 !== null) {
            result1 = [result1, result2];
          } else {
            result1 = null;
            pos = clone(pos2);
          }
        } else {
          result1 = null;
          pos = clone(pos2);
        }
        if (result1 !== null) {
          result1 = (function(offset, line, column, n) {return n})(pos1.offset, pos1.line, pos1.column, result1[1]);
        }
        if (result1 === null) {
          pos = clone(pos1);
        }
        while (result1 !== null) {
          result0.push(result1);
          pos1 = clone(pos);
          pos2 = clone(pos);
          if (input.charCodeAt(pos.offset) === 124) {
            result1 = "|";
            advance(pos, 1);
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\"|\"");
            }
          }
          if (result1 !== null) {
            result2 = parse_key();
            if (result2 !== null) {
              result1 = [result1, result2];
            } else {
              result1 = null;
              pos = clone(pos2);
            }
          } else {
            result1 = null;
            pos = clone(pos2);
          }
          if (result1 !== null) {
            result1 = (function(offset, line, column, n) {return n})(pos1.offset, pos1.line, pos1.column, result1[1]);
          }
          if (result1 === null) {
            pos = clone(pos1);
          }
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, f) { return ["filters"].concat(f) })(pos0.offset, pos0.line, pos0.column, result0);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("filters");
        }
        return result0;
      }
      
      function parse_special() {
        var result0, result1, result2, result3;
        var pos0, pos1;
        
        reportFailures++;
        pos0 = clone(pos);
        pos1 = clone(pos);
        result0 = parse_ld();
        if (result0 !== null) {
          if (input.charCodeAt(pos.offset) === 126) {
            result1 = "~";
            advance(pos, 1);
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\"~\"");
            }
          }
          if (result1 !== null) {
            result2 = parse_key();
            if (result2 !== null) {
              result3 = parse_rd();
              if (result3 !== null) {
                result0 = [result0, result1, result2, result3];
              } else {
                result0 = null;
                pos = clone(pos1);
              }
            } else {
              result0 = null;
              pos = clone(pos1);
            }
          } else {
            result0 = null;
            pos = clone(pos1);
          }
        } else {
          result0 = null;
          pos = clone(pos1);
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, k) { return ["special", k] })(pos0.offset, pos0.line, pos0.column, result0[2]);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("special");
        }
        return result0;
      }
      
      function parse_identifier() {
        var result0;
        var pos0;
        
        reportFailures++;
        pos0 = clone(pos);
        result0 = parse_path();
        if (result0 !== null) {
          result0 = (function(offset, line, column, p) { var arr = ["path"].concat(p); arr.text = p[1].join('.'); return arr; })(pos0.offset, pos0.line, pos0.column, result0);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        if (result0 === null) {
          pos0 = clone(pos);
          result0 = parse_key();
          if (result0 !== null) {
            result0 = (function(offset, line, column, k) { var arr = ["key", k]; arr.text = k; return arr; })(pos0.offset, pos0.line, pos0.column, result0);
          }
          if (result0 === null) {
            pos = clone(pos0);
          }
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("identifier");
        }
        return result0;
      }
      
      function parse_number() {
        var result0;
        var pos0;
        
        reportFailures++;
        pos0 = clone(pos);
        result0 = parse_frac();
        if (result0 === null) {
          result0 = parse_integer();
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, n) { return ['literal', n]; })(pos0.offset, pos0.line, pos0.column, result0);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("number");
        }
        return result0;
      }
      
      function parse_frac() {
        var result0, result1, result2, result3;
        var pos0, pos1;
        
        reportFailures++;
        pos0 = clone(pos);
        pos1 = clone(pos);
        result0 = parse_integer();
        if (result0 !== null) {
          if (input.charCodeAt(pos.offset) === 46) {
            result1 = ".";
            advance(pos, 1);
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\".\"");
            }
          }
          if (result1 !== null) {
            result3 = parse_integer();
            if (result3 !== null) {
              result2 = [];
              while (result3 !== null) {
                result2.push(result3);
                result3 = parse_integer();
              }
            } else {
              result2 = null;
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = clone(pos1);
            }
          } else {
            result0 = null;
            pos = clone(pos1);
          }
        } else {
          result0 = null;
          pos = clone(pos1);
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, l, r) { return parseFloat(l + "." + r.join('')); })(pos0.offset, pos0.line, pos0.column, result0[0], result0[2]);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("frac");
        }
        return result0;
      }
      
      function parse_integer() {
        var result0, result1;
        var pos0;
        
        reportFailures++;
        pos0 = clone(pos);
        if (/^[0-9]/.test(input.charAt(pos.offset))) {
          result1 = input.charAt(pos.offset);
          advance(pos, 1);
        } else {
          result1 = null;
          if (reportFailures === 0) {
            matchFailed("[0-9]");
          }
        }
        if (result1 !== null) {
          result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            if (/^[0-9]/.test(input.charAt(pos.offset))) {
              result1 = input.charAt(pos.offset);
              advance(pos, 1);
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("[0-9]");
              }
            }
          }
        } else {
          result0 = null;
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, digits) { return parseInt(digits.join(""), 10); })(pos0.offset, pos0.line, pos0.column, result0);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("integer");
        }
        return result0;
      }
      
      function parse_path() {
        var result0, result1, result2;
        var pos0, pos1;
        
        reportFailures++;
        pos0 = clone(pos);
        pos1 = clone(pos);
        result0 = parse_key();
        result0 = result0 !== null ? result0 : "";
        if (result0 !== null) {
          result2 = parse_array_part();
          if (result2 === null) {
            result2 = parse_array();
          }
          if (result2 !== null) {
            result1 = [];
            while (result2 !== null) {
              result1.push(result2);
              result2 = parse_array_part();
              if (result2 === null) {
                result2 = parse_array();
              }
            }
          } else {
            result1 = null;
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = clone(pos1);
          }
        } else {
          result0 = null;
          pos = clone(pos1);
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, k, d) {
            d = d[0]; 
            if (k && d) {
              d.unshift(k);
              return [false, d];
            }
            return [true, d];
          })(pos0.offset, pos0.line, pos0.column, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        if (result0 === null) {
          pos0 = clone(pos);
          pos1 = clone(pos);
          if (input.charCodeAt(pos.offset) === 46) {
            result0 = ".";
            advance(pos, 1);
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\".\"");
            }
          }
          if (result0 !== null) {
            result1 = [];
            result2 = parse_array_part();
            if (result2 === null) {
              result2 = parse_array();
            }
            while (result2 !== null) {
              result1.push(result2);
              result2 = parse_array_part();
              if (result2 === null) {
                result2 = parse_array();
              }
            }
            if (result1 !== null) {
              result0 = [result0, result1];
            } else {
              result0 = null;
              pos = clone(pos1);
            }
          } else {
            result0 = null;
            pos = clone(pos1);
          }
          if (result0 !== null) {
            result0 = (function(offset, line, column, d) {
              if (d.length > 0) {
                return [true, d[0]];
              }
              return [true, []] 
            })(pos0.offset, pos0.line, pos0.column, result0[1]);
          }
          if (result0 === null) {
            pos = clone(pos0);
          }
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("path");
        }
        return result0;
      }
      
      function parse_key() {
        var result0, result1, result2;
        var pos0, pos1;
        
        reportFailures++;
        pos0 = clone(pos);
        pos1 = clone(pos);
        if (/^[a-zA-Z_$]/.test(input.charAt(pos.offset))) {
          result0 = input.charAt(pos.offset);
          advance(pos, 1);
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[a-zA-Z_$]");
          }
        }
        if (result0 !== null) {
          result1 = [];
          if (/^[0-9a-zA-Z_$\-]/.test(input.charAt(pos.offset))) {
            result2 = input.charAt(pos.offset);
            advance(pos, 1);
          } else {
            result2 = null;
            if (reportFailures === 0) {
              matchFailed("[0-9a-zA-Z_$\\-]");
            }
          }
          while (result2 !== null) {
            result1.push(result2);
            if (/^[0-9a-zA-Z_$\-]/.test(input.charAt(pos.offset))) {
              result2 = input.charAt(pos.offset);
              advance(pos, 1);
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("[0-9a-zA-Z_$\\-]");
              }
            }
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = clone(pos1);
          }
        } else {
          result0 = null;
          pos = clone(pos1);
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, h, t) { return h + t.join('') })(pos0.offset, pos0.line, pos0.column, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("key");
        }
        return result0;
      }
      
      function parse_array() {
        var result0, result1, result2;
        var pos0, pos1, pos2, pos3;
        
        reportFailures++;
        pos0 = clone(pos);
        pos1 = clone(pos);
        pos2 = clone(pos);
        pos3 = clone(pos);
        if (input.charCodeAt(pos.offset) === 91) {
          result0 = "[";
          advance(pos, 1);
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"[\"");
          }
        }
        if (result0 !== null) {
          if (/^[0-9]/.test(input.charAt(pos.offset))) {
            result2 = input.charAt(pos.offset);
            advance(pos, 1);
          } else {
            result2 = null;
            if (reportFailures === 0) {
              matchFailed("[0-9]");
            }
          }
          if (result2 !== null) {
            result1 = [];
            while (result2 !== null) {
              result1.push(result2);
              if (/^[0-9]/.test(input.charAt(pos.offset))) {
                result2 = input.charAt(pos.offset);
                advance(pos, 1);
              } else {
                result2 = null;
                if (reportFailures === 0) {
                  matchFailed("[0-9]");
                }
              }
            }
          } else {
            result1 = null;
          }
          if (result1 !== null) {
            if (input.charCodeAt(pos.offset) === 93) {
              result2 = "]";
              advance(pos, 1);
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"]\"");
              }
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = clone(pos3);
            }
          } else {
            result0 = null;
            pos = clone(pos3);
          }
        } else {
          result0 = null;
          pos = clone(pos3);
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, a) {return a.join('')})(pos2.offset, pos2.line, pos2.column, result0[1]);
        }
        if (result0 === null) {
          pos = clone(pos2);
        }
        if (result0 !== null) {
          result1 = parse_array_part();
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = clone(pos1);
          }
        } else {
          result0 = null;
          pos = clone(pos1);
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, i, nk) { if(nk) { nk.unshift(i); } else {nk = [i] } return nk; })(pos0.offset, pos0.line, pos0.column, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("array");
        }
        return result0;
      }
      
      function parse_array_part() {
        var result0, result1, result2;
        var pos0, pos1, pos2, pos3;
        
        reportFailures++;
        pos0 = clone(pos);
        pos1 = clone(pos);
        pos2 = clone(pos);
        pos3 = clone(pos);
        if (input.charCodeAt(pos.offset) === 46) {
          result1 = ".";
          advance(pos, 1);
        } else {
          result1 = null;
          if (reportFailures === 0) {
            matchFailed("\".\"");
          }
        }
        if (result1 !== null) {
          result2 = parse_key();
          if (result2 !== null) {
            result1 = [result1, result2];
          } else {
            result1 = null;
            pos = clone(pos3);
          }
        } else {
          result1 = null;
          pos = clone(pos3);
        }
        if (result1 !== null) {
          result1 = (function(offset, line, column, k) {return k})(pos2.offset, pos2.line, pos2.column, result1[1]);
        }
        if (result1 === null) {
          pos = clone(pos2);
        }
        if (result1 !== null) {
          result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            pos2 = clone(pos);
            pos3 = clone(pos);
            if (input.charCodeAt(pos.offset) === 46) {
              result1 = ".";
              advance(pos, 1);
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("\".\"");
              }
            }
            if (result1 !== null) {
              result2 = parse_key();
              if (result2 !== null) {
                result1 = [result1, result2];
              } else {
                result1 = null;
                pos = clone(pos3);
              }
            } else {
              result1 = null;
              pos = clone(pos3);
            }
            if (result1 !== null) {
              result1 = (function(offset, line, column, k) {return k})(pos2.offset, pos2.line, pos2.column, result1[1]);
            }
            if (result1 === null) {
              pos = clone(pos2);
            }
          }
        } else {
          result0 = null;
        }
        if (result0 !== null) {
          result1 = parse_array();
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = clone(pos1);
          }
        } else {
          result0 = null;
          pos = clone(pos1);
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, d, a) { if (a) { return d.concat(a); } else { return d; } })(pos0.offset, pos0.line, pos0.column, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("array_part");
        }
        return result0;
      }
      
      function parse_inline() {
        var result0, result1, result2;
        var pos0, pos1;
        
        reportFailures++;
        pos0 = clone(pos);
        pos1 = clone(pos);
        if (input.charCodeAt(pos.offset) === 34) {
          result0 = "\"";
          advance(pos, 1);
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"\\\"\"");
          }
        }
        if (result0 !== null) {
          if (input.charCodeAt(pos.offset) === 34) {
            result1 = "\"";
            advance(pos, 1);
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\"\\\"\"");
            }
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = clone(pos1);
          }
        } else {
          result0 = null;
          pos = clone(pos1);
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column) { return ["literal", ""] })(pos0.offset, pos0.line, pos0.column);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        if (result0 === null) {
          pos0 = clone(pos);
          pos1 = clone(pos);
          if (input.charCodeAt(pos.offset) === 34) {
            result0 = "\"";
            advance(pos, 1);
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"\\\"\"");
            }
          }
          if (result0 !== null) {
            result1 = parse_literal();
            if (result1 !== null) {
              if (input.charCodeAt(pos.offset) === 34) {
                result2 = "\"";
                advance(pos, 1);
              } else {
                result2 = null;
                if (reportFailures === 0) {
                  matchFailed("\"\\\"\"");
                }
              }
              if (result2 !== null) {
                result0 = [result0, result1, result2];
              } else {
                result0 = null;
                pos = clone(pos1);
              }
            } else {
              result0 = null;
              pos = clone(pos1);
            }
          } else {
            result0 = null;
            pos = clone(pos1);
          }
          if (result0 !== null) {
            result0 = (function(offset, line, column, l) { return ["literal", l] })(pos0.offset, pos0.line, pos0.column, result0[1]);
          }
          if (result0 === null) {
            pos = clone(pos0);
          }
          if (result0 === null) {
            pos0 = clone(pos);
            pos1 = clone(pos);
            if (input.charCodeAt(pos.offset) === 34) {
              result0 = "\"";
              advance(pos, 1);
            } else {
              result0 = null;
              if (reportFailures === 0) {
                matchFailed("\"\\\"\"");
              }
            }
            if (result0 !== null) {
              result2 = parse_inline_part();
              if (result2 !== null) {
                result1 = [];
                while (result2 !== null) {
                  result1.push(result2);
                  result2 = parse_inline_part();
                }
              } else {
                result1 = null;
              }
              if (result1 !== null) {
                if (input.charCodeAt(pos.offset) === 34) {
                  result2 = "\"";
                  advance(pos, 1);
                } else {
                  result2 = null;
                  if (reportFailures === 0) {
                    matchFailed("\"\\\"\"");
                  }
                }
                if (result2 !== null) {
                  result0 = [result0, result1, result2];
                } else {
                  result0 = null;
                  pos = clone(pos1);
                }
              } else {
                result0 = null;
                pos = clone(pos1);
              }
            } else {
              result0 = null;
              pos = clone(pos1);
            }
            if (result0 !== null) {
              result0 = (function(offset, line, column, p) { return ["body"].concat(p) })(pos0.offset, pos0.line, pos0.column, result0[1]);
            }
            if (result0 === null) {
              pos = clone(pos0);
            }
          }
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("inline");
        }
        return result0;
      }
      
      function parse_inline_part() {
        var result0;
        var pos0;
        
        result0 = parse_special();
        if (result0 === null) {
          result0 = parse_reference();
          if (result0 === null) {
            pos0 = clone(pos);
            result0 = parse_literal();
            if (result0 !== null) {
              result0 = (function(offset, line, column, l) { return ["buffer", l] })(pos0.offset, pos0.line, pos0.column, result0);
            }
            if (result0 === null) {
              pos = clone(pos0);
            }
          }
        }
        return result0;
      }
      
      function parse_buffer() {
        var result0, result1, result2, result3, result4;
        var pos0, pos1, pos2, pos3;
        
        reportFailures++;
        pos0 = clone(pos);
        pos1 = clone(pos);
        result0 = parse_eol();
        if (result0 !== null) {
          result1 = [];
          result2 = parse_ws();
          while (result2 !== null) {
            result1.push(result2);
            result2 = parse_ws();
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = clone(pos1);
          }
        } else {
          result0 = null;
          pos = clone(pos1);
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, e, w) { return ["format", e, w.join('')] })(pos0.offset, pos0.line, pos0.column, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        if (result0 === null) {
          pos0 = clone(pos);
          pos1 = clone(pos);
          pos2 = clone(pos);
          pos3 = clone(pos);
          reportFailures++;
          result1 = parse_tag();
          reportFailures--;
          if (result1 === null) {
            result1 = "";
          } else {
            result1 = null;
            pos = clone(pos3);
          }
          if (result1 !== null) {
            pos3 = clone(pos);
            reportFailures++;
            result2 = parse_eol();
            reportFailures--;
            if (result2 === null) {
              result2 = "";
            } else {
              result2 = null;
              pos = clone(pos3);
            }
            if (result2 !== null) {
              pos3 = clone(pos);
              reportFailures++;
              result3 = parse_comment();
              reportFailures--;
              if (result3 === null) {
                result3 = "";
              } else {
                result3 = null;
                pos = clone(pos3);
              }
              if (result3 !== null) {
                if (input.length > pos.offset) {
                  result4 = input.charAt(pos.offset);
                  advance(pos, 1);
                } else {
                  result4 = null;
                  if (reportFailures === 0) {
                    matchFailed("any character");
                  }
                }
                if (result4 !== null) {
                  result1 = [result1, result2, result3, result4];
                } else {
                  result1 = null;
                  pos = clone(pos2);
                }
              } else {
                result1 = null;
                pos = clone(pos2);
              }
            } else {
              result1 = null;
              pos = clone(pos2);
            }
          } else {
            result1 = null;
            pos = clone(pos2);
          }
          if (result1 !== null) {
            result1 = (function(offset, line, column, c) {return c})(pos1.offset, pos1.line, pos1.column, result1[3]);
          }
          if (result1 === null) {
            pos = clone(pos1);
          }
          if (result1 !== null) {
            result0 = [];
            while (result1 !== null) {
              result0.push(result1);
              pos1 = clone(pos);
              pos2 = clone(pos);
              pos3 = clone(pos);
              reportFailures++;
              result1 = parse_tag();
              reportFailures--;
              if (result1 === null) {
                result1 = "";
              } else {
                result1 = null;
                pos = clone(pos3);
              }
              if (result1 !== null) {
                pos3 = clone(pos);
                reportFailures++;
                result2 = parse_eol();
                reportFailures--;
                if (result2 === null) {
                  result2 = "";
                } else {
                  result2 = null;
                  pos = clone(pos3);
                }
                if (result2 !== null) {
                  pos3 = clone(pos);
                  reportFailures++;
                  result3 = parse_comment();
                  reportFailures--;
                  if (result3 === null) {
                    result3 = "";
                  } else {
                    result3 = null;
                    pos = clone(pos3);
                  }
                  if (result3 !== null) {
                    if (input.length > pos.offset) {
                      result4 = input.charAt(pos.offset);
                      advance(pos, 1);
                    } else {
                      result4 = null;
                      if (reportFailures === 0) {
                        matchFailed("any character");
                      }
                    }
                    if (result4 !== null) {
                      result1 = [result1, result2, result3, result4];
                    } else {
                      result1 = null;
                      pos = clone(pos2);
                    }
                  } else {
                    result1 = null;
                    pos = clone(pos2);
                  }
                } else {
                  result1 = null;
                  pos = clone(pos2);
                }
              } else {
                result1 = null;
                pos = clone(pos2);
              }
              if (result1 !== null) {
                result1 = (function(offset, line, column, c) {return c})(pos1.offset, pos1.line, pos1.column, result1[3]);
              }
              if (result1 === null) {
                pos = clone(pos1);
              }
            }
          } else {
            result0 = null;
          }
          if (result0 !== null) {
            result0 = (function(offset, line, column, b) { return ["buffer", b.join('')] })(pos0.offset, pos0.line, pos0.column, result0);
          }
          if (result0 === null) {
            pos = clone(pos0);
          }
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("buffer");
        }
        return result0;
      }
      
      function parse_literal() {
        var result0, result1, result2;
        var pos0, pos1, pos2, pos3;
        
        reportFailures++;
        pos0 = clone(pos);
        pos1 = clone(pos);
        pos2 = clone(pos);
        pos3 = clone(pos);
        reportFailures++;
        result1 = parse_tag();
        reportFailures--;
        if (result1 === null) {
          result1 = "";
        } else {
          result1 = null;
          pos = clone(pos3);
        }
        if (result1 !== null) {
          result2 = parse_esc();
          if (result2 === null) {
            if (/^[^"]/.test(input.charAt(pos.offset))) {
              result2 = input.charAt(pos.offset);
              advance(pos, 1);
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("[^\"]");
              }
            }
          }
          if (result2 !== null) {
            result1 = [result1, result2];
          } else {
            result1 = null;
            pos = clone(pos2);
          }
        } else {
          result1 = null;
          pos = clone(pos2);
        }
        if (result1 !== null) {
          result1 = (function(offset, line, column, c) {return c})(pos1.offset, pos1.line, pos1.column, result1[1]);
        }
        if (result1 === null) {
          pos = clone(pos1);
        }
        if (result1 !== null) {
          result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            pos1 = clone(pos);
            pos2 = clone(pos);
            pos3 = clone(pos);
            reportFailures++;
            result1 = parse_tag();
            reportFailures--;
            if (result1 === null) {
              result1 = "";
            } else {
              result1 = null;
              pos = clone(pos3);
            }
            if (result1 !== null) {
              result2 = parse_esc();
              if (result2 === null) {
                if (/^[^"]/.test(input.charAt(pos.offset))) {
                  result2 = input.charAt(pos.offset);
                  advance(pos, 1);
                } else {
                  result2 = null;
                  if (reportFailures === 0) {
                    matchFailed("[^\"]");
                  }
                }
              }
              if (result2 !== null) {
                result1 = [result1, result2];
              } else {
                result1 = null;
                pos = clone(pos2);
              }
            } else {
              result1 = null;
              pos = clone(pos2);
            }
            if (result1 !== null) {
              result1 = (function(offset, line, column, c) {return c})(pos1.offset, pos1.line, pos1.column, result1[1]);
            }
            if (result1 === null) {
              pos = clone(pos1);
            }
          }
        } else {
          result0 = null;
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, b) { return b.join('') })(pos0.offset, pos0.line, pos0.column, result0);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("literal");
        }
        return result0;
      }
      
      function parse_esc() {
        var result0;
        var pos0;
        
        pos0 = clone(pos);
        if (input.substr(pos.offset, 2) === "\\\"") {
          result0 = "\\\"";
          advance(pos, 2);
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"\\\\\\\"\"");
          }
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column) { return '"' })(pos0.offset, pos0.line, pos0.column);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        return result0;
      }
      
      function parse_comment() {
        var result0, result1, result2, result3;
        var pos0, pos1, pos2, pos3, pos4;
        
        reportFailures++;
        pos0 = clone(pos);
        pos1 = clone(pos);
        if (input.substr(pos.offset, 2) === "{!") {
          result0 = "{!";
          advance(pos, 2);
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"{!\"");
          }
        }
        if (result0 !== null) {
          result1 = [];
          pos2 = clone(pos);
          pos3 = clone(pos);
          pos4 = clone(pos);
          reportFailures++;
          if (input.substr(pos.offset, 2) === "!}") {
            result2 = "!}";
            advance(pos, 2);
          } else {
            result2 = null;
            if (reportFailures === 0) {
              matchFailed("\"!}\"");
            }
          }
          reportFailures--;
          if (result2 === null) {
            result2 = "";
          } else {
            result2 = null;
            pos = clone(pos4);
          }
          if (result2 !== null) {
            if (input.length > pos.offset) {
              result3 = input.charAt(pos.offset);
              advance(pos, 1);
            } else {
              result3 = null;
              if (reportFailures === 0) {
                matchFailed("any character");
              }
            }
            if (result3 !== null) {
              result2 = [result2, result3];
            } else {
              result2 = null;
              pos = clone(pos3);
            }
          } else {
            result2 = null;
            pos = clone(pos3);
          }
          if (result2 !== null) {
            result2 = (function(offset, line, column, c) {return c})(pos2.offset, pos2.line, pos2.column, result2[1]);
          }
          if (result2 === null) {
            pos = clone(pos2);
          }
          while (result2 !== null) {
            result1.push(result2);
            pos2 = clone(pos);
            pos3 = clone(pos);
            pos4 = clone(pos);
            reportFailures++;
            if (input.substr(pos.offset, 2) === "!}") {
              result2 = "!}";
              advance(pos, 2);
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"!}\"");
              }
            }
            reportFailures--;
            if (result2 === null) {
              result2 = "";
            } else {
              result2 = null;
              pos = clone(pos4);
            }
            if (result2 !== null) {
              if (input.length > pos.offset) {
                result3 = input.charAt(pos.offset);
                advance(pos, 1);
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("any character");
                }
              }
              if (result3 !== null) {
                result2 = [result2, result3];
              } else {
                result2 = null;
                pos = clone(pos3);
              }
            } else {
              result2 = null;
              pos = clone(pos3);
            }
            if (result2 !== null) {
              result2 = (function(offset, line, column, c) {return c})(pos2.offset, pos2.line, pos2.column, result2[1]);
            }
            if (result2 === null) {
              pos = clone(pos2);
            }
          }
          if (result1 !== null) {
            if (input.substr(pos.offset, 2) === "!}") {
              result2 = "!}";
              advance(pos, 2);
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"!}\"");
              }
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = clone(pos1);
            }
          } else {
            result0 = null;
            pos = clone(pos1);
          }
        } else {
          result0 = null;
          pos = clone(pos1);
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, c) { return ["comment", c.join('')] })(pos0.offset, pos0.line, pos0.column, result0[1]);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("comment");
        }
        return result0;
      }
      
      function parse_tag() {
        var result0, result1, result2, result3, result4, result5, result6;
        var pos0, pos1, pos2;
        
        pos0 = clone(pos);
        result0 = parse_ld();
        if (result0 !== null) {
          if (/^[#?^><+%:@\/~%]/.test(input.charAt(pos.offset))) {
            result1 = input.charAt(pos.offset);
            advance(pos, 1);
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("[#?^><+%:@\\/~%]");
            }
          }
          if (result1 !== null) {
            result2 = [];
            result3 = parse_ws();
            while (result3 !== null) {
              result2.push(result3);
              result3 = parse_ws();
            }
            if (result2 !== null) {
              pos1 = clone(pos);
              pos2 = clone(pos);
              reportFailures++;
              result4 = parse_rd();
              reportFailures--;
              if (result4 === null) {
                result4 = "";
              } else {
                result4 = null;
                pos = clone(pos2);
              }
              if (result4 !== null) {
                pos2 = clone(pos);
                reportFailures++;
                result5 = parse_eol();
                reportFailures--;
                if (result5 === null) {
                  result5 = "";
                } else {
                  result5 = null;
                  pos = clone(pos2);
                }
                if (result5 !== null) {
                  if (input.length > pos.offset) {
                    result6 = input.charAt(pos.offset);
                    advance(pos, 1);
                  } else {
                    result6 = null;
                    if (reportFailures === 0) {
                      matchFailed("any character");
                    }
                  }
                  if (result6 !== null) {
                    result4 = [result4, result5, result6];
                  } else {
                    result4 = null;
                    pos = clone(pos1);
                  }
                } else {
                  result4 = null;
                  pos = clone(pos1);
                }
              } else {
                result4 = null;
                pos = clone(pos1);
              }
              if (result4 !== null) {
                result3 = [];
                while (result4 !== null) {
                  result3.push(result4);
                  pos1 = clone(pos);
                  pos2 = clone(pos);
                  reportFailures++;
                  result4 = parse_rd();
                  reportFailures--;
                  if (result4 === null) {
                    result4 = "";
                  } else {
                    result4 = null;
                    pos = clone(pos2);
                  }
                  if (result4 !== null) {
                    pos2 = clone(pos);
                    reportFailures++;
                    result5 = parse_eol();
                    reportFailures--;
                    if (result5 === null) {
                      result5 = "";
                    } else {
                      result5 = null;
                      pos = clone(pos2);
                    }
                    if (result5 !== null) {
                      if (input.length > pos.offset) {
                        result6 = input.charAt(pos.offset);
                        advance(pos, 1);
                      } else {
                        result6 = null;
                        if (reportFailures === 0) {
                          matchFailed("any character");
                        }
                      }
                      if (result6 !== null) {
                        result4 = [result4, result5, result6];
                      } else {
                        result4 = null;
                        pos = clone(pos1);
                      }
                    } else {
                      result4 = null;
                      pos = clone(pos1);
                    }
                  } else {
                    result4 = null;
                    pos = clone(pos1);
                  }
                }
              } else {
                result3 = null;
              }
              if (result3 !== null) {
                result4 = [];
                result5 = parse_ws();
                while (result5 !== null) {
                  result4.push(result5);
                  result5 = parse_ws();
                }
                if (result4 !== null) {
                  result5 = parse_rd();
                  if (result5 !== null) {
                    result0 = [result0, result1, result2, result3, result4, result5];
                  } else {
                    result0 = null;
                    pos = clone(pos0);
                  }
                } else {
                  result0 = null;
                  pos = clone(pos0);
                }
              } else {
                result0 = null;
                pos = clone(pos0);
              }
            } else {
              result0 = null;
              pos = clone(pos0);
            }
          } else {
            result0 = null;
            pos = clone(pos0);
          }
        } else {
          result0 = null;
          pos = clone(pos0);
        }
        if (result0 === null) {
          result0 = parse_reference();
        }
        return result0;
      }
      
      function parse_ld() {
        var result0;
        
        if (input.charCodeAt(pos.offset) === 123) {
          result0 = "{";
          advance(pos, 1);
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"{\"");
          }
        }
        return result0;
      }
      
      function parse_rd() {
        var result0;
        
        if (input.charCodeAt(pos.offset) === 125) {
          result0 = "}";
          advance(pos, 1);
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"}\"");
          }
        }
        return result0;
      }
      
      function parse_eol() {
        var result0;
        
        if (input.charCodeAt(pos.offset) === 10) {
          result0 = "\n";
          advance(pos, 1);
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"\\n\"");
          }
        }
        if (result0 === null) {
          if (input.substr(pos.offset, 2) === "\r\n") {
            result0 = "\r\n";
            advance(pos, 2);
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"\\r\\n\"");
            }
          }
          if (result0 === null) {
            if (input.charCodeAt(pos.offset) === 13) {
              result0 = "\r";
              advance(pos, 1);
            } else {
              result0 = null;
              if (reportFailures === 0) {
                matchFailed("\"\\r\"");
              }
            }
            if (result0 === null) {
              if (input.charCodeAt(pos.offset) === 8232) {
                result0 = "\u2028";
                advance(pos, 1);
              } else {
                result0 = null;
                if (reportFailures === 0) {
                  matchFailed("\"\\u2028\"");
                }
              }
              if (result0 === null) {
                if (input.charCodeAt(pos.offset) === 8233) {
                  result0 = "\u2029";
                  advance(pos, 1);
                } else {
                  result0 = null;
                  if (reportFailures === 0) {
                    matchFailed("\"\\u2029\"");
                  }
                }
              }
            }
          }
        }
        return result0;
      }
      
      function parse_ws() {
        var result0;
        
        if (/^[\t\x0B\f \xA0\uFEFF]/.test(input.charAt(pos.offset))) {
          result0 = input.charAt(pos.offset);
          advance(pos, 1);
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[\\t\\x0B\\f \\xA0\\uFEFF]");
          }
        }
        if (result0 === null) {
          result0 = parse_eol();
        }
        return result0;
      }
      
      
      function cleanupExpected(expected) {
        expected.sort();
        
        var lastExpected = null;
        var cleanExpected = [];
        for (var i = 0; i < expected.length; i++) {
          if (expected[i] !== lastExpected) {
            cleanExpected.push(expected[i]);
            lastExpected = expected[i];
          }
        }
        return cleanExpected;
      }
      
      
      
      var result = parseFunctions[startRule]();
      
      /*
       * The parser is now in one of the following three states:
       *
       * 1. The parser successfully parsed the whole input.
       *
       *    - |result !== null|
       *    - |pos.offset === input.length|
       *    - |rightmostFailuresExpected| may or may not contain something
       *
       * 2. The parser successfully parsed only a part of the input.
       *
       *    - |result !== null|
       *    - |pos.offset < input.length|
       *    - |rightmostFailuresExpected| may or may not contain something
       *
       * 3. The parser did not successfully parse any part of the input.
       *
       *   - |result === null|
       *   - |pos.offset === 0|
       *   - |rightmostFailuresExpected| contains at least one failure
       *
       * All code following this comment (including called functions) must
       * handle these states.
       */
      if (result === null || pos.offset !== input.length) {
        var offset = Math.max(pos.offset, rightmostFailuresPos.offset);
        var found = offset < input.length ? input.charAt(offset) : null;
        var errorPosition = pos.offset > rightmostFailuresPos.offset ? pos : rightmostFailuresPos;
        
        throw new parser.SyntaxError(
          cleanupExpected(rightmostFailuresExpected),
          found,
          offset,
          errorPosition.line,
          errorPosition.column
        );
      }
      
      return result;
    },
    
    /* Returns the parser source code. */
    toSource: function() { return this._source; }
  };
  
  /* Thrown when a parser encounters a syntax error. */
  
  result.SyntaxError = function(expected, found, offset, line, column) {
    function buildMessage(expected, found) {
      var expectedHumanized, foundHumanized;
      
      switch (expected.length) {
        case 0:
          expectedHumanized = "end of input";
          break;
        case 1:
          expectedHumanized = expected[0];
          break;
        default:
          expectedHumanized = expected.slice(0, expected.length - 1).join(", ")
            + " or "
            + expected[expected.length - 1];
      }
      
      foundHumanized = found ? quote(found) : "end of input";
      
      return "Expected " + expectedHumanized + " but " + foundHumanized + " found.";
    }
    
    this.name = "SyntaxError";
    this.expected = expected;
    this.found = found;
    this.message = buildMessage(expected, found);
    this.offset = offset;
    this.line = line;
    this.column = column;
  };
  
  result.SyntaxError.prototype = Error.prototype;
  
  return result;
})();

dust.parse = parser.parse;

})(typeof exports !== 'undefined' ? exports : getGlobal());

// ===== END EXTERNAL FILE: utils.dust =====

// ===== BEGIN COMPONENT: utils.template ====
(
function() {
  elation.extend("template", new function() {
    this.types = {};
    this.templates = {};
    this.defaulttype = false;

    this.addtype = function(type, wrapper) {
      this.types[type] = wrapper;
      if (!this.defaulttype && !this.types[type].failed) {
        this.setdefaulttype(type);
      }
    }
    this.setdefaulttype = function(type) {
      this.defaulttype = type;
    }

    this.add = function(name, tpl, type) {
      if (!type) type = this.defaulttype;
      this.types[type].add(name, tpl);
      this.templates[name] = {type: type, name: name, tpl: tpl}; 
      return this.templates[name];
    }
    this.addAsync = function(name, tpl, type) {
      return new Promise(elation.bind(this, function(resolve, reject) {
        var handleAsyncLoad = elation.bind(this, function() {
          var template = this.add(name, tpl, type);
          resolve(template);
        });
        if (typeof requestIdleCallback != 'undefined') {
          requestIdleCallback(handleAsyncLoad);
        } else {
          setTimeout(handleAsyncLoad, 0);
        }
      }));
    }
    this.remove = function(name) {
      if (this.templates[name] && this.types[this.templates[name].type]) {
        this.types[this.templates[name].type].remove();
        delete this.templates[name];
        return true;
      }
      return false;
    }
    this.get = function(name, args) {
      if (this.templates[name]) {
        var tpl = this.templates[name];
        if (this.types[tpl.type]) {
          return this.types[tpl.type].eval(name, args);
        } else {
          console.log('elation.template.get() - error: unknown template type for ' + name + ': ' + tpl.type);
        }
      } else {
        console.log('elation.template.get() - error: template not found: ' + name);
      }
      return '';
    }
    this.exists = function(name) {
      return (typeof this.templates[name] != 'undefined');
    }
    this.initFromDOM = function() {
      var templates = document.querySelectorAll('template[id]');
      console.log(templates);
      for (var i = 0; i < templates.length; i++) {
        elation.template.add(templates[i].id, templates[i].innerHTML);
      }
    }
  });
  elation.template.addtype("dust", new function() {
    this.failed = false;
    this.templates = {};
    this.init = function() {
      if (!dust) {
        console.log("elation.template.addtype('dust') - error: no dust library loaded");
        this.failed = true;
      }
    }
    this.add = function(name, tpl) {
      if (!this.failed) {
        //console.log('add template', name, tpl);
        this.templates[name] = dust.compile(tpl, name);
        dust.loadSource(this.templates[name]);
      }
    }
    this.remove = function(name) {
      if (this.templates[name]) {
        delete this.templates[name];
        return true;
      }
      return false;
    }
    this.eval = function(name, args) {
      // de-asynchronize template rendering.  templates can still trigger asynchronous output though...
      var result = '';
      if (!this.failed) {
        dust.render(name, args, function(err, res) {
          result = res;
        });
      }
      return result;
    }
  });
})();
// ===== END COMPONENT: utils.template =====

// ===== BEGIN COMPONENT: elements.elements ====
(
function() {
  elation.extend('elements', {
    initialized: false,
    uniqueids: {},
    types: {},
    activeElements: new Set(),

    init() {
      elation.elements.initialized = true;

      // Set up a mutation observer so we can keep track of all our elements and any style changes that require updates
      this.observer = new window.MutationObserver(mutations => mutations.forEach(this.observe.bind(this)))
      this.observer.observe(window.document, {
        attributes: true,
        attributeFilter: ['class'],
        childList: true,
        subtree: true
      })

    },
    observe(mutation) {
      if (mutation.type == 'childList' && mutation.addedNodes.length > 0) {
        for (let addition of mutation.addedNodes) {
          if (addition.tagName == 'LINK') {
            // new external CSS file, refresh elements when it finishes loading
            addition.addEventListener('load', (ev) => { elation.elements.refresh();});
          } else if (addition.tagName == 'STYLE') {
            // new inline CSS, refresh elements now
            elation.elements.refresh();
          } else if (addition instanceof elation.elements.base) {
            // New element, add it to our list of active elements
            this.activeElements.add(addition);
          }
        }
        for (let removal of mutation.removedNodes) {
          // Remove elements from activeElements set
          if (this.activeElements.has(removal)) {
            this.activeElements.delete(removal);
          }
        }
      }
    },
    refresh() {
      this.activeElements.forEach(el => el.refresh());
    },
    define: function(name, classdef, notag) {
      var elementname = name.replace(/\./g, '-'),
          componentname = name.replace(/-/g, '.');
      elation.extend('elements.' + componentname, classdef);

      if (!notag) {
        customElements.define(elementname, classdef);
      }

      //console.log('define element:', name, '<' + elementname + '>');
    },
    create: function(type, attrs={}) {
      var elementname = type.replace(/\./g, '-');
      var element = document.createElement(elementname);

      if (!elation.elements.initialized) {
        elation.elements.init();
      }

      if (element) {
        if (attrs.append) {
          elation.html.attach(attrs.append, element, attrs.before);
          delete attrs.append;
        }
        for (var k in attrs) {
          if (k == 'innerHTML') {
            element[k] = attrs[k];
          } else {
            // FIXME - this should be handled by the type coersion system
            if (elation.utils.isObject(attrs[k])) {
              element[k] = attrs[k];
            } else if (attrs[k] === true) {
              element.setAttribute(k, '');
            } else if (!(attrs[k] === false || attrs[k] === undefined || attrs[k] === null)) {
              element.setAttribute(k, attrs[k]);
            }
          }
        }
      }
      return element;
    },
    registerType: function(type, handler) {
      this.types[type] = handler;
    },
    fromString: function(str, parent) {
      let container = document.createElement('div');
      container.innerHTML = str;

      var nodes = container.querySelectorAll('*');
      var elements = {
        length: nodes.length
      };
      for (var i = 0; i < elements.length; i++) {
        elements[i] = nodes[i];
        let elname = elements[i].getAttribute('name');
        if (elname) {
          elements[elname] = elements[i];
        }
        if (elements[i].id) {
          elements[elements[i].id] = elements[i];
        }
      }

      if (parent) {
        while (container.childNodes.length > 0) {
          parent.appendChild(container.childNodes[0]);
        }
      }
      return elements;
    },
    fromTemplate: function(tplname, parent) {
      return elation.elements.fromString(elation.template.get(tplname, parent), parent);
    },
    getEvent: function(type, args) {
      var ev = new Event(type);
      for (var k in args) {
        ev[k] = args[k];
      }
      return ev;
    },
    getUniqueId: function(type) {
      if (!type) {
        type = 'element';
      }
      // Initialize to zero
      if (!this.uniqueids[type]) this.uniqueids[type] = 0;

      // Increment the counter for this type as we generate our new name
      return type + '_' + (++this.uniqueids[type]);
    },
    mixin: function(BaseClass) {
      return class extends BaseClass {
        constructor() {
          super();
          this.initElation();
        }
        initElation() {
          this._elation = {
            properties: {},
            classdef: {
            }
          };
          this.init();
          //this.initAttributes();
        }
        /**
         * Lifecycle hook: declare attributes via `defineAttributes` and
         * set per-instance state. Subclasses should call `super.init()`
         * first, then add their own `defineAttributes` call.
         *
         * @function init
         * @memberof elation.elements.base#
         */
        init() {
          this.defineAttributes({
            deferred: { type: 'boolean', default: false },
            template: { type: 'string' },
            name: { type: 'string' },
            //classname: { type: 'string' },
            preview: { type: 'boolean', default: false },
            hover: { type: 'boolean', default: false },
            editable: { type: 'boolean', default: false },
            flex: { type: 'string' }
          });
          elation.events.add(this, 'mouseover', (ev) => this.onhover(ev));
          elation.events.add(this, 'mouseout', (ev) => this.onunhover(ev));
        }
        /**
         * Declare a set of typed attributes on this element. Each entry is
         * a descriptor `{ type, default?, get?, set? }` keyed by attribute
         * name. The descriptor's `type` controls coercion between the HTML
         * attribute string and the JS property value; see the project
         * README's Type system section for built-in types and how to
         * register new ones.
         *
         * @function defineAttributes
         * @memberof elation.elements.base#
         * @param {object} attrs map of attribute name → descriptor
         */
        defineAttributes(attrs) {
          for (var k in attrs) {
            this.defineAttribute(k, attrs[k]);
          }
        }
        defineAttribute(attrname, attrdef) {
          this._elation.classdef[attrname] = attrdef;
          Object.defineProperty(this, attrname, {
            configurable: true,
            enumerable: true,
            get: () => { 
              return this.getProperty(attrname)
            },
            set: (v) => {
              this.setProperty(attrname, v);
            }
          });
          //var observer = new MutationObserver((ev) => console.log('now they mutate', ev, this); );
          //observer.observe(this, {attributes: true});
        }
        initAttributes() {
          var attributes = this.getAttributeNames();
          for (var i = 0; i < attributes.length; i++) {
            var attrname = attributes[i];
            if (attrname.indexOf('.') != -1) {
              elation.utils.arrayset(this, attrname, this.getAttribute(attrname));
            }
          }
        }
        setProperty(k, v, skip) {
          // TODO - type coersion magic happens here
          elation.utils.arrayset(this._elation.properties, k, v);
//this._elation.properties[k] = v;
//console.log(this._elation.properties);
//if (v == '[object HTMLElement]') debugger;
          let classdef = this._elation.classdef[k];
          if (!skip && !classdef.innerHTML) {
            if (classdef.type == 'boolean' || classdef.type == 'bool') {
              if (v) {
                this.setAttribute(k, '');
              } else {
                this.removeAttribute(k);
              }
            } else {
              if (elation.elements.types[classdef.type]) {
                this.setAttribute(k, elation.elements.types[classdef.type].write(v));
              } else {
                this.setAttribute(k, v);
              }
            }
            if (classdef.set) {
              classdef.set.call(this, v);
            }
          }
        }
        getProperty(k) {
          // TODO - type coersion magic happens here
          let prop = elation.utils.arrayget(this._elation.properties, k, null);
          let classdef = this._elation.classdef[k];
          if (classdef.get) {
            return this.getPropertyAsType(classdef.get.call(this, k), classdef.type);
          //} else if (k in this._elation.properties) {
          //  return this._elation.properties[k];
          } else if (prop !== null) {
            return this.getPropertyAsType(prop, classdef.type);
          } else if (this.hasAttribute(k)) {
            return this.getPropertyAsType(this.getAttribute(k), classdef.type);
          } else if (typeof classdef.default != 'undefined') {
            return classdef.default;
          }
        }
        getPropertyAsType(value, type) {
          switch (type) {
            case 'bool':
            case 'boolean':
              return ((value && value !== '0' && value !== 'false') || value === '' );
            case 'int':
            case 'integer':
              return value|0;
            case 'number':
            case 'float':
              return +value;
            case 'callback':
              if (elation.utils.isString(value)) {
                return new Function('event', value);
              }
              return value;
            default:
              if (elation.elements.types[type]) {
                return elation.elements.types[type].read(value);
              }
              return value;
          }
        }
        connectedCallback() {
          // FIXME - the document-register-element polyfill seems to throw away any object setup we do in the constructor, if that happened just re-init
          if (!this._elation) this.initElation();

          this.initAttributes();
          if (this.create && !this.created) {
            // Call the element's create function asynchronously so that its childNodes can populate
            setTimeout(() => this.create(), 0);
            this.created = true;
          }
          this.dispatchEvent({type: 'elementconnect'});
        }
        handleEvent(ev) {
          if (typeof this['on' + ev.type] == 'function') {
            this['on' + ev.type](ev);
          }
        }
        /**
         * Fire an event on this element. If `ev.bubbles` is true the event
         * walks up through parent nodes, with each ancestor receiving a
         * cloned event whose `target` stays this element but whose
         * `currentTarget` is the ancestor. A method named `on<type>` on
         * this element, if present, runs as a default handler before
         * registered listeners.
         *
         * @function dispatchEvent
         * @memberof elation.elements.base#
         * @param {object} ev event payload, e.g. `{type, bubbles, data}`
         */
        dispatchEvent(ev) {
          if (typeof this['on' + ev.type] == 'function') {
            this['on' + ev.type](ev);
          }
          //var evobj = elation.elements.getEvent(ev);
          //super.dispatchEvent(evobj);
          let element = ev.element = this;
          //ev.target = element;
          let fired = elation.events.fire(ev);
          if (ev.bubbles) {
            while ((element = element.parentNode) && !elation.events.wasBubbleCancelled(fired)) {
              let bubbleev = elation.events.clone(ev, {target: this, currentTarget: element, element: element})
              //ev.element = element;
              //ev.currentTarget = element;
              fired = elation.events.fire(bubbleev);
            }
          }
        }
        /**
         * Lifecycle hook: fires once after the element is connected to the
         * DOM and its child nodes have parsed. The default implementation
         * expands `template` into `innerHTML` if one is set; subclasses
         * typically override `create()` to wire event listeners, query
         * children, and produce initial content.
         *
         * @function create
         * @memberof elation.elements.base#
         */
        create() {
          if (this.template) {
            this.innerHTML = elation.template.get(this.template, this);
          }
        }

        /**
         * Mark data as dirty, and then start the render loop if not already active
         * @function refresh
         * @memberof elation.elements.base#
         */
        refresh() {
          this.needsUpdate = true;
          if (this.deferred) {
            if (!this.renderloopActive) {
              this.setuprenderloop();
            }
          } else {
            this.render();
          }
        }
        /**
         * Refresh all of this element's children
         * @function refreshChildren
         * @memberof elation.elements.base#
         */
        refreshChildren() {
          for (var i = 0; i < this.childNodes.length; i++) {
            var node = this.childNodes[i];
            if (node instanceof elation.elements.base) {
              node.refresh();
              node.refreshChildren();
            }
          }
        }
        /**
         * Hook into the browser's animation loop to make component renders as efficient as possible
         * This also automatically rate-limits updates to the render speed of the browser (normally 
         * 60fps) rather than triggering a render every time data changes (which could be > 60fps)
         * 
         * @function renderloop
         * @memberof elation.elements.base#
         */
        setuprenderloop() {
          requestAnimationFrame(this.renderloop.bind(this));
        }

        renderloop() {
          if (this.needsUpdate) {
            this.render();
//if (this.image) this.toCanvas();
            this.needsUpdate = false;
            this.renderloopActive = true;
            this.setuprenderloop();
          } else {
            this.renderloopActive = false;
          } 
        }
        /**
         * Update the component's visual representation to reflect the current state of the data
         * 
         * @function render
         * @abstract
         * @memberof elation.elements.base#
         */
        render() {
          if (this.flex && this.flex != this.style.flex) {
            this.style.flex = this.flex;
          }
          if (this.canvas) {
            this.updateCanvas();
          }
        }
        /**
         * Add an HTML class to this component
         * @function addclass
         * @memberof elation.elements.base#
         */
        addclass(classname) {
          if (!elation.html.hasclass(this, classname)) {
            elation.html.addclass(this, classname);
          }
        }
        /**
         * Remove an HTML class from this component
         * @function removeclass
         * @memberof elation.elements.base#
         */
        removeclass(classname) {
          if (elation.html.hasclass(this, classname)) {
            elation.html.removeclass(this, classname);
          }
        }
        /**
         * Check whether this component has the specified class
         * @function hasclass
         * @memberof elation.elements.base#
         * @returns {bool}
         */
        hasclass(classname) {
          return elation.html.hasclass(this, classname);
        }
        /**
         * Make this component visible 
         * @function show
         * @memberof elation.elements.base#
         */
        show() {
          if (this.hidden) {
            this.hidden = false;
            this.removeclass('state_hidden');
            this.refresh();
          }
        }
        /**
         * Make this component invisible 
         * @function hide
         * @memberof elation.elements.base#
         */
        hide() {
          this.hidden = true;
          this.addclass('state_hidden');
        }
        /**
         * Enable this component
         * @function enable
         * @memberof elation.elements.base#
         */
        enable() {
          this.enabled = true;
          this.removeclass('state_disabled');
        }
        /**
         * Disable this component
         * @function disable
         * @memberof elation.elements.base#
         */
        disable() {
          this.enabled = false;
          this.addclass('state_disabled');
        }
        /**
         * Set this component's hover state
         * @function hover
         * @memberof elation.elements.base#
         */
        onhover() {
          this.hover = true;
        }
        /**
         * Unset this component's hover state
         * @function unhover
         * @memberof elation.elements.base#
         */
        onunhover() {
          this.hover = false;
        }
        /**
         * Sets the orientation of this component
         * @function setOrientation
         * @memberof elation.elements.base#
         * @param {string} orientation
         */
        setOrientation(orientation) {
          if (this.orientation) {
            this.removeclass('orientation_' + this.orientation);
          }
          this.orientation = orientation;
          this.addclass('orientation_' + this.orientation);
        }
        addPropertyProxies(element, properties) {
          properties = (elation.utils.isString(properties) ? properties.split(',') : properties);
          for (var i = 0; i < properties.length; i++) {
            ((p) => {
              // Set current value
              if (typeof this[p] != 'undefined' && this[p] !== null) {
                element[p] = this[p];
              }
              // Define getter and setter to proxy requests for this property to another element
              Object.defineProperty(this, p, { get: function() { return element[p]; }, set: function(v) { element[p] = v; } });
            })(properties[i]);
          }
        }
        addEventProxies(element, events) {
          var passiveEvents = ['touchstart', 'touchmove', 'touchend', 'mousewheel'];
          events = (elation.utils.isString(events) ? events.split(',') : events);
          for (var i = 0; i < events.length; i++) {
            elation.events.add(element, events[i], (ev) => { 
              //this.dispatchEvent({type: ev.type, event: ev }); 
              this.dispatchEvent(ev);
            }, (passiveEvents.indexOf(events[i]) != -1 ? {passive: true} : false));
          }
        }
        /**
         * Render this element to an image
         * @function toCanvas
         * @memberof elation.elements.base#
         */
        toCanvas(width, height, scale) {
          this.canvasNeedsUpdate = true;
          if (typeof width == 'undefined') {
            width = this.offsetWidth;
          }
          if (typeof height == 'undefined') {
            height = this.offsetHeight;
          }
          if (typeof scale == 'undefined') {
            scale = 1;
          }
          if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.crossOrigin = 'anonymous';
            this.canvas.width = width;
            this.canvas.height = height;
            this.canvasscale = scale;
            //document.body.appendChild(this.canvas);

            this.observer = new MutationObserver(() => {
              // Rate limit refreshes to avoid too many updates
              if (this.refreshtimer) clearTimeout(this.refreshtimer);
              this.refreshtimer = setTimeout(() => {
                // Use requestIdleCallback to reduce the amount of jank when updating
                requestIdleCallback(() => {
                  this.updateCanvas();
                  this.refreshqueued = false;
                  this.refreshtimer = false;
                }, { timeout: 20 });
              }, 50);
              //this.refresh();
            });
            this.observer.observe(this, { subtree: true, childList: true, attributes: true, characterData: true });
          }
          //var img = new Image();

          // We need to sanitize our HTML in case someone provides us with malformed markup.
          // We use SVG to render the mark-up, and since SVG is XML it means we need well-formed data
          // However, for whatever reason, <br> amd <hr> seem to break things, so we replace them with
          // styled divs instead.

          //var sanitarydiv = document.createElement('div');
          //sanitarydiv.innerHTML = this.outerHTML;



/*
          if (this.stylesheetsChanged()) {
            let fetches = [];
            // Fetch all active stylesheets, so we can inject them into our foreignObject
            for (let i = 0; i < document.styleSheets.length; i++) {
              let stylesheet = document.styleSheets[i];
              fetches[i] = fetch(stylesheet.href).then(r => r.text()).then(t => { return { url: stylesheet.href, text: t, order: i }; });
            }
            this.stylecachenames = this.getStylesheetList();
            Promise.all(fetches).then((stylesheets) => {
              var styletext = '';
              // Make sure stylesheets are loaded in the same order as in the page
              stylesheets.sort((a, b) => { return b.order - a.order; });
              for (var i = 0; i < stylesheets.length; i++) {
                styletext += stylesheets[i].text.replace(/\/\*[^\*]+\*\//g, '').replace(/</g, '&lt;');
              }
              this.styletext = styletext;
              this.updateCanvas(); 
            });
          } else {
            this.updateCanvas(); 
          }
*/
          this.updateCanvas(); 
          return this.canvas;
        }
        async updateCanvas(force) {
          if (this.loading) return;
          let outerHTML = this.outerHTML;
          if (this.lasthtml == outerHTML && !force) return false;
          this.lasthtml = outerHTML;
          //console.time('updateCanvas');
          this.loading = true;

          var width = this.canvas.width,
              height = this.canvas.height;

          var ctx = this.canvas.getContext('2d');

          //console.time('updateCanvas:get images');
          var imgtags = this.getElementsByTagName('img');
          //console.timeEnd('updateCanvas:get images');
          var images = [],
              promises = [];

          if (!this.imagecache) this.imagecache = {};

          //console.time('updateCanvas:imagesrc');
          for (var i = 0; i < imgtags.length; i++) {
            if (imgtags[i].src.substring(0, 5) == 'data:') {
              //promises.push(this.fetchImage(imgtags[i].src));
              promises.push(new Promise(resolve => resolve(imgtags[i].src)));
              images[i] = imgtags[i].src;
            } else {
              promises.push(this.fetchImage(imgtags[i].src));
              images[i] = imgtags[i].src;
            }
          }
          //console.timeEnd('updateCanvas:imagesrc');

          //console.time('updateCanvas:style');
          if (this.stylesheetsChanged()) {
            await this.updateStylesheets();
          }
          //console.timeEnd('updateCanvas:style');

          Promise.all(promises).then((imgdata) => {
            //console.time('updateCanvas:img set src');
            for (var i = 0; i < imgtags.length; i++) {
              //content = content.replace(images[i], imgdata[i]);
              if (imgtags[i].src.substring(0, 5) != 'data:' && imgtags[i].src != imgdata[i]) {
                imgtags[i].src = imgdata[i];
              }
            }
            for (var i = 0; i < imgtags.length; i++) {
              //content = content.replace(images[i], imgdata[i]);
              //imgtags[i].src = images[i];
            }
            //console.timeEnd('updateCanvas:img set src');
            let img = this.img;
            //let svg = this.svg;
            if (!img) {
              //console.time('updateCanvas:create svg');
              img = this.img = new Image();
              img.eager = true;
              img.addEventListener('load', () => { 
                this.canvas.width = width;
                this.canvas.height = height;
                ctx.drawImage(img, 0, 0) 
                this.loading = false;
                elation.events.fire({element: this.canvas, type: 'asset_update'});
              });
              img.addEventListener('error', (err) => { 
                console.log('Error generating image from HTML', err, img, content);
                this.loading = false;
              });
            }

            let content = this.lastcontent;
            //console.time('updateCanvas:update svg');
            content = this.outerHTML.replace(/<br\s*\/?>/g, '<div class="br"></div>');
            content = content.replace(/<hr\s*\/?>/g, '<div class="hr"></div>');
            content = content.replace(/<img(.*?)>/g, "<img$1 />");
            content = content.replace(/<input(.*?)>/g, "<input$1 />");
            this.lastcontent = content;
            this.lasthtml = this.outerHTML;
            var svgdata = '<foreignObject requiredExtensions="http://www.w3.org/1999/xhtml" width="' + (width / this.canvasscale) + '" height="' + (height / this.canvasscale) + '" transform="scale(' + this.canvasscale + ')">' +
                       '<html xmlns="http://www.w3.org/1999/xhtml"><body class="dark janusweb">' +
                       '<style>' + encodeURIComponent(this.styletext) + '</style>' +
                       content +
                       '</body></html>' +
                       '</foreignObject>';
            var data = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '">' + svgdata + '</svg>';
            var url = 'data:image/svg+xml,' + data;
            img.src = url;
//svg.innerHTML = svgdata;
            //console.timeEnd('updateCanvas:update svg');
            this.canvasNeedsUpdate = false;
            //console.timeEnd('updateCanvas');
          });
          this.loading = false;
        }
        queryParentSelector(selector) {
          var node = this.parentNode;
          while (node) {
            if (node.matches && node.matches(selector)) {
              return node;
            }
            node = node.parentNode;
          }
          return null;
        }
        blobToDataURL(blob) {
          return new Promise((resolve, reject) => {
            var a = new FileReader();
            a.onload = function(e) {resolve(e.target.result);}
            a.readAsDataURL(blob);
          });
        }

        async fetchImage(src) {
          if (this.imagecache[src]) {
            return this.imagecache[src];
          } else {
            return fetch(this.getFullURL(src))
                      .then(r => r.blob())
                      .then(d => { let u = this.blobToDataURL(d); this.imagecache[src] = u; return u;});
          }
        }
        getFullURL(src) {
          // FIXME - egregious hack for CORS white building prototype.  Do not check this in!
          let proxyurl = 'https://p.janusvr.com/';
          if (src.indexOf(proxyurl) != 0) {
            return proxyurl + src;
          }
          return src;
        }
        toString() {
          if (!this.id) {
            this.id = elation.elements.getUniqueId(this.nodeName.toLowerCase());
          }
          return '#' + this.id;
        }
        fromString(str) {
          this.elements = elation.elements.fromString(str, this);
          return this.elements;
        }
        fromTemplate(tplname, obj) {
          this.elements = elation.elements.fromTemplate(tplname, this);
          return this.elements;
        }
        stylesheetsChanged() {
          if  (!this.styletext) return true;

          let stylesheets = this.getStylesheetList();
          if (stylesheets != this.stylecachenames) return true;

          return false;
        }
        async updateStylesheets(proxy='') {
console.log('update stylesheets', this);
          let fetches = [];
          proxy = elation.engine.assets.corsproxy;
          // Fetch all active stylesheets, so we can inject them into our foreignObject
          for (let i = 0; i < document.styleSheets.length; i++) {
            let stylesheet = document.styleSheets[i];
            if (stylesheet.href) {
              fetches.push(fetch(proxy + stylesheet.href).then(r => r.text()).then(t => { return { url: stylesheet.href, text: t, order: i }; }));
            } else if (document.styleSheets[i].cssRules.length > 0) {
              let txt = '';
              let sheet = document.styleSheets[i];
              for (let i = 0; i < sheet.cssRules.length; i++) {
                txt += sheet.cssRules[i].cssText + '\n';
              }
              fetches.push(new Promise((resolve) => resolve({url: null, text: txt, order: i })));
            }
          }
          this.stylecachenames = this.getStylesheetList();
          let stylesheets = await Promise.all(fetches);
          var styletext = '';
          // Make sure stylesheets are loaded in the same order as in the page
          stylesheets.sort((a, b) => { return b.order - a.order; });
          for (var i = 0; i < stylesheets.length; i++) {
            styletext += stylesheets[i].text.replace(/\/\*[^\*]+\*\//g, '').replace(/</g, '&lt;');
          }
          this.styletext = styletext;

          //this.dispatchEvent(new CustomEvent('styleupdate', { detail: stylesheets}));
          elation.events.fire({type: 'styleupdate', element: this, data: stylesheets});
          setTimeout(() => {
            this.updateCanvas(true);
          }, 0);
          return styletext;
        }
        getStylesheetList() {
          return Array.prototype.map.call(document.styleSheets, n => n.href).join(' ');
        }
      };
    }
  });
})();
// ===== END COMPONENT: elements.elements =====

// ===== BEGIN COMPONENT: elements.base ====
(
function() {
  /**
   * Base class for every Elation custom element. Provides the lifecycle
   * (`init` → `create` → `render`), the typed-attribute system via
   * `defineAttributes`, event dispatch with elation-style bubbling, and a
   * small set of helpers shared by every element (`refresh`, `show` / `hide`,
   * `enable` / `disable`, `addclass` / `removeclass` / `hasclass`, `toCanvas`).
   *
   * Extend this class directly for elements with no other parent, or extend
   * a more specific subclass like `elation.elements.ui.list` or
   * `elation.elements.ui.button` to inherit its behavior. Register the
   * subclass with `elation.elements.define(name, classdef)` so the tag name
   * is wired up with the browser's custom element registry and the class
   * lands in the correct namespace.
   *
   * Every base-class instance ships with a handful of attributes useful to
   * any element: `name` (an arbitrary identifier), `flex` (CSS flex
   * shorthand applied during render), `editable` and `preview` flags, and
   * `deferred` (defers `render()` to a render loop). These are inherited
   * by every subclass on top of whatever attributes that subclass adds in
   * its own `defineAttributes` call.
   *
   * @class base
   * @hideconstructor
   * @memberof elation.elements
   *
   * @param {object} args
   * @param {string} args.name
   * @param {string} args.flex
   * @param {string} args.template
   * @param {boolean} args.editable
   * @param {boolean} args.preview
   * @param {boolean} args.deferred
   */
  elation.elements.define('base', class extends elation.elements.mixin(HTMLElement) {
  }, true);
})();
// ===== END COMPONENT: elements.base =====

// ===== BEGIN COMPONENT: elements.ui.text ====
(
function() {
  elation.elements.define("ui.text", class extends elation.elements.base {
    init() {
      if (this.innerHTML && this.innerHTML.length > 0) {
        this.text = this.innerHTML;
      }
      super.init();
      this.defineAttributes({
        editable: { type: 'boolean', default: false },
        hidden: { type: 'boolean', default: false },
        text: { type: 'string', /*set: this.settext*/ }
      });
      if (this.preview) {
        this.text = 'The quick brown fox jumped over the lazy dog';
      }
    }
    create() {
      if (this.editable) {
        this.addclass('state_editable');
        elation.events.add(this, 'keydown,blur', this);
        this.contentEditable = true;
      }
      if (!this.innerHTML || this.innerHTML != this.text) {
        this.settext(this.text);
      }
      if (this.hidden) {
        this.hide();
      }
    }
    /**
     * Set text for this element
     * @function settext
     * @memberof elation.elements.ui.text#
     * @param {string} text
     */
    settext(text) {
      this.innerHTML = text;
      if (text != this.text) {
        this.text = text;
        if (typeof this.text != "undefined") {
          this.dispatchEvent({type: 'change', data: this.text});
        }
      }
    }
    /**
     * Event handler: HTML element keydown event
     * @function keydown
     * @memberof elation.elements.ui.text#
     * @param {event} ev
     */
    keydown(ev) {
      console.log(ev);
      switch (ev.keyCode) {
        case 13: // newline
          this.settext(this.innerHTML);
          this.blur();
          ev.preventDefault();
          break;
        case 27: // esc
          this.innerHTML = this.text;
          this.blur();
          break;
      }
    }
    /**
     * Event handler: HTML element blur event
     * @function blur
     * @memberof elation.elements.ui.text#
     * @param {event} ev
     */
    blur(ev) {
      this.settext(this.innerHTML);
    }
  });
})();
// ===== END COMPONENT: elements.ui.text =====

// ===== BEGIN COMPONENT: elements.ui.label ====
(
function() {
  elation.requireCSS('ui.label');

  elation.elements.define("ui.label", class extends elation.elements.base {
    init() {
      super.init();
      this.defineAttributes({
        label: { type: 'string' },
        forf: { type: 'object' },
      });
    }
    create() {
      this.setLabel(this.label);

      elation.events.add(this, 'click', this.handleFocus);
    }
    setLabel(label) {
      this.label = label;
      this.innerHTML = label;
    }
    handleFocus(ev) {
      if (this.forf) {
        this.forf.focus();
      }
    }
  });
})();
// ===== END COMPONENT: elements.ui.label =====

// ===== BEGIN COMPONENT: elements.ui.item ====
(
function() {

  /** 
   * Item UI element
   * Represents an individual item in a ui.list
   *
   * @class item
   * @hideconstructor
   * @category UI
   * @augments elation.elements.base
   * @memberof elation.elements.ui
   *
   * @param {object}  args
   * @param {object}  args.item
   * @param {object}  args.attrs
   * @param {boolean} args.selectable
   */
  elation.elements.define('ui.item', class extends elation.elements.base {
    init() {
      super.init();

      this.defineAttributes({
        value: { type: 'object', innerHTML: true },
        disabled: { type: 'boolean', default: false },
        selected: { type: 'boolean', default: false },
        selectable: { type: 'boolean', default: false },
        nameattr: { type: 'string', default: 'name' },
        childattr: { type: 'string', default: 'items' },
        labelattr: { type: 'string', default: 'label' },
        titleattr: { type: 'string', default: 'title' },
        disabledattr: { type: 'string', default: 'disabled' },
        itemtemplate: { type: 'string' },
        itemcomponent: { type: 'object' },
        itemplaceholder: { type: 'object' },
      });
    }
    create() {
      elation.events.add(this, 'mousedown', (ev) => this.mousedown(ev));

      this.render();
    }
    setValue(value) {
      this.value = value;
      this.render();
    }
    render() {
      super.render();
      // reset classname to default
      this.className = '';
      if (typeof this.value != 'undefined') {
        if (this.placeholder) {
          this.placeholder = false;
        }

        if (this.value instanceof HTMLElement) {
          this.setcontent(this.value);
        } else if (elation.utils.isString(this.value) && this.value != this.innerHTML) {
          this.setcontent(this.value);

          if (this.value.classname) {
            this.addclass(this.value.classname);
          }
        } else if (this.itemtemplate) {
          this.setcontent(this.value);
        } else if (this.labelattr && typeof this.value === 'object' && !this.value.nodeType) {
          // Plain data object with a label-attribute — render that property.
          // Skip DOM nodes (Text/Element) which extractItems() sometimes
          // assigns to `value`; those need to keep the existing innerHTML.
          this.setcontent(this.value);
        }

        if (this.selected) {
          this.addclass("state_selected");
        }
        if (this.lastselected) {
          this.addclass("state_lastselected");
        }
        if (this.titleattr && this.value[this.titleattr]) {
          this.title = this.value[this.titleattr];
        }
        if (!elation.utils.isEmpty(this.disabledattr) && !elation.utils.isEmpty(this.value[this.disabledattr])) {
          this.addclass("state_disabled");
        }
      } else {
        //console.log('JRJRIJRIJRIJR', this.childNodes);
        if (this.childNodes.length > 0) {
          this.extractcontent();
        }
        if (!this.placeholder && this.itemplaceholder && this.itemplaceholder != 'null') { // FIXME - type hinting should mean we never get 'null' as a string
          this.placeholder = true;
          this.setcontent(elation.utils.any(this.itemplaceholder, ''));
        }
      }
    }
    setcontent(value) {
//console.log('set content', (value == this.innerHTML), value, this.innerHTML);
      this.innerHTML = '';
      var filled = false;
      if (value instanceof elation.component.base) {
        this.appendChild(value.container);
        filled = true;
      } else if (value instanceof HTMLElement) {
        this.appendChild(value);
//this.innerHTML = value.innerHTML;
//console.log('here I add the guy to the thing', this.innerHTML, value, value.parentNode, this.parentNode);
        filled = true;
/*
      } else if (this.itemcomponent) {
        var itemcomponentclass = elation.utils.arrayget(elation, this.itemcomponent);
        if (itemcomponentclass) {
          var itemcomponent = itemcomponentclass(null, this, value);
          this.itemcomponent = itemcomponent;
          filled = true;
        }
*/
      } else if (this.itemtemplate) {
        this.innerHTML = elation.template.get(this.itemtemplate, value);
        filled = true;
      }
      if (!filled) {
        if (elation.utils.isString(value)) {
          this.innerHTML = value;
        } else if (this.labelattr) {
          var attrval = elation.utils.arrayget(value, this.labelattr);
          if (attrval !== null) {
            this.innerHTML = attrval;
          }
        }
      }
    }
    extractcontent() {
      var root;
      if (!this.value && this.innerHTML != '') {
        //this.value = this.innerHTML;
      }
    }
    /**
     * Set this list item as being selected
     * @function select
     * @memberof elation.elements.ui.item#
     * @fires elation.elements.ui.item#ui_list_item_select
     */
    select(extra) {
      this.selected = true;
      this.addclass('state_selected');
      this.setAttribute('aria-selected', true);
      // FIXME - 'extra' has two meanings here; if you pass false it doesn't emit events, but if you
      //          pass an object, it's treated as an event, and its properties are cloned
      if (extra !== false) {
        if (elation.events.wasDefaultPrevented(elation.events.fire({type: 'select', element: this, data: this.value, event: extra}))) {
          extra.preventDefault();
        }
      }
    }
    /**
     * Set this list item as being unselected
     * @function unselect
     * @memberof elation.elements.ui.item#
     * @fires elation.elements.ui.item#ui_list_item_unselect
     */
    unselect() {
      this.selected = false;
      this.removeclass('state_selected');
      this.setAttribute('aria-selected', false);
      elation.events.fire({type: 'unselect', element: this, data: this.value});
    }
    /**
     * Set this list item as being the last item selected in its list
     * @function setlastselected
     * @memberof elation.elements.ui.item#
     */
    setlastselected(state) {
      this.lastselected = state;
      var hasclass = this.hasclass('state_lastselected');
      if (state && !hasclass) {
        this.addclass('state_lastselected');
      } else if (!state && hasclass) {
        this.removeclass('state_lastselected');
      }
    }
    /**
     * Event handler: HTML element mousedown
     * @function mousedown
     * @memberof elation.elements.ui.item#
     * @param {Event} ev
     */
    mousedown(ev) {
      if (this.selectable && !this.selected) {
        this.select(ev);
        ev.stopPropagation();
      }
    }
  });
})();
// ===== END COMPONENT: elements.ui.item =====

// ===== BEGIN COMPONENT: elements.ui.button ====
(
function() {
  elation.requireCSS('ui.button');
  /** 
   * Button UI element
   *
   * @class button
   * @hideconstructor
   * @category UI
   * @augments elation.elements.ui.item
   * @memberof elation.elements.ui
   *
   * @param {object} args
   * @param {string} args.tag
   * @param {string} args.classname
   * @param {string} args.label
   * @param {string} args.title
   * @param {boolean} args.draggable
   * @param {boolean} args.autoblur
   * @param {boolean} args.autofocus
   */
  elation.elements.define('ui.button', class extends elation.elements.ui.item {
    init() {
      super.init()
      this.defineAttributes({
        label: { type: 'string', set: this.updateLabel },
        name: { type: 'string' },
        disabled: { type: 'boolean', default: false },
        autoblur: { type: 'boolean', default: false },
        tabindex: { type: 'integer', default: 0 }
      });
      if (this.preview) {
        this.label = 'Click Here';
      }
    }
    /**
     * Initialize HTML element
     * @function create
     * @memberof elation.elements.ui.button#
     */
    create() {
      //this.element = document.createElement(this.tag);
      //this.buttonelement = elation.elements.create('button', {append: this});
      //this.buttonelement.innerHTML = this.label;
      if (!this.label) {
        this.label = this.innerHTML;
      } else {
        this.innerHTML = this.label;
      }
      //this.addPropertyProxies(this.buttonelement, ['disabled']);
      //this.addEventProxies(this.buttonelement, ['mouseover','mouseout','mousedown', 'mouseup', 'mousemove', 'touchstart', 'touchmove', 'touchend', 'focus', 'blur']);
      this.setAttribute('tabindex', 0);
      this.addEventListener('click',   (ev) => this.handleClick(ev));
      this.addEventListener('keydown', (ev) => this.handleKeydown(ev));
      this.addEventListener('keyup',   (ev) => this.handleKeyup(ev));
      // Clear the keyboard-press visual if focus leaves mid-press.
      this.addEventListener('blur',    () => this.classList.remove('state_pressed'));
    }
    /**
     * Add as a child of the specified element, removing from current parent if necessary
     * @function addTo
     * @memberof elation.elements.ui.button#
     * @returns {boolean}
     */
    addTo(parent) {
      if (typeof parent != 'undefined') {
        if (!this.buttonelement)
          this.create();
        parent.appendChild(this);
        return true;
      }
      return false;
    }
    /**
     * Sets the text label of the button
     * @function setLabel
     * @memberof elation.elements.ui.button#
     */
    setLabel(label) {
      this.label = label;
      this.updateLabel();
    }
    /**
     * Updates the HTML that displays the label for this button
     * @function updateLabel
     * @memberof elation.elements.ui.button#
     */
    updateLabel() {
      this.innerHTML = this.label;
    }
    /**
     * Sets the title text of the button
     * @function setTitle
     * @memberof elation.elements.ui.button#
     */
    setTitle(title) {
      if (this.buttonelement)
        this.buttonelement.title = title;
    }
    /**
     * Set whether the element is active or not
     * @function setActive
     * @memberof elation.elements.ui.button#
     * @param {boolean} active
     */
    setActive(active) {
      if (active) {
        this.addclass('state_active');
      } else {
        this.removeclass('state_active');
      }
    }
    /**
     * Event handler for HTML button's click event
     * @function handleClick
     * @memberof elation.elements.ui.button#
     * @param {Event} ev
     */
    handleClick(ev) {
      if (this.disabled) {
        ev.stopPropagation();
        ev.preventDefault();
        return false;
      }
      //this.dispatchEvent({type: 'click', element: this});
      if (this.autoblur) {
        this.buttonelement.blur();
      }
      //ev.stopPropagation();
    }
    /**
     * Keyboard press visual — adds `state_pressed` for the duration of
     * the held key, mirroring mouse :active. Activation itself fires on
     * the matching keyup so behaviour matches native buttons.
     * @function handleKeydown
     * @memberof elation.elements.ui.button#
     * @param {KeyboardEvent} ev
     */
    handleKeydown(ev) {
      if (this.disabled) return;
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        this.classList.add('state_pressed');
      }
    }
    /**
     * Keyboard release: clears the press visual and triggers the click.
     * @function handleKeyup
     * @memberof elation.elements.ui.button#
     * @param {KeyboardEvent} ev
     */
    handleKeyup(ev) {
      if (this.disabled) return;
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        if (this.classList.contains('state_pressed')) {
          this.classList.remove('state_pressed');
          this.click();
        }
      }
    }
  });
})();
// ===== END COMPONENT: elements.ui.button =====

// ===== BEGIN COMPONENT: elements.ui.togglebutton ====
(
function() {
  /**
   * Button that flips between active and inactive on click. Emits
   * `activate` / `deactivate` events that can be cancelled via
   * `preventDefault()` to reject the state change.
   *
   * @class togglebutton
   * @hideconstructor
   * @category UI
   * @augments elation.elements.ui.button
   * @memberof elation.elements.ui
   * @example
   * <ui-togglebutton label="Mute"></ui-togglebutton>
   *
   * @param {object} args
   * @param {boolean} args.active
   */
  elation.elements.define('ui.togglebutton', class extends elation.elements.ui.button {
    init() {
      super.init();
      this.defineAttributes({
        active: { type: 'boolean', default: false }
      });
    }    
    create() {
      super.create();
    }
    handleClick(ev) {
      if (ev.button == 0) {
        if (!this.active) {
          this.activate();
        } else {
          this.deactivate();
        }
      }
    }
    activate() {
      let events = this.dispatchEvent({type: 'activate'});
      if (!events || !elation.events.wasDefaultPrevented(events)) {
        this.active = true;
      }
    }
    deactivate() {
      let events = this.dispatchEvent({type: 'deactivate'});
      if (!events || !elation.events.wasDefaultPrevented(events)) {
        this.active = false;
      }
    }
    toggle() {
      if (this.active) {
        this.deactivate();
      } else {
        this.activate();
      }
    }
  });
})();
// ===== END COMPONENT: elements.ui.togglebutton =====

// ===== BEGIN COMPONENT: elements.ui.list ====
(
function() {
  elation.requireCSS("ui.list");

  /**
   * Container for selectable, sortable, draggable item collections. Accepts
   * child `<li>` or `<ui-item>` elements statically, or bind a live data
   * source via the `collection` attribute for auto-updating lists.
   *
   * Base class for `ui-grid`, `ui-select`, `ui-tabs`, `ui-buttonbar`, and
   * other container components.
   *
   * @class list
   * @hideconstructor
   * @category UI
   * @augments elation.elements.base
   * @memberof elation.elements.ui
   * @example
   * <ui-list selectable>
   *   <li>Apple</li>
   *   <li>Banana</li>
   *   <li>Cherry</li>
   * </ui-list>
   *
   * @param {object}    args
   * @param {string}    args.tag
   * @param {string}    args.classname
   * @param {string}    args.title
   * @param {boolean}   args.draggable
   * @param {boolean}   args.selectable
   * @param {boolean}   args.hidden
   * @param {string}    args.orientation
   * @param {string}    args.sortbydefault
   * @param {array}     args.items
   * @param {boolean}   args.autoscroll
   * @param {number}    args.autoscrollmargin
   * @param {elation.elements.collection.simple} args.itemcollection
   *
   * @param {object}    args.attrs
   * @param {object}    args.attrs.name
   * @param {object}    args.attrs.children
   * @param {object}    args.attrs.label
   * @param {object}    args.attrs.disabled
   * @param {object}    args.attrs.itemtemplate
   * @param {object}    args.attrs.itemcomponent
   * @param {object}    args.attrs.itemplaceholder
   *
   */

  /**
   * ui_list_select event
   * @event elation.elements.ui.list#ui_list_select
   * @type {object}
   */
  elation.elements.define('ui.list', class extends elation.elements.base {
    init() {
      super.init();
      this.defineAttributes({
        title: { type: 'string' },
        hidden: { type: 'boolean' },
        draggable: { type: 'boolean' },
        selectable: { type: 'boolean' },
        sortbydefault: { type: 'string' },
        multiselect: { type: 'boolean' },
        spinner : { type: 'boolean' },
        orientation: { type: 'string' },
        autoscroll: { type: 'boolean' },
        autoscrollmargin: { type: 'integer', default: 100 },
        //items: { type: 'object' },
        itemcount: { type: 'integer', get: this.getItemCount },
        nameattr: { type: 'string', default: 'name' },
        childattr: { type: 'string', default: 'items' },
        labelattr: { type: 'string', default: 'label' },
        titleattr: { type: 'string', default: 'title' },
        disabledattr: { type: 'string', default: 'disabled' },
        collection: { type: 'object', default: null },
        itemtemplate: { type: 'string', default: '' },
        itemcomponent: { type: 'object', default: 'ui.item' },
        itemplaceholder: { type: 'object', default: null },
        emptytemplate: { type: 'string' },
        emptycontent: { type: 'string' },
      });
      this.items = [];
      this.listitems = [];
      this.selection = [];

      this.dirty = false;

      this.animatetime = 850;

    }
    create() {
      if (this.preview) {
        this.items = [{value: 1, label: 'One'}, {value: 2, label: 'Two'}, {value: 2, label: 'Three'}];
      }
      if (this.collection) {
        this.setItemCollection(this.collection);
      } else if (this.items && this.items.length > 0) {
        this.setItems(this.items);
      } else if (this.items.length == 0) {
        this.extractItems();
      }

      if (this.selectable) {
        this.addclass('state_selectable');
        this.setAttribute('tabindex', 0);
        this.addEventListener('keydown', (ev) => this.handleKeydown(ev));
        this.addEventListener('click', (ev) => this.handleClick(ev));
      }
      this.setAttribute('role', (this.selectable ? 'listbox' : 'list'));

      if (this.draggable) {
        this.addEventListener('dragstart', (ev) => this.handleDragStart(ev));
        this.addEventListener('dragover',  (ev) => this.handleDragOver(ev));
        this.addEventListener('drop',      (ev) => this.handleDrop(ev));
        this.addEventListener('dragend',   (ev) => this.handleDragEnd(ev));
      }

      if (this.orientation) {
        this.setOrientation(this.orientation);
      }

      if (this.sortbydefault) {
        this.setSortBy(this.sortbydefault);
      }
      if (this.hidden) {
        this.hide();
      }

      let emptycontent = this.emptycontent;
      if (this.emptytemplate) {
        emptycontent = elation.templates.get(this.emptytemplate, this);
      }
      if (emptycontent) {
        this.emptyitem = this.createlistitem({
          value: emptycontent,
          innerHTML: emptycontent,
          selectable: false,
          disabled: true
        });
      }
      this.refresh();
    }
    /**
     * Returns the UL element for this component, or create a new one if it doesn't exist yet
     * @function getListElement
     * @memberof elation.elements.ui.list#
     * @returns {HTMLUListElement}
     */
    getListElement() {
/*
      if (this instanceof HTMLUListElement) {
        return this;
      } else if (!this.listul) {
        this.listul = elation.html.create({tag: 'ul', append: this});
      }
      return this.listul;
*/
      return this;
    }
    getItemCount() {
      if (this.itemcollection) {
        return this.itemcollection.length;
      }
      return this.items.length;
    }
    /**
     * Update the items associated with this list
     * @function setItems
     * @memberof elation.elements.ui.list#
     */
    setItems(items) {
      this.clear();
      if (elation.utils.isArray(items)) {
        this.items = items;
      } else if (elation.utils.isString(items)) {
        this.items = items.split('|').map((x) => {
          return { 
            value: x, 
            nameattr: this.nameattr,
            childattr: this.childattr,
            labelattr: this.labelattr,
            disabledattr: this.disabledattr,
            itemtemplate: this.itemtemplate,
            itemcomponent: this.itemcomponent,
            itemplaceholder: this.itemplaceholder,
          };
        });
      } else {
        for (var k in items) {
          this.items.push(items[k]);
        }
      }
      this.refresh();
    }
    /**
     * Links this list component with a collection to automatically handle updates when data changes
     * @function setItemCollection
     * @memberof elation.elements.ui.list#
     * @param {elation.elements.collection.simple} itemcollection  
     */
    setItemCollection(itemcollection) {
      if (this.itemcollection) {
        elation.events.remove(this.itemcollection, "collection_add,collection_remove,collection_move", this);
      }
      //this.clear();
      if (itemcollection instanceof elation.elements.collection.simple) {
        this.itemcollection = itemcollection;
      } else if (elation.utils.isString(itemcollection)) {
        this.itemcollection = document.getElementById(itemcollection);
      }
      if (this.itemcollection) {
        elation.events.add(this.itemcollection, "collection_add,collection_remove,collection_move,collection_load,collection_load_begin,collection_clear", this);
        //this.setItems(this.itemcollection.items);
        if (this.hasOwnProperty('items')) {
          delete this.items;
        }

        // FIXME - some interaction between this.items, this.listitems, and this.sort is causing problems when you swap out collections for a list
        Object.defineProperty(this, 'items', { get: function() { return this.itemcollection.items; }, configurable: true });
        Object.defineProperty(this, 'count', { configurable: true, get: function() { return this.itemcollection.length; }, configurable: true });
      }
      this.refresh();
    }
    /**
     * Extracts items out of the list's existing HTML structure
     * @function extractItems
     * @memberof elation.elements.ui.list#
     */
    extractItems() {
      var items = [];
      for (var i = 0; i < this.childNodes.length; i++) {
        var node = this.childNodes[i];
        if (node instanceof HTMLLIElement) {
          var item = this.createlistitem({
            value: node.innerHTML,
            innerHTML: node.innerHTML,
            selectable: this.selectable,
            draggable: (this.draggable ? 'true' : 'false'),
            nameattr: this.nameattr,
            childattr: this.childattr,
            labelattr: this.labelattr,
            titleattr: this.titleattr,
            disabledattr: this.disabledattr,
            itemtemplate: this.itemtemplate,
            itemcomponent: this.itemcomponent,
            itemplaceholder: this.itemplaceholder
          });
          node.parentNode.removeChild(node);
          i--;
          items.push(item);
        } else if (node instanceof elation.elements.ui.item) {
          items.push(node);
          node.value = node.firstChild;
          node.selectable = this.selectable;
          node.draggable = (this.draggable ? 'true' : 'false');
          elation.events.add(node, 'select', (ev) => this.handleSelect(ev));
          node.parentNode.removeChild(node);
          i--;
        }
      }
      this.setItems(items);
    }
    /**
     * Add a new item to this list
     * @function addItem
     * @memberof elation.elements.ui.list#
     * @param {Object} item
     */
    addItem(item) {
      let wasScrollAtBottom = this.isScrollAtBottom(this.autoscrollmargin);
      this.items.push(item);
      this.refresh();
      this.applyAutoscroll(wasScrollAtBottom);
    }
    /**
     * Add a new item to a specific position in this list
     * @function addItemAtPosition
     * @memberof elation.elements.ui.list#
     * @param {Object} item
     * @param {integer} position
     */
    addItemAtPosition(item, position) {
      this.items.splice(position, 0, item);
      //this.listitems.splice(position, 0, null);
      this.refresh();
    }
    /**
     * Resets the list to empty
     * @function clear
     * @memberof elation.elements.ui.list#
     */
    clear() {
      var ul = this.getListElement();
      var items = this.items;
      for (var i = 0; i < items.length; i++) {
        if (items[i]) {
          var item = this.getlistitem(i);
          if (item.parentNode) {
            item.parentNode.removeChild(item);
          
            delete this.listitems[i];
            delete items[i];
          }
        }
      }
      if (!this.itemcollection) {
        this.items = this.items.filter(n => n !== null); // if this isn't a collection-backed list, filter out empty items
      }
      this.listitems = [];
      //delete this.items;
      ul.innerHTML = '';
    }
    /**
     * Get the elation.ui.listitem for a specified item, allocating as needed
     * @function getlistitem
     * @memberof elation.elements.ui.list#
     * @param {Object} item
     * @returns {elation.elements.ui.listitem}
     */
    getlistitem(itemnum) {
      if (this.items[itemnum] instanceof elation.elements.ui.item) {
        return this.items[itemnum];
      }
      var item = this.items[itemnum];
      for (var i = 0; i < this.listitems.length; i++) {
        if (this.listitems[i] && this.listitems[i].value === item) {
          return this.listitems[i];
        }
      }
      
      //if (!item) {
        // no existing listitem, allocate a new one
        let itemargs = {
          value: item,
        };
        if (this.selectable) itemargs.selectable = true;
        if (this.draggable) itemargs.draggable = 'true'; // draggable attribute requires the string 'true' not an actual boolean
        if (this.nameattr) itemargs.nameattr = this.nameattr;
        if (this.childattr) itemargs.childattr = this.childattr;
        if (this.labelattr) itemargs.labelattr = this.labelattr;
        if (this.titleattr) itemargs.titleattr = this.titleattr;
        if (this.disabledattr) itemargs.disabledattr = this.disabledattr;
        if (this.itemtemplate) itemargs.itemtemplate = this.itemtemplate;
        if (this.itemcomponent) itemargs.itemcomponent = this.itemcomponent;
        if (this.itemplaceholder) itemargs.itemplaceholder = this.itemplaceholde;

        item = this.createlistitem(itemargs);
        elation.events.add(item, 'select', (ev) => this.handleSelect(ev));
        this.listitems.push(item);
      //}
      return item;
    }

    /**
     * Creates a new instance of an elation.ui.item
     * Can be overridden by inheriting classes to override the ui.item type
     * @function createlistitem
     * @memberof elation.elements.ui.list#
     * @param {Object} args
     */
    createlistitem(args) {
      let listitem = elation.elements.create(this.itemcomponent, args);
      listitem.setAttribute('role', (this.selectable ? 'option' : 'listitem'));
      //listitem.setAttribute('aria-label', 'test');
      return listitem;
    }

    /**
     * Updates the list item objects and the HTML representation of this list with any new or removed items
     * @function render
     * @memberof elation.elements.ui.list#
     */
    render() {
      super.render();
      var ul = this.getListElement();

      // FIXME - this could be made more efficient in two ways:
      //   1) instead of removing all elements and then re-adding them in order, we should be
      //      able to figure out deletions, additions, and moves and apply them separately
      //   2) currently when we remove list items, we still keep a reference to the old object which gets
      //      reused if the same item is re-added.  this can be a performance optimization in some
      //      cases (automatic object reuse reduces gc if the same objects are added and removed repeatedly
      //      over the lifetime of the list), but can be a memory leak in cases where lots of 
      //      non-repeating data is added and removed.

      var items = this.items;

      if (!items) return;

      // Drop any cached listitems whose backing item is no longer in items[].
      // Without this, removals (and filter narrowings, which fire on the
      // derived collection as a load event) would leave stale rows in the DOM.
      for (var __i = this.listitems.length - 1; __i >= 0; __i--) {
        var stale = this.listitems[__i];
        if (!stale) continue;
        var stillPresent =
          items.indexOf(stale) !== -1
          || (stale.value !== undefined && items.indexOf(stale.value) !== -1);
        if (!stillPresent) {
          if (stale.parentNode === ul) ul.removeChild(stale);
          this.listitems.splice(__i, 1);
        }
      }

      if (items.length > 0) {
        if (this.emptyitem && this.emptyitem.parentNode == ul) {
          ul.removeChild(this.emptyitem);
        }
        for (var i = 0; i < items.length; i++) {
          var listitem = this.getlistitem(i);
          if (listitem.parentNode != ul) {
            ul.appendChild(listitem);
          }
          listitem.refresh();
        }
      } else if (this.emptyitem) {
        ul.appendChild(this.emptyitem);
      }
    }

    /**
     * Sorts the items in the list by the specified key
     * @function sort
     * @memberof elation.elements.ui.list#
     * @param {string} sortby
     * @param {boolean} reverse
     */
    sort(sortby, reverse) {
      if (!reverse) reverse = false; // force to bool
      var ul = this.getListElement();

      // First, get the existing position of each item's element
      // Then get a sorted item list, and resort the elements in the DOM
      // Next, apply a transform to place the items back in their old positions
      // Finally, set animation parameters and transform each item to its (0,0,0) position

      // Resort list items
      // FIXME - should also update this.items to reflect new order
      if (typeof sortby == 'function') {
        this.sortfunc = sortby;
        this.listitems.sort(sortby.bind(this));
      } else {
        this.listitems.sort(function(a, b) {
          var val1 = elation.utils.arrayget(a.value, sortby),
              val2 =  elation.utils.arrayget(b.value, sortby);
          if ((val1 < val2) ^ reverse) return -1;
          else if ((val1 > val2) ^ reverse) return 1;
          else return 0;
        });
      }


      // First calculate existing position of all items
      var items = [];
      for (var i = 0; i < this.listitems.length; i++) {
        items[i] = {};
        items[i].value = this.listitems[i].value;
        items[i].container = this.listitems[i];
        items[i].oldpos = [this.listitems[i].offsetLeft, this.listitems[i].offsetTop];
        items[i].oldlistpos = this.items.indexOf(this.listitems[i].value);
      }

      // Remove and re-add all items from list, so DOM order reflects item order
      // FIXME - this could be much more efficient, and is probably the slowest part of the whole process
      for (var i = 0; i < items.length; i++) {
        elation.html.removeclass(items[i], 'state_animating');
        if (items[i].parentNode == ul) {
          ul.removeChild(items[i].container);
        }
        ul.appendChild(items[i].container);
      }
      // Calculate new item positions, and set transform
      var maxdist = 0;
      for (var i = 0; i < items.length; i++) {
        items[i].newpos = [items[i].container.offsetLeft, items[i].container.offsetTop];
        items[i].diff = [items[i].oldpos[0] - items[i].newpos[0], items[i].oldpos[1] - items[i].newpos[1]],
        items[i].dist = Math.sqrt(items[i].diff[0]*items[i].diff[0] + items[i].diff[1] * items[i].diff[1]);
        if (items[i].dist > maxdist) maxdist = items[i].dist;
      }

      for (var i = 0; i < items.length; i++) {
        // FIXME - zooming is exaggerated and the animation feels slow on lists with fewer items.  need to scale this value somehow
        var ratio = items[i].dist / maxdist;
        items[i].z = 100 * ratio;
        items[i].animatetime = this.animatetime * ratio;
        items[i].container.style.zIndex = parseInt(items[i].z);

        // Start transform at item's old position, z=0
        elation.html.transform(items[i].container, 'translate3d(' + items[i].diff[0] + 'px, ' + items[i].diff[1] + 'px, 0px)', '50% 50%', 'none');

        // Animate halfway to the new position while zooming out
        setTimeout(elation.bind(items[i], function() {
          elation.html.transform(this, 'translate3d(' + (this.diff[0]/2) + 'px,' + (this.diff[1]/2) + 'px, ' + this.z + 'px)', '50% 50%', 'all ' + (this.animatetime / 2) + 'ms ease-in');
        }), 0);

        // Finish animating to the new position, and zoom back in
        setTimeout(elation.bind(items[i], function() {
          elation.html.transform(this, 'translate3d(0, 0, 0)', '50% 50%', 'all ' + (this.animatetime / 2) + 'ms ease-out');
        }), items[i].animatetime / 2);

        this.items[i] = items[i].value;
      }
      if (i < this.items.length) {
        this.items.splice(i, this.items.length);
      }

      // Set classname based on sortby parameter
      this.setSortBy(sortby);
    }
    /**
     * Sets the current sorting mode for this class
     * @function setSortBy
     * @memberof elation.elements.ui.list#
     * @param {string} sortby
     */
    setSortBy(sortby) {
      if (this.sortby && elation.utils.isString(this.sortby)) {
        this.removeclass('ui_list_sortby_' + this.sortby);
      }
      this.sortby = sortby;
      if (elation.utils.isString(this.sortby)) {
        this.addclass('ui_list_sortby_' + this.sortby);
      }
    }
    /**
     * Returns a list of which items are currently visible in this list
     * @function getVisibleItems
     * @memberof elation.elements.ui.list#
     * @returns {array}
     */
    getVisibleItems() {
      var visible = [];
      for (var i = 0; i < this.listitems.length; i++) { 
        var li = this.listitems[i];
        if (li.offsetTop + li.offsetHeight >= this.scrollTop && li.offsetTop <= this.scrollTop + this.offsetHeight) { 
          //console.log('visible:', i, li.args.item.label); 
          visible.push(i);
        } 
      }
      return visible;
    }
    /**
     * Sets the selection state of all items in the list
     * @function selectall
     * @memberof elation.elements.ui.list#
     * @param {bool} state
     * @param {Array} exclude
     */
    selectall(state, exclude) {
      if (state === undefined) state = true;
      if (exclude === undefined) exclude = [];

      if (state) {
        // select all
        for (var i = 0; i < this.listitems.length; i++) {
          var li = this.listitems[i];
          if (exclude.indexOf(li) == -1 && this.selection.indexOf(li) == -1) {
            li.select(false);
            this.selection.push(li);
          }
        }
      } else {
        // deselect all
        while (this.selection.length > 0) {
          var li = this.selection.pop();
          if (exclude.indexOf(li) == -1) {
            li.unselect();
          }
        }
      }
      this.dispatchEvent({type: 'selectionchange', data: this.selection});
    }
    /**
     * Set the selection array to include the specified item range
     * @function selectrange
     * @memberof elation.elements.ui.list#
     * @param {nunber} start
     * @param {nunber} end
     */
    selectrange(start, end) {
      start = Math.max(0, start);
      end = Math.min(this.listitems.length - 1, end);

      for (let i = 0; i < this.listitems.length; i++) {
        let item = this.listitems[i];
        if (i >= start && i <= end) {
          if (!item.selected) {
            item.select(false);
          }
        } else if (item.selected) {
          item.unselect();
        }
      }
      this.selection = this.listitems.slice(start, end+1);
      this.dispatchEvent({type: 'selectionchange', data: this.selection});
    }
    /**
     * Sets the specified selection as being the last one clicked
     * @function setlastselection
     * @memberof elation.elements.ui.list#
     * @param {elation.elements.ui.item} selection
     */
    setlastselection(selection) {
      if (this.lastselection) {
        this.lastselection.setlastselected(false);
      }
      this.lastselection = selection;
      this.lastselection.setlastselected(true);
    }
    /**
     * Scrolls to the bottom of the list
     * @function scrollToBottom
     * @memberof elation.elements.ui.list#
     */
    scrollToBottom() {
      this.scrollTop = this.scrollHeight;
    }
    /**
     * Is the list currently scrolled to the bottom?
     * @function isScrollAtBottom
     * @memberof elation.elements.ui.list#
     */
    isScrollAtBottom(margin=0) {
      return this.scrollTop + this.offsetHeight >= this.scrollHeight - margin;
    }
    applyAutoScroll(wasScrollAtBottom=true) {
      if (this.autoscroll && wasScrollAtBottom) {
        // Only autoscroll if the list was already near the bottom
        this.scrollToBottom();
        setTimeout(() => this.scrollToBottom(), 10);
      }
    }
    /**
     * Event handler: elation.ui.item#ui_list_item_select
     * @function ui_list_item_select
     * @memberof elation.elements.ui.list#
     * @param {event} ev
     */
    handleSelect(ev) {
      var newselection = ev.element;

      // Ignore select events that bubble up from unrelated elements (eg, <textarea>)
      if (!(ev.element instanceof elation.elements.ui.item)) return;

      if (!ev.ctrlKey && !ev.shiftKey && this.selection.length > 0) {
        // If ctrl key wasn't down, unselect all selected items in the list
        this.selectall(false, [newselection]);
      }

      if (this.multiselect && ev.shiftKey && this.lastselection) {
        // If shift key was down and we had a previous item selected, perform a range-select
        var idx1 = this.listitems.indexOf(this.lastselection);
        var idx2 = this.listitems.indexOf(newselection);
        if (idx1 != -1 && idx2 != -1) {
          var start = Math.min(idx1, idx2);
          var end = Math.max(idx1, idx2);

          let curstart = (this.selection.length > 0 ? this.listitems.indexOf(this.selection[0]) : start),
              curend = (this.selection.length > 0 ? this.listitems.indexOf(this.selection[this.selection.length - 1]) : end);

          if (idx2 < curstart) end = curend;
          if (idx2 > curend) start = curstart;

          for (var i = start; i <= end; i++) {
            if (this.selection.indexOf(this.listitems[i]) == -1) {
              this.listitems[i].select(false);
              this.selection.push(this.listitems[i]);
            }
          }
        }
      } else {
        // Otherwise, perform a single selection
        var idx = this.selection.indexOf(newselection);
        if (idx == -1) {
          this.selection.push(newselection);
        } else {
          this.selection.splice(idx, 1);
          newselection.unselect();
        }
      }

      //if (this.multiselect) {
        // Make note of the most recently-clicked list item, for future interaction
        this.setlastselection(newselection);
      //}
      if (elation.events.wasDefaultPrevented(elation.events.fire({type: 'select', element: this, target: ev.element, data: ev.data}))) {
        ev.preventDefault();
      }
      this.dispatchEvent({type: 'selectionchange', data: this.selection});
    }
    /**
     * Event handler: elation.collection.simple#collection_add
     * @function oncollection_add
     * @memberof elation.elements.ui.list#
     * @param {event} ev
     */
    oncollection_add(ev) {
      let wasScrollAtBottom = this.isScrollAtBottom(this.autoscrollmargin);
      this.refresh();
      this.applyAutoScroll(wasScrollAtBottom);
    }
    /**
     * Event handler: elation.collection.simple#collection_remove
     * @function oncollection_remove
     * @memberof elation.elements.ui.list#
     * @param {event} ev
     */
    oncollection_remove(ev) {
      let wasScrollAtBottom = this.isScrollAtBottom(this.autoscrollmargin);
      this.refresh();
      this.applyAutoScroll(wasScrollAtBottom);
    }
    /**
     * Event handler: elation.collection.simple#collection_move
     * @function oncollection_move
     * @memberof elation.elements.ui.list#
     * @param {event} ev
     */
    oncollection_move(ev) {
      this.refresh();
    }
    /**
     * Event handler: elation.collection.simple#collection_load_begin
     * @function oncollection_load_begin
     * @memberof elation.elements.ui.list#
     * @param {event} ev
     */
    oncollection_load_begin(ev) {
      this.clear();
      var ul = this.getListElement();
      ul.innerHTML = '';
      if (this.spinner) {
        this.appendChild(this.spinner);
        this.spinner.show();
      }
    }
    /**
     * Event handler: elation.collection.simple#collection_load
     * @function oncollection_load
     * @memberof elation.elements.ui.list#
     * @param {event} ev
     */
    oncollection_load(ev) {
      let wasScrollAtBottom = this.isScrollAtBottom(this.autoscrollmargin);
      if (this.spinner) {
        this.removeChild(this.spinner);
      }
      this.refresh();
      this.applyAutoScroll(wasScrollAtBottom);
    }
    /**
     * Event handler: elation.collection.simple#collection_clear
     * @function oncollection_clear
     * @memberof elation.elements.ui.list#
     * @param {event} ev
     */
    oncollection_clear(ev) {
      this.clear();
      var ul = this.getListElement();
      ul.innerHTML = '';
      this.refresh();
      this.applyAutoScroll(true);
    }

    /**
     * Event handler: keydown
     * @function handleKeydown
     * @memberof elation.elements.ui.list#
     * @param {event} ev
     */
    handleKeydown(ev) {
      let dirh = 0, dirv = 0;
      if (ev.key == 'ArrowUp') {
        dirv = -1;
        ev.stopPropagation();
        ev.preventDefault();
      } else if (ev.key == 'ArrowDown') {
        dirv = 1;
        ev.stopPropagation();
        ev.preventDefault();
      } else if (ev.key == 'ArrowLeft') {
        dirh = -1;
        ev.stopPropagation();
        ev.preventDefault();
      } else if (ev.key == 'ArrowRight') {
        dirh = 1;
        ev.stopPropagation();
        ev.preventDefault();
      }
      let selstart = this.listitems.indexOf(this.selection[0]),
          selend = this.listitems.indexOf(this.selection[this.selection.length - 1]);
      if (dirv != 0) {
        if (this.lastselection) {
          let leftpos = this.lastselection.offsetLeft;
          let idx = this.listitems.indexOf(this.lastselection);
          for (let i = idx + dirv; i >= 0 && i < this.listitems.length; i += dirv) {
            if (this.listitems[i].offsetLeft == leftpos) {
              let newselection = this.listitems[i];
              newselection.select();
              if (ev.shiftKey) {
                let newidx = i;
                if (newidx < selstart && dirv == -1) selstart = newidx;
                else if (newidx > selend && dirv == 1) selend = newidx;
                else if (newidx < selend && newidx >= selstart && dirv == -1 && !(idx == 0 && selstart == 0)) selend = newidx;
                else if (newidx > selstart && newidx <= selend && dirv == 1 && !(idx == this.listitems.length - 1 && selend == this.listitems.length - 1)) selstart = newidx;
                this.selectrange(selstart, selend);
              }
              if (newselection.offsetTop < this.scrollTop || newselection.offsetTop + newselection.offsetHeight > this.scrollTop + this.offsetHeight) {
                newselection.scrollIntoView({behavior: 'smooth', block: 'nearest'});
              }
              break;
            }
          }
        }
      }
      if (dirh != 0) {
        if (this.lastselection) {

          let idx = this.listitems.indexOf(this.lastselection);
          let newidx = Math.max(0, Math.min(this.listitems.length - 1, idx + dirh));
          let newselection = this.listitems[newidx];
          newselection.select();
          if (ev.shiftKey) {
            if (newidx < selstart && dirh == -1) selstart = newidx;
            else if (newidx > selend && dirh == 1) selend = newidx;
            else if (newidx < selend && newidx >= selstart && dirh == -1 && !(idx == 0 && selstart == 0)) selend = newidx;
            else if (newidx > selstart && newidx <= selend && dirh == 1 && !(idx == this.listitems.length - 1 && selend == this.listitems.length - 1)) selstart = newidx;
            this.selectrange(selstart, selend);
          }

          if (newselection.offsetTop < this.scrollTop || newselection.offsetTop + newselection.offsetHeight > this.scrollTop + this.offsetHeight) {
            newselection.scrollIntoView({bbbbehavior: 'smooth', block: 'nearest'});
          }
        }
      }
    }
    handleClick(ev) {
      if (ev.target === this && this.selection.length > 0) {
        this.selectall(false);
      }
    }

    /**
     * Drag/drop reorder support. Activated when the list has `draggable`
     * set; the framework then makes each child item draggable and handles
     * the dragstart/dragover/drop sequence to commit the reorder back to
     * the underlying items array (or the bound collection, for
     * collection-backed lists).
     *
     * @function handleDragStart
     * @memberof elation.elements.ui.list#
     * @param {DragEvent} ev
     */
    handleDragStart(ev) {
      const item = this._dragItemFromEvent(ev);
      if (!item) return;
      this._dragItem = item;
      this._dragOriginIdx = this.listitems.indexOf(item);
      item.classList.add('state_dragging');
      ev.dataTransfer.effectAllowed = 'move';
      try { ev.dataTransfer.setData('text/plain', ''); } catch (e) {}
    }

    /**
     * @function handleDragOver
     * @memberof elation.elements.ui.list#
     * @param {DragEvent} ev
     */
    handleDragOver(ev) {
      if (!this._dragItem) return;
      ev.preventDefault();
      ev.dataTransfer.dropEffect = 'move';

      const target = this._dragItemFromEvent(ev);
      if (!target || target === this._dragItem || target.parentNode !== this) return;

      // Vertical lists check Y; grids and inline-direction lists check X.
      const rect = target.getBoundingClientRect();
      const horizontal = rect.width > rect.height * 1.5;
      const cursor = horizontal ? ev.clientX : ev.clientY;
      const mid    = horizontal ? rect.left + rect.width / 2 : rect.top + rect.height / 2;
      const ref = (cursor < mid) ? target : target.nextSibling;
      if (this._dragItem !== ref && this._dragItem.nextSibling !== ref) {
        this.insertBefore(this._dragItem, ref);
      }
    }

    /**
     * @function handleDrop
     * @memberof elation.elements.ui.list#
     * @param {DragEvent} ev
     * @emits reorder
     */
    handleDrop(ev) {
      if (!this._dragItem) return;
      ev.preventDefault();
      // The dragover live-shifted the item; just count its new index.
      let newIdx = 0;
      for (const li of this.listitems) {
        if (li === this._dragItem) continue;
        if (this._dragItem.compareDocumentPosition(li) & Node.DOCUMENT_POSITION_PRECEDING) {
          newIdx++;
        }
      }
      this.commitReorder(this._dragItem, this._dragOriginIdx, newIdx);
    }

    /**
     * @function handleDragEnd
     * @memberof elation.elements.ui.list#
     */
    handleDragEnd(ev) {
      if (this._dragItem) this._dragItem.classList.remove('state_dragging');
      this._dragItem = null;
      this._dragOriginIdx = -1;
    }

    _dragItemFromEvent(ev) {
      if (!ev.target || !ev.target.closest) return null;
      // Match any direct ui.item descendant — covers ui-item, ui-tab,
      // ui-checklistitem, etc., since they all extend ui.item.
      let el = ev.target;
      while (el && el !== this) {
        if (el.parentNode === this && el instanceof elation.elements.ui.item) return el;
        el = el.parentNode;
      }
      return null;
    }

    /**
     * Commit a drag-reorder, syncing both the listitems[] cache and the
     * underlying items array (or bound collection).
     *
     * @function commitReorder
     * @memberof elation.elements.ui.list#
     * @param {elation.elements.ui.item} item   listitem element being moved
     * @param {integer} fromIdx
     * @param {integer} toIdx
     * @emits reorder
     */
    commitReorder(item, fromIdx, toIdx) {
      if (fromIdx === toIdx || fromIdx < 0) return;

      // Sync the listitems[] cache so subsequent renders see the new order.
      const liIdx = this.listitems.indexOf(item);
      if (liIdx !== -1) {
        this.listitems.splice(liIdx, 1);
        this.listitems.splice(toIdx, 0, item);
      }

      // Resolve the data item this listitem represents and move it in
      // whichever data source backs the list.
      let dataItem;
      if (this.itemcollection && this.itemcollection.items) {
        dataItem = this.itemcollection.items[fromIdx];
      } else if (this.items && this.items[fromIdx] === item) {
        dataItem = item;
      } else {
        dataItem = (item.value !== undefined) ? item.value : item;
      }

      if (this.itemcollection && typeof this.itemcollection.move === 'function') {
        this.itemcollection.move(dataItem, toIdx);
      } else if (this.items && typeof this.items.splice === 'function') {
        const idx = this.items.indexOf(dataItem);
        if (idx !== -1) {
          const x = this.items.splice(idx, 1)[0];
          this.items.splice(toIdx, 0, x);
        }
      }

      this.dispatchEvent({type: 'reorder', data: {item, fromIdx, toIdx}});
    }
  });
})();
// ===== END COMPONENT: elements.ui.list =====

// ===== BEGIN COMPONENT: elements.ui.dropdownbutton ====
(
function() {
  elation.requireCSS('ui.dropdownbutton');

  /**
   * Native-select-style dropdown. The trigger displays the currently
   * selected option's label. On mousedown, the popup opens with the
   * selected option centred on the cursor; mousemove highlights the
   * option underneath; release on an option commits the selection.
   * A mousedown / mouseup with no movement leaves the popup open in
   * "lazy" mode so the user can browse and click an option in their
   * own time. A second click on the trigger closes the popup; clicks
   * outside also close.
   *
   * @class dropdownbutton
   * @hideconstructor
   * @category UI
   * @augments elation.elements.ui.list
   * @memberof elation.elements.ui
   * @example
   * <ui-dropdownbutton label="Choose…">
   *   <ui-button label="Edit"></ui-button>
   *   <ui-button label="Duplicate"></ui-button>
   *   <ui-button label="Delete"></ui-button>
   * </ui-dropdownbutton>
   *
   * @param {object} args
   * @param {string} args.label fallback trigger label until the user picks an option
   * @param {boolean} args.open
   */
  elation.elements.define('ui.dropdownbutton', class extends elation.elements.ui.list {
    init() {
      super.init();
      this.defineAttributes({
        label: { type: 'string' },
        value: { type: 'string' },
        open:  { type: 'boolean', default: false }
      });
    }
    create() {
      // Create the popup container before super.create() so getListElement
      // routes ui-list's render output into the popup, not the dropdown root.
      this.optionsHost = elation.html.create({
        tag: 'div',
        classname: 'ui_dropdown_options',
        append: this
      });

      super.create();

      this.trigger = elation.html.create({
        tag: 'span',
        classname: 'ui_dropdown_trigger',
        append: this
      });
      this.insertBefore(this.trigger, this.optionsHost);

      this._dragging = false;
      this._dragStartX = 0;
      this._dragStartY = 0;
      this._hover = null;
      this.selected = null;

      this._initSelection();
      this._buildTriggerLabels();

      // The dropdown is a single tab stop; the options inside it are
      // navigated via keyboard within the dropdown itself, not via Tab.
      this.setAttribute('tabindex', '0');
      // Strip child options out of the tab order. ui-button.create() sets
      // tabindex=0 on each, and that runs after our create() (queued
      // separately via the connect-time setTimeout), so defer this one tick.
      setTimeout(() => {
        this._options().forEach((opt) => opt.setAttribute('tabindex', '-1'));
      }, 0);

      // Bound handlers we need to add and remove from the window.
      this._onMouseMove   = (ev) => this._handleMouseMove(ev);
      this._onMouseUp     = (ev) => this._handleMouseUp(ev);
      this._onOutsideClick = (ev) => {
        if (!this.contains(ev.target)) this.setOpen(false);
      };

      this.addEventListener('mousedown', (ev) => this._handleMouseDown(ev));
      this.addEventListener('click',     (ev) => this._handleClick(ev));
      this.addEventListener('keydown',   (ev) => this._handleKeydown(ev));
    }
    /**
     * @function getListElement
     * @memberof elation.elements.ui.dropdownbutton#
     * @override
     */
    getListElement() {
      return this.optionsHost || this;
    }
    _options() {
      return this.optionsHost ? Array.from(this.optionsHost.children) : [];
    }
    _initSelection() {
      const opts = this._options();
      if (!opts.length) return;
      // Pick the first option marked `selected` or `active`, otherwise the first.
      const initial = opts.find(o => o.hasAttribute('selected') || o.hasAttribute('active'));
      this.selected = initial || opts[0];
      this.selected.classList.add('state_selected');
      this.value = this.selected.label || (this.selected.textContent || '').trim();
    }
    _buildTriggerLabels() {
      // Stack a hidden span for every option inside the trigger; only the
      // active one is visible. Browser sizes the trigger to the widest
      // span, so picking a different option doesn't change the dropdown
      // width.
      if (!this.trigger) return;
      this.trigger.innerHTML = '';
      this._optionLabels = this._options().map((opt) => {
        const text = (opt.label !== undefined && opt.label !== null)
          ? opt.label
          : ((opt.textContent || '').trim());
        const span = document.createElement('span');
        span.className = 'ui_dropdown_label';
        span.textContent = text;
        this.trigger.appendChild(span);
        return { opt, span };
      });
      this._updateTriggerLabel();
    }
    _updateTriggerLabel() {
      if (!this.trigger) return;
      if (!this._optionLabels || !this._optionLabels.length) {
        this.trigger.innerHTML = this.label || '';
        return;
      }
      this._optionLabels.forEach(({ opt, span }) => {
        if (opt === this.selected) span.setAttribute('data-active', '');
        else span.removeAttribute('data-active');
      });
    }
    _optionAt(ev) {
      const el = document.elementFromPoint(ev.clientX, ev.clientY);
      if (!el) return null;
      const opt = el.closest && el.closest('ui-button');
      if (opt && this.optionsHost && this.optionsHost.contains(opt)) return opt;
      return null;
    }
    _highlight(opt) {
      if (this._hover === opt) return;
      // Use the framework's existing [hover] attribute so themes that
      // style ui-button[hover] pick this up automatically.
      if (this._hover) this._hover.hover = false;
      this._hover = opt;
      if (opt) opt.hover = true;
    }
    _alignSelectedToCursor(ev) {
      if (!this.selected || !this.optionsHost) return;
      // Reset any leftover transform before measuring.
      this.optionsHost.style.transform = '';
      const rect = this.selected.getBoundingClientRect();
      const optionMid = rect.top + rect.height / 2;
      const shift = ev.clientY - optionMid;
      this.optionsHost.style.transform = 'translateY(' + Math.round(shift) + 'px)';
    }
    _select(opt) {
      if (!opt) return;
      if (this.selected) this.selected.classList.remove('state_selected');
      this.selected = opt;
      opt.classList.add('state_selected');
      this.value = opt.label || (opt.textContent || '').trim();
      this._updateTriggerLabel();
      this._highlight(null);
      this.dispatchEvent({type: 'select', data: { item: opt, label: opt.label, value: this.value }});
      this.setOpen(false);
    }
    _handleMouseDown(ev) {
      if (ev.button !== 0) return;
      // mousedown inside the popup itself (lazy-mode click on an option)
      // is handled in _handleClick — fall through here.
      if (this.open && this.optionsHost && this.optionsHost.contains(ev.target)) return;

      if (this.open) {
        // Second click on the trigger while open → close.
        this.setOpen(false);
        return;
      }

      this._dragStartX = ev.clientX;
      this._dragStartY = ev.clientY;
      this._dragStartTime = Date.now();
      this._dragging = true;

      this.setOpen(true);
      this._alignSelectedToCursor(ev);
      this._highlight(this._optionAt(ev));

      window.addEventListener('mousemove', this._onMouseMove);
      window.addEventListener('mouseup',   this._onMouseUp);

      ev.preventDefault();   // suppress text selection during drag
    }
    _handleMouseMove(ev) {
      if (!this._dragging) return;
      this._highlight(this._optionAt(ev));
    }
    _handleMouseUp(ev) {
      if (!this._dragging) return;
      this._dragging = false;
      window.removeEventListener('mousemove', this._onMouseMove);
      window.removeEventListener('mouseup',   this._onMouseUp);

      const moved = Math.abs(ev.clientY - this._dragStartY) > 4 ||
                    Math.abs(ev.clientX - this._dragStartX) > 4;
      const heldMs = Date.now() - this._dragStartTime;
      const opt = this._optionAt(ev);

      if (moved && opt) {
        // Route through opt.click() so the option's own click listeners
        // fire and the click bubbles into our _handleClick (which then
        // calls _select). The browser may also synthesize a click on
        // the lowest common ancestor of the mousedown/mouseup targets
        // (the dropdown itself) once mouseup returns — set the
        // suppression flag *after* the synthetic click so that one
        // gets stopped instead.
        opt.click();
        this._suppressNextClick = true;
      } else if (moved && !opt) {
        this._suppressNextClick = true;
        this.setOpen(false);
      } else if (heldMs > 250) {
        this._suppressNextClick = true;
        this.setOpen(false);
      }
      // else: quick click — let the click event flow naturally (the
      // user just toggled the popup open in lazy mode; that's a real
      // dropdown-click consumers may want to know about).
    }
    _handleClick(ev) {
      // Suppress the post-drag synthesized click so it doesn't reach
      // consumer click-listeners as a spurious dropdown-click.
      if (this._suppressNextClick) {
        this._suppressNextClick = false;
        ev.stopImmediatePropagation();
        return;
      }
      // Lazy-mode option click. The drag path handles its own selection
      // in _handleMouseUp; this only fires when the popup is already open
      // and the user separately clicks an option.
      if (this._dragging) return;
      if (!this.open) return;
      const opt = ev.target.closest && ev.target.closest('ui-button');
      if (opt && this.optionsHost && this.optionsHost.contains(opt)) {
        // The click should be treated as an option-selection, not a
        // generic dropdown-click. Stop further propagation and any
        // sibling click-listeners on the dropdown itself.
        ev.stopImmediatePropagation();
        this._select(opt);
      }
    }
    /**
     * Keyboard interactions:
     * - Enter / Space: open the popup (or commit highlighted option if open)
     * - ArrowDown / ArrowUp: cycle the highlighted option (opens if closed)
     * - Escape: close without changing
     * @function _handleKeydown
     * @memberof elation.elements.ui.dropdownbutton#
     * @param {KeyboardEvent} ev
     */
    _handleKeydown(ev) {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        if (this.open) {
          if (this._hover) {
            // Route through the option's native click so click-listeners
            // (including the framework's bubble path into _handleClick)
            // fire alongside our own 'select' event.
            this._hover.click();
          } else {
            this.setOpen(false);
          }
        } else {
          this.setOpen(true);
          if (this.selected) this._highlight(this.selected);
        }
      } else if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
        ev.preventDefault();
        if (!this.open) {
          this.setOpen(true);
          this._highlight(this.selected || this._options()[0]);
        } else {
          this._navigateHighlight(ev.key === 'ArrowDown' ? 1 : -1);
        }
      } else if (ev.key === 'Escape' && this.open) {
        ev.preventDefault();
        this.setOpen(false);
      }
    }
    _navigateHighlight(dir) {
      const opts = this._options();
      if (!opts.length) return;
      let idx = this._hover ? opts.indexOf(this._hover)
              : (this.selected ? opts.indexOf(this.selected) : -1);
      if (idx === -1) idx = (dir > 0) ? -1 : opts.length;
      idx = (idx + dir + opts.length) % opts.length;
      this._highlight(opts[idx]);
    }
    /**
     * @function setOpen
     * @memberof elation.elements.ui.dropdownbutton#
     * @param {boolean} open
     */
    setOpen(open) {
      if (!!this.open === !!open) return;
      this.open = !!open;
      if (this.open) {
        this.addclass('state_open');
        // Defer outside-click attachment so the click that opened us
        // doesn't immediately re-close us when it bubbles to window.
        setTimeout(() => {
          window.addEventListener('click', this._onOutsideClick, true);
        }, 0);
      } else {
        this.removeclass('state_open');
        window.removeEventListener('click', this._onOutsideClick, true);
        if (this.optionsHost) this.optionsHost.style.transform = '';
        this._highlight(null);
      }
    }
  });
})();
// ===== END COMPONENT: elements.ui.dropdownbutton =====

// ===== BEGIN COMPONENT: elements.ui.popupbutton ====
(
function() {
  /**
   * Button that shows and hides a popup on click. The popup is a headless
   * `ui.window` whose content is taken from `popupcontent` (a string of
   * HTML or an `HTMLElement`). Clicking outside the popup closes it.
   * Set `detached` to float the popup at document root instead of
   * anchoring it to the button.
   *
   * @class popupbutton
   * @hideconstructor
   * @category UI
   * @augments elation.elements.ui.button
   * @memberof elation.elements.ui
   * @example
   * <ui-popupbutton label="More..." popupcontent="<p>Popup body</p>"></ui-popupbutton>
   *
   * @param {object} args
   * @param {boolean} args.active
   * @param {object} args.popupcontent
   * @param {boolean} args.detached
   */
  elation.elements.define('ui.popupbutton', class extends elation.elements.ui.button {
    init() {
      super.init();
      this.defineAttributes({
        active: { type: 'boolean', default: false },
        popupcontent: { type: 'object' },
        detached: { type: 'boolean', default: false },
      });
    }
    create() {
      super.create();
      //this.addEventListener('click', (ev) => this.handleClick(ev));
    }
    handleClick(ev) {
      if (!this.popup) {
        this.createPopup();
      } else {
        if (this.popup.parentNode === this) {
          if (!elation.utils.isin(this.popup, ev.target)) {
            this.hidePopup();
          }
        } else {
          this.showPopup();
        }
      }
    }
    handleWindowClick(ev) {
      // Separate click handler to hide the window if the user clicks anywhere in the window that's not inside the popup window
      if (!(elation.utils.isin(this, ev.target) || elation.utils.isin(this.popup, ev.target))) {
        this.hidePopup();
      }
    }
    createPopup() {
      let content = this.popupcontent;
      if (elation.utils.isString(content)) {
        // ui.content has no fromString helper; just set innerHTML directly.
        const wrapper = elation.elements.create('ui-content');
        wrapper.innerHTML = this.popupcontent;
        content = wrapper;
      }
      // The popup is a chrome-less ui-window. Don't pass top/bottom/left/right
      // as args — those flow through ui-panel's anchor type, which would snap
      // the popup to a viewport edge. Position directly via inline styles
      // instead.
      const winargs = {
        movable: false,
        controls: false,
        minimizable: '0',
        maximizable: '0',
        closable: '0',
        resizable: '0',
      };
      if (this.detached) {
        const pos = this.getBoundingClientRect();
        this.popup = elation.elements.create('ui.window', Object.assign({ append: document.body }, winargs));
        this.popup.style.top = (pos.bottom + window.scrollY + 4) + 'px';
        this.popup.style.left = (pos.left + window.scrollX) + 'px';
      } else {
        this.popup = elation.elements.create('ui.window', Object.assign({ append: this }, winargs));
        // Anchored below the button: top = button height (100% of containing
        // block), left edge aligned, small visual gap.
        this.popup.style.top  = '100%';
        this.popup.style.left = '0';
        this.popup.style.marginTop = '4px';
      }
      this.popup.classList.add('state_popup');
      this.popup.setcontent(content);
      this.windowClickHandler = (ev) => this.handleWindowClick(ev);
      window.addEventListener('click', this.windowClickHandler);
    }
    showPopup() {
      if (!this.popup) {
        this.createPopup();
      } else if (!this.popup.parentNode) {
        if (this.detached) {
          document.body.appendChild(this.popup);
          setTimeout(() => this.popup.refresh(), 0);
        } else {
          this.appendChild(this.popup);
        }
        window.addEventListener('click', this.windowClickHandler);
      }
    }
    hidePopup() {
      if (this.popup && this.popup.parentNode) {
        this.popup.parentNode.removeChild(this.popup);
        window.removeEventListener('click', this.windowClickHandler);
      }
    }
  });
})();
// ===== END COMPONENT: elements.ui.popupbutton =====

// ===== BEGIN COMPONENT: elements.ui.indicator ====
(
function() {
  /**
   * Notification count badge. Displays an integer and keeps its
   * `aria-label` in sync for screen readers. Typically composed into
   * other elements like `ui.notificationbutton`.
   *
   * @class indicator
   * @hideconstructor
   * @category UI
   * @augments elation.elements.base
   * @memberof elation.elements.ui
   * @example
   * <ui-indicator value="5"></ui-indicator>
   *
   * @param {object} args
   * @param {integer} args.value
   */
  elation.elements.define('ui.indicator', class extends elation.elements.base {
    init() {
      super.init();
      this.defineAttributes({
        value: { type: 'integer', default: 0, set: this.updateValue }
      });
    }
    create() {
      this.setAttribute('aria-label', 'No new notifications');
      this.updateValue();
    }
    updateValue() {
      this.innerHTML = this.value;
      this.setAttribute('aria-label', this.value + ' new notifications');
    }
  });
})();
// ===== END COMPONENT: elements.ui.indicator =====

// ===== BEGIN COMPONENT: elements.ui.notificationbutton ====
(
function() {
  /**
   * Button that renders a `ui.indicator` badge alongside its label. Setting
   * `count` updates the badge; a count of zero hides it via CSS.
   *
   * @class notificationbutton
   * @hideconstructor
   * @category UI
   * @augments elation.elements.ui.button
   * @memberof elation.elements.ui
   * @example
   * <ui-notificationbutton label="Inbox" count="3"></ui-notificationbutton>
   *
   * @param {object} args
   * @param {integer} args.count
   */
  elation.elements.define('ui.notificationbutton', class extends elation.elements.ui.button {
    init() {
      super.init();
      this.defineAttributes({
        count: { type: 'integer', default: 0, set: this.updateCount }
      });
      if (this.preview) {
        this.count = 3;
        this.label = 'Notifications';
      }
    }
    create() {
      super.create();
      this.indicator = elation.elements.create('ui.indicator', {
        value: this.count,
        append: this
      });
    }
    updateCount() {
      if (this.indicator) {
        this.indicator.value = this.count;
      }
    }
  });
})();
// ===== END COMPONENT: elements.ui.notificationbutton =====

// ===== BEGIN COMPONENT: elements.ui.buttonbar ====
(
function() {
  elation.requireCSS('ui.buttonbar');

  elation.elements.define('ui.buttonbar', class extends elation.elements.ui.list {
    init() {
      super.init();
      this.defineAttributes({
        'label': { type: 'string' },
        'itemcomponent': { type: 'string', default: 'ui.button' }
      });
    }
    create() {
      //this.buttonelements = [];
      if (this.preview) {
        this.items = [{value: 1, label: 'One'}, {value: 2, label: 'Two'}, {value: 2, label: 'Three'}];
      }
      if (this.collection) {
        this.setItemCollection(this.collection);
      } else if (this.buttons) {
        this.createButtons(this.buttons);
      } else if (this.items && this.items.length > 0) {
        this.createButtons(this.items);
      } else {
        this.extractButtons();
      }
      if (this.label) {
        this.labelobj = elation.elements.create('ui.label', {
          append: this,
          before: this.firstChild,
          label: this.label
        });
      }
    }
    createButton(buttonargs) {
      return elation.elements.create(this.itemcomponent, buttonargs);
    }
    createButtons(buttons) {
      for (var i in buttons) {
        var buttonargs = buttons[i];
        //var button = elation.ui.button(null, elation.html.create({tag: 'button', append: this.container}), buttonargs, buttonargs.events);
        //var button = (buttonargs.toggle ? elation.ui.togglebutton(buttonargs) : elation.ui.button(buttonargs));
        var button = (buttonargs instanceof elation.elements.ui.button ? buttonargs : this.createButton(buttons[i]));
        this.appendChild(button);
        this.items[i] = button;
      }
    }
    setButtons(buttons) {
      this.items = [];
      for (var i = 0; i < buttons.length; i++) {
        var button = this.createButton(buttons[i]);
        if (!this.items[i]) {
          this.appendChild(button);
        } else if (this.items[i] !== button) {
          this.insertBefore(button, this.items[i]);
          this.removeChild(this.items[i]);
        }
        this.items[i] = button;
      }
      while (buttons.length < this.items.length) {
        var olditem = this.items.pop();
        this.removeChild(olditem);
      }
    }
    extractButtons() {
      var buttons = [];
      for (var i = 0; i < this.childNodes.length; i++) {
        var node = this.childNodes[i];
        if (node instanceof elation.elements.ui.button) {
          //items.push({label: node.innerHTML});
          this.items.push(node);
        }
      }
      //this.buttons = buttons;
    }
    add(name, button) {
      this.buttons[name] = button;
      button.reparent(this.container);
    }
    enable() {
      super.enable();
      for (var k in this.buttons) {
        this.buttons[k].disabled = false;
      }
    }
    disable() {
      super.disable();
      for (var k in this.buttons) {
        this.buttons[k].disabled = true;
      }
    }
  });
})();
// ===== END COMPONENT: elements.ui.buttonbar =====

// ===== BEGIN COMPONENT: elements.ui.radiobuttonbar ====
(
function() {
  elation.elements.define('ui.radiobuttonbar', class extends elation.elements.ui.buttonbar {
    init() {
      super.init();
      this.defineAttributes({
        'itemcomponent': { type: 'string', default: 'ui.togglebutton' }
      });
    }
    create() {
      super.create();
      for (let i = 0; i < this.items.length; i++) {
        if (this.items[i].active) {
          if (!this.activebutton) {
            this.activebutton = this.items[i];
          } else {
            this.items[i].active = false;
          }
        }
        elation.events.add(this.items[i], 'activate', (ev) => this.handleButtonActivate(ev));
        elation.events.add(this.items[i], 'deactivate', (ev) => this.handleButtonDeactivate(ev));
      }
      if (!this.activebutton) {
        this.items[0].activate();
      }
    }
    handleButtonActivate(ev) {
      let button = ev.target;
      if (button !== this.activebutton) {
        this.dispatchEvent({type: 'change', data: button.value});
        this.activebutton = button;
      }
      for (let i = 0; i < this.items.length; i++) {
        if (this.items[i] !== button && this.items[i].active) {
          this.items[i].deactivate();
        }
      }
    }
    handleButtonDeactivate(ev) {
      // Prevent the active button from being deactivated
      if (ev.target === this.activebutton) {
        ev.preventDefault();
      }
    }
  });
})();
// ===== END COMPONENT: elements.ui.radiobuttonbar =====

// ===== BEGIN COMPONENT: elements.ui.buttonlist ====
(
function() {
  elation.elements.define('ui.buttonlist', class extends elation.elements.ui.buttonbar {
  });
})();
// ===== END COMPONENT: elements.ui.buttonlist =====

// ===== BEGIN COMPONENT: elements.ui.input ====
(
function() {
  /**
   * Single-line text input. Fires `change` on blur, `accept` on Enter,
   * and `cancel` on Escape.
   *
   * @class input
   * @hideconstructor
   * @category UI
   * @augments elation.elements.base
   * @memberof elation.elements.ui
   * @example
   * <ui-input placeholder="Name" value="Ada"></ui-input>
   *
   * @param {object} args
   * @param {string} args.type
   * @param {string} args.value
   * @param {string} args.inputname
   * @param {string} args.placeholder
   * @param {string} args.enterkeyhint
   * @param {boolean} args.disabled
   * @param {boolean} args.hidden
   * @param {boolean} args.autofocus
   */

  elation.elements.define('ui.input', class extends elation.elements.base {
    /** 
     * Initialize component
     * @function init
     * @memberof elation.elements.ui.input#
     */
    init() {
      super.init();
      this.defineAttributes({
        hidden: { type: 'boolean', default: false },
        label: { type: 'string' },
        type: { type: 'string' },
        placeholder: { type: 'string' },
        enterkeyhint: { type: 'string', default:"enter" },
        value: { type: 'string', get: this.getValue, set: this.setValue },
        disabled: { type: 'boolean', default: false },
        autofocus: { type: 'boolean', get: this.getAutofocus, set: this.setAutofocus },
        onaccept: { type: 'callback' },
      });

      if (this.preview) {
        this.value = 'Lorem ipsum dolor sit amet...';
      }
    }
    create() {
      if (this.label) {
        //this.labelobj = elation.ui.label({ append: this, label: this.label });
        this.labelobject = elation.elements.create('ui.label', { append: this, label: this.label });
        elation.events.add(this.labelobject, 'click', (ev) => { this.focus(); ev.stopPropagation(); });
      }

      this.inputelement = elation.html.create({tag: 'input', append: this});

      if (this.type) { 
        this.inputelement.type = this.type;
      }

      for (var k in this.events) {
        elation.events.add(this.inputelement, k, this.events[k]);
      }

      if (this.hidden) this.hide();

      if (this.placeholder) {
        this.inputelement.placeholder = this.placeholder;
      }

      this.inputelement.enterkeyhint = this.enterkeyhint;

      let value = this.value;
      elation.events.add(this, 'keydown', this.handlekeydown.bind(this));
      this.addEventProxies(this.inputelement, 'keyup,keypress,focus,blur,input,select,change');
      this.addPropertyProxies(this.inputelement, 'value,disabled,autofocus,form,name,type,required,placeholder');
      if (value) {
        this.value = value;
      }

      elation.events.add(this, 'focus', this.handlefocus.bind(this));

      // Set up object setters/getters to bridge with HTML element attributes
/*
      Object.defineProperty(this, "value", { get: function() { return this.inputelement.value; }, set: function(v) { this.inputelement.value = v; } });
      Object.defineProperty(this, "disabled", { get: function() { return this.inputelement.disabled; }, set: function(v) { this.inputelement.disabled = v; } });
      Object.defineProperty(this, "autofocus", { get: function() { return this.inputelement.autofocus; }, set: function(v) { this.inputelement.autofocus = v; } });
*/

      if (this.name) {
        this.inputelement.name = this.name;
      }
      if (this.placeholder) {
        this.inputelement.placeholder = this.placeholder;
      }
      if (this.disabled) {
        this.inputelement.disabled = true;
      }
      if (this.autofocus) {
        this.inputelement.autofocus = true;
      }
      if (this.value) {
        this.inputelement.value = this.value;
      }
    }
    /**
     * Mark this component as being enabled
     * @function enable
     * @memberof elation.elements.ui.input#
     */
    enable() {
      this.disabled = false;
    }
    /** Mark this component as being disabled
     * @function disable
     * @memberof elation.elements.ui.input#
     */
    disable() {
      this.disabled = true;
    }
    /** Sets this input element as focused
     * @function focus
     * @memberof elation.elements.ui.input#
     */
    focus() {
      if (this.inputelement) {
        this.inputelement.focus();
      }
      //this.dispatchEvent({type: 'focus'});
    }
    /** Removes focus from this input element
     * @function blur
     * @memberof elation.elements.ui.input#
     */
    blur() {
      this.inputelement.blur();
      //this.dispatchEvent({type: 'blur'});
    }
    /** Accepts the current value of the input component and emit appropriate events
     * @function accept
     * @memberof elation.elements.ui.input#
     * @fire elation.ui.input#ui_input_accept
     */
    accept(ev) {
      this.blur();
      this.dispatchEvent({
        type: 'accept',
        data: this.value,
        shiftKey: ev && ev.shiftKey,
        altKey: ev && ev.altKey,
        ctrlKey: ev && ev.ctrlKey,
        metaKey: ev && ev.metaKey,
      });
    }
    /** Restore input value to what it was before editing began and emit appropriate events
     * @function cancel
     * @memberof elation.elements.ui.input#
     * @fire elation.ui.input#ui_input_cancel
     */
    cancel() {
      if (!elation.utils.isNull(this.lastvalue) && this.lastvalue != this.value) {
        this.value = this.lastvalue;
        this.dispatchEvent({type: 'cancel', data: this.value});
      }
      this.blur();
    }
    /** Select all text
     * @function selectall
     * @memberof elation.elements.ui.input#
     * @fire elation.ui.input#ui_input_select
     */
    select() {
      this.inputelement.setSelectionRange(0, this.value.length)
      this.dispatchEvent({type: 'select', data: this.value});
    }
    /**
     * Reset input to blank, optionally focusing it
     * @function clear
     * @memberof elation.elements.ui.input#
     * @param focus boolean force focus on this component
     * @fire elation.ui.input#ui_input_clear
     */
    clear(focus) {
      this.value = "";
      this.lastvalue = "";
      if (focus) {
        this.focus();
      }
      this.dispatchEvent({type: 'clear', data: this.value});
    }
    /**
     * Event handler for HTML input element's keydown event
     * @function handlekeydown
     * @memberof elation.elements.ui.input#
     * @param ev event
     */
    handlekeydown(ev) {
      switch (ev.keyCode) {
        case 13: // enter
          this.accept(ev);
          break;
        case 27: // esc
          this.cancel();
          break;
      } 
    }
    /**
     * Event handler for HTML input element's focus event
     * @function handlefocus
     * @memberof elation.elements.ui.input#
     * @param ev event
     */
    handlefocus(ev) {
      this.lastvalue = this.value;
      //this.dispatchEvent({type: 'focus'});
    }
  });
})();
// ===== END COMPONENT: elements.ui.input =====

// ===== BEGIN COMPONENT: elements.ui.textarea ====
(
function() {
  elation.elements.define('ui.textarea', class extends elation.elements.ui.input {
    init() {
      super.init();
    }

    create() {
      if (this.label) {
        this.labelobject = elation.elements.create('ui.label', {
          append: this,
          label: this.label
        });
        elation.events.add(this.labelobject, 'click', (ev) => { this.focus(); ev.stopPropagation(); });
      }

      this.inputelement = elation.html.create({tag: 'textarea', append: this});
      if (this.inputelement) {
        this.addEventProxies(this.inputelement, [
          'dragover', 'dragenter', 'dragleave', 'drop', 
          'change', 'input', 'keydown', 'keypress', 'keyup', 
          'mouseover', 'mouseout', 'mousedown', 'mouseup', 'click',
          'touchstart', 'touchend', 'touchmove']);
        this.addPropertyProxies(this.inputelement, 'value,disabled,autofocus,form,name,type,required');
      }
    }
    /**
     * Event handler for HTML input element's keydown event
     * @function handlekeydown
     * @memberof elation.elements.ui.textarea#
     * @param ev event
     */
    handlekeydown(ev) {
      switch (ev.keyCode) {
        case 13: // enter
          if (ev.ctrlKey) {
            this.accept();
          }
          break;
        case 27: // esc
          this.cancel();
          break;
      } 
    }
  });
})();
// ===== END COMPONENT: elements.ui.textarea =====

// ===== BEGIN COMPONENT: elements.ui.toggle ====
(
function() {
  elation.requireCSS('ui.toggle');

  /**
   * On/off switch control. Fires `toggle_on` / `toggle_off` events when
   * flipped, plus a generic `toggle` event carrying the new state. Base
   * class for `ui.checkbox` and `ui.radio`.
   *
   * @class toggle
   * @hideconstructor
   * @category UI
   * @augments elation.elements.base
   * @memberof elation.elements.ui
   * @example
   * <ui-toggle label="Notifications" checked></ui-toggle>
   *
   * @param {object} args
   * @param {boolean} args.checked
   * @param {boolean} args.disabled
   * @param {string} args.label
   */
  elation.elements.define('ui.toggle', class extends elation.elements.base {
    init() {
      super.init();
      this.defineAttributes({
        checked: { type: 'boolean', default: false },
        disabled: { type: 'boolean', default: false },
        hover: { type: 'boolean', default: false },
        label: { type: 'string', default: '' }
      });
      if (this.checked === '') this.checked = true; // FIXME - type hinting should handle this

      if (this.preview) {
        this.label = 'Toggle';
      }
    }
    create() {
      var checked = this.checked || this.checked === '';
      if (this.bindvar && this.bindvar[0][this.bindvar[1]]) {
        checked = true;
      }

      if (!this.checkbox) {
        this.checkbox = elation.elements.create('input', {
          append: this, 
          type: 'checkbox', 
          name: this.formname,
          checked: checked
        });
        this.createlabel(this.label);
        this.toggleelement = elation.elements.create('div', {
          append: this, 
        });

        elation.events.add(this, 'click', (ev) => { this.toggle(); ev.stopPropagation(); });
        elation.events.add(this, 'mouseover', (ev) => { this.hover = true; });
        elation.events.add(this, 'mouseout', (ev) => { this.hover = false; });
      }
      this.refresh();
    }
    createlabel(value) {
      if (!this.formlabel) {
        this.formlabel = elation.elements.create('ui.label', {
          label: value,
          append: this,
        });
        this.formlabel.setLabel(value);
      } else {
        this.formlabel.setLabel(value);
      }
    }
    toggle() {
      if (this.disabled === false) {
        this.setstate(!(this.checked || this.checked === ''));
      }
    }
    setlabel(newlabel) {
      this.label = newlabel;
      if (this.formlabel) {
        this.formlabel.setLabel(newlabel);
      } else {
        this.createlabel(newlabel);
      }
    }
    setstate(newstate) {
      this.checked = newstate;

      // If a bindvar is passed in, automatically update the specified object property
      if (this.bindvar) {
        this.bindvar[0][this.bindvar[1]] = this.checked;
      }

      var evname = "toggle_" + (this.checked ? "on" : "off");
      // Fire two events - separate toggle_on/toggle_off events, plus a general toggle event
      elation.events.fire({type: evname, element: this, data: this.checked});
      elation.events.fire({type: 'toggle', element: this, data: this.checked});

      this.refresh();
    }
    render() {
      super.render();
      if (this.checkbox) {
        this.checkbox.checked = (this.checked || this.checked === '');
      }
    }
    focus() {
      this.toggle();
      this.checkbox.focus();
    }
  });
})();
// ===== END COMPONENT: elements.ui.toggle =====

// ===== BEGIN COMPONENT: elements.ui.checkbox ====
(
function() {
  /**
   * Checkbox variant of `ui.toggle`. Visually styled as a checkbox but
   * otherwise behaves identically; attributes and events are inherited.
   *
   * @class checkbox
   * @hideconstructor
   * @category UI
   * @augments elation.elements.ui.toggle
   * @memberof elation.elements.ui
   * @example
   * <ui-checkbox label="Remember me" checked></ui-checkbox>
   */
  elation.elements.define('ui.checkbox', class extends elation.elements.ui.toggle {
    init() {
      super.init();
      if (this.preview) {
        this.label = 'Checkbox';
      }
    }
  });
})();
// ===== END COMPONENT: elements.ui.checkbox =====

// ===== BEGIN COMPONENT: elements.ui.radio ====
(
function() {
  /**
   * Radio-button variant of `ui.toggle`. Renders the underlying input as
   * `type="radio"` so browser grouping applies when multiple radios share a
   * `formname`. Attributes and events are inherited from `ui.toggle`.
   *
   * @class radio
   * @hideconstructor
   * @category UI
   * @augments elation.elements.ui.toggle
   * @memberof elation.elements.ui
   * @example
   * <ui-radio label="Small" formname="size"></ui-radio>
   * <ui-radio label="Medium" formname="size" checked></ui-radio>
   * <ui-radio label="Large" formname="size"></ui-radio>
   */
  elation.elements.define('ui.radio', class extends elation.elements.ui.toggle {
    create() {
      if (this.preview) {
        this.label = 'Radio Button';
      }
      super.create();
      this.checkbox.type = 'radio';
    }
  });
})();
// ===== END COMPONENT: elements.ui.radio =====

// ===== BEGIN COMPONENT: elements.ui.select ====
(
function() {
  elation.requireCSS('ui.select');

  elation.elements.define('ui.select', class extends elation.elements.ui.list {
    init() {
      super.init();
    }
    create() {
      this.select = elation.elements.create('select');
      super.create();
      this.appendChild(this.select);

      this.defineAttributes({
        label: { type: 'string' },
        bindvar: { type: 'array' },
        selected: { type: 'object' },
        items: { type: 'object' },
      });

      if (this.label) {
        this.labelobj = elation.elements.create('ui.label', {
          append: this,
          before: this.select,
          label: this.label,
          class: 'ui_select_label' 
        });
        elation.events.add(this.labelobj, 'click', (ev) => { this.focus(); ev.stopPropagation(); });
      }
      if (this.bindvar) {
        this.selected = elation.utils.arrayget(this.bindvar[0], this.bindvar[1]);
      }
      elation.events.add(this.select, "change", (ev) => this.handleSelectChange(ev));

/*
      if (this.items) {
        this.setItems(this.items, this.selected);
      } else {
        this.extractItems();
      }
*/

      //this.value = this.select.value;
      this.addPropertyProxies(this.select, ['value']);
    }
    setItems(items, selected) {
      if (items instanceof Array) {
        //this.set('args.items', items.join(';'));
      } else {
        //this.set('args.items', items);
        //items = items.split(';');
      }
      this.items = items;
      this.select.innerHTML = '';
      for (var i = 0; i < items.length; i++) {
        this.addItem(items[i]);
      }
      if (selected) {
        this.setSelected(selected);
      }
    }
    addItem(value, selected) {
      var option = elation.elements.create('option');
      if (value instanceof HTMLOptionElement) {
        // Native option already has reflected value/label/selected.
        option.value     = value.value;
        option.innerHTML = value.label || value.innerHTML;
        if (value.selected) option.selected = true;
      } else if (value instanceof HTMLElement) {
        // Custom element (typically ui-option) — read attributes directly,
        // since value.value / value.label aren't reflected.
        var v = value.getAttribute('value');
        var l = value.getAttribute('label');
        option.value     = (v != null) ? v : ((value.textContent || '').trim() || value.innerHTML);
        option.innerHTML = (l != null) ? l : value.innerHTML;
        if (value.hasAttribute('selected')) option.selected = true;
      } else {
        option.value = value;
        option.innerHTML = value;
      }
      if (selected) {
        option.selected = selected;
      }
      this.select.appendChild(option);
    }
    setSelected(value) {
      this.value = value;
      if (!this.select) return;
      var found = false;
      for (var i = 0; i < this.select.childNodes.length; i++) {
        var node = this.select.childNodes[i];
        if (node.value == value) {
          node.selected = true;
          found = true;
        } else {
          node.selected = false;
        }
      }
      if (!found) {
        this.addItem(value, true);
      }
    }
    setLabel(label) {
      this.label = label;
      this.labelobj.setLabel(label);
    }
    /**
     * Extracts items out of the list's existing HTML structure
     * @function extractItems
     * @memberof elation.elements.ui.list#
     */
    extractItems() {
      // Snapshot the current children so the iteration is stable, then
      // remove the option-shaped ones from the DOM up front. We only
      // need them as data sources for populating the internal <select>;
      // leaving them attached lets them render as visible siblings.
      //
      // Accepted option shapes: native <option> (technically only valid
      // as a child of <select>, but browsers tolerate it), <ui-option>,
      // and <ui-item> — the last lets list-style markup double as
      // select options for parity with ui-list and ui-tabs.
      var items = [];
      var nodes = Array.prototype.slice.call(this.childNodes);
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        if (node.nodeType !== 1) continue;       // skip text / whitespace nodes
        var isOption = node instanceof HTMLOptionElement
          || (elation.elements.ui.option && node instanceof elation.elements.ui.option)
          || (elation.elements.ui.item   && node instanceof elation.elements.ui.item);
        if (isOption) {
          items.push(node);
          if (node.parentNode) node.parentNode.removeChild(node);
        }
      }
      this.setItems(items, this.value);
    }
    // ui.list.render() would iterate this.items and re-append any
    // ui.item instances to the host element — useful for <ui-list>, but
    // here it would put the option-shaped children back into the DOM
    // beside the internal <select>, where they'd render as plain text.
    // The native <select> is our rendering; nothing else needs doing.
    render() {}
    refresh() {}
    handleSelectChange(ev) {
      //this.value = this.select.value;

      // If a bindvar is passed in, automatically update the specified object property
      if (this.bindvar) {
        elation.utils.arrayset(this.bindvar[0], this.bindvar[1], this.value);
      }

      this.dispatchEvent({type: "change", data: this.value});
    }
    focus() {
      this.select.focus();
    }
    blur() {
      this.select.blur();
    }
  });

  elation.elements.define('ui.option', class extends elation.elements.base {
  });
})();
// ===== END COMPONENT: elements.ui.select =====

// ===== BEGIN COMPONENT: elements.ui.slider ====
(
function() {
  elation.requireCSS('ui.slider');

  /**
   * Continuous-range slider with a draggable handle. Drag, click, or scroll
   * the track to change the value; `snap` restricts values to a multiple of
   * that increment. Fires `change` with the new `value` whenever the handle
   * moves.
   *
   * @class slider
   * @hideconstructor
   * @category UI
   * @augments elation.elements.base
   * @memberof elation.elements.ui
   * @example
   * <ui-slider label="Volume" min="0" max="100" value="30" snap="1"></ui-slider>
   *
   * @param {object} args
   * @param {string} args.label
   * @param {float} args.min
   * @param {float} args.max
   * @param {float} args.value
   * @param {float} args.snap
   */
  elation.elements.define('ui.slider', class extends elation.elements.base {
    init() {
      super.init();
      this.defineAttributes({
        label: { type: 'string' },
        min: { type: 'float', default: 0 },
        max: { type: 'float', default: 1 },
        value: { type: 'float', default: 0, set: this.updateValue },
        snap: { type: 'float' }
      });
    }
    create() {
      if (this.values) return;
      this.values = [];
      if (this.label) {
        this.labelelement = elation.elements.create('ui-label', {
          append: this,
          label: this.label
        });
      }
      this.trackelement = elation.elements.create('ui-slider-track', { append: this });
      
      this.createHandles();
    }
    createHandles() {
      var handle = elation.elements.create('ui-slider-handle', {
        append: this.trackelement,
        onchange: (ev) => this.updateHandle(handle),
        value: this.value
      });
      handle.slider = this;
      this.handles = [handle];
    }
    updateHandle(handle) {
      var idx = this.handles.indexOf(handle);
      if (idx != -1) {
        this.values[idx] = handle.value;
        if (this.values.length == 1) {
          this.value = this.values[0];
        }
        //this.dispatchEvent({type: 'change', data: handle.value});
        elation.events.fire({element: this, type: 'change', data: handle.value});
      }
    }
    updateValue() {
      let handle = this.handles[0];
      handle.sendchangeevent = false;
      handle.value = this.value;
      this.values[0] = this.value;
      handle.sendchangeevent = true;
    }
  });
  elation.elements.define('ui.slider.track', class extends elation.elements.base {
    init() {
      super.init();
      this.defineAttributes({
        hover: { type: 'boolean', default: false },
      });
    }
    create() {
      elation.events.add(this, 'mousedown', ev => this.handleMouseDown(ev));
      elation.events.add(this, 'mouseover', ev => this.handleMouseOver(ev));
      elation.events.add(this, 'mouseout', ev => this.handleMouseOut(ev));
      elation.events.add(this, 'touchstart', ev => this.handleTouchStart(ev));
      elation.events.add(this, 'wheel', ev => this.handleWheel(ev));
    }
    handleMouseDown(ev) {
      var slider = this.parentNode;
      // Pass event through to the right handle
      var handle = slider.handles[0]; // TODO - pick closest
      handle.handleMouseDown(ev);
    }
    handleMouseOver(ev) {
      this.hover = true;
      this.parentNode.handles[0].showLabel();
    }
    handleMouseOut(ev) {
      this.hover = false;
      let handle = this.parentNode.handles[0];
      if (!handle.dragging) {
        handle.hideLabel();
      }
    }
    handleTouchStart(ev) {
      var slider = this.parentNode;
      // Pass event through to the right handle
      var handle = slider.handles[0]; // TODO - pick closest
      handle.handleTouchStart(ev);
    }
    handleWheel(ev) {
      let slider = this.parentNode,
          amount = (slider.snap ? slider.snap : (slider.max - slider.min) / 20);
      let handle = slider.handles[0]; // TODO - pick closest
      handle.value = Math.max(slider.min, Math.min(slider.max, handle.value + (ev.deltaY < 0 ? 1 : -1) * amount));
    }
  });
  elation.elements.define('ui.slider.handle', class extends elation.elements.base {
    init() {
      this.defineAttributes({
        label: { type: 'string' },
        value: { type: 'float', default: 0, set: this.sendChangeEvent },
        sendchangeevent: { type: 'boolean', default: true},
      });
    }
    create() {
      this.slider = this.parentNode.parentNode;

      // FIXME - these should be bound at a lower level
      this.handleMouseDown = elation.bind(this, this.handleMouseDown);
      this.handleMouseMove = elation.bind(this, this.handleMouseMove);
      this.handleMouseUp = elation.bind(this, this.handleMouseUp);
      this.handleTouchStart = elation.bind(this, this.handleTouchStart);
      this.handleTouchMove = elation.bind(this, this.handleTouchMove);
      this.handleTouchEnd = elation.bind(this, this.handleTouchEnd);

      elation.events.add(this, 'mousedown', this.handleMouseDown);
      elation.events.add(this, 'touchstart', this.handleTouchStart);
      elation.events.add(this, 'mouseover', this.handleMouseOver);
      elation.events.add(this, 'mouseout', this.handleMouseOut);

      this.labelel = elation.elements.create('ui-label', {
        append: this,
        label: this.value,
      });
      this.positionLabel();
      this.labelel.hide();
      this.refresh();

      let foo = new IntersectionObserver(d => this.handleIntersectionObserver(d), {
        root: null,
        threshold: [0, .5, 1],
      });
      foo.observe(this);
    }
    render() {
      this.style.left = 'calc(' + (100 * (this.value - this.slider.min) / (this.slider.max - this.slider.min)) + '% - ' + (this.offsetWidth / 2) + 'px)';
      this.style.top = -(this.offsetHeight / 2 - this.parentNode.offsetHeight / 2) + 'px';
      if (this.labelel) {
        let digits = 3;
        if (this.slider.snap) {
          if (this.slider.snap % 1 > 0) {
            digits = this.slider.snap.toString().split('.')[1].length;
          } else {
            digits = 0;
          }
        }
        this.labelel.setLabel(this.value.toFixed(digits));
        this.positionLabel();
      }
    }
    sendChangeEvent() {
      this.refresh();
      if (this.sendchangeevent) {
        this.dispatchEvent({type: 'change', data: this.value});
      }
    }
    updateValueFromEvent(ev) {
      var value = this.projectMouseEventOnAxis(ev);
      if (value !== this.value) {
        this.value = value;
      }
    }
    projectMouseEventOnAxis(ev) {
      var x = ev.clientX,
          y = ev.clientY,
          rect = this.parentNode.getBoundingClientRect();

      var percent = Math.max(0, Math.min(1, (x - rect.x) / rect.width));
      var value = percent * (this.slider.max - this.slider.min) + this.slider.min;
      if (this.slider.snap) {
        value = Math.floor(value / this.slider.snap) * this.slider.snap;
      }
      //console.log(value, percent, x, y, rect);
      return value;
    }
    positionLabel() {
      if (this.labelel) {
        let mycoords = this.getBoundingClientRect(),
            objcoords = this.labelel.getBoundingClientRect(),
            wincoords = document.body.getBoundingClientRect();


        this.labelel.style.right = 'auto'
        this.labelel.style.width = 'auto'
        this.labelel.style.bottom = this.offsetHeight + 'px';
        let margin = 2;

        let labeloffset = objcoords.width / 2;
       if (mycoords.x + labeloffset >= wincoords.width - margin) {
          labeloffset = labeloffset + ((mycoords.x + labeloffset) - wincoords.width) + margin;
        }
        //console.log(labeloffset, objcoords, wincoords);
        this.labelel.style.left = -labeloffset + 'px';
      }
    }
    showLabel() {
      if (this.labelel) {
        this.labelel.show();
        this.positionLabel();
      }
    }
    hideLabel() {
      if (this.labelel) {
        this.labelel.hide();
      }
    }
    handleMouseDown(ev) {
      elation.events.add(window, 'mousemove', this.handleMouseMove);
      elation.events.add(window, 'mouseup', this.handleMouseUp);
      ev.preventDefault();
      this.updateValueFromEvent(ev);
      this.refresh();
      this.labelel.show();
      this.positionLabel();
      this.dragging = true;
    }
    handleMouseMove(ev) {
      this.updateValueFromEvent(ev);
      this.refresh();
    }
    handleMouseUp(ev) {
      elation.events.remove(window, 'mousemove', this.handleMouseMove);
      elation.events.remove(window, 'mouseup', this.handleMouseUp);
      this.labelel.hide();
      this.dragging = false;
    }
    handleMouseOver(ev) {
      this.showLabel();
    }
    handleMouseOut(ev) {
      if (!this.dragging && this.labelel) {
        this.hideLabel();
      }
    }
    handleTouchStart(ev) {
      if (ev.touches.length == 1) {
        elation.events.add(window, 'touchmove', this.handleTouchMove);
        elation.events.add(window, 'touchend', this.handleTouchEnd);
        ev.preventDefault();
        this.updateValueFromEvent(ev.touches[0]);
      }
      this.refresh();
    }
    handleTouchMove(ev) {
      this.updateValueFromEvent(ev.touches[0]);
      this.refresh();
    }
    handleTouchEnd(ev) {
      elation.events.remove(window, 'touchmove', this.handleTouchMove);
      elation.events.remove(window, 'touchend', this.handleTouchEnd);
    }
    handleIntersectionObserver(d) {
      this.render();
    }
  });
})();
// ===== END COMPONENT: elements.ui.slider =====

// ===== BEGIN COMPONENT: elements.ui.grid ====
(
function() {
  elation.requireCSS('ui.grid');

  elation.elements.define('ui.grid', class extends elation.elements.ui.list {
    init() {
      super.init();
    }
  });
})();
// ===== END COMPONENT: elements.ui.grid =====

// ===== BEGIN COMPONENT: elements.ui.checklist ====
(
function() {
  /**
   * `ui.list` variant whose rendered items are `ui.checklistitem` rows
   * (each wrapping a `ui.checkbox`). Useful for multi-select lists backed
   * by a data collection.
   *
   * @class checklist
   * @hideconstructor
   * @category UI
   * @augments elation.elements.ui.list
   * @memberof elation.elements.ui
   * @example
   * <ui-checklist>
   *   <li>Apple</li>
   *   <li>Banana</li>
   *   <li>Cherry</li>
   * </ui-checklist>
   */
  elation.elements.define('ui.checklist', class extends elation.elements.ui.list {
    init() {
      super.init();
    }
    createlistitem(args) {
      var foo = elation.elements.create('ui.checklistitem', args);
      return foo;
    }
  });

  /**
   * Individual row in a `ui.checklist`. Wraps a `ui.checkbox` and
   * syncs the item's `checked` state to it.
   *
   * @class checklistitem
   * @hideconstructor
   * @category UI
   * @augments elation.elements.ui.item
   * @memberof elation.elements.ui
   *
   * @param {object} args
   * @param {string} args.checkedattr
   * @param {boolean} args.checked
   */
  elation.elements.define('ui.checklistitem', class extends elation.elements.ui.item {
    init() {
      super.init();
      this.defineAttributes({
        checkedattr: { type: 'string' },
        checked: { type: 'boolean', default: false }
      });
    }
    create() {
      this.setcontent(this.value);
    }
    toggle() {
      this.checkbox.toggle();
      this.checked = this.checkbox.togglestate;
    }
    handletoggle(ev) {
      this.checked = this.checkbox.togglestate;
    }
    setcontent(value) {
      var filled = false;
      if (!this.checkbox) {
        this.checkbox = elation.elements.create('ui.checkbox', {
          label: '',
          checked: this.checked,
          append: this,
          align: 'left'
        });
        elation.events.add(this.checkbox, 'toggle', elation.bind(this, this.handletoggle));
      }
      if (value instanceof elation.component.base) {
        this.checkbox.setlabel(value.container);
        filled = true;
      } else if (this.itemtemplate && this.itemtemplate != 'null') { // FIXME - should never get 'null' as a string here
        this.checkbox.setlabel(elation.template.get(this.itemtemplate, value));
        filled = true;
      } else if (this.itemcomponent && this.itemcomponent != 'null') { // FIXME - should never get 'null' as a string here
        var itemcomponentclass = elation.utils.arrayget(elation, this.itemcomponent);
        if (itemcomponentclass) {
          var itemcomponent = itemcomponentclass(value);
          this.checkbox.setlabel(itemcomponentclass);
          filled = true;
        }
      } 
      if (!filled) {
        if (elation.utils.isString(value)) {
          this.checkbox.setlabel(value);
        } else {
          var attrval = elation.utils.arrayget(value, this.labelattr);
          if (attrval !== null) {
            if (this.checkbox) this.checkbox.setlabel(attrval);
          }
        }
      }
    }
    refresh() {
      if (this.checkbox) {
        this.checkbox.setstate(this.checked);
      }
      super.refresh();
    }
  });
})();
// ===== END COMPONENT: elements.ui.checklist =====

// ===== BEGIN COMPONENT: elements.ui.panel ====
(
function() {
  elation.requireCSS('ui.panel');

  // Hybrid boolean / pixel-offset type used by the edge-snap attributes.
  // Presence (with or without a value) means "snap to this edge"; a numeric
  // value carries an additional pixel offset that subclasses may consult.
  // Accepts bare numbers (40), numeric strings ("40"), and CSS-style
  // pixel specifiers ("40px") — parseFloat reads the leading numeric.
  elation.elements.registerType('anchor', {
    read(value) {
      if (value === true || value === '' || value === 'true') return true;
      if (value === false || value == null || value === 'false') return false;
      const n = parseFloat(value);
      if (isNaN(n) || n === 0) return true;
      return n | 0;
    },
    write(value) {
      if (value === true) return '';
      if (value === false || value == null) return 'false';
      return String(value);
    }
  });

  /**
   * Absolutely-positioned container that snaps to its offsetParent's edges
   * or center. The position is driven by edge flags — any combination of
   * `top` / `middle` / `bottom` with `left` / `center` / `right`. Auto-updates
   * on window resize, orientation change, and child-list mutations.
   *
   * The four corner attributes (`top` / `bottom` / `left` / `right`) use the
   * `anchor` type: an absent attribute means "don't constrain this edge",
   * and presence — boolean form, empty value, or a numeric pixel offset —
   * means "snap to this edge". Panel's own layout treats anchor values
   * purely as truthy/falsy snap signals; subclasses like `ui.window` read
   * the numeric value and apply it as a pixel offset.
   *
   * Base class for `ui.window`, `ui.flexpanel`, `ui.collapsiblepanel`, and `ui.tooltip`.
   *
   * @class panel
   * @hideconstructor
   * @category UI
   * @augments elation.elements.base
   * @memberof elation.elements.ui
   * @example
   * <ui-panel bottom right>Docked to bottom-right</ui-panel>
   *
   * @param {object} args
   * @param {boolean|integer} args.top
   * @param {boolean} args.middle
   * @param {boolean|integer} args.bottom
   * @param {boolean|integer} args.left
   * @param {boolean} args.center
   * @param {boolean|integer} args.right
   */
  elation.elements.define('ui.panel', class extends elation.elements.base {
    init() {
      super.init();
      this.defineAttributes({
        top:    {type: 'anchor',  default: false, set: this.updateLayout },
        middle: {type: 'boolean', default: false, set: this.updateLayout },
        bottom: {type: 'anchor',  default: false, set: this.updateLayout },
        left:   {type: 'anchor',  default: false, set: this.updateLayout },
        center: {type: 'boolean', default: false, set: this.updateLayout },
        right:  {type: 'anchor',  default: false, set: this.updateLayout },
      });
    }
    create() {
      this.style.position = 'absolute';

      // Mutation observer watches for any changes to our children, and updates our layout in response to changes
      var observer = new MutationObserver((mutations) => this.refresh());
      observer.observe(this, {attributes: false, childList: true, subtree: true});

      // Update our layout if the page is resized or if orientation changes
      document.addEventListener('DOMContentLoaded', (ev) => this.refresh());
      document.addEventListener('load', (ev) => this.refresh());
      window.addEventListener('resize', (ev) => this.refresh());
      window.addEventListener('orientationchange', (ev) => this.refresh());
      this.refresh();
      // FIXME - sometimes panels initialize too early, and their vertical positioning gets messed up.  A 10ms timeout helps but an event would be better.
      setTimeout(() => {
        this.refresh();
      }, 10);
    }
    render() {
      super.render();
      this.updateLayout();
    }
    updateLayout() {
      if (!this.offsetParent) return; // Not in the DOM, no layout to be done

      if (this.middle) {
        this.style.top = ((this.offsetParent.offsetHeight - this.offsetHeight) / 2) + 'px';
        this.style.bottom = 'auto';
      } else if (this.top) {
        this.style.top = 0;
        this.style.bottom = (this.bottom ? 0 : 'auto');
      } else if (this.bottom) {
        this.style.top = (this.top ? 0 : 'auto');
        this.style.bottom = 0;
      }
      if (this.center) {
        this.style.left = ((this.offsetParent.offsetWidth - this.offsetWidth) / 2) + 'px';
        this.style.right = 'auto';
      } else if (this.left) {
        this.style.left = 0;
        this.style.right = (this.right ? 0 : 'auto');
      } else if (this.right) {
        this.style.left = (this.left ? 0 : 'auto');
        this.style.right = 0;
      }
    }
    setcontent(content) {
      if (elation.utils.isString(content)) {
        this.innerHTML = content;
      } else if (content instanceof HTMLElement) {
        this.appendChild(content);
      }
    }
  });
})();
// ===== END COMPONENT: elements.ui.panel =====

// ===== BEGIN COMPONENT: elements.ui.tabbutton ====
(
function() {
  /**
   * Button rendered inside a `ui.tabbar`, one per `ui.tab`. Carries a
   * `selected` flag that `ui.tabs` flips when its corresponding tab
   * becomes active.
   *
   * @class tabbutton
   * @hideconstructor
   * @category UI
   * @augments elation.elements.ui.button
   * @memberof elation.elements.ui
   *
   * @param {object} args
   * @param {boolean} args.selected
   */
  elation.elements.define('ui.tabbutton', class extends elation.elements.ui.button {
    init() {
      super.init();
      this.defineAttributes({
        selected: { type: 'boolean', default: false }
      });
    }
  });
})();
// ===== END COMPONENT: elements.ui.tabbutton =====

// ===== BEGIN COMPONENT: elements.ui.tabcountbutton ====
(
function() {
  /**
   * Tab-style button with a `selected` state and an integer count badge.
   * Used by `ui.tabbar` when a tabs container has `showcounts` enabled.
   *
   * @class tabcountbutton
   * @hideconstructor
   * @category UI
   * @augments elation.elements.ui.notificationbutton
   * @memberof elation.elements.ui
   *
   * @param {object} args
   * @param {boolean} args.selected
   */
  elation.elements.define('ui.tabcountbutton', class extends elation.elements.ui.notificationbutton {
    init() {
      super.init();
      this.defineAttributes({
        selected: { type: 'boolean', default: false }
      });
    }
  });
})();
// ===== END COMPONENT: elements.ui.tabcountbutton =====

// ===== BEGIN COMPONENT: elements.ui.tabbar ====
(
function() {
  elation.requireCSS('ui.tabbar');

  elation.elements.define('ui.tabbar', class extends elation.elements.ui.buttonbar {
    init() {
      super.init();
      this.defineAttributes({
        itemcomponent: { type: 'string', default: 'ui.tabbutton' }
      });
    }
  });
})();
// ===== END COMPONENT: elements.ui.tabbar =====

// ===== BEGIN COMPONENT: elements.ui.tab ====
(
function() {
  /**
   * Single tab for use inside `ui.tabs`. The `label` renders as the tab
   * button; `count` drives an optional badge; `tooltip` shows on hover.
   * Only the selected tab is attached to the DOM at a time, so children
   * are detached while unselected.
   *
   * @class tab
   * @hideconstructor
   * @category UI
   * @augments elation.elements.ui.item
   * @memberof elation.elements.ui
   * @example
   * <ui-tabs>
   *   <ui-tab label="Overview" tooltip="Summary">Overview content</ui-tab>
   *   <ui-tab label="Inbox" count="3">Inbox content</ui-tab>
   * </ui-tabs>
   *
   * @param {object} args
   * @param {string} args.label
   * @param {integer} args.count
   * @param {boolean} args.selected
   * @param {string} args.tooltip
   */
  elation.elements.define('ui.tab', class extends elation.elements.ui.item {
    init() {
      super.init();
      //this.tabname = this.args.name;
      this.defineAttributes({
        label: { type: 'string', set: this.updateLabel },
        count: { type: 'integer', default: 0, set: this.updateCount },
        selected: { type: 'boolean', default: false },
        tooltip: { type: 'string' }
      });
    }
    create() {
      elation.events.add(this, 'mouseover,mouseout,click', this);
    }
    hover() {
      this.addclass("state_hover");
      this.dispatchEvent({type: 'hover'});
    }
    unhover() {
      this.removeclass("state_hover");
      this.dispatchEvent({type: 'unhover'});
    }
    select() {
      this.selected = true;
      // FIXME - using the 'select' event causes issues if the tab contains an <input> or <textarea>, for now we throw both events but we should refactor code that uses 'select'
      this.dispatchEvent({type: 'select'});
      this.dispatchEvent({type: 'tabselect', bubbles: true});
      this.refreshChildren();
    }
    unselect() {
      this.selected = false;
      this.dispatchEvent({type: 'unselect'});
      this.dispatchEvent({type: 'tabunselect'});
    }
    mouseover(ev) {
      if (!this.disabled) {
        this.hover();
      }
    }
    mouseout(ev) {
      if (!this.disabled) {
        this.unhover();
      }
    }
    click(ev) {
      if (!this.disabled) {
        this.select();
      }
    }
    enable() {
      this.disabled = false;
    }
    disable() {
      this.disabled = true;
    }
    updateCount() {
      this.dispatchEvent({type: 'countchange', element: this, data: this.count});
    }
    updateLabel() {
      this.dispatchEvent({type: 'tablabelchange', element: this, data: this.label, bubbles: true});
    }
  });
})();
// ===== END COMPONENT: elements.ui.tab =====

// ===== BEGIN COMPONENT: elements.ui.tabs ====
(
function() {
  elation.requireCSS('ui.tabs');

  elation.elements.define('ui.tabs', class extends elation.elements.ui.list {
    init() {
      super.init();
      this.defineAttributes({
        itemcomponent: { type: 'string', default: 'ui.tab' },
        showcounts: { type: 'boolean', default: false },
        selectable: { type: 'boolean', default: false }
      });
      //this.collection = elation.elements.create('collection-simple');
/*
      if (this.args.items) {
        if (elation.utils.isArray(this.args.items)) {
          for (var i = 0; i < this.args.items.length; i++) {
            var item = this.args.items[i];
            if (elation.utils.isString(item)) {
              item = { name: item, label: item };
            }
            this.items.push(item);
          }
        } else {
          for (var k in this.args.items) {
            var item = this.args.items[k];
            if (!item.name) item.name = k;
            this.items.push(item);
          }
        }
      }
*/
    }
    create() {
      if (this.tabbar) return; // FIXME - create is being called twice
      this.buttons = false;
/*
      this.ul = elation.html.create({tag: 'ul', append: this.container});
      for (var i = 0; i < this.items.length; i++) {
        var tab = this.items[i];
        var tabargs = {};
        if (tab.tooltip) {
          tabargs.title = tab.tooltip;
        }
        this.add(tab);
      }
*/
      super.create();

      if (this.preview) {
        this.setItems([
          elation.elements.create('ui-tab', {
            append: this,
            label: 'One',
            content: 'Welcome to Tab One'
          }),
          elation.elements.create('ui-tab', {
            append: this,
            label: 'Two',
            content: 'You are now seeing Tab Two'
          }),
          elation.elements.create('ui-tab', {
            append: this,
            label: 'Three',
            content: 'And this is the final tab, Tab Three'
          })
        ]);
      }
      this.updateActiveTab();
      this.dispatchEvent({type: 'create'});

      elation.events.add(this, 'tablabelchange', ev => {
        let idx = this.items.indexOf(ev.target);
        if (idx != -1) {
          this.buttons[idx].label = ev.data;
          ev.stopPropagation();
        }
      });
    }
    setItems(items) {
      this.items = items;

      this._ensureTabbar();
      this.tabbar.setButtons(this.getTabButtons());
      this.buttons = this.tabbar.items;
      if (this.selected) {
        this.setActiveTab(this.selected);
      } else {
        this.updateActiveTab();
      }

      for (var i = 0; i < this.items.length; i++) {
        this._wireTabEvents(this.items[i]);
      }
    }
    /**
     * Add a tab dynamically. Accepts either an existing `ui-tab` element or an args object
     * (passed through to `elation.elements.create('ui-tab', ...)`).
     *
     * Insertion position is resolved in priority order: `options.position` → `options.before`
     * → `options.after` → append to end.
     *
     * The new tab is auto-selected only when the tabs component was previously empty,
     * unless `options.select` is explicitly set.
     *
     * @function addTab
     * @memberof elation.elements.ui.tabs#
     * @fires elation.elements.ui.tabs#tabadd
     * @param {elation.elements.ui.tab|object} tab  A tab element or an args object used to create one.
     * @param {object} [options]
     * @param {number} [options.position]  Explicit insertion index.
     * @param {elation.elements.ui.tab} [options.before]  Insert before this existing tab.
     * @param {elation.elements.ui.tab} [options.after]  Insert after this existing tab.
     * @param {boolean} [options.select]  Force-activate (true) or suppress activation (false).
     * @returns {elation.elements.ui.tab}  The newly-added tab element.
     */
    addTab(tab, options = {}) {
      if (!(tab instanceof elation.elements.ui.tab)) {
        tab = elation.elements.create('ui-tab', tab);
      }

      let index;
      if (typeof options.position === 'number') {
        index = options.position;
      } else if (options.before) {
        index = this.items.indexOf(options.before);
        if (index === -1) index = this.items.length;
      } else if (options.after) {
        let afterIdx = this.items.indexOf(options.after);
        index = (afterIdx === -1) ? this.items.length : afterIdx + 1;
      } else {
        index = this.items.length;
      }
      index = Math.max(0, Math.min(index, this.items.length));

      let wasEmpty = this.items.length === 0;

      this._ensureTabbar();
      this.buttons = this.tabbar.items;

      this.items.splice(index, 0, tab);

      let button = this.tabbar.createButton(this._buildButtonArgs(tab, index));
      if (index >= this.tabbar.items.length) {
        this.tabbar.appendChild(button);
        this.tabbar.items.push(button);
      } else {
        let ref = this.tabbar.items[index];
        this.tabbar.insertBefore(button, ref);
        this.tabbar.items.splice(index, 0, button);
      }

      for (let i = index + 1; i < this.tabbar.items.length; i++) {
        this.tabbar.items[i].name = i;
      }

      this._wireTabEvents(tab);

      let shouldSelect = (options.select !== undefined) ? options.select : wasEmpty;
      if (shouldSelect) {
        this.setActiveTab(index);
      }

      this.dispatchEvent({type: 'tabadd', data: tab});
      return tab;
    }
    /**
     * Remove a tab dynamically. Accepts either the tab element or its numeric index.
     * If the removed tab was active, the next tab (or previous if it was last) is activated.
     *
     * @function removeTab
     * @memberof elation.elements.ui.tabs#
     * @fires elation.elements.ui.tabs#tabremove
     * @param {elation.elements.ui.tab|number} tab  Tab element or index to remove.
     * @returns {elation.elements.ui.tab|null}  The removed tab, or null if not found.
     */
    removeTab(tab) {
      let index;
      if (typeof tab === 'number') {
        index = tab;
        tab = this.items[index];
      } else {
        index = this.items.indexOf(tab);
      }
      if (!tab || index === -1) return null;

      let wasActive = (tab.parentNode === this);

      let button = this.tabbar && this.tabbar.items[index];
      if (button) {
        if (button.parentNode === this.tabbar) {
          this.tabbar.removeChild(button);
        }
        this.tabbar.items.splice(index, 1);
      }

      this.items.splice(index, 1);
      if (tab.parentNode === this) {
        this.removeChild(tab);
      }

      if (this.tabbar) {
        for (let i = index; i < this.tabbar.items.length; i++) {
          this.tabbar.items[i].name = i;
        }
      }

      if (wasActive && this.items.length > 0) {
        let next = Math.min(index, this.items.length - 1);
        this.setActiveTab(next);
      }

      this.dispatchEvent({type: 'tabremove', data: tab});
      return tab;
    }
    setActiveTab(name) {
      for (var k in this.items) {
        let tab = this.items[k],
            button = this.buttons[k];

        if (!(tab instanceof elation.elements.ui.tab)) continue;
        //if (this.items[name]) {
          //console.log('bing', name, this.items[name]);
          //this.items[name].select();
        //}
        if (k == name) {
          button.selected = true;
          if (tab.parentNode !== this) {
            this.appendChild(tab);
          }
          tab.select();
          tab.refresh();
        } else {
          tab.unselect();
          button.selected = false;
          if (tab.parentNode === this) {
            this.removeChild(tab);
          }
        }
      }
    }
    updateActiveTab() {
      var tabs = this.items;
      for (var i = 0; i < tabs.length; i++) {
        var tab = tabs[i];
        if (tab.selected || tab.selected === "") {
          this.setActiveTab(i);
          return;
        }
      }
      // No tab selected in mark-up, so default to the first tab
      this.setActiveTab(0);
    }
    getTabButtons() {
      if (!this.buttons) {
        var buttons = this.buttons = [];
        var items = this.items;
        for (var i = 0; i < items.length; i++) {
          buttons.push(this._buildButtonArgs(items[i], i));
        }
      }
      return this.buttons;
    }
    updateButtonCounts() {
      for (var i = 0; i < this.items.length; i++) {
        this.buttons[i].count = this.items[i].count;
      }
    }
    handleTabbarClick(ev) {
      var button = ev.target;
      if (button instanceof elation.elements.ui.button) {
        this.setActiveTab(button.name);
      }
    }
    ui_tabitem_hover(ev) {
      if (this.hoveritem && this.hoveritem != ev.target) {
        //this.hoveritem.unhover();
      }
      this.hoveritem = ev.target;
      //this.hoveritem.hover();
    }
    ui_tabitem_select(ev) {
      if (this.selecteditem && this.selecteditem != ev.target) {
        this.selecteditem.unselect();
      }
      this.selecteditem = ev.target;
      //this.selecteditem.select();
      this.dispatchEvent({type: 'change', data: this.selecteditem});
      this.dispatchEvent({type: 'tabchange', data: this.selecteditem});
    }
    _ensureTabbar() {
      if (!this.tabbar) {
        this.tabbar = elation.elements.create('ui-tabbar', {
          append: this,
          itemcomponent: (this.showcounts ? 'ui.tabcountbutton' : 'ui.button')
        });
        elation.events.add(this.tabbar, 'click', (ev) => this.handleTabbarClick(ev));
      }
    }
    _buildButtonArgs(tab, index) {
      return {
        label: tab.label,
        name: index,
        disabled: tab.disabled && tab.disabled !== '',
        count: tab.count || 0
      };
    }
    _wireTabEvents(tab) {
      if (!elation.events.hasEventListener(tab, 'countchange')) {
        elation.events.add(tab, 'countchange', (ev) => this.updateButtonCounts());
      }
    }
  });
})();
// ===== END COMPONENT: elements.ui.tabs =====

// ===== BEGIN COMPONENT: elements.ui.window ====
(
function() {
  elation.requireCSS('ui.window');

  elation.elements.define('ui.window', class extends elation.elements.ui.panel {
    init() {
      super.init();
      this.defineAttributes({
        title:     { type: 'string', default: '' },
        windowtitle:     { type: 'string', default: '' }, // Using 'title' involves browser default tooltip behavior, consider forcing a rename, in the meantime we support 'windowtitle' as well
        //toolbar:   { type: 'object' },
        position:  { type: 'vector2' },
        content:   { type: 'object' },
        movable:   { type: 'boolean' },
        controls: { type: 'boolean' },
        width: { type: 'string' },
        height: { type: 'string' },
        resizable: { type: 'boolean' },
        scrollable: { type: 'boolean' },
        minimizable:  { type: 'boolean' },
        maximizable:  { type: 'boolean' },
        closable:     { type: 'boolean' },
      });
      this.offsetpos = [0, 0];
    }
    initUIWindow() {
      this.initialized = true;
      this.windownum = (elation.elements.ui.window.numwindows ? elation.elements.ui.window.numwindows : 0);
      elation.elements.ui.window.numwindows = this.windownum + 1;
      //this.style.top = 0;
      //this.style.left = 0;

      var content = this.getElementsByTagName('ui-window-content');
      if (content.length > 0) {
        this.content = content[0];
      } else {
        if (this.childNodes.length > 0) {
          this.content = document.createElement('ui-window-content');
          var children = [];
          while (this.childNodes.length > 0) {
            var child = this.childNodes[0];
            this.removeChild(child);
            this.content.appendChild(child);
          }
        }
      }

      if (!this.titlebar) {
        this.titlebar = elation.elements.create('ui.window.titlebar', {append: this});
      }
      this.toolbar = false;
      this.minimized = false;
      this.maximized = false;
      this.transformorigin = "50% 50%";
      this.labels = {
        minimize: '–',
        maximize: '□',
        restore: '₪',
        close: 'x'
      };
      if (this.controls !== false && this.controls != 0 && this.controls !== 'false') {
        this.createcontrols();
      }
      if (this.windowtitle) {
        this.settitle(this.windowtitle);
      } else {
        this.settitle(this.title);
      }
      if (this.toolbar) {
        this.settoolbar(this.toolbar);
      }
      if (this.position) {
        this.setposition(this.position);
      }
      this.setcontent(this.content);

      elation.events.add(window, 'resize,orientationchange', this);

      var curpos = elation.html.position(this);
      //this.addclass("ui_window");
      if (this.movable !== false) {
        this.addclass('state_movable');
        elation.events.add(this, 'mousedown,touchstart', this);
      }
      if (this.left) this.addclass('orientation_left');
      if (this.right) this.addclass('orientation_right');
      if (this.top) this.addclass('orientation_top');
      if (this.bottom) this.addclass('orientation_bottom');
      if (this.center) this.addclass('orientation_center');

      if (this.width) {
        this.style.width = this.width;  
      }
      if (this.height) {
        this.content.style.height = this.height;
      }
      this.refresh();

      if (this.titlebar.parentNode !== this) this.appendChild(this.titlebar);

      this.focus(true);
    }
    render() {
      //super.render();
      if (!this.initialized) {
        this.initUIWindow();
      }
      this.size = this.getsize();
      if (this.center) {
        this.centerwindow();
      }
      // TODO - should "center" be an orientation too?
      if (this.orientation) {
        this.setOrientation(this.orientation);
      }
      if (this.top) {
        this.setposition([this.offsetpos[0], this.top]);
      } else if (this.bottom) {
        this.setposition([this.offsetpos[0], window.innerHeight - this.offsetHeight - this.bottom]);
      }
      if (this.left) {
        this.setposition([this.left, this.offsetpos[1]]);
      } else if (this.right) {
        this.setposition([window.innerWidth - this.offsetWidth - this.right, this.offsetpos[1]]);
      }
    }
    focus(skipmove) {
      if (!this.active) {
        this.windownum = elation.elements.ui.window.numwindows++;
        // first remove focus from any existing active windows
        var activewindows = elation.find('.ui_window.state_active');
        if (activewindows.length > 0) {
          for (var i = 0; i < activewindows.length; i++) {
            //elation.component.fetch(activewindows[i]).blur();
          }
        }
        this.addclass('state_active');
        if (this.minimized) {
          //this.minimize();
        } else {[]
          //this.setposition((this.maximized ? [0,0] : this.offsetpos), false);
          elation.html.transform(this, this.gettransform(), this.transformorigin, (skipmove ? '' : 'all 100ms ease-in-out'));
        }
        this.active = true;
        elation.events.fire({type: 'focus', element: this});
      }
    }
    blur() {
      if (this.active) {
        this.active = false;
        elation.html.removeclass(this, 'state_active');
        elation.events.fire({type: 'blur', element: this});
      }
    }
    createcontrols() {
      var buttons = {};
      if (this.minimizable !== false && this.minimizable != 0) {
        buttons.minimize = { 
          label: this.labels.minimize,
          classname: 'ui_window_control_minimize',
          onclick: (ev) => this.minimize(ev)
        };
      }
      if (this.maximizable !== false && this.maximizable != 0) {
        buttons.maximize = {
          label: this.labels.maximize,
          classname: 'ui_window_control_maximize',
          onclick: (ev) => this.maximize(ev)
        };
      }
      if (this.closable !== false && this.closable != 0) {
        buttons.close = { 
          label: this.labels.close,
          classname: 'ui_window_control_close',
          onclick: (ev) => this.close(ev),
          ontouchend: (ev) => this.close(ev)
        }
      }

/*
      this.controls = elation.ui.buttonbar(null, elation.html.create({classname: 'ui_window_controls'}), {
        buttons: buttons
      });
*/
      this.controlbuttons = document.createElement('ui-buttonbar');
      this.controlbuttons.buttons = buttons;
      this.addclass('ui_window_withcontrols');
      if (this.resizable !== false && this.resizable !== 0 && this.resizable !== '0') {
        this.resizer = elation.html.create({tag: 'div', classname: 'ui_window_resizer', append: this});
      }
    }
    open() {
      this.show();
      this.visible = true;
      elation.events.fire({type: 'ui_window_open', element: this});
    }
    close(ev) {
      if (this.parentNode) {
        //this.parentNode.removeChild(this);
      }
      this.hide();
      this.visible = false;
      elation.events.fire({type: 'ui_window_close', element: this});
      if (ev) ev.stopPropagation();
    }
    minimize(ev) {
      if (this.maximized) {
        this.maximize();
      }
      if (!this.minimized) {
        // minimize
        if (!this.oldtransform) {
          this.oldtransform = elation.html.transform(this);
        }
        this.windownum = -1;
        elation.html.transform(this, this.gettransform(false, false, .25), this.transformorigin, 'all 100ms ease-out');
        this.addclass('state_minimized');
        //this.controls.buttons.minimize.setLabel(this.labels.restore);
        //this.controls.buttons.maximize.setLabel(this.labels.maximize);
        this.minimized = true;
        this.blur();
        elation.events.fire({type: 'ui_window_minimize', element: this});
      } else {
        // restore
        elation.html.removeclass(this, 'state_minimized');
        if (this.oldtransform) {
          this.oldtransform = false;
        }
        //this.controls.buttons.minimize.setLabel(this.labels.minimize);
        this.minimized = false;
        elation.html.transform(this, this.gettransform(), this.transformorigin, 'all 100ms ease-out');
        elation.events.fire({type: 'ui_window_restore', element: this});
      }
      if (ev) ev.stopPropagation();
    }
    maximize(ev) {
      if (!this.maximized) {
        // maximize
        this.focus();
        this.addclass('state_maximized');
  /*
        elation.html.transform(this, this.gettransform([0,0]), this.transformorigin, 'none'); //'all 100ms ease-out');
        this.style.width = window.innerWidth + 'px';
        this.style.height = window.innerHeight + 'px';
  */
        this.restorestate = [this.getposition(), this.getsize()];
        this.setposition([0,0]);
        this.setsize([window.innerWidth, window.innerHeight]);

        //this.controls.buttons.minimize.setLabel(this.labels.minimize);
        //this.controls.buttons.maximize.setLabel(this.labels.restore);
        this.maximized = true;
        elation.events.fire({type: 'ui_window_maximize', element: this});
      } else {
        // restore
        elation.html.removeclass(this, 'state_maximized');
        this.setposition(this.restorestate[0]);
        this.setsize(this.restorestate[1]);
        //elation.html.transform(this, this.gettransform(), this.transformorigin, 'none'); //'all 100ms ease-out');
        //this.controls.buttons.maximize.setLabel(this.labels.maximize);
        this.maximized = false;
        elation.events.fire({type: 'ui_window_restore', element: this});
      }
      if (this.minimized) {
        elation.html.removeclass(this, 'state_minimized'); // clear minimized flag if set
        this.minimized = false;
      }
      if (ev) ev.stopPropagation();
    }
    getsize() {
      return [this.offsetWidth, this.offsetHeight];
    }
    setsize(size) {
      elation.html.transform(this, this.gettransform(), this.transformorigin, 'none');
      if (this.style.width != 'auto') this.style.width = 'auto';
      if (this.style.height != 'auto') this.style.height = 'auto';
      this.content.style.width = size[0] + 'px';
      this.content.style.height = (Math.min(window.innerHeight, size[1]) - this.titlebar.offsetHeight - (this.toolbar ? this.toolbar.offsetHeight : 0)) + 'px';
      this.size[0] = size[0];
      this.size[1] = size[1];
  //alert('setted:' + this.size[0] + 'x' + this.size[1] + ", " + this.content.style.width + " x " + this.content.style.height);
    }
    centerwindow() {
      var dim = elation.html.dimensions(this);
      if (dim.w > window.innerWidth && !this.maximized) {
        this.maximize();
        //this.setsize([window.innerWidth, window.innerHeight]);
      }
      var realx = (window.innerWidth - this.offsetWidth) / 2;
      var realy = (window.innerHeight - this.offsetHeight) / 2;
      // TODO - border width should be detected automatically using getComputedStyle
      var borderwidth = 4;
      this.content.style.maxHeight = (window.innerHeight - this.content.offsetTop - borderwidth) + 'px';
      this.setposition([realx, realy]);
    }
    drag(diff) {
    }
    getposition() {
      return [this.offsetpos[0], this.offsetpos[1]];
    }
    setposition(pos, animate) {
      this.offsetpos[0] = pos[0];
      this.offsetpos[1] = pos[1];
      elation.html.transform(this, this.gettransform(), this.transformorigin, (animate ? 'all 100ms ease-in-out' : 'none'));
    }
    settitle(newtitle) {
      if (newtitle instanceof HTMLElement) {
        if (this.titlebar) {
          this.replaceChild(newtitle, this.titlebar);
        } else {
          this.appendChild(newtitle);
        }
        this.titlebar = newtitle;
        if (!elation.html.hasclass(this.titlebar, 'ui_window_titlebar')) {
          elation.html.addclass(this.titlebar, 'ui_window_titlebar');
        }
      } else {
        if (!this.titlebar) {
          this.titlebar = elation.elements.create('ui.window.titlebar', {append: this});
        }
        this.titlebar.innerHTML = "<span class='ui_window_titlebar_span'>"+newtitle+"</span>" || '';
      }
      if (this.controlbuttons) {
        //this.titlebar.appendChild(this.controlbuttons);
        this.titlebar.insertBefore(this.controlbuttons, this.titlebar.firstChild);
      }
    }
    settoolbar(newtoolbar) {
      if (this.toolbar) {
        this.removeChild(this.toolbar);
      }
      if (newtoolbar instanceof elation.component.base) {
        newtoolbar = newtoolbar.container;
      } else if (newtoolbar instanceof HTMLElement) {
        // ...
      } else {
        newtoolbar = elation.html.create({tag: 'div', content: newtoolbar});
      }
      this.toolbar = newtoolbar;
      this.insertBefore(newtoolbar, this.titlebar.nextSibling);
      if (!elation.html.hasclass(this.toolbar, 'ui_window_toolbar')) {
        elation.html.addclass(this.toolbar, 'ui_window_toolbar');
      }
    }
    setcontent(newcontent) {
      if (newcontent instanceof HTMLElement) {
        this.setcontenthtml(newcontent);
      } else if (newcontent instanceof elation.component.base) {
        this.setcontenthtml(newcontent.container);
      } else {
        if (!this.content) {
          this.content = elation.html.create({tag: 'ui-window-content', classname: 'ui_window_content', append: this});
        }
        if (!elation.utils.isNull(newcontent)) {
          this.content.innerHTML = newcontent;
        }
      }
      elation.component.init();
      this.refresh();
      //elation.html.addclass(newcontent, 'ui_window_content');
    }
    setcontenthtml(newcontent) {
      if (this.content && this.content.parentNode) {
        this.content.parentNode.removeChild(this.content);
      }
      if (newcontent.parentNode) newcontent.parentNode.removeChild(newcontent);
    
      this.appendChild(newcontent);
      this.content = newcontent;
    }
    gettransform(pos, layer, scale) {
      if (!pos && pos !== 0) pos = this.offsetpos;
      if (!layer && layer !== 0) layer = this.windownum;
      if (!scale) scale = (this.minimized ? .25 : 1);
      return 'translate3d(' + Math.round(pos[0]) + 'px, ' + Math.round(pos[1]) + 'px, ' + layer + 'px) scale(' + scale + ')';
    }
    animationstart() {
      this.animating = true;
      this.animate();
    }
    animationend() {
      this.animating = false;
    }
    animate(animating) {
      if (this.animating && (this.dirtysize || this.dirtyposition)) {
        if (!this.boundfunc) this.boundfunc = elation.bind(this, this.animate);
        if (window.requestAnimationFrame) requestAnimationFrame(this.boundfunc); 
        else if (window.webkitRequestAnimationFrame) webkitRequestAnimationFrame(this.boundfunc); 
        else if (window.mozRequestAnimationFrame) mozRequestAnimationFrame(this.boundfunc); 
        else if (window.msRequestAnimationFrame) msRequestAnimationFrame(this.boundfunc); 
        else { setTimeout(this.boundfunc, 1/60); }
      }
      if (this.dirtysize) {
        this.dirtysize = false;
        this.setsize(this.size);
      }
      if (this.dirtyposition) {
        this.dirtyposition = false;
        this.setposition(this.offsetpos, false);
      }
    }
    dragstart(ev) {
      this.dragstartpos = (ev.touches ? [ev.touches[0].clientX, ev.touches[0].clientY] : [ev.clientX, ev.clientY]);
      this.dirtyposition = this.dirtysize = false;
      this.newpos = [0, 0];
      if (elation.utils.isin(this.titlebar, ev.target) || this.minimized) {
        // titlebar dragging
        elation.html.addclass(this.titlebar, 'state_dragging');
        this.dragging = false;
        elation.events.add(window, 'mousemove,mouseup,touchmove,touchend', this);
        this.animationstart();
        ev.preventDefault();
      } else if (ev.target == this.resizer) {
        this.size = this.getsize();
        this.resizing = true;
        elation.events.add(window, 'mousemove,mouseup,touchmove,touchend', this);
        this.animationstart();
        ev.preventDefault();
      }
    }
    dragmove(ev) {
      this.newpos[0] = (ev.touches ? ev.touches[0].clientX : ev.clientX);
      this.newpos[1] = (ev.touches ? ev.touches[0].clientY : ev.clientY);
      //var diff = [this.dragstartpos[0] - newpos[0], this.dragstartpos[1] - newpos[1]];
      // limit left side offset to prevent windows from getting lost
      //this.style.left = Math.max(newpos[0] + this.dragdims.x - this.dragstartpos[0], this.dragdims.w * -.9) + 'px';
      //this.style.top = (newpos[1] + this.dragdims.y - this.dragstartpos[1]) + 'px';
      //this.offsetpos = [Math.max(newpos[0] + this.dragdims.x - this.dragstartpos[0], this.dragdims.w * -.9), (newpos[1] + this.dragdims.y - this.dragstartpos[1])];
      var wasanimating = (this.animating && (this.dirtysize || this.dirtyposition));
      if (this.resizing) {
        if (this.right) {
          this.offsetpos[0] -= (this.dragstartpos[0] - this.newpos[0]);
          this.size[0] += (this.dragstartpos[0] - this.newpos[0]);
        } else {
          this.size[0] -= (this.dragstartpos[0] - this.newpos[0]);
        }

        if (this.bottom) {
          this.offsetpos[1] -= (this.dragstartpos[1] - this.newpos[1]);
          this.size[1] += (this.dragstartpos[1] - this.newpos[1]);
        } else {
          this.size[1] -= (this.dragstartpos[1] - this.newpos[1]);
        }
        this.dirtysize = true;
      } else {
        this.dirtyposition = true;
        this.offsetpos = [this.offsetpos[0] - (this.dragstartpos[0] - this.newpos[0]), this.offsetpos[1] - (this.dragstartpos[1] - this.newpos[1])];
      }
      if (!wasanimating && (this.dirtysize || this.dirtyposition)) {
        this.animate();
      }
      this.dragstartpos[0] = this.newpos[0];
      this.dragstartpos[1] = this.newpos[1];
      this.dragging = true;
    }
    dragend(ev) {
      if (this.resizing) {
        elation.events.remove(window, 'mousemove,mouseup,touchmove,touchend', this);
        this.resizing = false;
      } else {
        elation.events.remove(window, 'mousemove,mouseup,touchmove,touchend', this);
        elation.html.removeclass(this.titlebar, 'state_dragging');
        if (this.minimized && !this.dragging) {
          this.minimize();
        }
      }
      this.dragging = false;
      //this.dragstartpos = [0,0];
      this.animationend();
    }
    onmousedown(ev) {
      if (ev.button == 0) {
        this.dragstart(ev);
      }
      this.focus();
      ev.stopPropagation();
    }
    onmousemove(ev) {
      this.dragmove(ev);
    }
    onmouseup(ev) {
      if (ev.button == 0) {
        this.dragend(ev);
      }
    }
    ontouchstart(ev) {
      if (ev.touches.length == 1 && !this.maximized) {
        this.dragstart(ev);
      }
      this.focus();
    }
    ontouchmove(ev) {
      if (ev.touches.length == 1 && !this.maximized) {
        this.dragmove(ev);
      }
    }
    ontouchend(ev) {
      if (ev.touches.length == 0) {
        this.dragend(ev);
      }
    }
    onresize(ev) {
      if (this.maximized) {
        this.setsize([window.innerWidth, window.innerHeight]);
      }
      this.refresh();
    }
    onorientationchange(ev) {
      if (this.maximized) {
        this.setsize([window.innerWidth, window.innerHeight]);
      }
      this.refresh();
    }
  });
  elation.elements.define('ui.window.titlebar', class extends elation.elements.base {
  });
  elation.elements.define('ui.window.content', class extends elation.elements.base {
  });
})();
// ===== END COMPONENT: elements.ui.window =====

// ===== BEGIN COMPONENT: elements.ui.tooltip ====
(
function() {
  elation.requireCSS('ui.tooltip');

  /**
   * Headless floating window that follows the mouse while its parent is
   * hovered and auto-hides on `mouseout`. Contents are set via
   * `setcontent()` the same way as `ui.window`.
   *
   * @class tooltip
   * @hideconstructor
   * @category UI
   * @augments elation.elements.ui.window
   * @memberof elation.elements.ui
   */
  elation.elements.define('ui.tooltip', class extends elation.elements.ui.window {
    init() {
      super.init();
      this.controls = false;
      this.handleMouseMove = elation.bind(this, this.handleMouseMove);
      this.handleMouseOut = elation.bind(this, this.handleMouseOut);
    }
    create() {
      super.create();
      if (this.preview) {
        this.setcontent('This is a tooltip');
      }
    }
    show() {
      if (!this.visible) {
        super.show();
        if (this.parentNode) {
          elation.events.add(this.parentNode, 'mousemove', this.handleMouseMove);
          elation.events.add(this.parentNode, 'mouseout', this.handleMouseOut);
        }
      }
    }
    hide() {
      if (this.visible) {
        super.hide();
        if (this.parentNode) {
          elation.events.remove(this.parentNode, 'mousemove', this.handleMouseMove);
          elation.events.remove(this.parentNode, 'mouseout', this.handleMouseOut);
        }
      }
    }
    handleMouseMove(ev) {
      this.setposition([ev.x, ev.y], false);
    }
    handleMouseOut(ev) {
      this.close();
    }
  });
})();
// ===== END COMPONENT: elements.ui.tooltip =====

// ===== BEGIN COMPONENT: elements.ui.formgroup ====
(
function() {
  elation.requireCSS('ui.formgroup');

  /**
   * Container for grouping form controls under an optional header label.
   * Use as a logical (and visual) section divider inside larger forms.
   *
   * @class formgroup
   * @hideconstructor
   * @category UI
   * @augments elation.elements.base
   * @memberof elation.elements.ui
   * @example
   * <ui-formgroup label="Account">
   *   <ui-input placeholder="Email"></ui-input>
   *   <ui-input type="password" placeholder="Password"></ui-input>
   * </ui-formgroup>
   *
   * @param {object} args
   * @param {string} args.label
   */
  elation.elements.define('ui.formgroup', class extends elation.elements.base {
    init() {
      super.init();
      this.defineAttributes({
        'label': { type: 'string' }
      });
    }
    create() {
      if (this.label) {
        this.labelobj = elation.elements.create('ui-label', {
          label: this.label,
          append: this,
          class: 'groupheader'
        });
      }
    }
  });
})();
// ===== END COMPONENT: elements.ui.formgroup =====

// ===== BEGIN COMPONENT: elements.ui.columnlayout ====
(
function() {
  elation.requireCSS('ui.columnlayout');

  /**
   * List variant that arranges its items into a fixed number of columns.
   *
   * @class columnlayout
   * @hideconstructor
   * @category UI
   * @augments elation.elements.ui.list
   * @memberof elation.elements.ui
   * @example
   * <ui-columnlayout columns="4">
   *   <li>One</li>
   *   <li>Two</li>
   *   <li>Three</li>
   * </ui-columnlayout>
   *
   * @param {object} args
   * @param {integer} args.columns
   */
  elation.elements.define('ui.columnlayout', class extends elation.elements.ui.list {
    init() {
      super.init();
      this.defineAttributes({
        columns: { type: 'integer', default: 3 }
      });
    }
  });
})();
// ===== END COMPONENT: elements.ui.columnlayout =====

// ===== BEGIN COMPONENT: elements.ui.collapsiblepanel ====
(
function() {
  elation.requireCSS('ui.collapsiblepanel');

  /**
   * Panel that slides open and closed via a toggle handle. Content is
   * wrapped in double-div containers so the collapse animation can use
   * hardware-accelerated CSS transforms; the handle doubles as a drag
   * resize grip. Set `hideempty` to auto-hide the panel when it has no
   * children.
   *
   * @class collapsiblepanel
   * @hideconstructor
   * @category UI
   * @augments elation.elements.ui.panel
   * @memberof elation.elements.ui
   * @example
   * <ui-collapsiblepanel left>
   *   <p>Sidebar contents</p>
   * </ui-collapsiblepanel>
   *
   * @param {object} args
   * @param {boolean} args.collapsed
   * @param {boolean} args.peek
   * @param {boolean} args.hideempty
   */
  elation.elements.define('ui.collapsiblepanel', class extends elation.elements.ui.panel {
    init() {
      super.init();
      this.defineAttributes({
        collapsed: { type: 'boolean', default: false },
        peek: { type: 'boolean', default: false },
        hideempty: { type: 'boolean', default: false }
      });

      this.handleMouseMove = this.handleMouseMove.bind(this);
      this.handleMouseUp = this.handleMouseUp.bind(this);
    }
    create() {
      super.create();
  
      // We want to put our content inside of two wrapper divs, which will let us
      // slide our content in and out in an efficient way.  We use hardware-accelerated
      // CSS transforms for smooth animations, and the containing div uses overflow to
      // make the content disappear when collapsed.

      // Extract our children - we'll reparent them later
      var children = [];
      while (this.childNodes.length > 0) {
        children.push(this.childNodes[0]);
        this.removeChild(this.childNodes[0]);
      }

      // The handle that's used to toggle this panel open or closed
      this.handle = elation.elements.create('ui.togglebutton', {
        append: this,
        label: '',
        onactivate: (ev) => this.expand(),
        ondeactivate: (ev) => this.collapse(),
        onmousedown: (ev) => this.startResize(ev)
      });
      this.handle.addclass('collapse');

      // Our outer wrapper
      this.container = elation.elements.create('div', {
        append: this,
        class: 'container'
      });

      // Our main container
      this.inner = elation.elements.create('div', {
        append: this.container,
        class: 'container-inner'
      });

      // Re-add the children
      for (var i = 0; i < children.length; i++) {
        this.inner.appendChild(children[i]);
      } 

      this.addclass('default');

      if (this.collapsed) {
        this.collapse();
      } else {
        this.expand();
      }
    }
    appendChild(child) {
      return (this.inner ? this.inner.appendChild(child) : HTMLElement.prototype.appendChild.call(this, child));
    }
    updateLabel() {
      let dirs = {
        'up': '^',
        'down': 'v',
        'left': '<',
        'right': '>',
      };
      let dir = 'right';
      if (this.top) {
        dir = (this.collapsed ? 'down' : 'up');
      } else if (this.bottom) {
        dir = (this.collapsed ? 'up' : 'down');
      }
      if (this.left) {
        dir = (this.collapsed ? 'right' : 'left');
      } else if (this.right) {
        dir = (this.collapsed ? 'left' : 'right');
      }
      this.handle.setLabel(dirs[dir]);
    }
    render() {
      super.render();
/*
      var collapsed = this.collapsed;
      this.collapsed = false;
      this.collapsed = collapsed;
*/
      if (this.hideempty && this.inner) {
        if (this.inner.childNodes.length == 0) {
          this.hide();
        } else {
          this.show();
        }
      }
    }
    collapse() {
      var dim = this.inner.getBoundingClientRect();
      this.inner.style.width = dim.width + 'px';
      if (this.left || this.right) {
        this.container.style.width = '0px';
      } else if (this.top || this.bottom) {
        this.container.style.height = '0px';
      }
      this.collapsed = true;
      //this.style.width = 0;
      this.updateLabel();
    }
    expand() {
      if (this.inner.offsetWidth == 0) {
        this.inner.style.width = 'auto';
      } else {
        //this.style.width = this.inner.offsetWidth + 'px';
      }
      this.container.style.width = 'auto';
      this.container.style.height = 'auto';
      this.collapsed = false;
      this.updateLabel();
    }
    startResize(ev) {
      if (ev.button == 0) {
        window.addEventListener('mousemove', this.handleMouseMove); 
        window.addEventListener('mouseup', this.handleMouseUp); 
        this.resizepos = [ev.clientX, ev.clientY];
      }
    }
    handleMouseMove(ev) {
      if (this.hasclass('default')) {
        this.removeclass('default');
      }
      if (this.top || this.bottom) {
        var height = this.inner.offsetHeight + (this.resizepos[1] - ev.clientY);
        this.container.style.height = height + 'px';
        this.inner.style.height = height + 'px';
      }
      if (this.left || this.right) {
        var width = this.inner.offsetWidth + (this.resizepos[0] - ev.clientX);
        this.container.style.width = width + 'px';
        this.inner.style.width = width + 'px';
      }
      this.resizepos[0] = ev.clientX;
      this.resizepos[1] = ev.clientY;
    }
    handleMouseUp(ev) {
      window.removeEventListener('mousemove', this.handleMouseMove); 
      window.removeEventListener('mouseup', this.handleMouseUp); 
    }
  });
})();
// ===== END COMPONENT: elements.ui.collapsiblepanel =====

// ===== BEGIN COMPONENT: elements.ui.content ====
(
function() {
  elation.requireCSS('ui.content');

  /**
   * Generic content container. Assigning a string or `HTMLElement` to
   * `value` replaces the current contents — useful as a slot for
   * dynamic content, e.g. inside `ui.window` or `ui.popupbutton`.
   *
   * @class content
   * @hideconstructor
   * @category UI
   * @augments elation.elements.base
   * @memberof elation.elements.ui
   *
   * @param {object} args
   * @param {string} args.align
   * @param {object} args.value
   */
  elation.elements.define('ui.content', class extends elation.elements.base {
    init() {
      super.init();
      this.defineAttributes({
        align: { type: 'string' },
        value: { type: 'object', set: this.updateContent }
      });
      this.updateContent(this.value);
    }
    updateContent(value) {
      if (value instanceof HTMLElement) {
        this.innerHTML = '';
        this.appendChild(value);
      } else if (elation.utils.isString(value)) {
        this.innerHTML = value;
      }
    }
  });
})();
// ===== END COMPONENT: elements.ui.content =====

// ===== BEGIN COMPONENT: elements.ui.treeview ====
(
function() {
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
      this.innerHTML = '';
      this.add(items, this, attrs);
    }
    add(items, root, attrs) {
      if (!root) root = this;

      //var ul = elation.html.create({tag: 'ul', append: root});
      //var list = elation.elements.create('ui-list', {append: root});

      // alphabetize the keys
      var keys = Object.keys(items);
      keys.sort((a, b) => a.localeCompare(b));

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
            tvitem.draggable = 'true';
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
            //elation.html.addclass(tvitem, 'state_expanded');
            tvitem.collapsed = true;
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
    find(search) {
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
})();
// ===== END COMPONENT: elements.ui.treeview =====

// ===== BEGIN COMPONENT: elements.ui.scrollindicator ====
(
function() {
  elation.elements.define("ui.scrollindicator", class extends elation.elements.base {
    init() {
      super.init();
      this.defineAttributes({
        target: { type: 'string' },
      });
    }
    create() {
      elation.events.add(this, 'click', this.handleClick);
    }
    handleClick(ev) {
      if (this.target) {
        let el = document.querySelector(this.target);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          ev.preventDefault();
        }
      }
    }
  });
})();
// ===== END COMPONENT: elements.ui.scrollindicator =====

// ===== BEGIN COMPONENT: elements.ui.spinner ====
(
function() {
  elation.requireCSS('ui.spinner');

  elation.elements.define('ui.spinner', class extends elation.elements.base {
    init() {
      super.init();

      this.defaultcontainer = { tag: 'div', classname: 'ui_spinner' };
      this.defineAttributes({
        label: { type: 'string', default: 'loading' },
        type: { type: 'string', default: 'default' },
        full: { type: 'boolean', default: false }
      });

      this.types = {
        'default': '<div class="loading-container"><div class="loading"></div><div class="loading-text">{label}</div></div>',
        'dark': '<div class="loading-container dark"><div class="loading"></div><div class="loading-text">{label}</div></div>'
      };
    }

    create() {
      this.settype(this.type);
    }
    settype(type) {
      if (!type) type = 'default';
      if (this.type) {
        elation.html.removeclass(this.container, 'ui_spinner_' + this.type);
      }

      elation.template.add('ui.spinner.types.' + type, this.types[type]);
      this.type = type;
      elation.html.addclass(this.container, 'ui_spinner_' + this.type);
      //this.innerHTML = this.types[this.type];
      this.innerHTML = elation.template.get('ui.spinner.types.' + type, this);
    }
    setlabel(label) {
      this.label = label;
      this.innerHTML = elation.template.get('ui.spinner.types.' + this.type, this);
    }
  });
})();
// ===== END COMPONENT: elements.ui.spinner =====

// ===== BEGIN COMPONENT: elements.ui.imagepicker ====
(
function() {
  elation.requireCSS('ui.imagepicker');

  /**
   * Image file-picker control with a preview canvas. Accepts file input via
   * the standard `<input type="file">` flow and renders the selected image
   * into an adjacent `<canvas>`. Use `onaccept` to receive the selected
   * image data.
   *
   * @class imagepicker
   * @hideconstructor
   * @category UI
   * @augments elation.elements.base
   * @memberof elation.elements.ui
   * @example
   * <ui-imagepicker label="Avatar"></ui-imagepicker>
   *
   * @param {object} args
   * @param {boolean} args.hidden
   * @param {string} args.label
   * @param {string} args.type
   * @param {string} args.placeholder
   * @param {string} args.value
   * @param {boolean} args.disabled
   * @param {boolean} args.autofocus
   * @param {callback} args.onaccept
   */
  elation.elements.define('ui.imagepicker', class extends elation.elements.base {
    init() {
      super.init();
      this.defineAttributes({
        hidden: { type: 'boolean', default: false },
        label: { type: 'string' },
        type: { type: 'string' },
        placeholder: { type: 'string' },
        value: { type: 'string', get: this.getValue, set: this.setValue },
        disabled: { type: 'boolean', default: false },
        autofocus: { type: 'boolean', get: this.getAutofocus, set: this.setAutofocus },
        onaccept: { type: 'callback' },
      });
    }
    create() {
      if (this.label) {
        //this.labelobj = elation.ui.label({ append: this, label: this.label });
        this.labelobject = elation.elements.create('ui.label', { append: this, label: this.label });
        elation.events.add(this.labelobject, 'click', (ev) => { this.focus(); ev.stopPropagation(); });
      }
      this.preview = elation.elements.create('canvas', {
        append: this,
      });
    }
  });
})();
// ===== END COMPONENT: elements.ui.imagepicker =====

// ===== BEGIN COMPONENT: elements.ui.wizard ====
(
function() {
  elation.requireCSS('ui.wizard');

  /**
   * Multi-step workflow container. Each step is a `<ui-wizard-step>`. Set
   * `type="paginate"` for one-step-at-a-time navigation with back/next
   * buttons, or `type="scroll"` for a vertically-scrolling single page.
   *
   * @class wizard
   * @hideconstructor
   * @category UI
   * @augments elation.elements.base
   * @memberof elation.elements.ui
   * @example
   * <ui-wizard type="paginate">
   *   <ui-wizard-step id="intro">
   *     <p>Step one.</p>
   *     <ui-wizard-pagination></ui-wizard-pagination>
   *   </ui-wizard-step>
   *   <ui-wizard-step id="done">
   *     <p>Step two.</p>
   *     <ui-wizard-pagination></ui-wizard-pagination>
   *   </ui-wizard-step>
   * </ui-wizard>
   *
   * @param {object} args
   * @param {integer} args.step
   * @param {string} args.type
   * @param {callback} args.oncomplete
   * @param {boolean} args.freeflow when set, all steps are reachable from the start; <code>ui-wizard-navigation</code> and <code>ui-wizard-pagination</code> won't disable buttons for unfinished steps. Default behaviour gates progression on each step's <code>finished</code> flag.
   */
  elation.elements.define('ui-wizard', class extends elation.elements.base {
    constructor() {
      super();
      this.defineAttributes({
        'step': {type: 'integer', default: 1},
        'type': {type: 'string', default: 'paginate'}, // "paginate" or "scroll"
        'oncomplete': {type: 'callback'},
        'freeflow': {type: 'boolean', default: false}
      });
    }
    create() {
      this.steps = this.getSteps();
      this.step = 1;
      //elation.events.add(this, 'wizard_advance', (ev) => { console.log('wizard advance', ev); this.advance(); ev.stopPropagation(); });
      elation.events.add(this, 'wizard_complete', (ev) => { this.advance(); });
      //this.addEventListener('wizard_advance', (ev) => { this.advance(); ev.stopPropagation(); });
      //this.addEventListener('wizard_complete', (ev) => { this.advance(); });
      //this.setAttribute('role', 'tablist');
      this.steps[0].start();
    }
    getSteps() {
      let steps = [];
      this.childNodes.forEach(n => {
        if (n.tagName == 'UI-WIZARD-STEP' && !steps.skip) {
          steps.push(n);
        }
      });
      return steps;
    }
    advance(id) {
      let laststepel = this.steps[this.step - 1];
      if (id) {
        if (elation.utils.isString(id)) {
          // If we passed in a string, we're advancing TO the element that matches the specified id
          //console.log('advance wizard to id', this, id);
          for (let i = 0; i < this.steps.length; i++) {
            if (this.steps[i].id == id) {
              this.step = i + 1;
              break;
            }
          }
        } else {
          // If we passed in a <wizard-step> element, advance to the NEXT step after the specified one
          //console.log('check the step', id, this.steps);
          for (let i = 0; i < this.steps.length; i++) {
            if (this.steps[i] === id) {
              this.step = i + 2;
              //console.log('found the step', this.step);
              break;
            }
          }
        }
      } else {
        //console.log('advance wizard', this.step, this.steps.length);
        this.step = this.step + 1;
        if (this.step >= this.steps.length) {
          this.step = this.steps.length;
          this.finish();
        }
      }
      let stepel = this.steps[this.step - 1];
      if (laststepel) {
        laststepel.finish();
      }
      if (stepel) {
        stepel.start();
        if (this.type == 'scroll') {
          //console.log('scroll into view!', stepel);
          stepel.scrollIntoView({ behavior: 'smooth' });
        }
      }
      this.dispatchEvent({type: 'step', detail: this.step });
    }
    goback() {
      const oldStep = this.step;
      this.step = Math.max(1, this.step - 1);
      if (this.step !== oldStep) {
        const stepel = this.steps[this.step - 1];
        if (stepel) stepel.start();
        this.dispatchEvent({type: 'step', detail: this.step});
      }
    }
    finish() {
      if (this.oncomplete) {
        //this.dispatchEvent({type: 'wizard_complete'});
      }
    }
  });
  /** 
   * Wizard Back button UI element
   *
   * @class wizard-backbutton
   * @hideconstructor
   * @category UI
   * @augments elation.elements.ui.button
   * @memberof elation.elements.ui
   */
  elation.elements.define('ui-wizard-backbutton', class extends elation.elements.ui.button {
    create() {
      super.create();
      this.addEventListener('click', (ev) => this.parentNode.goback());
    }
  });
  /** 
   * Wizard Step UI element
   *
   * @class wizard-step
   * @hideconstructor
   * @category UI
   * @augments elation.elements.base
   * @memberof elation.elements.ui
   *
   * @param {object} args
   * @param {boolean} args.skip
   * @param {boolean} args.finished
   * @param {string}   args.navlabel display label used by <code>ui-wizard-navigation</code>; falls back to the step's <code>id</code>.
   * @param {callback} args.onstart
   * @param {callback} args.onfinish
   */
  elation.elements.define('ui-wizard-step', class extends elation.elements.base {
    constructor() {
      super();
      this.defineAttributes({
        'skip': {type: 'boolean', default: false },
        'finished': {type: 'boolean', default: false },
        'navlabel': {type: 'string' },
        'onstart': {type: 'callback' },
        'onfinish': {type: 'callback'},
        'pending': {type: 'boolean', default: true},
      });
    }
    create() {
      //this.setAttribute('aria-live', 'off');
      //this.setAttribute('role', 'tab');
      //this.setAttribute('aria-selected', 'false');
      //this.setAttribute('role', 'dialog');
      //this.setAttribute('aria-hidden', 'true');
      this.setAttribute('pending', 'pending');
      let wizard = this.closest('ui-wizard');
      elation.events.add(this, 'wizard_advance', (ev) => { console.log('wizard advance', ev, wizard); wizard.advance(this); ev.stopPropagation(); });
    }
    start() {
      this.focus();
      this.dispatchEvent({type: 'start'});
      //this.setAttribute('aria-selected', 'true');
      this.setAttribute('role', 'dialog');
      //this.setAttribute('aria-hidden', 'false');
      setTimeout(() => {
        this.removeAttribute('pending');
      }, 0);
    }
    finish() {
      this.finished = true;
      //console.log('step finished', this);
      this.dispatchEvent({type: 'finish'});
      //this.setAttribute('aria-selected', 'false');
      this.removeAttribute('role');
      //this.setAttribute('aria-hidden', 'true');
    }
  });
  elation.elements.define('ui-wizard-pagination', class extends elation.elements.base {
    create() {
      let wizard = this.queryParentSelector('ui-wizard'),
          step = this.queryParentSelector('ui-wizard-step');
      let freeflow = !!wizard.freeflow;
      if (wizard.type == 'paginate') {
        if (step !== wizard.steps[0]) {
          this.backbutton = elation.elements.create('ui-button', {
            label: 'Back',
            disabled: false,
            append: this,
            'class': 'back',
          });
          elation.events.add(this.backbutton, 'click', ev => wizard.goback());
        }
        if (step !== wizard.steps[wizard.steps.length - 1]) {
          this.nextbutton = elation.elements.create('ui-button', {
            label: 'Next',
            disabled: !freeflow,
            append: this,
            'class': 'next',
          });
          elation.events.add(this.nextbutton, 'click', ev => {
            if (!this.nextbutton.disabled) wizard.advance()
          });
          if (!freeflow) elation.events.add(step, 'finish', ev => {
            this.nextbutton.disabled = false
          });
        }
      } else if (wizard.type == 'scroll') {
        elation.elements.create('ui-scrollindicator', { append: this });
      }
    }
  });
  elation.elements.define('ui-wizard-navigation', class extends elation.elements.base {
    create() {
      let wizard = this.queryParentSelector('ui-wizard');
      let freeflow = !!wizard.freeflow;
      let buttonbar = elation.elements.create('ui-buttonbar', {
        append: this
      });
      this.buttons = [];
      wizard.steps.forEach(step => {
        let button = elation.elements.create('ui-button', {
          label: step.navlabel || step.id,
          disabled: !freeflow && !step.finished,
          append: buttonbar
        });
        button.addEventListener('click', ev => {
          if (!button.disabled) {
            wizard.advance(step.id);
          }
        });
        if (!freeflow) {
          elation.events.add(step, 'finish', ev => {
            button.disabled = false;
          });
        }
        this.buttons.push(button);
      });
      elation.events.add(wizard, 'step', ev => {
        for (let i = 0; i < this.buttons.length; i++) {
          this.buttons[i].setActive((i == ev.detail - 1));
          if (!freeflow) {
            this.buttons[i].disabled = (i > ev.detail - 1) && !wizard.steps[i].finished;
          }
        }
        this.buttons[0].disabled = false;
      });
      this.buttons[0].disabled = false;
      this.buttons[0].setActive(true);
    }
  });
})();
// ===== END COMPONENT: elements.ui.wizard =====

// ===== BEGIN EXTERNAL FILE: elements.ui.all ====
elation.require([
  'elements.base',
  'elements.ui.text',
  'elements.ui.label',
  'elements.ui.button',
  'elements.ui.togglebutton',
  'elements.ui.dropdownbutton',
  'elements.ui.popupbutton',
  'elements.ui.notificationbutton',
  'elements.ui.buttonbar',
  'elements.ui.radiobuttonbar',
  'elements.ui.buttonlist',
  'elements.ui.input',
  'elements.ui.textarea',
  'elements.ui.toggle',
  'elements.ui.checkbox',
  'elements.ui.radio',
  'elements.ui.select',
  'elements.ui.slider',
  'elements.ui.list',
  'elements.ui.grid',
  'elements.ui.checklist',
  'elements.ui.panel',
  'elements.ui.tabs',
  'elements.ui.togglebutton',
  'elements.ui.window',
  'elements.ui.tooltip',
  'elements.ui.formgroup',
  'elements.ui.columnlayout',
  'elements.ui.collapsiblepanel',
  'elements.ui.content',
  'elements.ui.treeview',
  'elements.ui.scrollindicator',
  'elements.ui.spinner',
  'elements.ui.imagepicker',
  'elements.ui.wizard',
]);

// ===== END EXTERNAL FILE: elements.ui.all =====

// ===== BEGIN COMPONENT: elements.collection.simple ====
(
function() {
  /**
   * Fired when new objects are added to this collection
   * @event elation.elements.collection.simple#collection_add
   * @type {Object}
   */
  /**
   * Fired when new objects are removed from this collection
   * @event elation.elements.collection.simple#collection_remove
   * @type {Object}
   */
  /**
   * Fired when an object is moved to a new position within this collection
   * @event elation.elements.collection.simple#collection_move
   * @type {Object}
   */
  /**
   * Fired when this collection is cleared
   * @event elation.elements.collection.simple#collection_clear
   * @type {Object}
   */

  /**
   * In-memory data collection. Holds an ordered array of items and emits
   * `collection_add` / `collection_remove` / `collection_move` /
   * `collection_clear` events when the contents change. Bind a list-style
   * UI element (`ui.list`, `ui.grid`, `ui.tabs`, …) to a collection by
   * setting its `collection` attribute and the UI element will keep itself
   * in sync with the data automatically.
   *
   * Base class for every other collection in the library — REST-backed
   * (`api`, `jsonapi`, `jsonpapi`), index-enforced (`indexed`,
   * `localindexed`, `sqlite`), and derivers (`filter`, `subset`, `custom`).
   *
   * @class simple
   * @hideconstructor
   * @category Collections
   * @augments elation.elements.base
   * @memberof elation.elements.collection
   * @example
   * const people = elation.elements.create('collection-simple', {
   *   items: [{ name: 'Ada' }, { name: 'Grace' }]
   * });
   * people.add({ name: 'Hedy' });
   * elation.events.add(people, 'collection_add', ev => console.log('+', ev.data.item));
   *
   * @param {object} args
   * @param {array} args.items
   * @param {boolean} args.allowduplicates
   * @param {object} args.datatransform
   */
  elation.elements.define('collection.simple', class extends elation.elements.base {
    init() {
      super.init();
      this.defineAttributes({
        items: { type: 'array', default: [] },
        length: { type: 'integer', get: this.getlength },
        allowduplicates: { type: 'boolean', default: false },
        datatransform: { type: 'object', default: {} }
      });

      //this.items = [];
    }

    /**
     * Add an item, optionally at a specified position
     * @function add
     * @memberof elation.elements.collection.simple#
     * @param {object} item
     * @param {integer} pos
     * @returns {boolean}
     * @emits collection_add
     */
    add(item, pos) {
      if (this.allowduplicates || !this.contains(item)) {
        if (pos == undefined || pos >= this.items.length) {
          this.items.push(item);
        } else {
          this.items.splice(pos, 0, item);
        }
        elation.events.fire({type: 'collection_add', element: this, data: {item: item}, itemcount: this.items.length});
        return true;
      }
      return false;
    }
    /**
     * Remove an item
     * @function remove
     * @memberof elation.elements.collection.simple#
     * @param {object} item
     * @returns {boolean}
     * @emits collection_remove
     */
    remove(item) {
      var idx = this.find(item);
      if (idx != -1) {
        this.items.splice(idx, 1);
        elation.events.fire({type: 'collection_remove', element: this, data: {item: item}, itemcount: this.items.length});
        return true;
      }
      return false;
    }
    /**
     * Move an item to a new position
     * @function move
     * @memberof elation.elements.collection.simple#
     * @param {object} item
     * @param {integer} pos
     * @returns {boolean}
     * @emits collection_move
     */
    move(item, pos) {
      var idx = this.items.indexOf(item);
      if (idx != -1 && idx != pos) {
        this.items.splice(idx, 1);
        this.items.splice(pos, 0, item);
        elation.events.fire({type: 'collection_move', element: this, data: {item: item, from: idx, to: pos}, itemcount: this.items.length});
        return true;
      }
      return false;
    }
    /**
     * Return the item index of the specified item
     * @function find
     * @memberof elation.elements.collection.simple#
     * @param {object} item
     * @returns {integer}
     */
    find(item) {
      return this.items.indexOf(item);
    }
    /**
     * Check whether the specified item exists in this dataset
     * @function contains
     * @memberof elation.elements.collection.simple#
     * @param {object} item
     * @returns {boolean}
     */
    contains(item) {
      return this.find(item) != -1;
    }
    /**
     * Get a reference to the specified item
     * @function get
     * @memberof elation.elements.collection.simple#
     * @returns {object}
     */
    get(item) {
      var idx = this.find(item);
      if (idx != -1) {
        return this.items[idx];
      }
      return null;
    }
    /**
     * Returns the number of items contained in this collection
     * @function getlength
     * @memberof elation.elements.collection.simple#
     * @returns {integer}
     */
    getlength() {
      return this.items.length;
    }
    /**
     * Clear all items from the list
     * @function clear
     * @memberof elation.elements.collection.simple#
     * @returns {boolean}
     * @emits collection_clear
     */
    clear() {
      this.items.splice(0, this.items.length);
      elation.events.fire({type: "collection_clear", element: this});
    }
    filter(filterfunc, filterargs) {
      //return elation.collection.filter({parent: this, filterfunc: filterfunc, filterargs: filterargs});
      var filtered = elation.elements.create('collection-filter', {
        append: this,
        filterfunc: filterfunc,
        filterargs: filterargs
      });
      return filtered;
    }
    subset(datatransform) {
      return elation.collection.subset({parent: this, datatransform: datatransform});
    }
    transformData(data) {
      var transformed = {};
      if (this.datatransform.items) {
        transformed.items = this.datatransform.items(data);
      } else {
        transformed.items = data;
      }
      if (this.datatransform.count) {
        transformed.count = this.datatransform.count(data);
      } else {
        transformed.count = (transformed.items ? transformed.items.length : 0);
      }
      return transformed;
    }
  });
})();
// ===== END COMPONENT: elements.collection.simple =====

// ===== BEGIN COMPONENT: elements.collection.indexed ====
(
function() {
  /**
   * Collection that enforces uniqueness on a per-item key. Adding an item
   * whose `index` value already exists merges the new properties into the
   * existing item rather than creating a duplicate, making this useful as
   * a primary-key store for incremental updates from an API.
   *
   * Set `indextransform` to normalize keys before lookup — e.g. lowercase
   * a username or strip whitespace.
   *
   * Base class for `localindexed` (localStorage persistence) and `sqlite`
   * (Node.js sqlite3 persistence).
   *
   * @class indexed
   * @hideconstructor
   * @category Collections
   * @augments elation.elements.collection.simple
   * @memberof elation.elements.collection
   * @example
   * const products = elation.elements.create('collection-indexed', { index: 'sku' });
   * products.add({ sku: 'A100', name: 'Widget' });
   * products.add({ sku: 'A100', price: 9.99 });
   * // → { sku: 'A100', name: 'Widget', price: 9.99 }
   *
   * @param {object}   args
   * @param {string}   args.index          property name used as the unique key
   * @param {function} args.indextransform optional `(key) => normalizedKey`
   */
  elation.elements.define('collection.indexed', class extends elation.elements.collection.simple {
    /**
     * @function init
     * @memberof elation.elements.collection.indexed#
     */
    init() {
      super.init();
      this.defineAttributes({
        index: { type: 'string' },
        indextransform: { type: 'function' },
      });
      this.itemindex = {};
    }
    add(item, pos) {
      var idx = this.getindex(item);
      if (!(idx in this.itemindex)) {
        this.itemindex[idx] = item;
        return super.add(item, pos);
      } else if (!elation.utils.isNull(pos)) {
        var realitem = this.itemindex[idx];
        if (this.items[pos] != realitem) {
          this.move(realitem, pos);
        }
        var changed = false;
        // Update with new properties
        for (var k in item) {
          if (realitem[k] != item[k]) {
            realitem[k] = item[k];
            changed = true;
          }
        }
        if (changed) return true;
      } else {
        var i = this.find(this.itemindex[idx]);
        this.itemindex[idx] = item;
        if (i != -1) {
          this.items[i] = item;
        } else {
          this.items.push(item);
        }
        return true;
      }
      return false;
    }
    remove(item) {
      var idx = this.getindex(item);
      if (idx in this.itemindex) {
        var realitem = this.itemindex[idx];
        delete this.itemindex[idx];
        return super.remove(realitem);
      }
      return false;
    }
    find(item) {
      var idx = this.getindex(item);
      if (!elation.utils.isNull(this.itemindex[idx])) {
        return super.find(this.itemindex[idx]);
      }
      return super.find(item);
    }
    getlength() {
      return Object.keys(this.itemindex).length;
    }
    getindex(idx) {
      if (!elation.utils.isString(idx)) {
        idx = idx[this.index];
      }
      if (this.indextransform) {
        idx = this.indextransform(idx);
      }
      return idx;
    }
    save(key) {
    }
  });
})();
// ===== END COMPONENT: elements.collection.indexed =====

// ===== BEGIN COMPONENT: elements.collection.localindexed ====
(
function() {

  /**
   * Indexed collection persisted to `localStorage`. Loads from storage on
   * init and re-serializes on every add/remove/move; cross-tab updates
   * arrive via the browser's `storage` event so tabs sharing a key stay
   * in sync.
   *
   * `storagekey` is the localStorage key used for persistence. `index` is
   * the per-item primary key inherited from `collection.indexed`.
   *
   * @class localindexed
   * @hideconstructor
   * @category Collections
   * @augments elation.elements.collection.indexed
   * @memberof elation.elements.collection
   * @example
   * const todos = elation.elements.create('collection-localindexed', {
   *   index: 'id',
   *   storagekey: 'app.todos'
   * });
   * todos.add({ id: 1, text: 'Write docs' });
   * // Persisted across reloads automatically.
   *
   * @param {object} args
   * @param {string} args.index
   * @param {string} args.storagekey
   */
  /**
   * Fired when this collection is saved
   * @event elation.elements.collection.localindexed#collection_save
   * @type {Object}
   */
  /**
   * Fired when this collection starts fetching items
   * @event elation.elements.collection.localindexed#collection_load_begin
   * @type {Object}
   */
  /**
   * Fired when this collection has fetched items
   * @event elation.elements.collection.localindexed#collection_load
   * @type {Object}
   */
  elation.elements.define('collection.localindexed', class extends elation.elements.collection.indexed {
    init() {
      super.init();
      this.defineAttributes({
        storagekey: { type: 'string' },
      });
      if (!elation.utils.isEmpty(this.storagekey)) {
        this.load(this.storagekey);
      }
      elation.events.add(window, 'storage', (ev) => { if (ev.key == this.storagekey) this.load() });
    }
    add(item, pos) {
      var changed = super.add(item, pos);
      if (changed) {
        this.save();
      }
    }
    move(item, pos) {
      var changed = super.move(item, pos);
      if (changed) {
        this.save();
      }
    }
    remove(item) {
      var changed = super.remove(item);
      if (changed) {
        this.save();
      }
    }
    save(key) {
      if (!key) key = this.storagekey;
      try {
        localStorage[this.storagekey] = JSON.stringify(this.items);
        elation.events.fire({type: "collection_save", element: this});
        return true;
      } catch (e) {
        console.error(e.stack);
      }
      return false;
    }
    load(key) {
      if (!key) key = this.storagekey;
      if (!elation.utils.isEmpty(localStorage[this.storagekey])) {
        try {
          elation.events.fire({type: "collection_load_begin", element: this});
          this.items = JSON.parse(localStorage[this.storagekey]);
          this.buildindex();
          elation.events.fire({type: "collection_load", element: this});
          return true;
        } catch (e) {
          console.error(e.stack);
        }
      }
      return false;
    }
    buildindex() {
      for (var i = 0; i < this.items.length; i++) {
        var idx = this.getindex(this.items[i]);
        this.itemindex[idx] = this.items[i];
      }
    }
  });
})();
// ===== END COMPONENT: elements.collection.localindexed =====

// ===== BEGIN COMPONENT: elements.collection.api ====
(
function() {
  /**
   * REST-backed data collection. Sends a GET to `host` + `endpoint` (with
   * `apiargs` as URL parameters) and exposes the response as a live items
   * array. Reading `.items` for the first time triggers an automatic load;
   * call `load()` to refresh, `append()` to merge additional pages.
   *
   * Use `datatransform.items` and `datatransform.count` to extract items
   * and total count from a non-flat response (or set `itempath` to a
   * dot-separated path for the simple case).
   *
   * @class api
   * @hideconstructor
   * @category Collections
   * @augments elation.elements.collection.simple
   * @memberof elation.elements.collection
   * @example
   * const users = elation.elements.create('collection-api', {
   *   host: 'https://api.example.com',
   *   endpoint: '/users',
   *   apiargs: { active: true },
   *   itempath: 'data.users'
   * });
   * elation.events.add(users, 'collection_load', () => render(users.items));
   *
   * @param {object} args
   * @param {string} args.host
   * @param {string} args.endpoint
   * @param {object} args.apiargs
   * @param {string} args.itempath
   * @param {object} args.datatransform
   * @param {function} args.datatransform.items
   * @param {function} args.datatransform.count
   */
  /**
   * Fired when this collection starts fetching items
   * @event elation.elements.collection.api#collection_load_begin
   * @type {Object}
   */
  /**
   * Fired when this collection has fetched items
   * @event elation.elements.collection.api#collection_load
   * @type {Object}
   */

  elation.elements.define('collection.api', class extends elation.elements.collection.simple {
    init() {
      super.init();
      this.defineAttributes({
        host: { type: 'string', default: '' },
        endpoint: { type: 'string' },
        apiargs: { type: 'object' },
        itempath: { type: 'string' },
        items: { type: 'array', get: this.getitems }
      });
    }
    getURL() {
      var url = this.host + this.endpoint;
      if (this.apiargs) {
        url += (url.indexOf('?') == -1 ? '?' : '&') + elation.utils.encodeURLParams(this.apiargs);
      }
      return url;
    }
    load() {
      if (this.loading) {
        this.cancel();
      }
      this.loading = true;
      var url = this.getURL();
      elation.events.fire({type: "collection_load_begin", element: this});
      this.xhr = elation.net.get(url, null, { callback: elation.bind(this, function(d) { this.clear(); this.processResponse(d); }) });
    }
    clear() {
      if (this.data) {
        this.data.items.splice(0, this.items.length);
        this.data.count = 0;
      }
      this.rawdata = null;
      elation.events.fire({type: "collection_clear", element: this});
    }
    cancel() {
      if (this.xhr) {
        console.log('stop it!', this.xhr);
        this.xhr.abort();
      }
    }
    append() {
      var url = this.getURL();
      elation.net.get(url, this.apiargs, { callback: elation.bind(this, this.processResponse) });
    }
    getitems() {
      if (!this.data) {
        this.data = { items: [], count: 0 };
        this.load();
      }
      return this.data.items;
    }
    getlength() {
      if (!this.data) {
        this.data = { items: [], count: 0 };
        this.load();
      }
      return this.data.count;
    }
    processResponse(data, args) {
      this.rawdata = this.parseData(data);
      var newdata = this.transformData(this.rawdata);
      if (!this.data) {
        this.data = { items: [], count: 0 };
      }
      if (newdata.items) {
        Array.prototype.push.apply(this.data.items, newdata.items);
      }
      if (newdata.count) {
        this.data.count = newdata.count;
      }
      this.loading = false;
      elation.events.fire({type: "collection_load", element: this});
    }
    parseData(data) {
      return data;
    }
    transformData(data) {
      var transformed = {};
      if (this.datatransform.items) {
        transformed.items = this.datatransform.items(data);
      } else if (this.itempath) {
        transformed.items = elation.utils.arrayget(data, this.itempath);
      } else {
        transformed.items = data;
      }
      if (this.datatransform.count) {
        transformed.count = this.datatransform.count(data);
      } else {
        transformed.count = (transformed.items ? transformed.items.length : 0);
      }
      return transformed;
    }
  });
})();
// ===== END COMPONENT: elements.collection.api =====

// ===== BEGIN COMPONENT: elements.collection.jsonapi ====
(
function() {
  /**
   * REST-backed data collection that parses responses as JSON. Identical
   * to `collection.api` except the body is deserialized via `JSON.parse`
   * before reaching `datatransform`. Use this for any JSON API; the parent
   * `api` class hands raw response text to the transform.
   *
   * @class jsonapi
   * @hideconstructor
   * @category Collections
   * @augments elation.elements.collection.api
   * @memberof elation.elements.collection
   * @example
   * const projects = elation.elements.create('collection-jsonapi', {
   *   host: 'https://api.example.com',
   *   endpoint: '/projects',
   *   itempath: 'results'
   * });
   *
   * @param {object} args
   * @param {string} args.host
   * @param {string} args.endpoint
   * @param {object} args.apiargs
   * @param {string} args.itempath
   * @param {object} args.datatransform
   * @param {function} args.datatransform.items
   * @param {function} args.datatransform.count
   */
  elation.elements.define('collection.jsonapi', class extends elation.elements.collection.api {
    parseData(data) {
      return JSON.parse(data);
    }
  });
})();
// ===== END COMPONENT: elements.collection.jsonapi =====

// ===== BEGIN COMPONENT: elements.collection.jsonpapi ====
(
function() {
  /**
   * JSONP-backed data collection. Loads via a `<script>` tag and a global
   * callback, which sidesteps CORS for cross-origin endpoints that don't
   * set the right headers. The callback URL parameter name defaults to
   * `callback`; set `callbackarg` if the API uses a different name.
   *
   * @class jsonpapi
   * @hideconstructor
   * @category Collections
   * @augments elation.elements.collection.api
   * @memberof elation.elements.collection
   * @example
   * const photos = elation.elements.create('collection-jsonpapi', {
   *   host: 'https://photos.example.com',
   *   endpoint: '/feed',
   *   apiargs: { tag: 'sunset' },
   *   callbackarg: 'jsonp'
   * });
   *
   * @param {object} args
   * @param {string} args.host
   * @param {string} args.endpoint
   * @param {object} args.apiargs
   * @param {string} args.callbackarg
   * @param {object} args.datatransform
   * @param {function} args.datatransform.items
   * @param {function} args.datatransform.count
   */
  elation.elements.define('collection.jsonpapi', class extends elation.elements.collection.api {
    load() {
      if (this.loading) {
        this.cancel();
      }
      this.loading = true;

      var callbackarg = this.args.callbackarg || 'callback';
      this.apiargs[callbackarg] = 'elation.' + this.componentname + '("' + this.id + '").processResponse';

      var url = this.getURL();
      elation.events.fire({type: "collection_load_begin", element: this});

      this.script = elation.html.create('SCRIPT');
      this.script.src = url;

      document.head.appendChild(this.script);
    }
  });
})();
// ===== END COMPONENT: elements.collection.jsonpapi =====

// ===== BEGIN COMPONENT: elements.collection.custom ====
(
function() {
  /**
   * Collection whose items come from a user-supplied callback rather than
   * an internal array. Useful for exposing a non-array data structure as
   * a collection — e.g. a list of an object's properties, the entries of
   * a `Map`, or a computed view over some other application state.
   *
   * `itemcallback` is invoked on every read of `.items` and should return
   * the current array of items.
   *
   * @class custom
   * @hideconstructor
   * @category Collections
   * @augments elation.elements.collection.simple
   * @memberof elation.elements.collection
   * @example
   * // Expose Object.keys(window) as a live-updating collection
   * const globals = elation.elements.create('collection-custom', {
   *   itemcallback: () => Object.keys(window).map(k => ({ name: k }))
   * });
   *
   * @param {object} args
   * @param {function} args.itemcallback returns the current items array
   */
  elation.elements.define('collection.custom', class extends elation.elements.collection.simple {
    init() {
      super.init();
      this.defineAttributes({
        items: { type: 'array', get: this.getItemsFromCallback },
        itemcallback: { type: 'function' }
      });
console.log('INIT THE COLLECTION', this.itemcallback, this.getAttribute('itemcallback'));
    }
    create() {
console.log('CREATE THE COLLECTION', this.itemcallback, this.getAttribute('itemcallback'));
    }
    getItemsFromCallback() {
console.log('I need to call the callback', this.itemcallback, this);
      if (this.itemcallback && typeof this.itemcallback == 'function') {
        return this.itemcallback();
      }
      return [];
    }
  });
})();
// ===== END COMPONENT: elements.collection.custom =====

// ===== BEGIN COMPONENT: elements.collection.filter ====
(
function() {
  /**
   * Derived collection that exposes a subset of a parent's items selected
   * by a user-supplied predicate. Re-evaluates `filterfunc` against every
   * parent item on each read; bind it to a list and the list updates as
   * the parent's data changes.
   *
   * @class filter
   * @hideconstructor
   * @category Collections
   * @augments elation.elements.collection.simple
   * @memberof elation.elements.collection
   * @example
   * const activeUsers = elation.elements.create('collection-filter', {
   *   parent: users,
   *   filterfunc: u => u.active && !u.archived
   * });
   *
   * @param {object} args
   * @param {elation.elements.collection.simple} args.parent collection to filter
   * @param {function} args.filterfunc predicate `(item) => boolean`
   */
  /**
   * Fired when this collection has fetched items
   * @event elation.elements.collection.filter#collection_load
   * @type {Object}
   */
  elation.elements.define('collection.filter', class extends elation.elements.collection.simple {
    init() {
      super.init();
      this.defineAttributes({
        parent: { type: 'object' },
        filterfunc: { type: 'function' },
        items: { type: 'array', get: this.getfiltereditems }
      });
      // TODO - attach events to the parent, so we can respond to its events and emit our own as necessary
    }
    getfiltereditems() {
      //if (!this.filtered) {
        var items = this.parentNode.items;
        var filtered = [];
        for (var i = 0; i < items.length; i++) {
          if (this.filterfunc(items[i])) {
            filtered.push(items[i]);
          }
        }
        this.filtered = filtered;
      //}
      return this.filtered;
    }
    update() {
      elation.events.fire({type: "collection_load", element: this});
    }
    clear() {
      this.filtered = false;
      elation.events.fire({type: "collection_clear", element: this});
    }
  });
})();
// ===== END COMPONENT: elements.collection.filter =====

// ===== BEGIN COMPONENT: elements.collection.subset ====
(
function() {
  /**
   * Derived collection produced by transforming a parent's raw response
   * data. Where `filter` operates on already-parsed items via a predicate,
   * `subset` runs on `parent.rawdata` (typically a fresh server response)
   * and is meant for cases where a single API call backs multiple list
   * views — e.g. one collection holds the response, several subsets each
   * pull out a different slice.
   *
   * Configure the slice via `datatransform.items` / `datatransform.count`
   * inherited from `simple`, the same way you'd shape a non-flat API
   * response in `collection.api`.
   *
   * @class subset
   * @hideconstructor
   * @category Collections
   * @augments elation.elements.collection.simple
   * @memberof elation.elements.collection
   * @example
   * const admins = elation.elements.create('collection-subset', {
   *   parent: users,
   *   datatransform: {
   *     items: data => data.users.filter(u => u.role === 'admin'),
   *     count: data => data.users.filter(u => u.role === 'admin').length
   *   }
   * });
   *
   * @param {object} args
   * @param {elation.elements.collection.simple} args.parent source collection
   * @param {object} args.datatransform
   * @param {function} args.datatransform.items
   * @param {function} args.datatransform.count
   */
  /**
   * Fired when this collection has fetched items
   * @event elation.elements.collection.subset#collection_load
   * @type {Object}
   */
  elation.elements.define('collection.subset', class extends elation.elements.collection.simple {
    init() {
      super.init();
      this.defineAttributes({
        parent: { type: 'object' },
        items: { type: 'array', get: this.getsubsetitems }
      });
      // TODO - probably need to proxy the rest of the collection events as well
      elation.events.add(this.parent, 'collection_load,collection_clear', elation.bind(this, this.proxyevent));
    }
    getsubsetitems() {
      // TODO - we should cache this so we don't have to transform multiple times for the same dataser
      var subset = this.transformData(this.parent.rawdata);
      return subset.items || [];
    }
    getlength() {
      var subset = this.transformData(this.parent.rawdata);
      return subset.count || 0
    }
    update() {
      elation.events.fire({type: "collection_load", element: this});
    }
    proxyevent(ev) {
      console.log('proxy it!', ev.type, ev);
      elation.events.fire({type: ev.type, element: this});
    }
  });
})();
// ===== END COMPONENT: elements.collection.subset =====

// ===== BEGIN EXTERNAL FILE: elements.collection.all ====
elation.require([
  'elements.base',
  'elements.collection.simple',
  'elements.collection.indexed',
  'elements.collection.localindexed',
  'elements.collection.api',
  'elements.collection.jsonapi',
  'elements.collection.jsonpapi',
  'elements.collection.custom',
  'elements.collection.filter',
  'elements.collection.subset',
  //'elements.collection.sqlite',
]);

// ===== END EXTERNAL FILE: elements.collection.all =====

setTimeout(function() { elation.component.init(); }, 0); elation.onloads.add("elation.component.init()"); 