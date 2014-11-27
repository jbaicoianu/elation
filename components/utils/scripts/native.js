/** event bridge for native wrappers **/

elation.extend("native", new function() {
  this.prefix = "elation-event://";
  this.subscriptions = [];

  this.init = function() {
    var subscriptions = this.getsubscriptions();
    if (subscriptions && subscriptions.length > 0) {
      elation.onloads.add(elation.bind(this, function() {
        this.subscribe(subscriptions);
      }));
    }
  }
  this.subscribe = function(events, force) {
    var subscriptions = this.getsubscriptions() || [];
    var newevents = [];
    if (events == '*') {
      var allevents = Object.keys(elation.events.events);
      newevents = this.mergesubscriptions(this.subscriptions, allevents);
      elation.events.add(null, newevents.join(','), this);
console.log("subscribe:", newevents);
      //newevents = subscriptions = '*';
      subscriptions = '*';
    } else {
      elation.events.add(null, events, this);
      if (force) {
        newevents = this.mergesubscriptions(this.subscriptions, (elation.utils.isArray(events) ? events : events.split(',')));
      } else {
        newevents = events;
      }
    }
    if (newevents.length > 0) {
      this.setsubscriptions(subscriptions);
      console.log('Added new subscriptions:',events, newevents);
    }
  }
  this.getsubscriptions = function() {
    var subs = '';
    if (sessionStorage['elation.native.subscriptions']) {
      subs = sessionStorage['elation.native.subscriptions'];
    }
    return (subs != "" ? subs.split(',') : false);
  }
  this.setsubscriptions = function(subs) {
    sessionStorage['elation.native.subscriptions'] = subs;
  }
  this.mergesubscriptions = function(existing, newsubs) {
    var diffs = [];
    for (var i = 0; i < newsubs.length; i++) {
      if (existing.indexOf(newsubs[i]) == -1) {
        diffs.push(newsubs[i]);
        existing.push(newsubs[i]);
      }
    }
    return diffs;
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
      // iOS UIWebView and android WebView
      var url = this.prefix + ev.type;
      if (ev.element) {
        var elementid = ev.element.componentname + "(" + ev.element.id + ")";
        url += "/" + elementid;
      }
      if (evdata) {
        url += "?" + evdata;
      }

      var iframe = elation.html.create('iframe');
      iframe.src = url;
      // add the frame to the DOM so the URL is actually requested
      document.body.appendChild(iframe);
      document.body.removeChild(iframe);
    }
  }
  this.init();
});
