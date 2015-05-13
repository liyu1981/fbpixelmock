var backend = require('./backend');

var wsclients = {};

exports.send = function(pixelId, type, data) {
  console.log('well send', pixelId, type);
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
      console.log('we got:', message, data);
      if (data['pixelId']) {
        wsclients[data['pixelId']] = ws;
        exports.send(data['pixelId'], 'ok');
      }
    });
  });
}
