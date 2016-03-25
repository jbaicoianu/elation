elation.require(["utils.events", "utils.dust"], function() {
  elation.extend("template", new function() {
    this.types = {};
    this.templates = {};
    this.defaulttype = false;

    this.addtype = function(type, wrapper) {
      this.types[type] = wrapper;
      if (!this.defaulttype && !this.types[type].failed) {
        this.setdefaulttype(type);
      }
    }
    this.setdefaulttype = function(type) {
      this.defaulttype = type;
    }

    this.add = function(name, tpl, type) {
      if (!type) type = this.defaulttype;
      this.types[type].add(name, tpl);
      this.templates[name] = {type: type, name: name, tpl: tpl}; 
      return this.templates[name];
    }
    this.remove = function(name) {
      if (this.templates[name] && this.types[this.templates[name].type]) {
        this.types[this.templates[name].type].remove();
        delete this.templates[name];
        return true;
      }
      return false;
    }
    this.get = function(name, args) {
      if (this.templates[name]) {
        var tpl = this.templates[name];
        if (this.types[tpl.type]) {
          return this.types[tpl.type].eval(name, args);
        } else {
          console.log('elation.template.get() - error: unknown template type for ' + name + ': ' + tpl.type);
        }
      } else {
        console.log('elation.template.get() - error: template not found: ' + name);
      }
      return '';
    }
    this.exists = function(name) {
      return (typeof this.templates[name] != 'undefined');
    }
  });
  elation.template.addtype("dust", new function() {
    this.failed = false;
    this.templates = {};
    this.init = function() {
      if (!dust) {
        console.log("elation.template.addtype('dust') - error: no dust library loaded");
        this.failed = true;
      }
    }
    this.add = function(name, tpl) {
      if (!this.failed) {
        //console.log('add template', name, tpl);
        this.templates[name] = dust.compile(tpl, name);
        dust.loadSource(this.templates[name]);
      }
    }
    this.remove = function(name) {
      if (this.templates[name]) {
        delete this.templates[name];
        return true;
      }
      return false;
    }
    this.eval = function(name, args) {
      // de-asynchronize template rendering.  templates can still trigger asynchronous output though...
      var result = '';
      if (!this.failed) {
        dust.render(name, args, function(err, res) {
          result = res;
        });
      }
      return result;
    }
  });
});
