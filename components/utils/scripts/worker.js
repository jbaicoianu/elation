elation.require(['utils.events'], function() {
  elation.extend('worker', {
    create: function(component) {
      var worker = new elation.worker.thread(component);
      return worker;
    }
  });
  elation.define('worker.thread', {
    _construct: function(component, scriptsuffix) {
      var bloburl = "";
      var origin = elation.config.get('dependencies.path', document.location.origin).replace(/\/$/, '');
      if (origin[origin.length-1] != '/') origin += '/';
      var root = elation.config.get('dependencies.rootdir', '/');
      var file = elation.config.get('dependencies.main', '/scripts/utils/elation.js');
      var scriptfile = origin + (origin.indexOf(root) == -1 ? root : '') + file;
      // The suffix swap (janusweb.js -> janusweb.assetworker.js) has to
      // survive cache-busting query strings on the main script URL, so
      // match against the path alone and reattach the query afterward.
      var queryidx = scriptfile.indexOf('?');
      var query = queryidx == -1 ? '' : scriptfile.substring(queryidx);
      var scriptpath = queryidx == -1 ? scriptfile : scriptfile.substring(0, queryidx);
      var m = scriptpath.match(/((:?\.min)?\.js)$/);
      if (scriptsuffix && m) {
        scriptpath = scriptpath.substring(0, scriptpath.length - m[1].length) + '.' + scriptsuffix + m[1];
      }
      scriptfile = scriptpath + query;

      var script = [
        "importScripts('" + scriptfile + "');",
        "if (elation.requireactivebatchjs) {",
        "  elation.requireactivebatchjs.webroot = '" + origin + root + "scripts';",
        "} else {",
        "  elation.requireactivebatchjs = new elation.require.batch('js', '" + origin + root + "scripts');",
        "}",
        "var msgqueue = [];",
        "onmessage = function(ev) { msgqueue.push(ev); };",
        "elation.require('" + component + "', function() {",
        "  elation.config.merge(" + JSON.stringify(elation.config.data) + ");",
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
