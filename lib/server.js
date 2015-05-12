var rask = require('rask');

var log = rask.log.get(module);

exports.register = function(server) {
  server.get('/tr', function(req, res, next) {
    var data = {
      headers: req.headers,
      params: req.params
    };
    log.debug('get: ', JSON.stringify(data));
    res.send(200, 'ok');
  });

  server.post('/tr', function(req, res, next) {
    var data = {
      headers: req.headers,
      body: req.body
    };
    log.debug('post: ', JSON.stringify(data));
    res.send(200, 'ok');
  });
}
