/**
 * Sources files that match a defined pattern
 *
 * The content that this task produces is ideal for pulling in individual html files or sourcing
 * <script> and <link> files to provide to something like usemin
 */

var path = require('path'),
    quote = require('regexp-quote'),
    async = require('async'),
    _     = require('lodash'),
    bowerdeps = require('../lib/bowerdeps');

module.exports = function (grunt) {

    // Get the HTML tag output for bower dependencies
    function getBowerDepTags (type, template, callback) {
        bowerdeps.resources(function (files) {
            async.reduce(files, '', function (memo, file, next) {
                // Get the base path
                file = file.replace('bower_components', grunt.config('bowerrc').directory);

                // Get the HTML tag
                types[type](file, null, function (content) {
                    memo += content;
                    next(null, memo);
                });
            }, function (err, memo) {
                callback(memo);
            });
        }, function(depFile) {
            return depFile.match(new RegExp('\.' + quote(type) + '$'));
        });
    }//end getBowerDepTags()

    // Different types of importable content for the boilerplate
    var types = {

        // The content of a file
        content: function (file, template, callback) {
            callback(grunt.file.read(file));
        },//end content()

        // JS script tags
        js: function (file, template, callback) {
            var output = '';
            if (grunt.file.exists(file)) {
                output = '<script src="' + file + '"></script>';
            }//end if
            callback(output);
        },//end js()

        // This one proves too difficult to mix with scoped usemin blocks
        // Just use @import directives in the module
        // bower_css: function (file, template, callback) {
        //     getBowerDepTags('css', template, callback);
        // },//end bower_css_deps()

        bower_js: function (file, template, callback) {
            getBowerDepTags('js', template, callback);
        },//end bower_js_deps()

        // Link tags for direct css
        css: function (file, template, callback) {
            var output = '';
            if (grunt.file.exists(file)) {
                output = '<link rel="stylesheet" href="' + file + '" />';
            }//end if
            callback(output);
        },//end css()

        // sass combinator alias
        // This triggers the combinator to wrap the resulting module content in the media
        // query that is attached to the template, it's ideal when all resulting css may
        // be combined into a single CSS file rendering media attributes useless
        sass_wrapped: function (file, template, callback) {
            var media  = /\s*media="([^"]+)"\s*/gi;
            var match  = media.exec(template);
            var mq     = (match !== null) ? match[1] : 'screen';

            // Modify the output of the result to remove any media attributes
            // being wrapped they are now in the content of the css.
            types.sass(file, template, function (output) {
                output = output.replace(media, '');
                callback(output);
            }, mq);
        },//end sass_wrapped()

        // Sass combinators (triggers other grunt tasks to compile)
        sass: function (file, template, callback, mq) {
            var dirname  = path.dirname(file);
            var baseName = path.basename(file, '.scss');
            var baseFile = path.basename(file);
            var hrefMatch = (/href="([^"]+)"/gi).exec(template);
            var href = (hrefMatch !== null) ? hrefMatch[1] : 'styles/' + baseFile.replace('scss', 'css');

            // Copy the desired sass files into the temp directory for processing
            var newCopyConfig = {};
            newCopyConfig['sass_importer_' + baseName] = {
                src: file,
                dest: '<%= config.tmp %>/styles/' + baseFile
            };
            grunt.config('copy', _.extend(grunt.config('copy') || {}, newCopyConfig));

            // Concatenate module sass with the base sass
            var compiledModules = {};
            compiledModules['sass_importer_' + baseName] = {
                options: {
                    process: function (src, filePath) {
                        // Only place module banners on the right files
                        if (path.basename(filePath) === baseFile) {
                            var module = filePath.split('/')[2]; // source/<folder>/<module_name>
                            return "/*-- module:" + module + " --*/\n" + src;
                        }//end if
                        return src;
                    }
                },
                files: [{
                        src: [
                            '<%= config.source %>/modules/**/css/variables.scss',
                            '<%= bowerrc.directory %>/squiz-module-*/css/variables.scss',
                            '<%= config.source %>/modules/**/css/' + baseFile,
                            '<%= bowerrc.directory %>/squiz-module-*/css/' + baseFile
                        ],
                        dest: '<%= config.tmp %>/styles/modules/' + baseFile
                    }]
            };

            // Merge all temporary files together (includes merged module sass, variables and base sass)
            var singleFileMerge = {};
            singleFileMerge['sass_importer_merge_' + baseName] = {
                options: {
                    process: function (src, filePath) {
                        var useMq = (typeof(mq) !== 'undefined');
                        // Wrap the content properly
                        if (filePath.indexOf('styles/' + baseFile) !== -1 && useMq) {
                            // Start mq tag goes before base content
                            src = "@media " + mq + " {\n" + src;
                        } else if (filePath.indexOf('modules/' + baseFile) !== -1 && useMq) {
                            // End mq tag goes after module content
                            src = src + "\n}";
                        }//end if

                        return src;
                    }
                },
                files: [{
                        src: [
                            '<%= config.tmp %>/styles/' + baseFile,
                            '<%= config.tmp %>/styles/modules/' + baseName + '_variables.scss',
                            '<%= config.tmp %>/styles/modules/' + baseFile
                        ],
                        dest: '<%= config.tmp %>/concat/styles/' + baseFile
                    }]
            };

            grunt.config('concat', _.extend(grunt.config('concat') || {},
                compiledModules, singleFileMerge));

            // Create the sass compiler config
            var sassCompile = {};
            sassCompile['sass_compile_' + baseName] = {
                options: {
                    style: 'expanded',
                    loadPath: [
                        '<%= bowerrc.directory %>',
                        '<%= config.source %>/styles/imports/',
                        '/'
                    ]
                },
                files: [{
                    src: '<%= config.tmp %>/concat/styles/' + baseFile,
                    dest: '<%= config.dest %>/' + href
                }]
            };

            grunt.config('sass', _.extend(grunt.config('sass') || {}, sassCompile));

            callback(template);
        }//end sass()
    };

    // The grunt task
    grunt.registerMultiTask('boilerplate-importer', 'File content importing for boilerplate HTML files.', function() {
        var options = this.options({});

        var sourceFiles = this.filesSrc;
        var done = this.async();

        function processLine (line, queue) {

            var match  = /^\s*?<!--\s*import:([a-z_]+)\s*([^\s]+)?\s*(\[([^\]]+)\])?\s*-->([\s]+)?/gim.exec(line);
            var indent = (line.match(/^\s*/) || [])[0];

            if (match === null) return;

            var tag             = match[0];
            var type            = match[1];
            var filePattern     = match[2];
            var template        = match[4];
            var files           = [];
            var moduleAlphaSort = false;

            // If we don't have a file pattern simply call the function without the first argument.
            if (!filePattern) {
                if (type === 'bower_js' || type === 'bower_css') {
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
                filePattern = [grunt.config('config').source + '/modules/' + relPath,
                               grunt.config('bowerrc').directory + '/' + relPath];

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
                    if (aModule < bModule) return -1;
                    if (aModule > bModule) return 1;
                    return 0;
                });
            }//end if

            if (files.length >= 1) {
                grunt.log.writeln('Import: ' + type.cyan + ' '  + path.basename(files[0]).green +
                    ' (' + files.length + ' file' + ((files.length>1) ? 's' : '') + ' found)');
            } else {
                grunt.log.writeln('Import: ' + type.cyan + ' '  + filePattern +
                    ' (0 files found)');
            }//end if

            queue.push(function (content, done) {
                async.reduce(files, [], function (memo, file, next) {
                    types[type](file, template, function (output) {
                        memo.push(output)
                        next(null, memo);
                    });
                }, function (err, htmlTags) {
                    content = content.replace(tag, htmlTags.join("\n" + indent));
                    done(null, content);
                });
            });
        }//end processLine()

        async.forEachSeries(sourceFiles, function (sourceFile, next) {
            var content = grunt.file.read(sourceFile);
            var lines   = content.replace(/\r\n/g, '\n').split(/\n/);
            var queue   = [];

            // Gather up the replacements to be made and push functions
            // to a queue to perform replacements
            lines.forEach(function(line) {
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
            done();
        });
    });
};