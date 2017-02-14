elation.require(['utils.events'], function() {

  elation.define('proxy', {
    _proxytarget: null,
    _proxydefs: {},
    _proxyobj: null,
    _proxypassthrough: true,
    _scriptprops: {},
    _construct: function(target, defs, passthrough) {
      this._proxytarget = target;
      if (defs) this._proxydefs = defs;
      var self = this;
      var proxydefs = this._proxydefs,
          scriptprops = this._scriptprops;
      var changetimer = false,
          proxyobj = this._proxyobj;

      function setProxyChangeTimer(data) {
        // FIXME - it seems like we're not actually using this, and it's incredibly expensive
        //         to throw this many events, especially since many properties tend to change
        //          at the same time.  Disabling for now, we'll see if anything breaks...
        //elation.events.fire({element: proxyobj, type: 'proxy_change', data: data});
      }

      function executeCallback(fn, target, args) {
        try { 
          if (elation.utils.isString(fn)) {

            eval(fn);
          } else if (fn instanceof Function) {
            fn.apply(target, args);
          }
        } catch (e) { 
          console.log(e.stack); 
        }
      }

      var getProxyValue = function(target, name) {
        if (proxydefs && proxydefs.hasOwnProperty(name)) {
          var def = proxydefs[name];
          var value;
          if (def[1] && def[1].split) {
            value = elation.utils.arrayget(target, def[1]);
          } else {
            console.log('wtf d00d', name, def, defs);
          }
          if (def[0] == 'property') {
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
        } else if (name in scriptprops) {
          return scriptprops[name];
        } else if (name == '_target') {
          return target;
        } else {
          scriptprops[name] = target[name];
        }
        if (passthrough) {
          return target[name];
        }
      }


      var proxyhandler = {
        construct: target.constructor,
        get: getProxyValue,
        set: function(target, name, value) {
          if (proxydefs && proxydefs[name]) {
            var def = proxydefs[name],
                deftype = def[0],
                defname = def[1],
                defargs = def[2];
            if (deftype == 'property') {
              var propargs = defargs || {};
              if (!propargs.readonly) {
                elation.utils.arrayset(target, defname, value);
                //elation.events.fire({element: this._proxyobj, type: 'proxy_change', data: {key: defname, value: value}});
                setProxyChangeTimer({key: defname, value: value});
                return value;
              }
            } else if (deftype == 'callback') {
              var evobj = target;
              if (defargs) {
                evobj = elation.utils.arrayget(target, defargs);
              }
              elation.utils.arrayset(target, name, value);
              if (evobj) {
                var bindargs = def[3] || [];
                //elation.events.add(evobj, def[1], elation.bind.apply(null, bindargs));
                elation.events.add(evobj, def[1], elation.bind(target, function(ev) {
                  var funcargs = [];
                  for (var i = 0; i < bindargs.length; i++) {
                    funcargs.push(bindargs[i]);
                  }
                  for (var i = 0; i < arguments.length; i++) {
                    funcargs.push(arguments[i]);
                  }
                  executeCallback(value, target, funcargs);
                }));
              }
              //elation.events.fire({element: this._proxyobj, type: 'proxy_change', data: {key: defname, value: value}});
              setProxyChangeTimer({key: defname, value: value});
              return value;
            } else {
              console.log('why set function?', target, name, def);
            }
          } else if (name == '_proxydefs') {
            var keys = Object.keys(value);
            for (var i = 0; i < keys.length; i++) {
              if (proxydefs[keys[i]]) {
                delete proxydefs[keys[i]];
              }
            }
            elation.utils.merge(value, proxydefs);
          } else {
            scriptprops[name] = value;
            target[name] = value;
            //elation.events.fire({element: target, type: 'proxy_change', data: {key: name, value: value}});
            setProxyChangeTimer({key: name, value: value});
          }
        },
        has: function(key) {
          return (proxydefs && (key in proxydefs || key in self._scriptprops));
        },
        getOwnPropertyDescriptor: function(target, prop) {
          if (prop in proxydefs || prop in self._scriptprops) {
            return {enumerable: true, configurable: true, value: getProxyValue(target, prop)};
          }
        },
        enumerate: function(target) {
          var scriptkeys = (self._scriptprops ? Object.keys(self._scriptprops) : []);
          var proxykeys = [];//(self._proxydefs ? Object.keys(self._proxydefs) : []);
          for (var k in self._proxydefs) {
            if (self._proxydefs[0] == 'property') {
              proxykeys.push(k);
            }
          }
          return proxykeys.concat(scriptkeys);
        },
        ownKeys: function(target) {
          var scriptkeys = (self._scriptprops ? Object.keys(self._scriptprops) : []);
          var proxykeys = [];//(self._proxydefs ? Object.keys(self._proxydefs) : []);
          for (var k in self._proxydefs) {
            if (self._proxydefs[k][0] == 'property') {
              proxykeys.push(k);
            }
          }
          var ret = proxykeys.concat(scriptkeys);
          return ret;
        }
      };

      if (typeof Proxy != 'undefined') {
        this._proxyobj = new Proxy(this._proxytarget, proxyhandler);
        return this._proxyobj;
      }
      return target;
    }
  });
});
