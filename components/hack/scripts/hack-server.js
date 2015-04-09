if (typeof require != 'undefined') {
  var elation = require("utils/elation"),
      ws = require("ws"),
      net = require('net'),
      fs = require('fs'),
      peer = require('peer');

  require('utils/events');
}

elation.extend('hack.PeerServer', new function() {
  this.init = function() {
    this.connections = {};
    this.sockets = {};
    this.peerInit();
    this.wsInit();
    console.log('[PeerServer] Listening for websockets and webrtc');
  }

  this.peerInit = function() {
    this.peer = peer.PeerServer({
      port: 8088, 
      path: '/peer'
    });
    this.peer.on('connection', elation.bind(this, this.peerConnect));
    this.peer.on('disconnect', elation.bind(this, this.peerDisconnect));
  }

  this.peerConnect = function(id) {
    console.log('[PeerServer] RTC Connected:', id);
    this.connections[id] = true;
    this.send();
  }

  this.peerDisconnect = function(id) {
    console.log('[PeerServer] RTC Disconnected:', id);
    delete this.connections[id];
    this.send();
  }

  this.wsInit = function() {
    var WebSocketServer = ws.Server;
    var wss = this.wss = new WebSocketServer({ 
      host: "meobets.com", 
      port: 8087, 
      path: '/peer' 
    });

    wss.on('connection', elation.bind(this, this.wsConnect));
    
    (function(self) {
      wss.broadcast = function broadcast(data) {
        console.log('[PeerServer] WS Broadcast:',data);
        wss.clients.forEach(function each(client) {
          client.send(data, elation.bind(self, self.wsError));
        });
      };
    })(this);
  }

  this.wsConnect = function(ws) {
    var address = ws.upgradeReq.client.remoteAddress;
    console.log('[PeerServer] WS Connected: ', address);

    this.sockets[address] = ws;

    ws.on('message', elation.bind(this, this.wsReceive));
    ws.on('close', elation.bind(this, this.wsDisconnect));

    this.send();
  }


  this.wsDisconnect = function(code, message) {
    //var address = ws.upgradeReq.client.remoteAddress;
    console.log('[PeerServer] WS Disconnected: ', code, message);
    //delete this.sockets[address];
  }

  this.wsReceive = function(data, flags) {
    console.log('[PeerServer] WS Received: ', data, flags);
    if (data == 'users') {
      this.send();
    }
  }

  this.send = function() {
    var json = JSON.stringify(this.connections);

    this.wss.broadcast(json);

    delete self;
  }

  this.wsError = function(error) {
    if (error) {
      console.log('[PeerServer] WS Error:', error);
    }
  }

  this.init();
});

elation.extend('hack.TerminalServer', new function() {
  this.init = function() {
    websockserver = this.websockserver = new ws.Server({ host: "meobets.com", port: 8086, path: '/terminal' });
    websockserver.on('connection', elation.bind(this, this.connected));
    console.log('[TerminalServer] Listening for websockets');
  }

  this.connected = function(websock) {
    console.log('[TerminalServer] Connected: ', websock.upgradeReq.client.remoteAddress);
    this.websock = websock;
    websock.send('established.<br>');
    
    this.eof();

    websock.on('message', elation.bind(this, this.message));
  }

  this.message = function(data, flags) {
    console.log('[TerminalServer] Message: ', data);
    var split = data.split(' '),
        command = split[0],
        websock = this.websock;

    switch (command) {
      case "shit": 
        websock.send('right now the only command is "help" and it\'s not very helpful'); 
        this.eof();
        break;
      case "help": 
        websock.send('you get no help'); 
        this.eof();
        break;
      case "": 
        websock.send(''); 
        this.eof();
        break;
      case "generate": 
        websock.send('<br>');
        websock.send('_.o[ Internet Proceedural Generation Script ]o._<br><br>');
        this.initdb();
        this.generate(split[1], split[2]);
        break;
      default: 
        websock.send("'" + command + "' is not a valid command"); 
        this.eof();
        break;
    }
  }

  this.eof = function() {
    this.websock.send('<EOL>'); 
  }

  this.initdb = function() {
    console.log('[TerminalServer] Connecting to Database...');
    this.file = 'hack.db';
    this.exists = fs.existsSync(this.file);
    this.sqlite3 = require("sqlite3").verbose();
    this.db = new this.sqlite3.Database(this.file);
  }

  this.generate = function(routers, clients) {
    var db = this.db,
        websock = this.websock;

    db.serialize(function() {
      console.log('[TerminalServer] Generating World...');
      db.run("DROP TABLE IF EXISTS network");
      db.run("CREATE TABLE network (router TEXT)");
      
      var stmt = db.prepare("INSERT INTO network VALUES (?)");
      
      for (var i = 1, rnd; i <= 256; i++) {
        websock.send(".");
        rnd = Math.floor(Math.random() * 10000000);
        stmt.run("#" + rnd);
      }

      websock.send("<br><br>Database Created.<br><br>");
      
      stmt.finalize();

      db.each("SELECT rowid AS id, router FROM network", function(err, row) {
        websock.send(row.id + ":" + row.router + " ");
      }, function() {
        console.log('[TerminalServer] Operation Completed.');
        websock.send("<br><br>Operation Completed.");
        websock.send('<EOL>');
        db.close();
      });
    });
  }

  this.init();
});