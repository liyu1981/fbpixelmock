var rask = require('rask');

rask
  .server({
    serveStatic: true,
    enableWebSocket: true,
    enableGzip: true
  })
  .route(function(server) {
    require('./lib/server').register(server);
  })
  .wsRoute(function(wsServer) {
    require('./lib/wsserver').register(wsServer);
  })
  .start({
    bind_port: process.env.PORT || 5000
  });
