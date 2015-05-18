var NodeCache = require( "node-cache" );

var cache = new NodeCache();

cache.ttl = 1800; // 0.5hr

cache._set = cache.set;

cache.setHooks = {
  after: []
};

cache.set = function(key, val, callback) {
  cache._set(key, val, cache.ttl, callback);
  cache.setHooks['after'].forEach(function(hook) {
    hook(key, val);
  });
};

cache.sync = function(ws, pixelId) {
  cache.keys().forEach(function(key) {
    var evt = cache.get(key);
    if (evt['pixelId'] === pixelId) {
      ws.send(JSON.stringify({
        type: 'event',
        event: cache.get(key)
      }));
    }
  });
};

exports.cache = cache;


