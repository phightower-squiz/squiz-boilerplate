var _ = require('lodash');

// List of self closing tags, html parser hasn't been smart
// enough to pick these up so far
var selfClosingTags = ['meta', 'link', 'br', 'hr', 'input', 
                       'img', 'embed', 'keygen', 'base', 'area',
                       'col', 'command', 'param', 'source', 'track',
                       'wbr'];

/**
 * Create a HTML tag
 * @param  {string} name The name of the HTML tag, e.g. 'head'
 * @param  {object} attr Hash of attribute key and value pairs
 * @return {string}      Constructed HTML tag as a string
 */
module.exports.create = function(name, attr) {
    attr = attr || {};

    var tag = '<';
    tag += name;
    for (var key in attr) {
        tag += ' ' + key + '="' + attr[key] + '"';
    }
    tag += ((_.indexOf(selfClosingTags, name) !== -1) ? ' /' : '') + '>';
    return tag;
};

module.exports.close = function(name) {
    if (_.indexOf(selfClosingTags, name) !== -1) {
        return '';
    }
    return '</' + name + '>';
};