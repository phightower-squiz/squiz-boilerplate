/**
 * Automated HTML CS sniffs on HTML
 */

module.exports = function (grunt) {
    'use strict';

    grunt.registerMultiTask('htmlcs', 'HTML Code Sniffer.', function () {
        var phantomjs = require('grunt-lib-phantomjs').init(grunt);

        var errors = {};

        function resetErrors() {
            errors = {
                unknown: [],
                error:   [],
                notice:  [],
                warning: []
            };
        }//end resetErrors();

        phantomjs.on('htmlcs.started', function () {
            resetErrors();
        });

        phantomjs.on('htmlcs.unknown', function (code, msg) {
            errors.unknown.push({
                code: code,
                msg:  msg
            });
        });

        phantomjs.on('htmlcs.error', function (code, msg) {
            errors.error.push({
                code: code,
                msg:  msg
            });
        });

        phantomjs.on('htmlcs.notice', function (code, msg) {
            errors.notice.push({
                code: code,
                msg:  msg
            });
        });

        phantomjs.on('htmlcs.warning', function (code, msg) {
            errors.warning.push({
                code: code,
                msg:  msg
            });
        });

        phantomjs.on('htmlcs.gather', function (num, standard) {
            grunt.log.write(' ' + standard.cyan + ' (' + num + ') ');
        });

        phantomjs.on('htmlcs.done', function () {
            phantomjs.halt();
        });

        // Built-in error handlers.
        phantomjs.on('fail.load', function (url) {
            phantomjs.halt();
            grunt.verbose.write('Running PhantomJS...').or.write('...');
            grunt.log.error();
            grunt.warn('PhantomJS unable to load "' + url + '" URI.');
        });

        phantomjs.on('fail.timeout', function () {
            phantomjs.halt();
            grunt.log.writeln();
            grunt.warn('PhantomJS timed out.');
        });

        // Pass-through console.log statements.
        phantomjs.on('console', console.log.bind(console));

        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            // Default PhantomJS timeout.
            timeout: 15000,

            inject: 'lib/htmlcs/htmlcs_combined.js',

            // WCAG2A | WCAG2AA | WCAG2AAA
            standard: 'WCAG2AA'
        });

        var urls = this.filesSrc;
        var done = this.async();

        grunt.util.async.forEachSeries(urls, function (url, next) {
            grunt.log.write('Testing... ', url);

            if (!grunt.file.exists(url)) {
                grunt.log.error('Unable to locate file for testing: ', url);
                next();
            }//end if

            var sourceUrl = url + '?standard=' + options.standard;

            phantomjs.spawn(sourceUrl, {
                // Additional PhantomJS options.
                options: options,
                // Do stuff when done.
                done: function (err) {
                    if (err) {
                        // If there was an error, abort the series.
                        done();
                    } else {
                        // Otherwise, process next url.
                        grunt.log.write((errors.error.length + '').red + ' errors, ' +
                                        (errors.warning.length + '').yellow + ' warnings, ' +
                                        (errors.notice.length + '').grey + ' notices. ');

                        if (errors.error.length === 0) {
                            grunt.log.ok();
                        } else {
                            grunt.log.fail();

                            // Count colour contrast issues since they are likely to spam the
                            // error log
                            var contrast = 0;

                            errors.error.forEach(function (error) {
                                if (error.msg.indexOf('insufficient contrast') !== -1) {
                                    contrast += 1;
                                } else {
                                    grunt.log.writeln('    ' + error.msg.red);
                                }//end if
                            });

                            if (contrast !== 0) {
                                grunt.log.writeln(('    There were (' + contrast +
                                 ') colour contrast issues.').red);
                            }//end if
                        }//end if

                        next();
                    }
                }
            });

        }, function () {
            // All finished!
            done();
        });
    });
};