// if (typeof require == 'function') var elation = require("utils/elation");
elation.extend("events", {
  events: {},
  cloneattrs: ['type', 'bubbles', 'cancelable', 'view', 'detail', 'screenX', 'screenY', 'clientX', 'clientY', 'ctrlKey', 'shiftKey', 'altKey', 'metaKey', 'button', 'relatedTarget', 'target', 'element', 'data', 'origin', 'timeStamp', 'returnValue', 'cancelBubble', 'keyCode', 'dataTransfer'],

  eventstats: {},
  
  fire: function(type, data, target, element, fn) {
    var ev = this.getEvent(type, data, target, element, fn);

    //console.log('fire!', ev, type, data, target, element, fn);
    return elation.events.fireEvent(ev);
  },
  getEvent: function(type, data, target, element, fn) {
    var extras = {};

    if (typeof type == 'object') {
      data = elation.utils.any(elation.utils.arrayget(type, 'data'), data);
      target = elation.utils.arrayget(type, 'target') || target;
      element = elation.utils.arrayget(type, 'element') || element;
      fn = elation.utils.arrayget(type, 'fn') || fn;
      var cloneev = type.event || {};

      for (var i = 0; i < this.cloneattrs.length; i++) {
        var attr = this.cloneattrs[i];
        if (!elation.utils.isNull(type[attr])) extras[attr] = type[attr];
        else if (!elation.utils.isNull(cloneev[attr])) extras[attr] = cloneev[attr];
      }

      if (!elation.utils.isNull(type.clientX)) extras.clientX = type.clientX;
      if (!elation.utils.isNull(type.clientY)) extras.clientY = type.clientY;
      if (!elation.utils.isNull(type.button)) extras.button = type.button;
      if (!elation.utils.isNull(type.keyCode)) extras.keyCode = type.keyCode;

      extras.fn = fn;

      type = elation.utils.arrayget(type, 'type');
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
  fireEvent: function(realevent) {
    //console.log('fireEvent:',realevent);
    var type = realevent.type,
        data = realevent.data,
        element = realevent.element,
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
      return;
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

      if (cont === false || event.cancelBubble) {
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

  clone: function(ev,  overrides) {
    //var newev = new Event(ev.type);
    var newev = {};
    for (var i = 0; i < this.cloneattrs.length; i++) {
      var foo = elation.utils.any(overrides[this.cloneattrs[i]], ev[this.cloneattrs[i]]);
      if (foo !== null) {
        newev[this.cloneattrs[i]] = foo;
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
  }
});
