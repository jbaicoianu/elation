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

elation.extend("utils.findpos", function(obj) {
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
