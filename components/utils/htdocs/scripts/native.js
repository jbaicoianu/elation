/** event bridge for native wrappers **/

elation.extend("native", new function() {
  this.subscribe = function(events) {
    elation.events.add(null, events, this);
  }
  this.handleEvent = function(ev) {
    this.bridge(ev);
  }
  this.bridge = function(ev) {
    if (window.external && window.external.notify) {
      // metro
      window.external.notify('{"type": "' + ev.type + '", "data": ' + elation.JSON.stringify(ev.data) + '}');
    } else {
      // iOS UIWebView
      var url = 'elation-event:' + ev.type;
      if (ev.data) {
        url += "/" + elation.JSON.stringify(ev.data);
      }
      var iframe = elation.html.create('iframe');
      iframe.src = url;
      // add the frame to the DOM so the URL is actually requested
      document.body.appendChild(iframe);
      document.body.removeChild(iframe);
    }
  }
});
