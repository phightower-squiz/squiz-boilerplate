'use strict';

var async = require('async'),
    chalk = require('chalk'),
    path  = require('path');

var importers = {
    js:         require('../importers/javascript.js'),
    css:        require('../importers/css.js'),
    content:    require('../importers/content.js'),
    browserify: require('../importers/browserify.js'),
    markdown:   require('../importers/markdown.js'),
    handlebars: require('../importers/handlebars.js')
};

module.exports.fetch = function(directive, next) {
    if (importers.hasOwnProperty(directive.type)) {
        importers[directive.type](directive, function(err, content) {
            next(err, content);
        });
    } else {
        next(new Error('Unable to process import, no match was found'));
    }//end if
};