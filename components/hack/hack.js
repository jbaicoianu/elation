if (typeof require != 'undefined') {
  var elation = require("utils/elation"),
      ws = require("ws"),
      net = require('net');

  require('utils/events');
}

elation.extend("hack.terminal_server", function() {
  this.init = function() {
    this.websockserver = new ws.Server({host: "meobets.com", port: 8086});
    this.websockserver.on('connection', elation.bind(this, this.connected));
  }
  this.connected = function(websock) {
    console.log('client connected: ', websock.upgradeReq.client.remoteAddress);
    //var client = new elation.irc.relay.client(this, websock);
    //elation.events.add(client, "clientauth", elation.bind(this, this.clientauth));
    //this.pending.push(client);
  }
  this.init();
});