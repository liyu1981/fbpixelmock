var backend = require('./backend');
var rask = require('rask');

var wsclients = {};
var wspixelids = {};

var log = rask.log.get(module);

exports.send = function(pixelId, type, data) {
  log.info('well send', pixelId, type);
  if (pixelId in wsclients) {
    wsclients[pixelId].send(JSON.stringify({
      type: type,
      event: data
    }));
  }
};

backend.cache.setHooks.after.push(function(key, val) {
  var pixelId = val['pixelId'];
  exports.send(pixelId, 'event', val);
});

exports.register = function(wsServer) {
  wsServer.on('connection', function(ws) {
    ws.on('message', function(message) {
      var data = JSON.parse(message);
      log.info('we got:', message, data);
      if (data['pixelId']) {
        wsclients[data['pixelId']] = ws;
        wspixelids[ws] = data['pixelId'];
        exports.send(data['pixelId'], 'ok');
      }
    });
    ws.on('close', function() {
      var id = wspixelids[ws];
      log.info('close connection:', id);
      delete wsclients[id];
      delete wspixelids[ws];
    });
  });
}
