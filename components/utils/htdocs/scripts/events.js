/* Cross-platform event handlers */
elation.extend("events", {
	// syntax: add(element || [ elements ], "type1,type2,type3", function || object);
	add: function(elements, types, fn) {
		if (!elements || !types || !fn || typeof types != "string")
			return;
		
		var	elements = (!elation.utils.isNull(elements.nodeName) || elements == window) ? [ elements ] : elements,
				types = types.split(',');
		
		for (var e=0; e<elements.length; e++) {
			var obj = elements[e];
			
			if (typeof obj != 'object')
				continue;
			
			for (var i=0; i<types.length; i++) {
				var type = types[i];
				
				if ("addEventListener" in obj) {
					if (type == 'mousewheel' && elation.browser.type != 'safari')
						type = 'DOMMouseScroll';
					
					if (typeof fn == "object" && fn.handleEvent) {
						obj[type+fn] = function(e) { 
							fn.handleEvent(e); 
						}
						obj.addEventListener(type, obj[type + fn], false);
					} else {
						obj.addEventListener(type, fn, false);
					}
				} else if (obj.attachEvent) {
					if (typeof fn == "object" && fn.handleEvent) { 
						obj[type+fn] = function() { 
							fn.handleEvent(elation.events.fix(window.event)); 
						}
					} else {
						obj["e" + type + fn] = fn;
						obj[type + fn] = function() { 
							if (typeof obj["e" + type + fn] == 'function') 
								obj["e" + type + fn](elation.events.fix(window.event)); 
						}
					}
					
					obj.attachEvent("on" + type, obj[type + fn]);
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
			var obj = elements[e];
			
			if (typeof obj != 'object')
				continue;
			
			for (var i=0; i<types.length; i++) {
				var type = types[i];
				
				if (obj.removeEventListener) {
					if (typeof fn == "object" && fn.handleEvent) {
						obj.removeEventListener(type, obj[type+fn], false);
						delete obj[type + fn];
					} else {
						obj.removeEventListener(type, fn, false);
					}
				} else if (obj.detachEvent) {
					if (typeof obj[type + fn] == "function")
						obj.detachEvent("on" + type, obj[type + fn]);
					
					obj[type + fn] = null;
					obj["e" + type + fn] = null;
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
	
  // returns mouse or all finger touch coords
	coords: function(event) {
		if (typeof event.touches != 'undefined' && event.touches.length > 0) {
			var c = [];
      
      for (var i=0; i<events.touches.length; i++) {
        c.push({
          x: event.touches[i].pageX, 
          y: event.touches[i].pageY
        });
      }
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
