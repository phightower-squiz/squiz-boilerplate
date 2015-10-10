var _       = require('lodash'),
    _s      = require('underscore.string'),
    path    = require('path'),
    log     = require('./logger.js'),
    file    = require('grunt').file,
    actions = module.exports;

actions._expandPrefixed = function(prefixes, patterns) {
    var expanded = [];
    patterns.forEach(function(pattern) {
        // Default expanded is the pattern
        var x = [pattern];
        if (pattern.indexOf(':') !== -1) {
            var parts = pattern.split(':');
            if (prefixes.hasOwnProperty(parts[0]) &&
                Array.isArray(prefixes[parts[0]])) {
                x = _.map(prefixes[parts[0]], function(prefix) {
                    // It's a path, join them
                    if (prefix.slice(-1) === '/') {
                        return path.join(prefix, parts[1]);
                    }
                    // Simple concatentation
                    return prefix + parts[1];
                });
            }
        }
        expanded = expanded.concat(x);
    });
    return expanded;
};

actions.expand = function(prefixes, patterns) {
    var files = [];

    // Are we dealing with multiple patterns?
    if (patterns.indexOf(',') !== -1) {
        patterns = patterns.split(',');
    } else if (!Array.isArray(patterns)) {
        patterns = [patterns];
    }

    patterns = this._expandPrefixed(prefixes, patterns);

    // Expand files if globbing is detected, if not
    // then just pass back the pattern we have
    patterns.forEach(function(pattern) {
        if (pattern.indexOf('*') !== -1) {
            files = files.concat(file.expand({dot: true}, pattern));
        } else {
            files = files.concat(pattern);
        }
    });

    files = _(files).compact().uniq().value();

    // Trim the file names
    files = _.map(files, function(file) {
        return _s.trim(file);
    });

    return files;
};