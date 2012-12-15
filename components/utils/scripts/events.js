if (typeof require == 'function') var elation = require("utils/elation");
elation.extend("events", {
  events: {},
  
  fire: function(type, data, target, element, fn) {
    if (typeof type == 'object') {
      data = elation.utils.arrayget(type, 'data') || data;
      target = elation.utils.arrayget(type, 'target') || target;
      element = elation.utils.arrayget(type, 'element') || element;
      fn = elation.utils.arrayget(type, 'fn') || fn;
      type = elation.utils.arrayget(type, 'type');
    }

    //console.log('fire:',type,fn,element,data);
    if (!type)
      return false;
    
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
      event = elation.events.fix(list[i]);
      if (fn || element) {
        if ((fn && event.origin == fn) || (element && event.target == element)) {
          original_events.push(event);
        } else {
          continue;
        }
      } else {
        original_events.push(event);
      }
    }
    
    /*
    for (var i=events.length-1; i>=0; i--) {
      var event = events[i];
      event.data = data;
      if (event.origin) {
        if (typeof event.origin == 'function')
          event.origin(event);
        else if (typeof event.origin.handleEvent != 'undefined')
          event.origin.handleEvent(event);
      }
      if (event.cancelBubble) {
        break;
      }
    */

    // fire each event
    for (var i=0; i<original_events.length; i++) {
      var eventObj = original_events[i],
      
          // break reference to eventObj so original doesn't get overwritten
          event = elation.events.clone(eventObj, {type: type, target: target, data: data});
      
      if (!event.origin)
        continue;
      
      if (typeof event.origin == 'function')
        event.origin(event);
      else if (typeof event.origin.handleEvent != 'undefined')
        event.origin.handleEvent(event);
      
      events.push(event);
    }
    
    // return all event objects that were fired
    return events;
  },
  
  register: function(types, fn, element) {
    var types = types.split(','),
        type;
    
    for (var i=0; i<types.length; i++) {
      type = types[i];
      
      if (!this.events[type])
        if (fn || element)
          this._register(element, type, fn);
        else
          this.events[type] = [];
    }
  },
  
  _register: function(element, type, fn, custom_event_name) {
    if (custom_event_name)
      custom_event_name = custom_event_name.replace('.','_');
    
    var event = { 
      type: type, 
      target: element, 
      origin: fn,
      custom_event: custom_event_name,
      preventDefault: function() { return; },
      stopPropagation: function() { this.cancelBubble = true; return; },
      cancelBubble: false
    };
    
    if (custom_event_name) {
      if (!elation.events.events[custom_event_name])
        elation.events.events[custom_event_name] = [];
      
      //console.log('BINDING '+type+' -> '+custom_event_name);
    }
    
    if (!elation.events.events[type])
      elation.events.events[type] = [];
    
    elation.events.events[type].push(event);
    /*
    if (custom_event_name) {
      if (!elation.events.events[custom_event_name])
        elation.events.events[custom_event_name] = [];
      
      elation.events.events[custom_event_name].push(event);
    }
    */
  },
  _unregister: function(element, type, fn) {
    if (elation.events.events[type]) {
      for (var i = 0; i < elation.events.events[type].length; i++) {
        var ev = elation.events.events[type][i];
        if (ev.type == type && ev.target == element && ev.origin == fn) {
          elation.events.events[type].splice(i--);
        }
      }
    }
  },
  
	// syntax: add(element || [ elements ], "type1,type2,type3", function || object);
	add: function(elements, types, fn, custom_event_name) {
    if (custom_event_name)
      custom_event_name = custom_event_name.replace('.','_');

		if (!types || !fn || typeof types != "string")
			return;

    var elements = elation.utils.isNull(elements) 
          ? [{}] 
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
				
        elation.events._register(element, type, fn, custom_event_name);
        
        if (!element)
          continue;
        
				if ("addEventListener" in element) {
          if (type == 'mousewheel' && elation.browser.type != 'safari')
            type = 'DOMMouseScroll';
					
          if (typeof fn == "object" && fn.handleEvent) {
						element[type+fn] = function(e) { 
              if (custom_event_name)
                elation.events.fire({ type: custom_event_name, data: fn });
              
							fn.handleEvent(e); 
						}
						element.addEventListener(type, element[(type + fn)], false);
					} else {
						element.addEventListener(type, fn, false);
					}
				} else if (element.attachEvent) {
					if (typeof fn == "object" && fn.handleEvent) { 
						element[type+fn] = function() { 
              if (custom_event_name)
                elation.events.fire({ type: custom_event_name, data: fn });
							
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
		if (!elements || !types || !fn || typeof types != "string")
			return;
		
		//var	elements = (!elation.utils.isNull(elements.nodeName) || elements == window) ? [ elements ] : elements;
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
		
		return this;
	},
  
  fix: function(event) {
    this.preventDefault = function() {
      this.returnValue = false;
    }
    
    this.stopPropagation = function() {
      this.cancelBubble = true;
    }

    event.preventDefault = this.preventDefault;
    event.stopPropagation = this.stopPropagation;
    
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
			var	c = {
        x: (event.pageX || (event.clientX + document.body.scrollLeft)),
        y: (event.pageY || (event.clientY + document.body.scrollTop))
      };
		}
    
		return c;
	},

  clone: function(ev,  overrides) {
    var attrs = ['type', 'bubbles', 'cancelable', 'view', 'detail', 'screenX', 'screenY', 'clientX', 'clientY', 'ctrlKey', 'shiftKey', 'altKey', 'metaKey', 'button', 'relatedTarget', 'target', 'element', 'data', 'origin'];
    var newev = {};
    for (var i = 0; i < attrs.length; i++) {
      var foo = elation.utils.any(overrides[attrs[i]], ev[attrs[i]]);
      if (foo !== null) {
        newev[attrs[i]] = foo;
      }
    }
    return elation.events.fix(newev);
  }
});
