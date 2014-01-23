/** event bridge for native wrappers **/

elation.extend("native", new function() {
  this.subscribe = function(events) {
    elation.events.add(null, events, this);
  }
  this.handleEvent = function(ev) {
    this.bridge(ev);
  }
  this.bridge = function(ev) {
    var evdata = false;
    try {
      evdata = elation.JSON.stringify(ev.data);
    } catch (e) {
      console.log("Couldn't encode event data for event type " + ev.type, ev);
    }
    if (window.external && window.external.notify) {
      // metro
      window.external.notify('{"type": "' + ev.type + '", "data": ' + data + '}');
    } else {
      // iOS UIWebView
      var url = 'elation-event:' + ev.type;
      if (evdata) {
        url += "/" + evdata;
      }

      var iframe = elation.html.create('iframe');
      iframe.src = url;
      // add the frame to the DOM so the URL is actually requested
      document.body.appendChild(iframe);
      document.body.removeChild(iframe);
    }
  }
});
