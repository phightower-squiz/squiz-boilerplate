// It's often expensive to keep re-parsing content so we need to do some simple cache
// storage with keys (often file paths). The cache is super simple and will just
// exist for the lifecycle of the code runtime.
var cache  = {},
    actions = module.exports;

actions.exists = function(key) {
    return cache.hasOwnProperty(key);
};

actions.fetch = function(key) {
    if (this.exists(key)) {
        return cache[key];
    }
    return;
};

actions.write = function(key, content) {
    cache[key] = content;
};