var rask = require('rask');
var backend = require('./backend');

var log = rask.log.get(module);

exports.register = function(server) {
  function getpost(method, req, res, next) {
    var data = null;
    var time = (new Date()).getTime();
    switch(method) {
      case 'get':
        data = {
          time: time,
          pixelId: 123,
          method: 'get',
          headers: req.headers,
          params: req.params
        };
      break;
      case 'post':
        data = {
          time: time,
          pixelId: 123,
          method: 'post',
          headers: req.headers,
          body: req.body
        };
      break;
    }
    backend.cache.set(time, data);
    log.debug(time, ':', JSON.stringify(data, null, 2));
    res.send(200, 'ok');
  }

  server.get('/tr', function(req, res, next) {
    getpost('get', req, res, next);
  });

  server.post('/tr', function(req, res, next) {
    getpost('post', req, res, next);
  });
}
