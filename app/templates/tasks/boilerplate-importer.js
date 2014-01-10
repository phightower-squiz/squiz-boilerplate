/**
 * Sources files that match a defined pattern
 *
 * The content that this task produces is ideal for pulling in individual html files or sourcing
 * <script> and <link> files to provide to something like usemin
 */

var _path = require('path');

module.exports = function (grunt) {

    var _ = grunt.util._;

    // Storage for any bower dependencies that have been resolved
    var bowerDepList = {};

    // Different types of importable content for the boilerplate
    var types = {

        // The content of a file
        content: function (path) {
            return grunt.file.read(path);
        },//end content()

        // JS script tags
        js: function (path) {
            if (grunt.file.exists(path)) {
                return '<script src="' + path + '"></script>';
            }//end if
            return '';
        },//end js()

        // Analyse the path to determine any bower deps that need to be included
        bower_deps: function (path) {
            var bower = grunt.file.readJSON(path);
            var bowerDir = grunt.config('bowerrc').directory;
            var output = '';
            if (_.has(bower, 'dependencies')) {
                _.each(bower.dependencies, function(version, dep) {
                    var jsonPath = bowerDir + '/' + dep + '/*bower.json';
                    var json = grunt.file.expand({dot: true}, jsonPath);

                    // Use the first bower file we get from the pattern
                    if (json.length >= 1) {
                        var bowerJSON = grunt.file.readJSON(json[0]);
                        bowerDepList[dep] = bowerJSON.version;
                        if (_.has(bowerJSON, 'main')) {
                            var mainFile = bowerDir + '/' + dep + '/' + bowerJSON.main;
                            output = types.js(mainFile);
                            return;
                        }//end if
                    }//end if
                });
            }//end if
            return output;
        },//end bower_deps()

        // Link tags for direct css
        css: function (path) {
            if (grunt.file.exists(path)) {
                return '<link rel="stylesheet" href="' + path + '" />';
            }//end if
            return '';
        },//end css()

        // sass combinator alias
        // This triggers the combinator to wrap the resulting module content in the media
        // query that is attached to the template, it's ideal when all resulting css may
        // be combined into a single CSS file rendering media attributes useless
        sass_wrapped: function (path, template) {
            var media  = /\s*media="([^"]+)"\s*/gi;
            var match  = media.exec(template);
            var mq     = (match !== null) ? match[1] : 'screen';

            // Modify the output of the result to remove any media attributes
            // being wrapped they are now in the content of the css.
            var output = types.sass(path, template, mq);
            output = output.replace(media, '');

            return output;
        },//end sass_wrapped()

        // Sass combinators (triggers other grunt tasks to compile)
        sass: function (path, template, mq) {
            var dirname  = _path.dirname(path);
            var baseName = _path.basename(path, '.scss');
            var baseFile = _path.basename(path);
            var hrefMatch = (/href="([^"]+)"/gi).exec(template);
            var href = (hrefMatch !== null) ? hrefMatch[1] : 'styles/' + baseFile.replace('scss', 'css');

            // Copy the desired sass files into the temp directory for processing
            var newCopyConfig = {};
            newCopyConfig['sass_importer_' + baseName] = {
                src: path,
                dest: '<%= config.tmp %>/styles/' + baseFile
            };
            grunt.config('copy', _.extend(grunt.config('copy') || {}, newCopyConfig));

            // Concatenate module sass with the base sass
            var compiledModules = {};
            compiledModules['sass_importer_' + baseName] = {
                options: {
                    process: function (src, filePath) {
                        // Only place module banners on the right files
                        if (_path.basename(filePath) === baseFile) {
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

            return template;
        }//end sass()
    };

    // The grunt task
    grunt.registerMultiTask('boilerplate-importer', 'File content importing for boilerplate HTML files.', function() {
        var options = this.options({});

        var sourceFiles = this.filesSrc;
        var done = this.async();

        var result_indexes = {
            type: 1,
            filePattern: 2,
            template: 4
        };

        /**
         * Process a line of HTML from the source HTML file
         * @param  {string} line       The individual line
         * @param  {string} content    The full content so replacements can be made
         * @return {string} The replaced content
         */
        function processLine (line, content) {

            var match  = /^\s*?<!--\s*import:([a-z_]+)\s*([^\s]+)\s*(\[([^\]]+)\])?\s*-->([\s]+)?/gim.exec(line);
            var indent = (line.match(/^\s*/) || [])[0];

            if (match !== null) {
                var tag  = match[0];
                var type = match[result_indexes.type];
                var filePattern = match[result_indexes.filePattern];
                var files = [];
                var output = [];
                var moduleAlphaSort = false;

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
                    grunt.log.writeln('Import: ' + type.cyan + ' '  + filePattern.green +
                        ' (' + files.length + ' file' + ((files.length>1) ? 's' : '') + ' found)');
                } else {
                    grunt.log.writeln('Import: ' + type.cyan + ' '  + filePattern.green +
                        ' Could not find any files to match this pattern'.red);
                }//end if

                // Iterate all the files found and perform the action specified in the type
                files.forEach(function (file, i) {
                    output.push(types[type](file, match[result_indexes.template]));
                });

                // Replace the tag with it's output
                content = content.replace(tag, output.join("\n" + indent));
            }//end if

            return content;
        }//end processLine()

        grunt.util.async.forEachSeries(sourceFiles, function (sourceFile, next) {
            var content = grunt.file.read(sourceFile);
            var lines   = content.replace(/\r\n/g, '\n').split(/\n/);

            // Process the content line by line
            // Preserves line indenting on replacements made
            lines.forEach(function(line) {
                content = processLine(line, content);
            });

            // Re-write the modified source
            grunt.file.write(options.dest + '/' + _path.basename(sourceFile), content);

            next();
        }, function () {

            var depText = _.map(bowerDepList, function(version, dep) {
                return "\n *    " + dep + " (" + version + ")";
            }).join('');

            var subConfig = {};
            subConfig.bowerDeps = {
                options: {
                    replacements: {
                        deps: depText
                    }
                },
                files: [{
                    expand: true,
                    cwd: '<%= config.dest %>/js/',
                    src: ['*.js'],
                    dest: '<%= config.dest %>/js/'
                }]
            };
            grunt.config('substitute', _.extend(grunt.config('substitute') || {}, subConfig));

            done();
        });
    });
};