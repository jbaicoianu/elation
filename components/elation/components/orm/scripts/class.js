//elation.template.add('orm.class.property.connector', '<span data-elation-component="orm.connector" data-elation-args.direction="in"></span><span data-elation-component="orm.connector" data-elation-args.direction="out"></span>', 'dust');
elation.template.add('orm.class.property.view', '<span class="orm_class_property_name">{name}</span> <span class="orm_class_property_type">({type})</span>', 'dust');
elation.template.add('orm.class.property.edit', '<span class="orm_class_property_name"><input name="name" value="{name}" /></span> <span class="orm_class_property_type"><select name="type">{#alltypes}<option{@eq key=type value=.} selected{/eq}>{.}</option>{/alltypes}</select></span>', 'dust');

elation.component.add('orm.class', function() {
  this.init = function() {
    this.name = '';
    this.properties = {};

    var uls = elation.find('.orm_class_properties', this.container);
    if (uls[0]) {
      this.propertiesul = uls[0];
    } else {
      this.propertiesul = elation.html.create({tag: 'ul', classname: 'orm_class_properties', append: this.container});
    }
    if (this.args.classdef) {
      //this.name = this.args.name;
      if (this.args.classdef.props) {
        this.initproperties(this.args.classdef.props);
      }
      this.addproperty('', '', {formdefault:true});

      // associations
      if (this.args.classdef.associations) {
        this.initassociations(this.args.classdef.associations);
      }
      //this.addproperty('', '', {formdefault:true});
    }
    this.enabledrag();
console.log(Math.floor(Math.random() * window.innerWidth * .9));
 this.container.style.left = Math.floor(Math.random() * window.innerWidth * .8) + 'px';
 this.container.style.top = Math.floor(Math.random() * window.innerHeight * .6) + 'px';
    //elation.component.init();
  }
  this.serialize = function() {
    console.log(this.properties, this.connections);
  }
  this.initproperties = function(props) {
    console.log('class properties:', props);
    for (var k in props) {
      var prop = props[k];
      console.log('add prop', k, prop);
      this.addproperty(prop[0], prop[1], prop[2]);
    }
  }
  this.initassociations = function(associations) {
    setTimeout(elation.bind(this, function() {
      console.log('class associations: ' + this.name, associations);
      for (var k in associations) {
        var assoc = associations[k];
        console.log('new association: ' + k, assoc);
        this.addassociation(assoc);
      }
    }), 0);
  }
  this.addproperty = function(name, type, args) {
    if (!args) args = {};
    args.name = name;
    args.type = type;
    this.properties[name] = elation.orm.class.property(null, elation.html.create({tag: 'li', append: this.propertiesul}), args);
    elation.events.add(this.properties[name], "orm_class_property_editstart,orm_class_property_editend,orm_class_property_change", this);
    if (args.formdefault) {
      elation.events.add(this.properties[name], "orm_class_property_add", this);
    }
  }
  this.addassociation = function(assoc) {
    var type = assoc[0];
    var otherclass = assoc[1];
    var args = assoc[2];

    var keys = args.key.split(',');
    var other = elation.orm.class(otherclass);
console.log(this, other, otherclass);
    if (other && other.properties) {
      for (var i = 0; i < keys.length; i++) {
        if (this.properties[keys[i]] && other.properties[keys[i]]) {
          this.properties[keys[i]].link(other.properties[keys[i]]); 
        }
      }
    }
  }
  this.click = function(ev) {
    this.propertiesul.appendChild(newitem);
  }
  this.orm_class_property_editstart = function(ev) {
    this.disabledrag();
  }
  this.orm_class_property_editend = function(ev) {
    this.enabledrag();
  }
  this.orm_class_property_change = function(ev) {
    this.enabledrag();
  }
  this.orm_class_property_add = function(ev) {
    this.enabledrag();
    var prop = ev.target;
console.log('added property to ' + this.name, prop);
    prop.setdefault(false);
    //elation.events.remove(prop, "orm_class_property_add", this);
    this.properties[prop.name] = prop;
    delete this.properties[''];
    this.addproperty('', '', {formdefault:true});
  }
}, elation.ui.draggable);
elation.component.add('orm.class.property', function() {
  this.alltypes = ['string', 'int32', 'int64', 'float'];

  this.init = function() {
    this.name = this.args.name;
    this.type = this.args.type;
    this.connectors = {};
    if (this.args.formdefault) {
      this.type = this.alltypes[0];
    }
    this.render(false);
    elation.events.add(this.container, 'mouseover,mouseout,keydown', this);
    elation.html.addclass(this.container, 'orm_class_property');
    this.setdefault(this.args.formdefault);

    this.connectors['in'] = elation.orm.connector(null, elation.html.create({tag: 'div', append: this.container}), {direction: 'any_in'});
    this.connectors['out'] = elation.orm.connector(null, elation.html.create({tag: 'div', append: this.container}), {direction: 'any_out'});
  }
  this.setdefault = function(def) {
    this.isdefault = def;
    if (def) {
      elation.html.addclass(this.container, 'orm_class_property_create');
    } else {
      elation.html.removeclass(this.container, 'orm_class_property_create');
    }
  }
  this.link = function(other) {
    var thisconn = this.getconnector('in');
    var otherconn = other.getconnector('in');
    if (thisconn && otherconn) {
      thisconn.addlink(otherconn);
    }
  }
  this.getconnector = function(type) {
    if (this.connectors[type]) {
      return this.connectors[type];
    }
  return false;
  }
  this.render = function(editmode) {
    //var outtext = elation.template.get('orm.class.property.connector', this);
    var outtext = '';
    if (editmode == 0) {
      if (this.inputelements) {
        elation.events.remove(this.inputelements, 'focus,blur,change', this);
      }
      outtext += elation.template.get('orm.class.property.view', this);
      this.container.innerHTML = outtext;
    } else {
      outtext += elation.template.get('orm.class.property.edit', this);
      this.container.innerHTML = outtext;
      this.inputelements = elation.find('input,select', this.container);
      elation.events.add(this.inputelements, 'focus,blur,change', this);
      setTimeout(elation.bind(this.inputelements[0], function() { this.focus(); }), 10);
    }
    if (editmode) {
      elation.html.addclass(this.container, 'state_editing');
    } else if (elation.html.hasclass(this.container, 'state_editing')) {
      elation.html.removeclass(this.container, 'state_editing');
    }
  }
  this.startedit = function(skiprender) {
    this.editing = 2;
    if (!skiprender) {
      this.render(true);
    }
    elation.events.fire({type: 'orm_class_property_editstart', element: this});
  }
  this.endedit = function() {
    this.render(false);
    this.editing = false;
    elation.events.fire({type: 'orm_class_property_editend', element: this});
    elation.component.init();
  }
  this.mouseover = function(ev) {
    var target = elation.events.getTarget(ev),
        rel = elation.events.getRelated(ev);
    if (target != rel && elation.utils.isin(this.container, target) && !elation.utils.isin(this.container, rel)) {
      if (!this.editing) {
        //this.editing = 1;
        //this.render(true);
      }
    } else {
      //console.log('mouseover', target, this.container, rel, elation.utils.isin(this.container, target), elation.utils.isin(this.container, rel));
    }
  }
  this.mouseout = function(ev) {
    var target = elation.events.getTarget(ev),
        rel = elation.events.getRelated(ev);
    if (this.editing == 1 && elation.utils.isin(this.container, target) && !elation.utils.isin(this.container, rel)) {
      this.endedit();
    }
  }
  this.mousedown = function(ev) {
    if (ev.button == 0 && !this.editing) {
      this.startedit();
    }
  }
  this.keydown = function(ev) {
    switch (ev.keyCode) {
      case 13: // enter
        ev.target.blur();
        break;
      case 27: // esc
        ev.target.value = this[ev.target.name];
        ev.target.blur();
        break;
    } 
  }
  this.focus = function(ev) {
    //console.log('focus', ev.target);
    if (this.blurtimer) {
      clearTimeout(this.blurtimer);
      this.blurtimer = false;
    }
    this.startedit(true);
  }
  this.blur = function(ev) {
    //console.log('blur', ev.target);
    this.blurtimer = setTimeout(elation.bind(this, function() {
      this.blurtimer = false;
      if (this.changed && this.name != '') {
        elation.html.addclass(this.container, 'state_changed');
        elation.events.fire({type: 'orm_class_property_' + (this.isdefault ? 'add' : 'change'), element: this});
        this.changed = false;
      }
      this.endedit();
    }), 10);
  }
  this.change = function(ev) {
    var target = ev.target;
    if (target.value != '') {
      this.changed = this.changed || this[target.name] != target.value;
      this[target.name] = target.value;
    }
  }
});
elation.component.add("orm.connector", function() {
  this.init = function() {
    this.direction = this.args.direction || 'any';
    this.links = [];
    elation.html.addclass(this.container, 'orm_connector');
    if (this.direction == 'any_in' || this.direction == 'any_out') {
      var dir = this.direction.substr(this.direction.indexOf('_')+1);
      this.direction = 'any';
      elation.html.addclass(this.container, 'orm_connector_any orm_connector_' + dir);
    } else {
      elation.html.addclass(this.container, 'orm_connector_' + this.direction);
    }
    elation.events.add(this.container, 'mousedown', this);

  }
  this.addlink = function(other) {
    var newlink = elation.orm.connector.link(null, elation.html.create({tag: 'canvas', append: this.container}));
    newlink.setstart(this);
    if (other) {
      newlink.setend(other);
    }
    this.links.push(newlink);
    return newlink;
  }
  this.removelink = function(link) {
    var i = this.links.indexOf(link);
    if (i != -1) {
      this.links.splice(i, 1);
      if (link.container.parentNode) {
        link.container.parentNode.removeChild(link.container);
      }
    }
  }
  this.moveto = function(x, y) {
    this.container.style.left = x + 'px';
    this.container.style.top = y + 'px';
    //elation.html.transform(this.container, 'scale(2) translate3d(' + x + 'px, ' + y + 'px, 0px)');
    elation.events.fire({type: 'orm_connector_move', element: this});
  }
  this.reparent = function(parent) {
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    if (parent) {
      parent.appendChild(this.container);
    }
  }
  this.mousedown = function(ev) {
    if (ev.button == 0) {
      var dragname = 'dragpoint';
      if (!elation.orm.connector.obj[dragname]) {
        this.dragpoint = elation.orm.connector(dragname, elation.html.create({tag: 'div', append: this.container}), {direction: 'temp'});
      } else {
        this.dragpoint = elation.orm.connector(dragname);
        this.dragpoint.reparent(this.container);
      }
      var mypos = elation.html.position(this.container);
      var offset = 4; // FIXME - dunno why this is needed...need to figure it out instead of hardcoding
      this.dragpoint.moveto(ev.clientX - mypos[0] + window.scrollX - offset, ev.clientY - mypos[1] + window.scrollY - offset);
      if (!this.draglink) {
        this.draglink = this.addlink(this.dragpoint);
      }
      elation.events.add(window, 'mousemove,mouseup', this);
      ev.stopPropagation();
    }
  }
  this.mousemove = function(ev) {
    //this.endpos = [ev.clientX, ev.clientY];
    var target = ev.target;
    var color = '#900';
    if (elation.html.hasclass(target, 'orm_connector')) {
      var other = elation.component.fetch(target);
      if (other && ((this.direction == 'any' || other.direction == 'any') || 
          (this.direction == 'in' && other.direction == 'out') ||
          (this.direction == 'out' && other.direction == 'in'))) {
        color = '#0f0';
      }
    }
    if (this.draglink) {
      this.draglink.setcolor(color);
    }
    var mypos = elation.html.position(this.container);
    var offset = 4; // FIXME - dunno why this is needed...need to figure it out instead of hardcoding
    this.dragpoint.moveto(ev.clientX - mypos[0] + window.scrollX - offset, ev.clientY - mypos[1] + window.scrollY - offset);
  }
  this.mouseup = function(ev) {
    elation.events.remove(window, 'mousemove,mouseup', this);
    var target = ev.target;
    if (elation.html.hasclass(target, 'orm_connector')) {
      var other = elation.component.fetch(target);
      if (other && ((this.direction == 'any' || other.direction == 'any') || 
          (this.direction == 'in' && other.direction == 'out') ||
          (this.direction == 'out' && other.direction == 'in'))) {
        if (this.draglink) {
          this.draglink.setend(other);
          this.draglink = false;
        }
      } else {
        this.removelink(this.draglink);
        this.draglink = false;
      }
    } else {
      this.removelink(this.draglink);
      this.draglink = false;
    }
    this.dragpoint.reparent(false);
  }
});
elation.component.add("orm.connector.link", function() {
  this.start = false;
  this.end = false;
  this.debug = false;
  this.color = "#900";

  this.init = function() {
    elation.html.addclass(this.container, 'orm_connector_link');
    if (this.args.start) this.setstart(this.args.start);
    if (this.args.end) this.setend(this.args.end);
    if (this.args.color) this.setcolor(this.args.color);

    this.ctx = this.container.getContext('2d');
  }
  this.getdraggableparent = function(obj) {
    var parentdiv = elation.utils.getParent(obj.container, "div", "ui_draggable");
    if (parentdiv) {
      var parentobj = elation.component.fetch(parentdiv);
      if (parentobj) {
        return parentobj;
      }
    }
    return false;
  }
  this.setstart = function(start) {
    this.start = start;
    elation.events.add(start, "orm_connector_move", this);
    var dragparent = this.getdraggableparent(start);
    if (dragparent) {
      elation.events.add(dragparent, "ui_draggable_move", this);
    }
    this.updatepositions();
  }
  this.setend = function(end) {
    this.end = end;
    elation.events.add(end, "orm_connector_move", this);
    var dragparent = this.getdraggableparent(end);
    if (dragparent) {
      elation.events.add(dragparent, "ui_draggable_move", this);
    }
    this.updatepositions();
  }
  this.setcolor = function(color) {
    this.color = color;
    this.updatepositions();
  }
  this.updatepositions = function() {
    if (this.start && this.end) {
      var startpos = elation.html.position(this.start.container);
      var endpos = elation.html.position(this.end.container);

      this.startpos = startpos;
      this.endpos = endpos;

      // FIXME - instead of calling render directly here, we should throw an event so 
      //         that a central renderframe manager can render at its leisure
      this.render();
    }
  }
  this.render = function(color) {
    var diff = [this.endpos[0] - this.startpos[0], this.endpos[1] - this.startpos[1]];
    var offset = [50, 50];
    this.container.width = diff[0];
    var realstart = [0,0];
    var realend = [diff[0], diff[1]];
    for (var i = 0; i < 2; i++) {
      if (diff[i] < 0) {
        realstart[i] = -diff[i] + offset[i];
        realend[i] = offset[i];
      } else {
        realstart[i] = offset[i];
        realend[i] = diff[i] + offset[i];
      }
    }
    this.container.style.left = -realstart[0] + 'px';
    this.container.style.top = -realstart[1] + 'px';
    this.container.width = Math.abs(diff[0]) + offset[0] * 2;
    this.container.height = Math.abs(diff[1]) + offset[1] * 2;
    var midpoint = Math.abs(diff[0]) / 2 + offset[0];
    var ctx = this.ctx;

    if (this.debug) {
      // border outline
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(0,255,0,1)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(this.container.width, 0);
      ctx.lineTo(this.container.width, this.container.height);
      ctx.lineTo(0, this.container.height);
      ctx.lineTo(0, 0);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,0,0,.5)';
      ctx.beginPath();
      ctx.moveTo(offset[0], offset[1]);
      ctx.lineTo(this.container.width - offset[0], offset[1]);
      ctx.lineTo(this.container.width - offset[0], this.container.height - offset[1]);
      ctx.lineTo(offset[0], this.container.height - offset[1]);
      ctx.lineTo(offset[0], offset[1]);
      ctx.stroke();

      // control points
      ctx.beginPath();
      ctx.arc(realstart[0], realstart[1], 4, 0, 2*Math.PI, false);
      ctx.arc(realend[0], realend[1], 4, 0, 2*Math.PI, false);
      ctx.arc(midpoint, realstart[1], 4, 0, 2*Math.PI, false);
      ctx.arc(midpoint, realend[1], 4, 0, 2*Math.PI, false);
      ctx.fillStyle = '#00f';
      ctx.fill();
    }
    ctx.beginPath();
    ctx.moveTo(realstart[0],realstart[1]);
    ctx.bezierCurveTo(midpoint, realstart[1], midpoint, realend[1], realend[0], realend[1]);
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255,255,255,.5)';
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.strokeStyle = this.color || '#900';
    ctx.stroke();
  }
  this.orm_connector_move = function(ev) {
    this.updatepositions();
  }
  this.ui_draggable_move = function(ev) {
    this.updatepositions();
  }
});
