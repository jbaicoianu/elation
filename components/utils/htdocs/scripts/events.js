/* Cross-platform event handlers */
elation.extend("events", {
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
  }
});
  
