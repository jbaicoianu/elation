elation.require([
    "ui.base",
    "ui.tabbedcontent",
    "ui.treeview",
    "ui.select",
    "ui.breadcrumbs",
    "elation.collection"
  ], function() {
  elation.component.add("hack.wsUsers", function() {
    this.defaultcontainer = {tag: 'ul', classname: 'ws_users'};
    this.init = function() {
      this.ws = elation.network.WebSocket({
        host: 'meobets.com',
        port: 8087,
        path: 'peer',
        events: {
          'ws_connect': elation.bind(this, this.connect),
          'ws_disconnect': elation.bind(this, this.disconnect),
          'ws_receive': elation.bind(this, this.receive)
        }
      });

      elation.events.add(this, 'wsUsers_list', elation.bind(this, this.list));
    }
    this.connect = function(event) {
      console.log('wsUsers_connect', event);
      //this.send('users');
    }   
    this.disconnect = function(event) {
      console.log('wsUsers_disconnect', event);
    }
    this.receive = function(event) {
      console.log('wsUsers_receive', event);
      var data = JSON.parse(event.data.data);
      elation.events.fire({type:'wsUsers_list',data:data});
    }
    this.list = function(event) {
      console.log('wsUsers: redrawing list',event);
      var data = event.data;
      var conns = this.args.parent.connections;
      var selected = {};
      var labels = elation.find('div.state_toggled label', this.container);
      
      for (var i=0; label = labels[i]; i++) {
        var address = label.textContent;
        selected[address] = true;
      }

      this.container.innerHTML = '';
      
      for (var key in data) {
        if (key == this.args.id)
          continue;

        var sid = selected[key],
            li = elation.html.create({
              tag: 'li',
              classname: (conns[key] ? 'connected' : '') + (sid == key ? ' selected' : ''),
              append: this.container
            });

        elation.ui.toggle({
          append: li,
          label: key,
          selected: sid
        });

        elation.events.add(li, 'click', this);
      }
    }
    this.click = function(event) {
      if (event.target.tagName != 'LI')
        return;

      var lis = elation.find('li.selected', this.container);

      elation.html.addClass(event.target, 'selected');
      elation.html.removeClass(lis, 'selected');
    }
    this.send = function(txt) {
      console.log('WS Sending',txt);
      this.ws.send(txt);
    }
  }, elation.ui.base);
  elation.component.add("hack.WebRTC_WhiteBoard", function() {
    this.defaultcontainer = { tag: 'canvas' };
    this.init = function() {
      this.ctx = this.container.getContext('2d');
      (function(self) {
        setTimeout(function() {
          self.setEvents();
        }, 1);
      })(this);
    }

    this.setEvents = function() {
      //console.log('setEvents', this);
      var parent = this.args.parent;

      elation.events.add(parent._window.resizable, 'window_resize', elation.bind(this, this.resize));
      elation.events.add(this.container, 'mousedown,mousemove,mouseup', this);
      elation.events.add(this.container, 'touchstart', elation.bind(this, this.mousedown));
      elation.events.add(this.container, 'touchmove', elation.bind(this, this.mousemove));
      elation.events.add(this.container, 'touchend', elation.bind(this, this.mouseup));
      this.resize();
    }

    this.resize = function(event) {
      //console.log('resize', event);
      this.container.setAttribute('width', this.container.parentNode.offsetWidth);
      this.container.setAttribute('height', this.container.parentNode.offsetHeight);
    }

    this.mousedown = function(event) {
      //console.log(event.type,event);
      this.dimensions = elation.html.dimensions(this.container);
      this.coords = elation.events.coords(event);
      
      var x = this.coords.x - this.dimensions.x,
          y = this.coords.y - this.dimensions.y,
          width = "4",
          color = "rgba(0, 0, 0, 1)";

      this.drawing = true;
      this.ctx.beginPath();
      this.ctx.lineWidth = width;
      this.ctx.strokeStyle = color;
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(x, y);
      this.send([
        { beginPath: null },
        { lineWidth: width },
        { strokeStyle: color },
        { moveTo: [ x, y ] },
        { lineTo: [ x, y ] },
        { stroke: null }
      ]);
    }

    this.mousemove = function(event) {
      if (!this.drawing)
        return;

      var coords = elation.events.coords(event);
      
      var x = coords.x - this.dimensions.x,
          y = coords.y - this.dimensions.y;

      this.ctx.lineTo(x, y);
      this.ctx.stroke();

      this.send([
        { lineTo: [ x, y ] },
        { stroke: null }
      ]);

      //console.log(event.type,event);
      event.preventDefault();
    }

    this.mouseup = function(event) {
      //console.log(event.type,event);
      this.drawing = false;
      this.ctx.stroke();

      this.send([{ stroke: null }]);
    }

    this.send = function(json) {
      var json = JSON.stringify(json);
      console.log('WB Sending', json, this);

      this.args.parent.send('DRAW|' + json, true);
    }
  }, elation.ui.base);

  elation.component.add("hack.WebRTC_Video", function() {
    this.defaultcontainer = { tag: 'div', classname: 'webrtc_video_container' };

    this.init = function() {
      this.container.autoplay = true;

      this.them = elation.html.create({
        tag: 'video',
        classname: 'webrtc_video_them',
        append: this.container,
        attributes: {
          width: "300",
          height: "250",
          autoplay: true
        }
      });
      this.me = elation.html.create({
        tag: 'video',
        classname: 'webrtc_video_me',
        append: this.container,
        attributes: {
          width: "100",
          height: "75",
          autoplay: true
        }
      });
      this.enable_button = elation.ui.button({ 
        append: this.container, 
        label: "Enable Camera", 
        classname: "webrtc_video_enable" 
      });
      this.connect_button = elation.ui.button({ 
        append: this.container, 
        label: "Call", 
        classname: "webrtc_video_connect" 
      });
      elation.events.add(this.enable_button.container, 'click', elation.bind(this, this.enable));
      elation.events.add(this.connect_button.container, 'click', this);
    }

    this.enable = function() {
      var venderUrl = window.URL || window.webkitURL,
          me = this.me,
          them = this.them;

      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      navigator.getUserMedia({
        video: true,
        audio: false
      }, function(stream) {
        me.src = venderUrl.createObjectURL(stream);
        window.localStream = stream;
      }, function(error) {
        console.log('WebRTC Video Error:', error.code);
      });

      this.enable_button.container.style.display = 'none';
      this.connect_button.container.style.display = 'block';
      
      var peer = this.args.parent.webrtc.peer;

      peer.on('call', function(call) {
        if (window.existingCall) {
          window.existingCall.close();
        }
        
        window.existingCall = call;

        call.on('stream', function(stream) {
          console.log('creating');
          them.src = venderUrl.createObjectURL(stream)
        });
        console.log('answering');
        call.answer(window.localStream);
      });
    }

    this.click = function(event) {
      var peer = this.args.parent.webrtc.peer,
          label = elation.find('div.state_toggled label', this.args.parent.container, true),
          address = label.textContent,
          call = peer.call(address, window.localStream);

    }
  }, elation.ui.base);

  elation.component.add("hack.WebRTC_Client", function() {
    this.defaultcontainer = { tag: 'div', classname: 'application_peer' };

    this.init = function() {
      this.id = prompt('enter your name');
      this.connections = {};

      this.webrtc = elation.network.WebRTC({
        id: this.id,
        host: 'meobets.com',
        port: 8088, 
        path: '/peer',
        events: {
          'rtc_connect': elation.bind(this, this.rtc_connect),
          'rtc_disconnect': elation.bind(this, this.rtc_disconnect),
          'rtc_receive': elation.bind(this, this.rtc_receive),
          'rtc_svrconnect': elation.bind(this, this.rtc_svrconnect)
        }
      });
      
      this.left = elation.html.create({
        tag: 'div',
        classname: 'webrtc_left',
        append: this.container
      });

      this.users = elation.hack.wsUsers({
        parent: this,
        id: this.id, 
        append:this.left 
      });

      this.top = elation.html.create({
        tag: 'div',
        classname: 'webrtc_top',
        append: this.container
      });

      this.tabs = {};

      this.tabs.chat = elation.html.create({ tag: 'div', classname: 'ui_tabs_item_container' });
      this.tabs.draw = elation.html.create({ tag: 'div', classname: 'ui_tabs_item_container' });
      this.tabs.video = elation.html.create({ tag: 'div', classname: 'ui_tabs_item_container' });

      this.tabs.control = elation.ui.tabbedcontent({
        append: this.top,
        classname: 'webrtc_tabs',
        contenttype: 'contentlist',
        animation: 'fade',
        items: [
          { label: 'Chat', name: 'chat', content: this.tabs.chat },
          { label: 'Draw', name: 'draw', content: this.tabs.draw },
          //{ label: 'Talk', name: 'talk', content: this.tabs.talk },
          { label: 'Video', name: 'video', content: this.tabs.video }
        ]
      });

      this.whiteboard = elation.hack.WebRTC_WhiteBoard({
        append: this.tabs.draw,
        parent: this
      });

      this.video = elation.hack.WebRTC_Video({
        append: this.tabs.video,
        parent: this
      });

      this.viewport = elation.html.create({
        tag: 'ul',
        classname: 'webrtc_chat_viewport',
        append: this.tabs.chat
      });

      this.bottom = elation.html.create({
        tag: 'div',
        classname: 'webrtc_bottom',
        append: this.tabs.chat
      });

      this.connect_button = elation.ui.button({ 
        append: this.left, 
        label: "Connect", 
        classname: "webrtc_connect" 
      });
      
      this.text_input = elation.ui.input({ 
        append: this.bottom,
        events: { 
          'ui_input_accept': elation.bind(this, this.submit) 
        }
      });

      this.send_button = elation.ui.button({ append: this.bottom, label: "Send", classname: "webrtc_send" });

      elation.events.add([
        this.viewport,
        this.connect_button.container,
        this.send_button.container
      ], 'click', this);
    }

    this.rtc_connect = function(event) {
      console.log('rtc_connect', event);
      this.log('*** Connection established to '+event.data.peer+'.');
      this.text_input.focus();

      this.connect(event.data);
    }

    this.rtc_disconnect = function(event) {
      console.log('rtc_disconnect', event);
      this.log('*** Peer has disconnected.')
    }

    this.rtc_receive = function(event) {
      var phrase = event.split('|'),
          word = phrase[0],
          ctx = this.whiteboard.ctx;
      
      if (word == "DRAW") {
        var json = JSON.parse(phrase[1]);

        for (var i=0; i<json.length; i++) {
          var item = json[i]
          
          for (var cmd in item) {
            var value = item[cmd],
                val1 = Array.isArray(value) ? value[0] : value,
                val2 = Array.isArray(value) ? value[1] : null;

            if (typeof ctx[cmd] == 'function') {
              (value == null) 
                ? ctx[cmd]() 
                : ctx[cmd](val1, val2);
            } else {
              ctx[cmd] = val1;
            }
          }
        }
      } else {
        this.log(event, this.conn.peer);
      }
    }

    this.rtc_error = function(event) {
      console.log('rtc_error', event);
    }

    this.rtc_svrconnect = function(event) {
      console.log('rtc_svrconnect', event);
      var id = event.data;

      // register hide callback with the containing window to close up connections
      this._window.args.hide_callback = elation.bind(this, this.destroy);
      this._window.titlebar.setTitle('Connected as '+id);
    }

    this.log = function(txt, name) {
      var li = elation.html.create({
            tag: 'li',
            append: this.viewport,
            before: this.viewport.firstChild || false
          });

      if (name) {
        var label = elation.html.create({
              tag: 'label',
              append: li
            }),
            span = elation.html.create({
              tag: 'span',
              append: li
            });

            label.textContent = name;
            span.textContent = txt;
      } else {
        li.textContent = txt;
      }
    }

    this.click = function(event) {
      if (event.target == this.connect_button.container) {
        this.establish();
      } else if (event.target == this.send_button.container) {
        this.send();
      } else {
        this.text_input.focus();
      }
    }

    this.establish = function() {
      var labels = elation.find('div.state_toggled label', this.container);
  
      for (var i=0; label = labels[i]; i++) {
        var address = label.textContent;
        
        if (!address || this.connections[address]) 
          continue;
        
        var conn = this.webrtc.peer.connect(address);
        this.connect(conn);
        this.log('*** Connection to '+address+'.');
      }

      this.text_input.focus();
    }

    this.send = function(txt, nolog) {
      var labels = elation.find('div.state_toggled label', this.container);
      var txt = txt || this.text_input.value || alert('type something...');

      for (var i=0; label = labels[i]; i++) {
        var address = label.textContent;
        
        if (!txt || !this.connections[address]) 
          return;
        
        console.log(this.webrtc.peer.id, ': ', txt, this.conn, this);
        this.connections[address].send(txt);
        
        if (!nolog)
          this.log(txt, address+'>');
      }

      this.text_input.value = '';
      this.text_input.focus();
    }

    this.submit = function(event) {
      this.send();
    }

    this.connect = function(conn) {
      console.log('connect', conn);
      this.connections[conn.peer] = conn;
      this.conn = conn;

      this.users.send('users');

      conn.on('data', elation.bind(this, this.rtc_receive));
      conn.on('error', elation.bind(this, this.rtc_error));
    }

    this.destroy = function() {
      console.log('destroying...',this);
      this.log('*** You have been disconnected from the server.')
      
      // close all peer2peer connections
      for (var key in this.connections)
        this.connections[key].close();

      // disengage from broker server
      if (this.webrtc.peer)
        this.webrtc.peer.disconnect();

      // close websocket to broker server
      this.users.ws.websocket.close();
    }
  });

  elation.component.add("network.WebSocket", function() {
    this.init = function() {
      this.websocket = new WebSocket('ws://' +
        this.args.host + ':' +
        this.args.port + '/' +
        this.args.path
      );

      this.websocket.onopen = elation.bind(this, this.connect);
      this.websocket.onclose = elation.bind(this, this.disconnect);
      this.websocket.onmessage = elation.bind(this, this.receive);
      this.websocket.onerror = elation.bind(this, this.receive);
    }
    this.connect = function(event) {
      console.log('WebSocket connect',event);
      elation.events.fire({ 
        type:'ws_connect', 
        data: event, 
        element: this 
      });
    }
    this.disconnect = function(event) {
      console.log('WebSocket disconnect',event);
      elation.events.fire({ 
        type:'ws_disconnect', 
        data: event, 
        element: this 
      });
    }
    this.receive = function(event) {
      console.log('WebSocket receive',event);
      elation.events.fire({ 
        type:'ws_receive', 
        data: event, 
        element: this 
      }); 
    }
    this.error = function(event) {
      console.log('WebSocket error', event);
      this.send({ 
        data: event
      });
    }
    this.send = function(txt) {
      this.websocket.send(txt);
    }
  }, elation.ui.base);

  elation.component.add("network.WebRTC", function() {
    this.init = function() {
      this.connections = {};
      var id = this.args.id || 'RTC'+(Math.round(Math.random() * 10e5));

      var peer = this.peer = new Peer(id, {
        host: this.args.host, 
        port: this.args.port, 
        path: this.args.path,
        debug: this.args.debug || true,
        config: this.args.config || { 
          'iceServers': [
            { url: 'stun:stun.l.google.com:19302' },
            { url: 'turn:192.158.29.39:3478?transport=udp', credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=', username:'28224511:1379330808' },
            { url: 'turn:192.158.29.39:3478?transport=tcp', credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=', username:'28224511:1379330808' }
          ]
        }
      });

      peer.on('open', elation.bind(this, this.server_open));
      peer.on('connection', elation.bind(this, this.peer_connection));
    }

    this.peer_connection = function(conn) {
      this.connections[conn.peer] = conn;
      
      (function(self) {
        conn.on('open', function() {
          console.log('peer_connection',conn);
          elation.events.fire({ type:'rtc_connect', data: conn, element: self });
        });
      })(this);
    }

    this.peer_error = function(err) {
      console.log('peer_error', err);
      elation.events.fire({ type:'rtc_error', data: err, element: this });
    }

    this.peer_data = function(data) {
      console.log('peer_data', data);
      elation.events.fire({ type:'rtc_receive', data: { value: data, conn: this.conn }, element: this });
    }

    this.server_open = function(id) {
      console.log('server_svrconnect', id, this);
      elation.events.fire({ type:'rtc_svrconnect', data: id, element: this });
    }
  });

  elation.component.add("hack.terminal", function() {
    this.defaultcontainer = {tag: 'div', classname: 'application_terminal'};
    this.init = function() {
      this.message({data:'Connecting... '})
      elation.events.add(this.container, 'click', this);
      this.connection = new WebSocket('ws://meobets.com:8086/terminal');
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
      this.sources = [];

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

      this.sourceControls = elation.hack.explorer_source_controls({ append: this.elements.tree, parent: this })
      
      elation.template.add('apicollection.treeview',
        '{@select key=type}' +
        '{@eq value="folder"}{?children}<div class="checkbox"></div>{/children}<span class="label">{key}</span>{/eq}' +
        '{@default}{key}={value}{/default}' + 
        '{/select}');

      elation.template.add('apicollection.jsoncontentheader', '<li class="header">{label}</li>');
      elation.template.add('apicollection.jsoncontentname', '<li class="entry">{key}</li>');
      elation.template.add('apicollection.jsoncontentvalue', '<li class="entry">{value}</li>');

      this.addSource({
        api: 'jsonapi',
        host: 'http://api.thefind.com',
        endpoint: '/search.js',
        apiargs: {
          page: 1,
          query: 'shoes'
        }
      });

      this.addSource({
        api: 'jsonpapi',
        host: 'https://archive.org',
        endpoint: '/advancedsearch.php', 
        apiargs: { 
          output: 'json', 
          q:'collection:softwarelibrary_msdos', 
          fl: ['identifier', 'title'],
          sort: ['avg_rating desc']
        }
      });
    }

    this.addSource = function(args) {
      args.parent = this;
      args.api = args.api || 'jsonapi';

      this.sources.push(elation.hack.explorer_source(args));
    }

    this.click = function(event) {
      //console.log('parent click',event);
      this.lastsource.click(event);
    }

    this.setPath = function(id, source) {
      //console.log('parent setPath',id,source);
      this.lastsource = source;
      this.breadcrumbs.setPath(id);
      elation.events.add(this.breadcrumbs.labels, 'click', this);
    }
  }, elation.ui.base);

  elation.component.add("hack.explorer_source_controls", function() {
    this.defaultcontainer = { tag: 'div', classname: 'fs_sources' };
    this.init = function() {
      this.select = elation.ui.select({
        append: this,
        items: '-- new source --'
      });

      this.button = elation.ui.button({
        append: this,
        label: '+'
      });

      this.sources = elation.html.create({ 
        classname: 'tf_tree_container', 
        append: this.args.parent.elements.tree 
      });
    }
  }, elation.ui.base);

  elation.component.add("hack.explorer_source", function() {
    this.init = function() {
      this.parent = this.args.parent;
      this.elements = this.parent.elements;
      this.add(); 
    }

    this.add = function() {
      var parms = this.args;

      this.apicollection = elation.collection[parms.api]({
        host: parms.host,
        endpoint: parms.endpoint,
        apiargs: parms.apiargs,
        //requiredargs: ['query'],
        datatransform: { },
        events: {
          'collection_load': elation.bind(this, this.finished)
        }
      });

      this.apicollection.load();
    }

    this.getName = function(parms) {
      var host = parms.host.replace('http://','').replace('https://',''),
          endpoint = parms.endpoint,
          name = host + endpoint;

      return name;
    }

    this.finished = function(data) {
      console.log('finished loading', data.target.rawdata,this.getName(this.args));
      var items = {},
          name = this.getName(this.args),
          div = elation.html.create({append:this.parent.sourceControls.sources});
      
      items[name] = data.target.rawdata;

      this.tree = elation.ui.treeview2('apicollection_tree_' + name, div, {
        properties: false,
        folders: true,
        attrs: {
          itemtemplate: 'apicollection.treeview'
        },
        items: items
      });

      elation.events.add(this.tree, 'ui_treeview_select', this);
    }

    this.ui_treeview_select = function(event) {
      console.log('selected', event, this);
      var selected = event.data,
          items = selected.value,
          content = '<ul><li class="column"><ul>';
      
      content += elation.template.get('apicollection.jsoncontentheader', { label: 'Name' });
      
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

      var id = selected.container.id,
          id = id.split(';');

      this.parent.setPath(id, this);
    }

    this.click = function(event) {
      var target = event.target,
          button = elation.component.fetch(target),
          path = button.args.path;

      //console.log('click', event, target, button, path);
      this.setPath(path);
    }

    this.setPath = function(path) {
      if (typeof path == 'string')
        path = path.split(';');

      //console.log('setPath',path,this);
      //this.breadcrumbs.setPath(path);
      this.tree.setPath(path);
    }
  }, elation.ui.base);
});
/* 
    datatransform: { 
      items: function(d) { return d.response.docs; }, 
      count: function(d) { return d.response.numFound; } 
    }
*/
  elation.component.add("animal", function() {
    this.init = function() {
      console.log('animal init', this);
    }
    this.breath = function() {
      console.log('breathing');
    }
  });
  elation.component.add("animal.fish", function() {
    this.init = function() {
      console.log('animal.fish init', this);
      //this.super();
    }
    this.swim = function() {
      console.log('swimming');
    }
  }, elation.animal);
  elation.component.add("animal.fish.trout", function() {
    this.init = function() {
      console.log('animal.fish.trout init', this);
      this.super();
    }
    this.tasty = function() {
      console.log('yum');
    }
  }, elation.animal.fish);