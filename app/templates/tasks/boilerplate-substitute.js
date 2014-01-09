var path = require('path'),
    quote = require('regexp-quote');

module.exports = function (grunt) {
    'use strict';
    var _ = grunt.util._;

    grunt.registerMultiTask('substitute', 'Process template vars on source files.', function () {
        var options = this.options({
            startTag: '{{',
            endTag:   '}}',
            replacements: {}
        });

        var files = this.filesSrc;
        var done = this.async();

        // Analyse the contents of a file for included module comments and build a
        // table of contents
        // format: /*-- module:name --*/
        function buildTOC(content) {
            var commentReg = /\/\*[\-]+\s*?module:([^\s]+)\s*?[\-]+\*\//gim;
            var toc = [];
            var name;
            var bowerFiles = [];
            var match;

            while (match = commentReg.exec(content)) {
                name = match[1];

                // See if we can fetch a version number from any source bower files
                bowerFiles = [grunt.config('config').source + '/modules/' + name + '/.bower.json',
                              grunt.config('bowerrc').directory + '/' + name + '/.bower.json'];
                _.each(bowerFiles, function(bowerFile) {
                    var files = grunt.file.expand(bowerFile);
                    if (files.length) {
                        _.each(files, function(file) {
                            var json = grunt.file.readJSON(file);
                            if (_.has(json, 'version')) {
                                name += ' (' + json.version + ')';
                            }//end if
                        });
                    }//end if
                });

                toc.push(name);
            }//end while

            // Create toc text that can be output in a comment block
            if (toc.length >= 1) {
                grunt.log.writeln('Subtitute toc for modules: ' + toc.join(', ').cyan);
                return _.map(toc, function(name) {
                    return "\n *    " + name;
                }).join('').replace(/^\n/,'');
            }//end if

            return '';
        }//end buildTOC()

        grunt.util.async.forEachSeries(files, function (file, next) {
            // Dynamic replacements generated for each file
            options.replacements.file = path.basename(file);

            // Only perform replacements if there is something to replace.
            if (_.keys(options.replacements).length >= 1) {
                grunt.log.writeln('Substitute processing file: ' + file.cyan + '... ');
                var content = grunt.file.read(file);

                // Build module table of contents based on specific commenting syntax
                options.replacements.toc = buildTOC(content);

                _.each(options.replacements, function (replacement, name) {
                    var regex = new RegExp(quote(options.startTag + name + options.endTag));
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