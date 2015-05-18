var backend = require('./backend');
var rask = require('rask');

var wsclients = {};
var wspixelids = {};

var log = rask.log.get(module);

function newClient(pixelId, ws) {
  log.info('new client for:', pixelId);
  if (!(pixelId in wsclients)) {
    wsclients[pixelId] = [];
  }
  wsclients[pixelId].push(ws);
  wspixelids[ws] = pixelId;
}

function rmClient(pixelId, ws) {
  var index = wsclients[pixelId].indexOf(ws);
  log.info('remove client for:', pixelId, index);
  if (index >= 0) {
    wsclients[pixelId].splice(index, 1);
  }
  delete wspixelids[ws];
}

exports.send = function(pixelId, type, data) {
  log.info('well send', pixelId, type);
  if (pixelId in wsclients) {
    wsclients[pixelId].forEach(function(ws) {
      ws.send(JSON.stringify({
        type: type,
        event: data
      }));
    });
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
      log.info('received msg:', message, data);
      if (data['pixelId']) {
        newClient(data['pixelId'], ws);
        exports.send(data['pixelId'], 'ok');
        backend.cache.sync(ws, data['pixelId']);
      }
    });
    ws.on('close', function() {
      var id = wspixelids[ws];
      log.info('close connection:', id);
      rmClient(id, ws);
    });
  });
}
