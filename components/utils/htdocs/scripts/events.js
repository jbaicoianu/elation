/* Cross-platform event handlers */
function addEvent( obj, type, fn ) {
  if (obj) {
    if (obj.addEventListener) {
      if (type == 'mousewheel' && browser.type != 'safari') type = 'DOMMouseScroll';
      if (typeof fn == "object" && fn.handleEvent) {
        obj[type+fn] = function(e) { fn.handleEvent(e); }
        obj.addEventListener( type, obj[type+fn], false );
      } else {
        obj.addEventListener( type, fn, false );
      }
    } else if (obj.attachEvent) {
      if (typeof fn == "object" && fn.handleEvent) {
        obj[type+fn] = function() { fn.handleEvent(fixEvent(window.event)); }
      } else {
        obj["e"+type+fn] = fn;
        obj[type+fn] = function() { obj["e"+type+fn]( fixEvent(window.event) ); }
      }
      obj.attachEvent( "on"+type, obj[type+fn]);
    }
  }
  return this;
}
function removeEvent( obj, type, fn ) {
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
function fixEvent(event) {
  event.preventDefault = fixEvent.preventDefault;
  event.stopPropagation = fixEvent.stopPropagation;
  return event;
}
fixEvent.preventDefault = function() {
  this.returnValue = false;
}
fixEvent.stopPropagation = function() {
  this.cancelBubble = true;
}

