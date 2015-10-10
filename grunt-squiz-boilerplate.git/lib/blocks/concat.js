/**
 * Concatenate content from a matching ist of files parsed from HTML content
 */

'use strict';

var chalk      = require('chalk'),
    htmlparser = require('htmlparser2'),
    _          = require('lodash'),
    log        = require('../util/logger.js'),
    fileUtil   = require('../util/file.js'),
    url        = require('url');

function filterTags(tag, attrName, content, cb) {
    var matches = [];
    var parser = new htmlparser.Parser({
        recognizeSelfClosing: true,
        onopentag: function(name, attr) {
            if (name === tag && attr.hasOwnProperty(attrName)) {
                matches.push(attr);
            }
        },
        onend: function() {
            cb(matches);
        }
    });
    parser.write(content);
    parser.done();
}

/**
 * Create a concatenator function
 * @param  {string} tag         Tag to search for, e.g. 'script'
 * @param  {string} attrName    The attribute name to extract the file name from
 * @return {function}           Concatenator function that is passed HTML content to transform
 */
module.exports = function(tag, attrName) {
    return function(directive, content, callback) {
        // Filter only the HTML tags from the content we need so we can process the
        // urls, read the content and return concatenated
        filterTags(tag, attrName, content, function(matches) {

            // Ensure all URL attributes are unique and not falsey
            matches = _(matches).uniq(function(item) {
                return item[attrName];
            }).compact().value();

            var concat = _.reduce(matches, function(memo, match) {
                // Parse the file as a url to avoid any stuff like
                // query strings or anchor hashes
                var file = url.parse(match[attrName]).pathname;

                // Media query wrapping if media="" attributes are found on the tag
                if (match.hasOwnProperty('media')) {
                    memo.push('@media ' + match.media + ' {');
                }
                // Push the file content
                if (fileUtil.exists(file)) {
                    // Optionally pass the content through a banner function
                    var content = fileUtil.read(file);
                    if (typeof(directive.options.banner) === 'function') {
                        memo.push(directive.options.banner(file, content));
                    } else {
                        memo.push(content);
                    }
                }
                if (match.hasOwnProperty('media')) {
                    memo.push('}');
                }
                return memo;
            }, []);

            callback(concat.join('\n'));
        });
    };
};