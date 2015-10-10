var element = require('../util/element.js'),
    _       = require('lodash');

module.exports = function(directive, callback) {
    var output = _.reduce(directive.files, function(memo, file) {
        var attr = {
            rel: 'stylesheet',
            href: file
        };

        // If there are any media query options they need to be 
        // passed through onto the generated link tag so they can be picked up later
        if (directive.options && directive.options.hasOwnProperty('media')) {
            attr.media = directive.options.media;
        }

        return memo + element.create('link', attr);
    }, '');

    callback(null, output);
};