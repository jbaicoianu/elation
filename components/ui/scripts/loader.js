elation.require(['ui.window', 'ui.panel', 'ui.spinner'], function() {
  elation.component.add('ui.loader', function() {
    this.defaultcontainer = { tag: 'div', classname: 'ui_loader' };

    this.init = function() {
      elation.ui.loader.extendclass.init.call(this);
      this.defaulttype = 'image';
      this.pendingtypes = {};
      this.pendingurls = {};
      this.pending = 0;

      // listen globally for all resource_load_* events
      elation.events.add(null, 'resource_load_start,resource_load_finish,resource_load_fail', this);

      var content = elation.ui.panel({});
      var spinner = elation.ui.spinner({append: content});
      this.setcontent(content);
      this.hide();
    }
    this.resource_load_start = function(ev) {
      if (!this.started) this.start();
      var object = ev.data || {};
      if (!object.type) {
        object.type = this.defaulttype;
      }
      if (!object.url && object.image) {
        object.url = object.image.src;
      }

      if (object && object.url && !this.pendingurls[object.url]) {
        this.pendingtypes[object.type] = (this.pendingtypes[object.type] || 0) + 1;
        this.pendingurls[object.url] = object;
        this.pending++;
        if (object.image) {
          if (object.image.complete) {
            this.image_load({target: object.image, data: object});
          } else {
            elation.events.add(object.image, 'load', elation.bind(this, this.image_load));
            elation.events.add(object.image, 'error', elation.bind(this, this.image_error));
          }
        } else if (object instanceof XMLHttpRequest) {
          elation.events.add(object, 'readystatechange', elation.bind(this, this.xhr_readystatechange, object.type));
        }
      }
      this.refresh();
    }
    this.complete = function(url) {
      if (url && this.pendingurls[url]) {
        var obj = this.pendingurls[url];
        delete this.pendingurls[url];
        this.pendingtypes[obj.type]--;
        this.pending--;
        //console.log('finished an ' + obj.type, obj, this.pending, this.pendingtypes);
        if (this.pending == 0) {
          this.finish();
        }
      }
      this.refresh();
    }
    this.start = function() {
      this.started = true;
      this.show();
      elation.events.fire({type: 'ui_loader_start', element: this});
    }
    this.finish = function() {
      this.started = false;
      this.hide();
      elation.events.fire({type: 'ui_loader_finish', element: this});
    }
    this.resource_load_finish = function(ev) {
      this.complete(ev.data.url);
    }
    this.image_load = function(ev) {
      var img = ev.target;
      this.complete(img.src);
    }
    this.image_error = function(ev) {
      var img = ev.target;
      this.complete(img.src);
    }
    this.xhr_readystatechange = function(type, ev) {
      if (ev.target.readyState == 4) {
        this.pendingtypes[type]--;
        this.pending--;
        console.log('finished a ' + type, this.pending, this.pendingtypes);
      }
    }
  }, elation.ui.window);
});
