module.exports = function (grunt) {
    'use strict';

    var path = require('path'),
        _     = require('lodash'),
        async = require('async'),
        quote = require('regexp-quote');

    grunt.registerMultiTask('substitute', 'Process template vars on source files.', function () {
        var options = this.options({
            startTag: '{{',
            endTag:   '}}',
            replacements: {}
        });

        var files = this.filesSrc;
        var done = this.async();

        function getNamesForToc(name, bowerFiles) {
            _.each(bowerFiles, function (bowerFile) {
                var files = grunt.file.expand(bowerFile);
                if (files.length) {
                    _.each(files, function (file) {
                        var json = grunt.file.readJSON(file);
                        if (_.has(json, 'version')) {
                            name = name.replace('squiz-module-', '');
                            name += ' (' + json.version + ')';
                        }//end if
                    });
                }//end if
            });
            return name;
        }

        // Analyse the contents of a file for included module comments and build a
        // table of contents
        // format: /*-- module:name --*/
        function buildTOC(content) {
            var commentReg = /\/\*[\-]+\s*?module:([^\s]+)\s*?[\-]+\*\//gim;
            var toc = [];
            var bowerFiles = [];
            var match;

            while ((match = commentReg.exec(content)) !== null) {
                // See if we can fetch a version number from any source bower files
                bowerFiles = [grunt.config('config').source + '/modules/' + match[1] + '/.bower.json',
                              grunt.config('bowerrc').directory + '/' + match[1] + '/.bower.json'];

                toc.push(getNamesForToc(match[1], bowerFiles));
            }//end while

            // Create toc text that can be output in a comment block
            toc = _.uniq(toc);
            if (toc.length >= 1) {
                grunt.log.writeln('Subtitute toc for modules: ' + toc.join(', ').cyan);
                return _.map(toc, function (name) {
                    return '\n *    ' + name;
                }).join('').replace(/^\n/, '');
            }//end if

            return '';
        }//end buildTOC()

        async.forEachSeries(files, function (file, next) {
            // Dynamic replacements generated for each file
            options.replacements.file = path.basename(file);

            // Only perform replacements if there is something to replace.
            if (_.keys(options.replacements).length >= 1) {
                grunt.log.writeln('Substitute processing file: ' + file.cyan + '... ');
                var content = grunt.file.read(file);

                // Build module table of contents based on specific commenting syntax
                options.replacements.toc = buildTOC(content);

                _.each(options.replacements, function (replacement, name) {
                    var regex = new RegExp(quote(options.startTag + name + options.endTag), 'gm');
                    content = content.replace(regex, replacement);
                });

                grunt.file.write(file, content);
            } else {
                grunt.log.writeln('Skipping... no replacements specified');
            }//end if

            next();
        }, done);
    });
};