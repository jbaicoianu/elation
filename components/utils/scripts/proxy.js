elation.require(['utils.events'], function() {
  elation.define('proxy', {
    _proxytarget: null,
    _proxydefs: {},
    _construct: function(target, defs) {
      this._proxytarget = target;
      if (defs) this._proxydefs = defs;

      var proxyhandler = {
        get: function(target, name) {
          if (name in defs) {
            var def = defs[name];
            var value = elation.utils.arrayget(target, def[1]);
            if (def[0] == 'property') {
              if (target.refresh) target.refresh();
              return value;
            } else if (def[0] == 'function') {
              var bindobj = target;
              if (def[1].indexOf('.') != -1) {
                var parts = def[1].split('.');
                parts.pop();
                bindobj = elation.utils.arrayget(target, parts.join('.'));
              }
              return elation.bind(bindobj, value);
            }
          }
          return target[name];
        },
        set: function(target, name, value) {
          if (name in defs) {
            var def = defs[name];
            if (def[0] == 'property') {
              var propargs = def[2] || {};
              if (!propargs.readonly) {
                elation.utils.arrayset(target, def[1], value);
                if (target.refresh) target.refresh();
                return value;
              }
            } else if (def[0] == 'callback') {
              var evobj = target;
              if (def[2]) {
                evobj = elation.utils.arrayget(target, def[2]);
              }
              elation.utils.arrayset(target, name, value);
              if (evobj) {
                elation.events.add(evobj, def[1], elation.bind(target, value))
              }
              return value;
            } else {
              console.log('why set function?', target, name, def);
            }
          } else {
            target[name] = value;
          }
        },
        has: function(key) {
          return (key in defs);
        },
        enumerate: function() {
          return Object.keys(defs);
        },
        ownKeys: function() {
          return Object.keys(defs);
        }
      };

      return new Proxy(this._proxytarget, proxyhandler);
    },
  });
});
