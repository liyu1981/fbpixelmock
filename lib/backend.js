var rask = require('rask');
var NodeCache = require('node-cache');

var _ = rask.underscore;

// trackSessions is a cache of event caches
var trackSessions = new NodeCache();

trackSessions.defaultTTL = 1800; // 0.5hr

var cacheExt = {
  ttl: 1800, // 0.5hr

  setHooks: {
    after: []
  },

  set: function(key, val, callback) {
    this._set(key, val, this.ttl, callback);
    this.setHooks['after'].forEach(function(hook) {
      hook(key, val);
    });
  },

  sync: function(ws, pixelId) {
    this.keys().forEach(function(key) {
      var evt = cache.get(key);
      if (evt['pixelId'] === pixelId) {
        ws.send(JSON.stringify({
          type: 'event',
          event: cache.get(key)
        }));
      }
    });
  }
};

exports.getSessionCache = function(key, callback) {
  var c = trackSessions.get(key);
  if (c) {
    callback && callback(c);
  } else {
    trackSessions.set(key, new NodeCache(), trackSessions.defaultTTL,
      function(err, success) {
        var cache = trackSessions.get(key);
        cache._set = cache.set;
        _.extend(cache, cacheExt);
        callback && callback(cache);
      });
  }
};

exports.extendSessionCacheTTL = function(key) {
  trackSessions.ttl(key, trackSessions.defaultTTL);
};
