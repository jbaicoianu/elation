if (typeof require != 'undefined') {
  var elation = require("utils/elation"),
      ws = require("ws"),
      net = require('net'),
      fs = require('fs');

  require('utils/events');
}

elation.extend('hack.server', new function() {
  this.init = function() {
    websockserver = this.websockserver = new ws.Server({ host: "meobets.com", port: 8086 });
    websockserver.on('connection', elation.bind(this, this.connected));

    console.log('Listening');
  }

  this.connected = function(websock) {
    console.log('Client connected: ', websock.upgradeReq.client.remoteAddress);
    this.websock = websock;
    websock.send('established.<br>');
    
    this.eof();

    websock.on('message', elation.bind(this, this.message));
  }

  this.message = function(data, flags) {
    console.log('Message: ', data);
    var split = data.split(' '),
        command = split[0],
        websock = this.websock;

    switch (command) {
      case "shit": 
        websock.send('right now the only command is "help" and it\'s not very helpful'); 
        this.eol();
        break;
      case "help": 
        websock.send('you get no help'); 
        this.eol();
        break;
      case "": 
        websock.send(''); 
        this.eol();
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
    console.log('Connecting to Database...');
    this.file = 'hack.db';
    this.exists = fs.existsSync(this.file);
    this.sqlite3 = require("sqlite3").verbose();
    this.db = new this.sqlite3.Database(this.file);
  }

  this.generate = function(routers, clients) {
    var db = this.db,
        websock = this.websock;

    db.serialize(function() {
      console.log('Generating World...');
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
        console.log('Operation Completed.');
        websock.send("<br><br>Operation Completed.");
        websock.send('<EOL>');
        db.close();
      });
    });
  }

  this.init();
});