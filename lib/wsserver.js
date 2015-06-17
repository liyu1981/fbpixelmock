var backend = require('./backend');
var rask = require('rask');

var _ = rask.underscore;
var log = rask.log.get(module);

var monitorSessions = {
  ws2sessionId: {}
};

var wsclients = {};
var wspixelids = {};

function newClient(sessionId, pixelId, ws) {
  log.info('new client for:', sessionId, pixelId);
  var s = monitorSessions[sessionId];
  if (!s) {
    s = monitorSessions[sessionId] = {
      wsclient: ws,
      monitoring: 'null'
    };
  }
  s.monitoring = pixelId;
  monitorSessions.ws2sessionId[ws] = sessionId;
  backend.getSessionCache(sessionId, function(cache) {
    cache.setHooks.after.push(function(key, val) {
      var pixelId = val['pixelId'];
      exports.send(sessionId, pixelId, 'event', val);
    })
  });
}

function pingClient(sessionId) {
  if (monitorSessions[sessionId]) {
    backend.extendSessionCacheTTL(sessionId);
  }
}

function rmClient(ws) {
  if (monitorSessions.ws2sessionId[ws]) {
    sessionId = monitorSessions.ws2sessionId[ws];
    delete monitorSessions[sessionId];
    delete monitorSessions.ws2sessionId[ws];
  }
}

exports.send = function(sessionId, pixelId, type, data) {
  log.info('well send', sessionId, pixelId, type);
  if (monitorSessions[sessionId]) {
    var ws = monitorSessions[sessionId].wsclient;
    var monitoring = monitorSessions[sessionId].monitoring;
    if (monitoring === pixelId) {
      ws.send(JSON.stringify({
        type: type,
        event: data
      }));
    }
  }
};

exports.register = function(wsServer) {
  wsServer.on('connection', function(ws) {

    ws.on('message', function(message) {
      var data = JSON.parse(message);
      //log.info('received msg:', message, data);
      var sessionId = data['sessionId'];
      if (!sessionId) { return; }
      switch(data['type']) {
        case 'hello':
          if (monitorSessions[sessionId]) {
            ws.send(JSON.stringify({
              type: 'error',
              errmsg: 'Session is in use!'
            }));
            return;
          }
          if (data['pixelId']) {
            newClient(sessionId, data['pixelId'], ws);
            exports.send(sessionId, data['pixelId'], 'ok');
            backend.getSessionCache(sessionId, function(cache) {
              cache.sync(ws, data['pixelId']);
            });
          }
          break;
        case 'ping':
          pingClient(sessionId);
          ws.send(JSON.stringify({ type: 'pong' }));
          break;
      }
    });

    ws.on('close', function() {
      var id = wspixelids[ws];
      log.info('close connection:', id);
      rmClient(id, ws);
    });
  });
}
