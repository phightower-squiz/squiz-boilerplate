'use strict';

module.exports = function(grunt) {
    var path    = require('path'),
        libPath = path.resolve(__dirname, '../lib'),
        parser  = require(libPath + '/parser.js'),
        timer   = require(libPath + '/util/timer.js'),
        async   = require('async'),
        _       = require('lodash'),
        chalk   = require('chalk');

    grunt.registerMultiTask('boilerplate', 'HTML comment parser for Squiz Boilerplate', function () {
        var options = this.options({
            // Destination directory
            dest: '',
            // Ignored Bower Dependencies
            ignored: [
                'jquery',
                'modernizr'
            ],

            browserify: {
                debug: false
            },

            prefixes: {
                module: [
                    'test/fixtures/source/bower-components/squiz-module-',
                    'test/fixtures/source/modules/'
                ],
                source: [
                    'test/fixtures/source/'
                ],
                tmp: [
                    '.tmp/'
                ],
                dist: [
                    '.tmp/dist/'
                ]
            },

            sass: {
                includePaths:  [
                    'test/fixtures/source/bower_components',
                    'test/fixtures/source/styles'
                ],
                sourceMap:      false,
                sourceComments: false,
                outputStyle:    'nested'
            },

            banner: function(file, content) {
                return content;
            }
        });

        var done = this.async();

        async.forEachSeries(this.filesSrc, function (file, next) {
            var content = grunt.file.read(file);
            grunt.log.writeln('Parsing ' + chalk.yellow(file));
            timer.start('parse ' + file);
            parser.parse(content, options, function(err, parsed) {
                timer.end('parse ' + file);
                if (!err) {
                    var target = options.dest + '/' + path.basename(file);
                    grunt.log.writeln('File ' + chalk.cyan(target) + ' created.');
                    grunt.file.write(target, parsed);
                } else {
                    grunt.log.error(err);
                }
                next();
            });
        }, function(err) {
            if (err) {
                throw err;
            }
            timer.report();
            done();
        });
    });
};