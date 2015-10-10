var async    = require('async'),
    chalk    = require('chalk'),
    cache    = require('../util/cache.js'),
    fileUtil = require('../util/file.js'),
    parser   = require('../parser.js');

module.exports = function(directive, callback) {
    if (cache.exists(directive.id)) {
        return callback(null, cache.fetch(directive.id));
    }

    async.reduce(directive.files, '', function(memo, file, next) {
        if (fileUtil.exists(file)) {
            memo += fileUtil.read(file);
        }
        next(null, memo);
    }, function(err, content) {
        // Recursively parse the content
        parser.parse(content, directive.options, function(err, parsed) {
            cache.write(directive.id, parsed);
            callback(err, parsed);
        });
    });
};