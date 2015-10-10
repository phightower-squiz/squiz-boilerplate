/**
 * Take content from markdown files and parse them into HTML
 */

var async    = require('async'),
    chalk    = require('chalk'),
    cache    = require('../util/cache.js'),
    fileUtil = require('../util/file.js'),
    log      = require('../util/logger.js'),
    parser   = require('../parser.js'),
    marked   = require('marked');

var options = {
    renderer: new marked.Renderer(),

    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: false,
    silent: false,
    langPrefix: 'lang-',
    smartypants: false,
    headerPrefix: '',
    xhtml: false,

    // Code highlighting
    highlight: function (code) {
        return require('highlight.js').highlightAuto(code).value;
    }
};

module.exports = function(directive, callback) {
    if (cache.exists(directive.id)) {
        return callback(null, cache.fetch(directive.id));
    }

    async.reduce(directive.files, '', function(memo, file, next) {
        if (fileUtil.exists(file)) {
            var content = fileUtil.read(file);
            var tokens  = marked.lexer(content, options);
            if (typeof(directive.options.markdownParser) === 'function') {
                directive.options.markdownParser(tokens, file, function(err, tokens) {
                    var html = marked.parser(tokens, options);

                    // Optionally run the banner function over markdown content
                    if (typeof(directive.options.banner) === 'function') {
                        html = directive.options.banner(file, html);
                    }

                    next(err, memo + html);
                });
            } else {
                var html = marked.parser(tokens, options);
                if (typeof(directive.options.banner) === 'function') {
                    html = directive.options.banner(file, html);
                }
                next(null, memo + html);
            }
        } else {
            next(null, memo);
        }
    }, function(err, content) {
        // Recursively parse the content
        parser.parse(content, directive.options, function(err, parsed) {
            cache.write(directive.id, parsed);
            callback(err, parsed);
        });
    });
};