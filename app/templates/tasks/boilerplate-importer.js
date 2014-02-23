/**
 * Sources files that match a defined pattern
 *
 * The content that this task produces is ideal for pulling in individual html files or sourcing
 * <script> and <link> files to provide to something like usemin
 */
'use strict';

module.exports = function (grunt) {

    // Require calls moved inside to load only when this task is invoked
    var path = require('path'),
        quote = require('regexp-quote'),
        async = require('async'),
        _     = require('lodash'),
        bowerdeps;

    var ignored = [];

    // Get the HTML tag output for bower dependencies
    function getBowerDepTags(type, template, callback) {
        // Defer requiring this library, it does a require('bower') which is slow
        if (!bowerdeps) {
            bowerdeps = require('../lib/bowerdeps');
        }//end if
        grunt.log.writeln('Bower: ' + type.cyan);
        grunt.log.debug('ignored: ' + ignored.join(', '));
        bowerdeps.resources(function (files) {
            async.reduce(files, '', function (memo, file, next) {
                // Get the base path
                grunt.log.writeln('Bower: ' + type.cyan + ' '  + file.green);

                // The file needs to be copied in order for it to be accessible to any usemin blocks which
                // will use the relative current directory. We also want the file to be available to the
                // dist directory in case it needs to be packaged up with all the files
                var sourceReg = new RegExp('^' + quote(grunt.config('config').source) + '/');
                var destFile = path.join(grunt.config('config').dest, file.replace(sourceReg, ''));
                grunt.file.copy(file, destFile);
                grunt.log.writeln('Copied: ' + path.basename(file).cyan + ' to ' + destFile.green);

                // Make the file path relative so the css usemin can handle it with it's custom
                // directory argument.
                var destReg = new RegExp('^' + quote(grunt.config('config').dest) + '/');
                if (type === 'css') {
                    destFile = destFile.replace(destReg, '');
                }//end if

                // Get the HTML tag by calling an existing type function
                types[type](destFile, null, function (content) {
                    memo += content + "\n";
                    next(null, memo);
                });
            }, function (err, memo) {
                callback(memo);
            });
        }, function (depFile) {
            return depFile.match(new RegExp(quote('.' + type) + '$'));
        }, ignored);
    }//end getBowerDepTags()

    // Different types of importable content for the boilerplate
    var types = {

        // The content of a file
        content: function (file, template, callback) {
            callback(grunt.file.read(file));
        },//end content()

        // JS script tags
        js: function (file, template, callback) {
            var output = '<script src="' + file + '"></script>';
            callback(output);
        },//end js()

        bowerCSS: function (file, template, callback) {
            getBowerDepTags('css', template, callback);
        },//end bower_css_deps()

        bowerJS: function (file, template, callback) {
            getBowerDepTags('js', template, callback);
        },//end bower_js_deps()

        // Link tags for direct css
        css: function (file, template, callback) {
            var output = '<link rel="stylesheet" href="' + file + '" />';
            callback(output);
        },//end css()

        // sass combinator alias
        // This triggers the combinator to wrap the resulting module content in the media
        // query that is attached to the template, it's ideal when all resulting css may
        // be combined into a single CSS file rendering media attributes useless
        sassMQ: function (file, template, callback) {
            var media  = /\s*media=['"]([^"']+)['"]\s*/gi;
            var match  = media.exec(template);
            var mq     = (match !== null) ? match[1] : null;

            // Modify the output of the result to remove any media attributes
            // being wrapped they are now in the content of the css.
            types.sass(file, template, function (output) {
                output = output.replace(media, '');
                callback(output);
            }, mq);
        },//end sass_wrapped()

        // Sass combinators (triggers other grunt tasks to compile)
        sass: function (file, template, callback, mq) {
            var baseName = path.basename(file, '.scss');
            var baseFile = path.basename(file);
            var gruntConfig = grunt.config();

            if (typeof(template) === 'undefined') {
                callback('<!-- Error: could not construct css. Missing template parameter for sass file: ' + file + ' -->');
                return;
            }//end if

            // Figure out the right destination for the merged sass file based on the href
            // supplied in the template
            var hrefMatch  = /\s*href=['"]([^"']+)['"]\s*/gi.exec(template);
            var concatDest = baseFile;
            if (hrefMatch !== null) {
                concatDest = hrefMatch[1].replace(/^\/?styles\//, '');
            }//end if

            var uniqName = concatDest.replace(/\/\./gim, '_');
            var tmpFile  = path.join(grunt.config('config').tmp, '/styles/', concatDest);

            // Ensure .css file extension
            tmpFile = tmpFile.replace(/\.scss$/,'.css');

            // Get variable content to merge together
            var variableContent = _.reduce(grunt.file.expand([
                gruntConfig.config.source + '/modules/**/css/variables.scss',
                gruntConfig.bowerrc.directory + '/squiz-module-*/css/variables.scss'
            ]), function (memo, targetFile) {
                return memo += '\n// Source: ' + targetFile + '\n' + '@import "' + targetFile + '";';
            }, '');

            // Get the module content with header to merge together
            var moduleContent = _.reduce(grunt.file.expand([
                gruntConfig.config.source + '/modules/**/css/' + baseFile,
                gruntConfig.bowerrc.directory + '/squiz-module-*/css/' + baseFile
            ]), function (memo, targetFile) {
                var module = targetFile.split('/')[2];
                grunt.log.debug('Module Sass file: ', path.basename(targetFile), module);
                return memo += '\n/*-- module:' + module + ' --*/\n' + '@import "' + targetFile + '";';
            }, variableContent);

            // Perform the merge
            var tmpContent = grunt.file.read(file);
            tmpContent = tmpContent.replace('{{modules}}', moduleContent);
            // Optionally wrap the file in it's media query
            if (typeof(mq) !== 'undefined' && mq !== null) {
                grunt.log.writeln('Wrapping file content ' + tmpFile.cyan + ' in media query ' + mq.green);
                tmpContent = '@media ' + mq + ' {\n' + tmpContent + '\n}';
            }//end if
            var exists = grunt.file.exists(tmpFile);
            grunt.file.write(tmpFile, tmpContent);
            grunt.log.writeln(((exists) ? 'Overwrite'.yellow : 'Create'.green) + ': ' + tmpFile.cyan);

            // Write out the template
            callback(template);
        }//end sass()
    };

    // The grunt task
    grunt.registerMultiTask('boilerplate-importer', 'File content importing for boilerplate HTML files.', function () {
        var options = this.options({
            ignored: [
                'jquery',
                'modernizr'
            ]
        });

        ignored = options.ignored;

        var sourceFiles = this.filesSrc;
        var done = this.async();

        function processLine(line, queue) {

            var match  = /^\s*?<!--\s*import:([a-z]+)\s*([^\s]+)?\s*(\[([^\]]+)\])?\s*-->([\s]+)?/gim.exec(line);
            var indent = (line.match(/^\s*/) || [])[0];

            if (match === null) {
                return;
            }//end if

            var tag             = match[0];
            var type            = match[1];
            var filePattern     = match[2];
            var template        = match[4];
            var files           = [];
            var moduleAlphaSort = false;

            // Fail gracefully on unknown tag types
            if (!_.has(types, type)) {
                grunt.log.writeln('Unknown type ' + type.red + ' from tag: ' + tag);
                return;
            }//end if

            // If we don't have a file pattern simply call the function without the first argument.
            if (!filePattern) {
                if (type.match(/^bower/)) {
                    queue.push(function (content, done) {
                        types[type](null, template, function (output) {
                            done(null, content.replace(tag, output));
                        });
                    });
                }//end if
                return;
            }//end if

            // Module shortcuts to be expanded
            if (filePattern.indexOf('module:') === 0) {
                var relPath = filePattern.replace('module:', '');
                filePattern = [
                    grunt.config('config').source + '/modules/' + relPath,
                    grunt.config('bowerrc').directory + '/squiz-module-' + relPath.replace(/^squiz\-module\-/,'')
                ];

                // We know we are dealing with modules, so alpha sort them by module name
                moduleAlphaSort = true;
            }//end if

            if (_.isArray(filePattern)) {
                _.each(filePattern, function (pattern) {
                    var file = grunt.file.expand({dot: true}, pattern);
                    if (file.length) {
                        files = files.concat(file);
                    }//end if
                });
                filePattern = filePattern.join(', ');
            } else {
                files = grunt.file.expand({dot: true}, filePattern);
            }//end if

            // Sort files in alpha
            if (moduleAlphaSort) {
                files.sort(function (a, b) {
                    var aModule = a.split('/')[2];
                    var bModule = b.split('/')[2];
                    if (aModule < bModule) {
                        return -1;
                    }
                    if (aModule > bModule) {
                        return 1;
                    }
                    return 0;
                });
            }//end if

            if (files.length >= 1) {
                grunt.log.writeln('Import: ' + type.cyan + ' '  + path.basename(files[0]).green +
                    ' (' + files.length + ' file' + ((files.length > 1) ? 's' : '') + ' found)');
            } else {
                grunt.log.writeln('Import: ' + type.cyan + ' '  + filePattern +
                    ' (0 files found)');
            }//end if

            queue.push(function (content, done) {
                async.reduce(files, [], function (memo, file, next) {
                    types[type](file, template, function (output) {
                        memo.push(output);
                        next(null, memo);
                    });
                }, function (err, htmlTags) {
                    content = content.replace(tag, indent + htmlTags.join('\n' + indent));
                    done(null, content);
                });
            });
        }//end processLine()

        var once = false;
        function processFiles() {
            async.forEachSeries(sourceFiles, function (sourceFile, next) {
                var content = grunt.file.read(sourceFile);
                var lines   = content.replace(/\r\n/g, '\n').split(/\n/);
                var queue   = [];

                // Gather up the replacements to be made and push functions
                // to a queue to perform replacements
                lines.forEach(function (line) {
                    processLine(line, queue);
                });

                async.waterfall([function (nextQueue) {
                    // Pass in the content to get started
                    nextQueue(null, content);
                }].concat(queue), function (err, modifiedContent) {
                    grunt.file.write(options.dest + '/' + path.basename(sourceFile), modifiedContent);
                    next();
                });
            }, function () {

                // Run the replacement twice per file. The second time around will do any replacements
                // injected from content, such as module HTML files. This allows modules to output
                // dynamic references for builds like large groups of individual JS files intended
                // to be combined in single file output by usemin.
                if (!once) {
                    processFiles();
                    once = true;
                } else {
                    done();
                }//end if
            });
        }

        processFiles();
    });
};