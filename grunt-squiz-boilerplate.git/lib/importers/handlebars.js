var chalk      = require('chalk'),
    fileUtil   = require('../util/file.js'),
    handlebars = require('handlebars'),
    path       = require('path'),
    log        = require('../util/logger.js'),
    _          = require('lodash');

module.exports = function(directive, callback) {
    var dataFile = directive.option('data'),
        helpers  = directive.option('helpers');

    if (!dataFile) {
        throw new Error('Handlebars directive option "data" is required');
    }

    var data = JSON.parse(fileUtil.read(dataFile));

    // Add any helpers by requiring them
    if (helpers) {
        if (Array.isArray(helpers)) {
            helpers.forEach(function(file) {
                if (fileUtil.isFile(file)) {
                    require(path.resolve(file));
                }
            });
        } else if (fileUtil.isFile(helpers)) {
            require(path.resolve(helpers));
        }
    }

    callback(null, _.reduce(directive.files, function(memo, file) {
        if (fileUtil.isFile(file)) {
            log.write(chalk.cyan('Handlebars: ') + chalk.yellow(file));
            var template = handlebars.compile(fileUtil.read(file));
            return memo += template(data);
        } else {
            return memo;
        }
    }, ''));
};