/**
 * Process a list of Sass files by concatentating, then running node sass
 */

'use strict';

var chalk    = require('chalk'),
    _        = require('lodash'),
    log      = require('../util/logger.js'),
    fileUtil = require('../util/file.js'),
    sass     = require('node-sass'),
    timer    = require('../util/timer.js'),
    concat   = require('./concat.js')('link', 'href'),
    path     = require('path');

module.exports = function(directive, content, callback) {
    var options = directive.options;
    concat(directive, content, function(parsed) {
        // Don't parse empty content, the Sass parser will throw odd errors
        if (/^[\s\t\n]*$/.test(parsed)) {
            return callback('');
        }//end if

        // Timeout after 60 seconds
        var longProcess = setTimeout(function(){
            log.write('It looks like Sass took longer than 60 seconds to process the code. This is unusual, check for infinite loops.');
            process.exit(1);
        },options.sass.timeout || 60*1000);

        timer.start('sass ' + directive.files[0]);

        sass.render({
            data: parsed,
            includePaths:   options.sass.includePaths,
            outputStyle:    options.sass.outputStyle,
            sourceComments: options.sass.sourceComments,
            sourceMap:      options.sass.sourceMap || options.hasOwnProperty('map')
        }, function(err, result) {
            if (err) {
                log.write(err);
                log.write('Parsed file written to: ', chalk.red('.tmp/_error.scss'));
                fileUtil.write('.tmp/_error.scss', parsed);
                clearTimeout(longProcess);
                process.exit(1);
            }

            var css = result.css;
            var map = result.map;

            if (options.hasOwnProperty('mediaWrap')) {
                css = '@media ' + options.mediaWrap + ' {\n' + css + '\n}';
            }

            if (options.hasOwnProperty('map') && !/^\s+$/.test(options.map)) {
                fileUtil.write(options.map, map);
                log.write('File ' + chalk.cyan(options.map) + ' created.');
            }//end if
            timer.end('sass ' + directive.files[0]);
            clearTimeout(longProcess);
            callback(css);
        });
    }, options);
};