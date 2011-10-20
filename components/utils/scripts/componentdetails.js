elation.component.add('utils.componentdetails', {
  updatetimeout: 500,

  init: function(name, container, args) {
    this.name = name;
    this.container = container;
    this.args = args;
    console.log('koo');
    (function(self) {
      setTimeout(function() {
        elation.events.add(elation.utils.paneledit('dostuff').container, 'setactive', self);
      }, 100);
    })(this);
  },
  setComponent: function(component) {
    this.active = component;
    (function(self) {
      var url = '/utils/componentdetails.snip?component=' + component.name + '&root=0'; 
      if (component.args) {
        for (var k in component.args) {
          url += '&componentargs[' + k + ']=' + component.args[k];
        }
      }
      if (component.events) {
        for (var k in component.events) {
          url += '&events[' + k + ']=' + component.events[k];
        }
      }
      elation.ajax.Get(url, null, {callback: function(data) {
        self.setComponentForm(data);
      }});
    })(this);
  },
  setComponentForm: function(html) {
    this.container.innerHTML = html;
    this.inputs = {};
    var inputs = elation.find("input", this.container);
    for (var i = 0; i < inputs.length; i++) {
      if (inputs[i].name) {
        elation.utils.arrayset(this.inputs, inputs[i].name, inputs[i]);
        elation.events.add(inputs[i], "keyup", this);
      }
    }
  },
  updateComponent: function() {
    //console.log('uy', this.active);
    var sets = {}, events = {};
    for (var k in this.inputs.args) {
      if (this.active.args[k] != this.inputs.args[k].value) {
        sets['args.'+k] = this.inputs.args[k].value;
      }
    }
    for (var k in this.inputs.events) {
      sets['events.'+k] = this.inputs.events[k].value;
    }
    this.active.set(sets);
    //this.active.setevents(events);
    //console.log('UPDATED', this.active);
  },
  handleEvent: function(ev) {
    if (typeof this[ev.type] == 'function') {
      return this[ev.type](ev);
    }
  },
  setactive: function(ev) {
    if (ev.data && ev.data.itemtype == 'component' && ev.data.item) {
      this.setComponent(ev.data.item);
    }
  },
  keyup: function(ev) {
    /*
    if (this.updatetimer) {
      clearTimeout(this.updatetimer);
    }
    (function(self) {
      self.updatetimer = setTimeout(function() { self.updateComponent(); }, self.updatetimeout);
    })(this);
    */
    if (this.active.args[ev.target.name] == ev.target.value || (elation.utils.isEmpty(this.active.args[ev.target.name]) && elation.utils.isEmpty(ev.target.value))) {
      elation.html.removeclass(ev.target, 'state_modified');
    } else {
      elation.html.addclass(ev.target, 'state_modified');
    }
    if (ev.keyCode == 13) { // newline
      this.updateComponent();
      for (var k in this.inputs) {
        for (var k2 in this.inputs[k]) {
          if (elation.html.hasclass(this.inputs[k][k2], 'state_modified')) {
            elation.html.removeclass(this.inputs[k][k2], 'state_modified');
          }
        }
      }
    }
  },
});
