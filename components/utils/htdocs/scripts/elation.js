var elation = new function() {
  this.extend = function(name, func) {
      //console.log('register function: ' + name, func);
      var ptr = this;
      var parts = name.split(".");
      var i;
      for (i = 0; i < parts.length-1; i++) {
          if (typeof ptr[parts[i]] == 'undefined') {
              ptr[parts[i]] = {};
          }
          ptr = ptr[parts[i]];
      }
      ptr[parts[i]] = func;
  }
}
elation.extend("component", new function() {
  this.namespace = "elation";
  this.registry = [];
  this.init = function() {
    var componentattr = "component";
    var argsattr = this.namespace+':args';
    // Find all elements which have a namespace:componentattr attribute

    //var elements = $("["+this.namespace+"\\:"+componentattr+"]"); 
/*
    function nsresolver(prefix) {  
      var ns = {  
        'xhtml' : 'http://www.w3.org/1999/xhtml',  
        'elation': 'http://www.ajaxelation.com/xmlns'  
      };  
alert(ns[prefix]);
      return ns[prefix] || null;  
    }  
*/
    var nsresolver = document.createNSResolver(document.documentElement);


// FIXME - I've started work to switch this over to use xpath selectors instead of jquery but namespaces make it a pain
//         Right now this is just selecting all elements, very inefficient...
//var selector = '//*['+this.namespace+':'+componentattr+']';
//var selector = "//*[@*["+this.namespace+":"+componentattr+"]]";
//var selector = "//*[@*[namespace-uri()='http://www.ajaxelation.com/xmlns']]";
//var selector = "//*[local-name()='component']";
var selector = "//*";
    var result = document.evaluate(selector, document, nsresolver, XPathResult.ANY_TYPE, null);
    var elements = [];
    while (element = result.iterateNext()) {
      elements.push(element);
    }
console.log('i init now');
    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];
      var componenttype = element.getAttribute(this.namespace+':'+componentattr);
      var componentname = element.getAttribute(this.namespace+':name') || element.id;
      if (componenttype) {
        var componentargs = {}, j;
        // First look for a JSON-encoded args array in the element's direct children
        for (j = 0; j < element.children.length; j++) {
          if (element.children[j].nodeName == argsattr.toUpperCase()) {
            try {
              componentargs = JSON.parse(element.children[j].innerHTML);
              break; // only one args array per block, bail out when we find one so we don't waste time with the rest
            } catch(e) {
              // Probably JSON syntax error
              console.log("Could not parse " + argsattr + ": " + element.children[j].innerHTML);
            }
          }
        }
        // Then, loop through the attributes and parse out any individual arguments which can be specified as attributes
        for (j = 0; j < element.attributes.length; j++) {
          if (element.attributes[j].nodeName.substring(0, argsattr.length+1) == argsattr+'.') {
            componentargs[element.attributes[j].nodeName.substring(argsattr.length+1)] = element.attributes[j].nodeValue;
          }
        }
        // Instantiate the new component with all parsed arguments
        //elation.component.create(componenttype, element, componentargs);
        var componentclass = elation.utils.arrayget(elation, componenttype);
        if (typeof componentclass == 'function') {
          componentclass(componentname, element, componentargs);
        } 
      }
    }
  }
  this.add = function(name, classdef) {
    // At the top level, a component is just a function which checks to see if
    // an instance with the given name exists already.  If it doesn't we create
    // it, and then we return a reference to the specified instance.
    var el = function(name, container, args) {
      if (!name && name !== 0) // If no name was passed, use the current object count as a name instead ("anonymous" components)
        name = el.objcount;
      if (!el.obj[name]) {
        el.obj[name] = new el.fn.init(name, container, args);
        el.objcount++;
      }
      return el.obj[name];
    };
    el.objcount = 0;
    el.obj = {}; // this is where we store all the instances of this type of component
    el.fn = (typeof classdef == 'function' ? new classdef : classdef); // and this is where we store the functions
    // If no init function is defined, add a default one
    if (!el.fn.init) el.fn.init = function(name, container, args) { 
      this.name = name;
      this.container = container;
      this.args = args;
    }
    el.fn.init.prototype = el.fn; // The functions which were passed in are attached to the insantiable component objects
    elation.extend(name, el); // inject the newly-created component wrapper into the main elation object
  }
});
elation.extend('onloads',new function() {
  this.done = false;
  this.onloads = [];

  this.add = function(expr) {
    this.onloads.push(expr);
  }
  this.init = function() {
    /* for Safari */
    if (/WebKit/i.test(navigator.userAgent)) { // sniff
      this.timer = setInterval(function() {
        if (/loaded|complete/.test(document.readyState)) {
          elation.onloads.execute(); // call the onload handler
        }
      }, 10);
      return;
    }

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
    if (elation.onloads.done) return;

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
elation.onloads.init();

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
elation.extend("html.hasclass", function(element, className) {
  var re = new RegExp("(^| )" + className + "( |$)", "g");
  return element.className.match(re);
});
elation.extend("html.addclass", function(element, className) {
  if (!elation.html.hasclass(element, className)) {
    element.className += " " + className;
  }
});
elation.extend("html.removeclass", function(element, className) {
  var re = new RegExp("(^| )" + className + "( |$)", "g");
  if (element.className.match(re)) {
    element.className = element.className.replace(re, " ");
  }
});
elation.extend("utils.arrayget", function(obj, name) {
  var ptr = obj;
  var x = name.split(".");
  for (var i = 0; i < x.length; i++) {
    if (ptr==null || (typeof ptr[x[i]] != 'array' && typeof ptr[x[i]] != 'object' && i != x.length-1)) {
      ptr = null;
      break;
    }
    ptr = ptr[x[i]];
  }
  return (typeof ptr == "undefined" ? null : ptr);
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

