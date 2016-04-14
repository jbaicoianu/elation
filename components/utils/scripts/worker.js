elation.require(['utils.events'], function() {
  elation.extend('worker', {
    create: function(component) {
      var worker = new elation.worker.thread(component);
      return worker;
    }
  });
  elation.define('worker.thread', {
    _construct: function(component) {
      var bloburl = "";
      //var root = document.location.protocol + '//' + document.location.host;
      //var file = '/scripts/utils/elation.js';
      //var root = document.location.protocol + '//' + document.location.host + document.location.pathname;
      //var file = '/bundle.js';
      var root = elation.config.get('dependencies.path', document.location.protocol + '//' + document.location.host);
      var file = elation.config.get('dependencies.main', '/scripts/utils/elation.js');
      var script = [
        "importScripts('" + root + file + "');",
        "if (elation.requireactivebatchjs) {",
        "  elation.requireactivebatchjs.webroot = '" + root + "/scripts';",
        "} else {",
        "  elation.requireactivebatchjs = new elation.require.batch('js', '" + root + "/scripts');",
        "}",
        "var msgqueue = [];",
        "onmessage = function(ev) { msgqueue.push(ev); };",
        "elation.require('" + component + "', function() {",
        "  var handler = new elation." + component + "();",
        "  onmessage = handler.onmessage.bind(handler);",
        "  msgqueue.forEach(function(msg) { handler.onmessage(msg); });",
        "});"
      ];

      var scriptsrc = script.join('\n');
      var blob = new Blob([scriptsrc], {type: 'application/javascript'});
      bloburl = URL.createObjectURL(blob);

      this.thread = new Worker(bloburl);
      elation.events.add(this.thread, 'message', elation.bind(this, this.handlemessage));
    },
    postMessage: function(msg) {
      return this.thread.postMessage(msg);
    },
    handlemessage: function(ev) {
      elation.events.fire({element: this, type: 'message', data: ev.data});
    }
  });
  elation.define('worker.base', {
    onmessage: function(ev) {
      console.log('got message in worker base', ev);
    }
  });
});
