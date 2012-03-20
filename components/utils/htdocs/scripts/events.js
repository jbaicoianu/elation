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
      event = list[i];
      
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

    // fire each event
    for (var i=0; i<original_events.length; i++) {
      var eventObj = original_events[i];
      
      // break reference to eventObj so original doesn't get overwritten
      var event = {
        type: type, 
        target: (target ? target : eventObj.target),
        data: (data ? data : null),
        origin: eventObj.origin,
        custom_event: eventObj.custom_event,
        preventDefault: eventObj.preventDefault,
        cancelBubble: eventObj.cancelBubble,
        stopPropogation: eventObj.stopPropogation
      };
      
      if (!event.origin)
        continue;
      
      if (typeof event.origin == 'function') {
        event.origin(event);
        // FIXME - MSIE keeps erroring on this line, saying expected ';', no idea why.  try/catch doesn't suppress error
        //if (elation.browser.type != 'msie') event.origin(event);
        //else console.log('Error firing custom event: '+type);
      } else if (typeof event.origin.handleEvent != 'undefined') {
        event.origin.handleEvent(event);
      }
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
      cancelBubble: function() { return; },
      stopPropogation: function() { return; }
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
  
	// syntax: add(element || [ elements ], "type1,type2,type3", function || object);
	add: function(elements, types, fn, custom_event_name) {
    if (custom_event_name)
      custom_event_name = custom_event_name.replace('.','_');

		if (!types || !fn || typeof types != "string")
			return;
    
    //if (types == 'change')
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
		
		var	elements = (!elation.utils.isNull(elements.nodeName) || elements == window) ? [ elements ] : elements,
				types = types.split(',');
		
		for (var e=0; e<elements.length; e++) {
			var element = elements[e];
			
			if (typeof element != 'object')
				continue;
			
			for (var i=0; i<types.length; i++) {
				var type = types[i];
				
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
	}
});

/* backup - original elation add/remove funcs
add: function(obj, type, fn) {
  if (obj) {
    var types = type.split(',');
    for (var i = 0; i < types.length; i++) {
      var type = types[i];
      if (obj.addEventListener) {
        if (type == 'mousewheel' && elation.browser.type != 'safari') type = 'DOMMouseScroll';
        if (typeof fn == "object" && fn.handleEvent) {
          obj[type+fn] = function(e) { fn.handleEvent(e); }
          obj.addEventListener( type, obj[type+fn], false );
        } else {
          obj.addEventListener( type, fn, false );
        }
      } else if (obj.attachEvent) {
        if (typeof fn == "object" && fn.handleEvent) {
          obj[type+fn] = function() { fn.handleEvent(elation.events.fix(window.event)); }
        } else {
          obj["e"+type+fn] = fn;
          obj[type+fn] = function() { obj["e"+type+fn]( elation.events.fix(window.event) ); }
        }
        obj.attachEvent( "on"+type, obj[type+fn]);
      }
    }
  }
  return this;
},

remove: function( obj, type, fn ) {
  var types = type.split(',');
  for (var i = 0; i < types.length; i++) {
    var type = types[i];
    if (obj.removeEventListener) {
      if (typeof fn == "object" && fn.handleEvent) {
        obj.removeEventListener( type, obj[type+fn], false );
        delete obj[type+fn];
      } else {
        obj.removeEventListener( type, fn, false );
      }
    } else if (obj.detachEvent) {
      obj.detachEvent( "on"+type, obj[type+fn] );
      obj[type+fn] = null;
      obj["e"+type+fn] = null;
    }
  }
},
*/
