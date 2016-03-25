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
if (process.argv.length > 2) {
  for (var i = 2; i < process.argv.length; i++) {
    requires.push(process.argv[i]);
  }
}
elation.require(requires);

var resolved = elation.requireactivebatchjs.resolve(elation.requireactivebatchjs.rootnode);
resolved.unshift({name: 'utils.elation'});
var resolvednames = [];
resolved.forEach(function(r) { resolvednames.push(r.name); });
console.log('===== RESOLVED ORDER =====', resolvednames);
var files = [];
var sources = [];
resolved.forEach(function(module) {
  var fname = 'htdocs/scripts/' + module.name.replace(/\./g, '/') + '.js';
  console.log(fname);
  if (fs.existsSync(fname)) {
    files.push(fname);
    //var source = fs.readFileSync(fname, 'utf8');
    var source = '';
    if (module.callback) source = wrapSource(module.name, module.callback.toString());
    else source = fs.readFileSync(fname, 'utf8');

    //source += '\nsetTimeout(function() { elation.requireactivebatchjs.finished("' + module.name + '"); }, 0)\n';
    //source = 'elation.utils.arrayset(elation, "' + module + '", true);\n' + source;
    sources.push(source);
  }
});
sources.push('setTimeout(elation.component.init, 0); elation.onloads.add("elation.component.init()"); ');

function wrapSource(name, source) {
  var pre = '// ===== BEGIN FILE: ' + name + ' ====\n(\n';
  var post = ')();\n// ===== END FILE: ' + name + ' =====\n';
  return pre + source + post;
}

if (elation.requireactivebatchcss) {
  var resolvedcss = elation.requireactivebatchcss.resolve(elation.requireactivebatchcss.rootnode);
  var resolvednames = [];
  var csssources = [];
  resolvedcss.forEach(function(module) { 
    resolvednames.push(module.name);
    var fname = 'htdocs/css/' + module.name.replace(/\./g, '/') + '.css';
    console.log(fname);
    if (fs.existsSync(fname)) {
      files.push(fname);
      var source = fs.readFileSync(fname, 'utf8');

      csssources.push(source);
    }
  });
  console.log('===== RESOLVED ORDER =====', resolvednames);

  fs.writeFileSync('bundle-pack.css', csssources.join('\n'));
  //sources.push('elation.requireactivebatchcss.fulfill(' + JSON.stringify(resolvednames) + ');');
  sources.splice(1, 0, 'elation.requireactivebatchcss = new elation.require.batch("css", "/css"); elation.requireactivebatchcss.fulfill(' + JSON.stringify(resolvednames) + ');');
     
}
fs.writeFileSync('bundle-pack.js', sources.join('\n'));
console.log(elation.env);
