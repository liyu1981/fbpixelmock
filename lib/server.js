var rask = require('rask');
var backend = require('./backend');
var fs = require('fs');
var path = require('path');
var url = require('url');

var _ = rask.underscore;
var log = rask.log.get(module);

function getpost(method, req, res, next) {
  var data = null;
  var sessionId = null;
  var time = (new Date()).getTime();
  sessionId = req.params['sid'] || null;
  switch(method) {
    case 'get':
      data = {
        time: time,
        pixelId: req.params['id'] || 'null',
        method: 'get',
        headers: req.headers,
        params: req.params
      };
    break;
    case 'post':
      data = {
        time: time,
        pixelId: req.body['id'] || 'null',
        method: 'post',
        headers: req.headers,
        body: req.body
      };
    break;
  }
  console.log('we get:', req.params, data);
  if (sessionId !== null) {
    backend.getSessionCache(sessionId, function(cache) {
      cache.set(time, data);
      log.debug(time, ':', JSON.stringify(data, null, 2));
    });
  }
  res.send(200, 'ok');
}

exports.register = function(server) {
  server.get('/tr(.*)', function(req, res, next) {
    var urlobj = url.parse(req.url);
    req.params.sid = parseInt(urlobj.pathname.replace('/tr', ''));
    getpost('get', req, res, next);
  });

  server.post('/tr(.*)', function(req, res, next) {
    var urlobj = url.parse(req.url);
    req.params.sid = parseInt(urlobj.pathname.replace('/tr', ''));
    getpost('post', req, res, next);
  });

  server.get('/fbds.js', function(req, res, next) {
    fs.readFile(path.resolve(__dirname, '..', 'www', 'fbds.js'),
      function(err, fbdstmp) {
        var sid = req.params.sid;
        if (sid) {
          var fbds = _.template(fbdstmp.toString('utf8'), {
            sessionId: sid
          });
          res.setHeader('Content-Type', 'application/javascript');
          res.end(fbds);
        } else {
          res.send(404, 'Not found.');
        }
      });
  });
}
