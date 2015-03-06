elation.require([
    "ui.base",
    "ui.tabbedcontent",
    "ui.treeview",
    "ui.select",
    "ui.breadcrumbs",
    "elation.collection"
  ], function() {
  elation.component.add("hack.terminal", function() {
    this.defaultcontainer = {tag: 'div', classname: 'application_terminal'};
    this.init = function() {
      this.message({data:'Connecting... '})
      elation.events.add(this.container, 'click', this);
      this.connection = new WebSocket('ws://meobets.com:8086');
      this.connection.onmessage = elation.bind(this, this.message);

      (function(self) {
        self.connection.onerror = function(err) {
          console.log('WebSocket err:', err);
          self.message({data:'Unable to establish connection.  Server down?'});
        };
      })(this);
    }
    this.input = function() {
      this.prompt = elation.ui.input(null, null, {
        label: '$ ',
        classname: 'terminal_prompt',
        append: this.container
      });

      this.focus();
      elation.events.add(this.prompt.container, 'keydown', this);
    }
    this.focus = function() {
      this.prompt.inputelement.focus();
    }
    this.click = function(event) {
      this.focus();
    }
    this.keydown = function(event) {
      if (event.keyCode == 13) {
        if (this.prompt)
          this.prompt.disabled = true;

        this.connection.send(this.prompt.inputelement.value);
      }
    }
    this.message = function(event) {
      console.log('###', event.type, event);
      this.reply = elation.html.create({
        tag: 'div',
        classname: 'terminal_response',
        attributes: { innerHTML: event.data },
        append: this.container
      });

      if (event.data == '<EOL>')
        this.input();
    }
  }, elation.ui.base);

  elation.component.add("hack.admin", function() {
    this.defaultcontainer = {tag: 'div', classname: 'application_admin'};
    this.init = function() {
      var create = elation.html.create;

      this.elements = {};

      this.elements.system = create({ tag: 'div' });
      this.elements.user = create({ tag: 'div' });
      this.elements.admin = create({ tag: 'div' });

      this.elements.tabbedcontent = elation.ui.tabbedcontent({
        append: this.container,
        classname: 'system_tabs',
        contenttype: 'contentlist',
        animation: 'fade',
        items: [
          { label: 'System', name: 'system', content: this.elements.system },
          //{ label: 'User', name: 'user', content: this.elements.user },
          { label: 'Admin', name: 'admin', content: this.elements.admin }
        ]
      });

      this.elements.systemlabel = create({
        tag: 'span',
        classname: 'dialog_label',
        attributes: { innerHTML: 'System Settings' },
        append: this.elements.system
      });
      this.elements.systembox = create({
        tag: 'div',
        classname: 'box',
        append: this.elements.system
      });
      this.elements.computer = elation.ui.input('computer', null, {
        inputname: 'computer',
        label: 'Computer Name',
        classname: 'admin_computer',
        append: this.elements.systembox
      });
      this.elements.colorbox = create({
        tag: 'div',
        classname: 'admin_colorbox',
        append: this.elements.systembox
      });
      this.elements.color_hue = elation.ui.inputslider('color_hue', null, {
        max: 360,
        handle: {
          prefix: 'hue',
          value: 280
        }
      });
      this.elements.color_lightness = elation.ui.inputslider('color_lightness', null, {
        max: 100,
        handle: {
          prefix: 'lightness',
          value: 40
        }
      });
      this.elements.color_saturation = elation.ui.inputslider('color_saturation', null, {
        max: 100,
        handle: {
          prefix: 'saturation',
          value: 60
        }
      });
      this.elements.colorbox.appendChild(this.elements.color_hue.container);
      this.elements.colorbox.appendChild(this.elements.color_lightness.container);
      this.elements.colorbox.appendChild(this.elements.color_saturation.container);
      this.elements.systemcolor = create({ 
        tag: 'div', 
        id: 'colorsquare', 
        append: this.elements.colorbox 
      });
      elation.events.add(null, 'ui_inputslider_change', function(event) {
        var hue = elation.ui.inputslider('color_hue'),
            saturation = elation.ui.inputslider('color_saturation'),
            lightness = elation.ui.inputslider('color_lightness'),
            square = elation.id('#colorsquare');

        square.style.backgroundColor = 'hsl('+hue.value+','+saturation.value+'%,'+lightness.value+'%)';
      });
      this.elements.systemsave = elation.ui.button('systemsave', null, {
        label: 'Save',
        title: 'Save User Data',
        type: 'submit',
        tag: 'button',
        append: this.elements.systembox
      });

      this.elements.userlabel = create({
        tag: 'span',
        classname: 'dialog_label',
        attributes: { innerHTML: 'User Settings' },
        append: this.elements.user
      });
      this.elements.userbox = create({
        tag: 'div',
        classname: 'box',
        append: this.elements.user
      });
      this.elements.username = elation.ui.input('username', null, {
        inputname: 'username',
        label: 'Username',
        append: this.elements.userbox
      });
      this.elements.userpassword = elation.ui.input('userpassword', null, {
        inputname: 'user_password',
        type: 'password',
        label: 'Password',
        classname: 'admin_computer',
        append: this.elements.userbox
      });
      this.elements.usersave = elation.ui.button('usersave', null, {
        label: 'Save',
        title: 'Save User Data',
        type: 'submit',
        tag: 'button',
        append: this.elements.userbox
      });

      this.elements.worldlabel = create({
        tag: 'span',
        classname: 'dialog_label',
        attributes: { innerHTML: 'World Settings' },
        append: this.elements.admin
      });
      this.elements.worldbox = create({
        tag: 'div',
        classname: 'box',
        append: this.elements.admin
      });
      this.elements.adminpassword = elation.ui.input('adminpassword', null, {
        inputname: 'admin_password',
        type: 'password',
        label: 'Admin Password',
        append: this.elements.worldbox
      });
      this.elements.seed = elation.ui.input('seed', null, {
        inputname: 'seed',
        label: 'Seed',
        classname: 'admin_seed',
        append: this.elements.worldbox
      });
      this.elements.routers = elation.ui.slider('routers', null, {
        min: 32,
        max: 1024,
        handle: {
          prefix: 'Routers:',
          append: 'container',
          before: "track",
          anchor: 'right',
          value: 512,
          toFixed: 0,
          snap: 8
        }
      });
      this.elements.worldbox.appendChild(this.elements.routers.container);
      this.elements.nodes = elation.ui.slider('clients', null, {
        min: 32,
        max: 1024,
        handle: {
          prefix: 'Clients:',
          append: 'container',
          before: "track",
          anchor: 'right',
          value: 768,
          toFixed: 0,
          snap: 8
        }
      });
      this.elements.worldbox.appendChild(this.elements.nodes.container);
      this.elements.worldfooter = create({
        tag: 'div',
        classname: 'admin_worldfooter',
        append: this.elements.worldbox
      });
      this.elements.generate = elation.ui.button('generate', null, {
        label: 'Generate',
        title: 'Generate World Data',
        type: 'submit',
        tag: 'button',
        append: this.elements.worldfooter
      });
    }
  }, elation.ui.base);

  elation.component.add("hack.network", function() {
    this.defaultcontainer = { tag: 'div', classname: 'application_network' };
    this.init = function() {
      this.container.innerHTML = "<br><div style='text-align:center;'>NETWORK ERROR<br><br>The network appears to be down.</div><br>";
    }
  }, elation.ui.base);

  elation.component.add("hack.irc", function() {
    this.defaultcontainer = { tag: 'div', classname: 'application_irc' };
    this.init = function() {
      var create = elation.html.create;
      this.iframe = create({tag:'iframe',attr:{src:'http://www.thefind.com/admin/'}, append: this});
      this.window = elation.window.window(null, null, {
        content: this.container,
        classname: 'application_irc'
      });
    }
  }, elation.ui.base);

  elation.component.add("hack.login", function() {
    this.defaultcontainer = { tag: 'div', classname: 'application_login' };
    this.init = function() {
      var create = elation.html.create;

      this.elements = {};

      this.elements.login = create({ tag: 'div' });
      this.elements.register = create({ tag: 'div' });

      this.elements.tabbedcontent = elation.ui.tabbedcontent({
        append: this.container,
        classname: 'signin_tabs',
        contenttype: 'contentlist',
        animation: 'fade',
        items: [
          { label: 'Sign In', name: 'login', content: this.elements.login },
          { label: 'Register', name: 'register', content: this.elements.register }
        ]
      });

      this.elements.login_label = create({
        tag: 'span',
        classname: 'dialog_label',
        attributes: { innerHTML: 'Existing Account' },
        append: this.elements.login
      });
      this.elements.login_box = create({
        tag: 'div',
        classname: 'box',
        append: this.elements.login
      });
      this.elements.login_name = elation.ui.input('login_name', null, {
        inputname: 'username',
        label: 'Username',
        append: this.elements.login_box
      });
      this.elements.login_password = elation.ui.input('login_password', null, {
        inputname: 'user_password',
        type: 'password',
        label: 'Password',
        classname: 'admin_computer',
        append: this.elements.login_box
      });
      this.elements.login_checkbox = elation.ui.toggle('login_save', null, {
        label: 'Remember these credentials',
        title: 'Remembers via browser cookies',
        append: this.elements.login_box
      });
      this.elements.login_submit = elation.ui.button('login_submit', null, {
        label: 'Sign In',
        title: 'Log in to the system',
        type: 'submit',
        tag: 'button',
        append: this.elements.login_box
      });

      this.elements.register_label = create({
        tag: 'span',
        classname: 'dialog_label',
        attributes: { innerHTML: 'New Account Setup' },
        append: this.elements.register
      });
      this.elements.register_box = create({
        tag: 'div',
        classname: 'box',
        append: this.elements.register
      });
      this.elements.register_email = elation.ui.input('register_email', null, {
        inputname: 'email',
        label: 'E-mail Address',
        classname: 'admin_computer',
        append: this.elements.register_box
      });
      this.elements.register_updates = elation.ui.toggle('register_updates', null, {
        label: 'Send me spam mail',
        title: 'Email a list of fixes for new releases',
        classname: 'admin_computer',
        append: this.elements.register_box
      });
      this.elements.register_name = elation.ui.input('register_name', null, {
        inputname: 'username',
        label: 'Username',
        append: this.elements.register_box
      });
      this.elements.register_password = elation.ui.input('register_password', null, {
        inputname: 'user_password',
        type: 'password',
        label: 'Password',
        classname: 'admin_computer',
        append: this.elements.register_box
      });
      this.elements.register_password2 = elation.ui.input('register_password2', null, {
        inputname: 'user_password2',
        type: 'password',
        label: 'Cornfirm Password',
        classname: 'admin_computer',
        append: this.elements.register_box
      });
      this.elements.register_submit = elation.ui.button('register_submit', null, {
        label: 'Save Credentials',
        title: 'Log in to the system',
        type: 'submit',
        tag: 'button',
        append: this.elements.register_box
      });

      elation.events.add([this.elements.register_submit.container, this.elements.login_submit.container], 'click', this);
    }
    this.click = function(event) {
      console.log('buh',event);
      elation.window.manager.get('application_login').close();
    }
  }, elation.ui.base);

  elation.component.add("hack.zuulpics", function() {
    this.defaultcontainer = { tag: 'div', classname: 'zuul_viewer' };
    this.init = function() {
      console.log('ZUULPICS!',this);
      this.tabs = elation.ui.tabbedcontent({
        append: this.container,
        classname: 'pic_tabs',
        contenttype: 'contentlist',
        animation: 'fade',
        items: [
          { label: 'zuul1.jpg', name: 'zuul1', content: '<img src="/images/hack/zuul/zuul1.jpg" />' },
          { label: 'zuul2.jpg', name: 'zuul2', content: '<img src="/images/hack/zuul/zuul2.jpg" />' },
          { label: 'zuul3.jpg', name: 'zuul3', content: '<img src="/images/hack/zuul/zuul3.jpg" />' },
          { label: 'zuul4.jpg', name: 'zuul4', content: '<img src="/images/hack/zuul/zuul4.jpg" />' },
          { label: 'zuul5.jpg', name: 'zuul5', content: '<img src="/images/hack/zuul/zuul5.jpg" />' }
        ]
      });
    }
  }, elation.ui.base);

  elation.component.add("hack.explorer", function() {
    this.defaultcontainer = { tag: 'div', classname: 'fs_container' };
    this.init = function() {
      console.log('explorer!',this);
      this.tree = {};

      var create = elation.html.create,
          labels = {
            back: '⇦',
            forward: '⇨',
            up: '↰',
            home: '⌂'
          };

      this.elements = {
        buttonbar: create('div', 'fs_buttonbar', null, null, this),
        tree: create('div', 'fs_tree', null, null, this),
        content: create('div', 'fs_content', null, null, this)
        //status: create('div', 'fs_status', null, null, this)
      };

      var buttons = {
        back: {
          label: labels.back,
          classname: "fs_buttonbar_back",
          events: { click: elation.bind(this, this["back"]) }
        },
        forward: {
          label: labels.forward,
          classname: "fs_buttonbar_forward",
          events: { click: elation.bind(this, this["forward"]) }
        },
        up: {
          label: labels.up,
          classname: "fs_buttonbar_up",
          events: { click: elation.bind(this, this["up"]) }
        }
      };

      this.buttonbar = elation.ui.buttonbar({
        container: elation.html.create({ classname: 'apicollection_controls' }),
        buttons: buttons,
        append: this.elements.buttonbar
      });

      this.elements.path = elation.html.create({ 
        tag: 'div',
        classname: 'ui_breadcrumbs',
        append: this.elements.buttonbar 
      });

      this.breadcrumbs = elation.ui.selectcrumbs({
        append: this.elements.path,
        root_icon: labels.home
      })

      this.breadcrumbs.setPath([]);
/*
      this.buttonbar2 = elation.ui.buttonbar(null, elation.html.create({classname: 'apicollection_controls2'}), {
        buttons:{
          reload: {
            label: "&#9166;",
            classname: "fs_buttonbar_reload",
            events: { click: elation.bind(this, this["reload"]) }
          }
        },
        append: this.elements.buttonbar
      });
*/
      elation.template.add('apicollection.treeview',
        '{@select key=type}' +
        '{@eq value="folder"}{?children}<div class="checkbox"></div>{/children}<span class="label">{key}</span>{/eq}' +
        '{@default}{key}={value}{/default}' + 
        '{/select}');

      elation.template.add('apicollection.jsoncontentheader',
        '<li class="header">{label}</li>');

      elation.template.add('apicollection.jsoncontentname',
        '<li class="entry">{key}</li>');

      elation.template.add('apicollection.jsoncontentvalue',
        '<li class="entry">{value}</li>');

      this.addSource({
        host: 'http://api.thefind.com',
        endpoint: '/search.js',
        apiargs: {
          page: 1,
          query: 'shoes'
        }
      })
    }

    this.addSource = function(parms) {
      this.apicollection = elation.collection.jsonapi({
        host: parms.host,
        endpoint: parms.endpoint,
        apiargs: parms.apiargs,
        //requiredargs: ['query'],
        datatransform: { },
        events: {
          'collection_load': elation.bind(this, this.finished)
        }
      });

      this.parms = parms;

      //this.apicollection.clear();
      this.apicollection.load();
    }

    this.click = function(event) {
      var target = event.target,
          button = elation.component.fetch(target),
          path = button.args.path;

      console.log('click', event, target, button, path);
      this.setPath(path);
    }

    this.getName = function(parms) {
      var host = parms.host.replace('http://',''),
          endpoint = parms.endpoint,
          name = host + endpoint;

      return name;
    }

    this.finished = function(data) {
      console.log('finished loading', data.target.rawdata);
      var items = {},
          name = this.getName(this.parms);
      
      items[name] = data.target.rawdata.data;

      this.tree[name] = elation.ui.treeview2('apicollection_tree_'+name, this.elements.tree, {
        properties: false,
        folders: true,
        attrs: {
          itemtemplate: 'apicollection.treeview'
        },
        items: items
      });

      elation.events.add(null, 'ui_treeviewitem_select', this);
    }

    this.ui_treeviewitem_select = function(event) {
      console.log('selected', event);
      var items = event.element.value,
          content = '<ul><li class="column"><ul>';
      
      content += elation.template.get('apicollection.jsoncontentheader', { label: 'Name'  });
      
      for (var key in items) 
        if (typeof items[key] != 'object') 
          content += elation.template.get('apicollection.jsoncontentname', { key: key });

      content += '</ul></li><li class="column two"><ul>';
      content += elation.template.get('apicollection.jsoncontentheader', { label: 'Value' });

      for (var key in items) 
        if (typeof items[key] != 'object') 
          content += elation.template.get('apicollection.jsoncontentvalue',{ value: items[key] });

      content += '</ul></li></ul>';
      this.elements.content.innerHTML = content;

      var id = event.element.container.id,
          id = id.split(';');

      //this.setPath(id);
      this.breadcrumbs.setPath(id);
      elation.events.add(this.breadcrumbs.labels, 'click', this);
    }

    this.setPath = function(path) {
      if (typeof path == 'string')
        path = path.split(';');

      console.log('setPath',path,this);
      //this.breadcrumbs.setPath(path);
      this.tree[this.getName(this.parms)].setPath(path);
    }
  }, elation.ui.base);
});