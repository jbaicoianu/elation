elation = require('utils/elation');
var fs = require('fs');

// We only care about the browser dependencies right now
/*
elation.env.isBrowser = true;
elation.env.isNode = false;
elation.env.isWorker = false;
*/

var depname = process.argv[2];
var requires = ['utils.events'];
var config = false,
    bundle = 'bundle';
if (process.argv.length > 2) {
  for (var i = 2; i < process.argv.length; i++) {
    var arg = process.argv[i];
    if (arg == '-config') {
      config = process.argv[++i];
    } else if (arg == '-bundle') {
      bundle = process.argv[++i];
    } else {
      requires.push(process.argv[i]);
    }
  }
}

try {
  elation.require(requires);
} catch (e) {
}
elation.requireCSS('utils.elation');
elation.requireCSS(requires);

try {
  var resolved = elation.requireactivebatchjs.resolve(elation.requireactivebatchjs.rootnode);
} catch (e) {
}
if (config) {
  // If config is specified, make sure it's loaded immediately after utils.elation
  var idx = -1;
  resolved.forEach(function(n) { if (n.name == config) idx = resolved.indexOf(n); });
  if (idx != -1) {
    resolved.splice(idx, 1);
  }
  resolved.unshift({name: config});
}
resolved.unshift({name: 'utils.elation'});

var resolvednamesjs = [];
resolved.forEach(function(r) { resolvednamesjs.push(r.name); });

var files = [];
var sources = [];
resolved.forEach(function(module) {
  var fname = 'htdocs/scripts/' + module.name.replace(/\./g, '/') + '.js';
  if (fs.existsSync(fname)) {
    files.push(fname);

    var source = '';
    if (module.callback) source = wrapComponent(module.name, module.callback.toString());
    else source = wrapExternal(module.name, fs.readFileSync(fname, 'utf8'));

    sources.push(source);
  }
});
sources.push('setTimeout(function() { elation.component.init(); }, 0); elation.onloads.add("elation.component.init()"); ');

function wrapComponent(name, source) {
  var pre = '// ===== BEGIN FILE: ' + name + ' ====\n(\n';
  var post = ')();\n// ===== END FILE: ' + name + ' =====\n';
  return pre + source + post;
}
function wrapExternal(name, source) {
  var pre = '// ===== BEGIN EXTERNAL FILE: ' + name + ' ====\n';
  var post = '\n// ===== END EXTERNAL FILE: ' + name + ' =====\n';
  return pre + source + post;
}

if (elation.requireactivebatchcss) {
  var resolvedcss = elation.requireactivebatchcss.resolve(elation.requireactivebatchcss.rootnode);
  var resolvednamescss = [];
  var csssources = [];
  resolvedcss.forEach(function(module) { 
    resolvednamescss.push(module.name);
    var fname = 'htdocs/css/' + module.name.replace(/\./g, '/') + '.css';
    if (fs.existsSync(fname)) {
      files.push(fname);
      var source = fs.readFileSync(fname, 'utf8');

      csssources.push(source);
    }
  });
  //console.log('===== RESOLVED ORDER =====', resolvednamescss);

  fs.writeFileSync(bundle + '.css', csssources.join('\n'));
  //sources.push('elation.requireactivebatchcss.fulfill(' + JSON.stringify(resolvednamescss) + ');');
  sources.splice(1, 0, 'elation.requireactivebatchcss = new elation.require.batch("css", "/css"); elation.requireactivebatchcss.fulfill(' + JSON.stringify(resolvednamescss) + ');');
  sources.splice(1, 0, 'elation.requireactivebatchjs = new elation.require.batch("js", "/scripts"); elation.requireactivebatchjs.fulfill(' + JSON.stringify(resolvednamesjs) + ');');
}
fs.writeFileSync(bundle + '.js', sources.join('\n'));

console.log('Built files: ' + bundle + '.js ' + bundle + '.css');
