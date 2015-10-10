var _  = require('lodash'),
    element = require('../util/element.js');

module.exports = function(directive, callback) {
    callback(null, _.reduce(directive.files, function(memo, file) {
        return memo += element.create('script', {src: file}) + element.close('script');
    }, ''));
};