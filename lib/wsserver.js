exports.register = function(wsServer) {
    wsServer.on('connection', function(ws) {
      ws.on('message', function(message) {
          ws.send("you said: " + message);
      });
    });
}
