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
}

exports.cache = cache;
