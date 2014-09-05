'use strict';

module.exports = function (grunt) {
    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Deferred loading of grunt tasks from NPM
    require('./lib/defer.js')(grunt, [
        'grunt-contrib-connect',
        'grunt-contrib-jshint',
        'grunt-contrib-qunit',
        'grunt-contrib-imagemin',
        'grunt-contrib-cssmin',
        'grunt-contrib-uglify',
        'grunt-autoprefixer',
        'grunt-modernizr',
        'grunt-svgmin',
        'grunt-cssbeautifier',
        'grunt-prettify',
        'grunt-jsbeautifier',
        { 'grunt-squiz-boilerplate': ['boilerplate'] },
        { 'grunt-html-validation': ['validation'] },
        { 'grunt-lib-phantomjs': ['htmlcs', 'qunit'] }
    ]);

    // Task config
    var tasks = {};

    var _ = grunt.util._;

    ///////////////////
    // Configuration //
    ///////////////////
    tasks.config  = grunt.file.readJSON('config.json');
    tasks.bower   = grunt.file.readJSON('bower.json');
    tasks.bowerrc = grunt.file.readJSON('.bowerrc');
    tasks.pkg     = grunt.file.readJSON('package.json');

    //////////////////
    // Grunt Server //
    //////////////////

    tasks.connect = {
        options: {
            port: 9002,
            livereload: 35729,
            // Change this to '0.0.0.0' to access the server from outside
            hostname: 'localhost'
        },
        livereload: {
            options: {
                open: true,
                base: [
                    '<%= config.dest %>'
                ]
            }
        },
        test: {
            options: {
                port: 9001,
                base: [
                    '.tmp',
                    'test',
                    '<%= config.source %>'
                ]
            }
        },
        dist: {
            options: {
                open: true,
                base: '<%= config.dest %>',
                livereload: false
            }
        }
    };

    // Analyses import directives and creates appropriate output
    tasks.boilerplate = {
        html: {
            options: {
                dest: tasks.config.dest,
                filePrefixes: {
                    module: {
                        prefixes: [
                            tasks.config.source + '/modules/',
                            tasks.bowerrc.directory + '/' + tasks.config.module_prefix,
                        ],
                        sort: function(files) {
                            var depCache = {};

                            if (!files.length) {
                                return files;
                            }
                            grunt.log.verbose.writeln('initial %s file order: ', 'module'.yellow, files);
                            // Pick out all of the information from a file including
                            // bower dependencies and module (directory) names
                            var tmp = _.map(files, function(file, index) {
                                var f = {};
                                f.file  = file;
                                f.index = index;
                                f.parts = file.split(/\//);
                                f.name  = f.parts[2];
                                f.path  = f.parts.slice(0, 3).join('/');
                                var files = grunt.file.expand(f.path + '/*bower.json');
                                if (files.length) {
                                    f.bower = grunt.file.readJSON(files.shift());
                                    if (_.has(f.bower, 'dependencies')) {
                                        _.each(f.bower.dependencies, function(source, name) {
                                            if (!_.has(depCache, name)) {
                                                depCache[name] = [];
                                            }
                                            depCache[name].push(f.file);
                                        });
                                    }
                                }
                                return f;
                            });
                            
                            _.each(tmp, function(f) {
                                // Move dependents to a later position in the array
                                var dependents = _.has(depCache, f.name) ? depCache[f.name] : [];
                                _.each(dependents, function(file) {
                                    var currentIndex = _.indexOf(files, file);
                                    var newIndex  = f.index + 1;
                                    files.splice(newIndex, 0, files.splice(currentIndex, 1)[0]);
                                });
                            });

                            grunt.log.verbose.writeln('modified %s file order: ', 'module'.yellow, files);
                            return files;
                        }
                    },
                    bower: tasks.bowerrc.directory + '/',
                    source: tasks.config.source + '/',
                    tmp:    tasks.config.tmp + '/',
                    dist:   tasks.config.dest + '/'
                },
                sass: {
                    includePaths: [
                       tasks.bowerrc.directory,
                       tasks.config.source + '/styles/imports/',
                       __dirname
                    ]
                },
                banner:  function(file) {

                    // var basename = path.basename(file);
                    // if (basename.indexOf('variables') === -1) {
                    //     return '/*-- ' + path.basename(file) + ' --*/\n';
                    // }
                    return;
                }
            },
            files: {
                src: [
                    '<%= config.source %>/html/*.html',
                    '!<%= config.source %>/html/_*.html'
                ]
            }
        }
    };

    tasks.copy = {
        files: {
            files: [{
                src: ['*.*'],
                dest: '<%= config.dest %>/<%= config.file_dest %>/',
                cwd:  '<%= config.source %>/files/',
                expand: true
            }, {
                src: ['*.*'],
                dest: '<%= config.dest %>/styles/<%= config.file_dest %>/',
                cwd:  '<%= config.source %>/styles/files',
                expand: true
            }]
        },

        moduleFonts: {
            files: [{
                src: [
                    // Manually copy known module fonts
                    'bootstrap-sass/fonts/*.*',
                    'font-awesome/fonts/*.*'
                ],
                dest: '<%= config.dest %>/styles/<%= config.file_dest %>/',
                cwd:  '<%= bowerrc.directory %>/',
                flatten: true,
                expand: true
            }]
        },

        moduleCSSFiles: {
            files: [{
                src: [
                    '<%= config.source %>/modules/**/css/files/*.*',
                    '<%= bowerrc.directory %>/squiz-module-*/css/files/*.*'
                ],
                expand: true,
                flatten: true,
                dest: '<%= config.dest %>/styles/<%= config.file_dest %>/'
            }]
        },

        moduleFiles: {
            files: [{
                src: [
                    '<%= config.source %>/modules/**/files/*.*',
                    '<%= bowerrc.source %>/squiz-module-*/files/*.*'
                ],
                expand: true,
                flatten: true,
                dest: '<%= config.dest %>/files/'
            }]
        },

        favicon: {
            expand: true,
            cwd: '<%= config.source %>/html/',
            dest: '<%= config.dest %>',
            src: 'favicon.ico'
        }
    };

    tasks.clean = {
        dist: {
            files: [{
                dot: true,
                src: [
                    '<%= config.tmp %>',
                    '.sass-cache',
                    '<%= config.dest %>/*',
                    '!<%= config.dest %>/.git*'
                ]
            }]
        },
        tmp: {
            files: {
                src: '<%= config.tmp %>'
            }
        },
        test: {
            files: {
                src: [
                    '<%= config.source %>/html/_test.html',
                    '<%= config.dest %>/js/test',
                    '<%= config.dest %>/styles/test'
                ]
            }
        },
        distFragments: {
            files: {
                src: '<%= config.dest %>/_*.html'
            }
        }
    };

    // Simple variable substitution
    // This also includes dynamic replacements for:
    // {{toc}} (table of contents for modules)
    // {{file}} (the name of the file)
    tasks.substitute = {
        template: {
            options: {
                replacements: _.extend(tasks.config, tasks.pkg, {
                    date: grunt.template.today('dd-mm-yyyy HH:MM'),
                    bowerdir: tasks.bowerrc.directory
                })
            },
            files: [{
                expand: true,
                cwd: '<%= config.dest %>',
                src: ['*.html', 'styles/**.css', 'js/{*,}*.js'],
                dest: '<%= config.dest %>'
            }]
        },
        html: {
            options: {
                replacements: _.extend(tasks.config, tasks.pkg, {
                    date: grunt.template.today('dd-mm-yyyy HH:MM'),
                    bowerdir: tasks.bowerrc.directory
                })
            },
            files: [{
                expand: true,
                cwd: '<%= config.dest %>',
                src: ['*.html'],
                dest: '<%= config.dest %>'
            }]
        }
    };

    ///////////////////////
    // Pretty Print HTML //
    ///////////////////////
    // https://npmjs.org/package/grunt-prettify
    tasks.prettify = {
        options: {
            indent: 4,
            unformatted: ['a', 'pre', 'code', 'p', 'span', 'b', 'i', 'strong', 'em']
        },
        all: {
            expand: true,
            cwd: '<%= config.dest %>',
            ext: '.html',
            src: ['*.html'],
            dest: '<%= config.dest %>'
        }
    };

    /////////////////
    // JS Beautify //
    /////////////////
    tasks.jsbeautifier = {
        files : [
            '<%= config.dest %>/js/*.js',
            '!<%= config.dest %>/js/*.min.js',
            '!<%= config.dest %>/js/vendor/*.js'
        ],
        options : {
            braceStyle: 'collapse',
            breakChainedMethods: true,
            e4x: false,
            evalCode: false,
            indentChar: ' ',
            indentLevel: 0,
            indentSize: 4,
            indentWithTabs: false,
            jslintHappy: false,
            keepArrayIndentation: false,
            keepFunctionIndentation: false,
            maxPreserveNewlines: 10,
            preserveNewlines: true,
            spaceBeforeConditional: true,
            spaceInParen: false,
            unescapeStrings: false,
            wrapLineLength: 80
        }
    };

    //////////////////
    // Optimisation //
    //////////////////

    tasks.modernizr = {
        dist: {
            devFile: '<%= config.dest %>/js/vendor/modernizr.min.js',
            outputFile: '<%= config.dest %>/js/vendor/modernizr.min.js',
            files: {
                src: [
                    '<%= config.dest %>/js/{,*/}*.js',
                    '<%= config.dest %>/styles/{,*/}*.css',
                    '!<%= config.dest %>/js/vendor/*'
                ]
            },
            uglify: false
        }
    };

    tasks.uglify = {
        plugins: {
            options: {
                // banner: "/* generated: <%= grunt.template.today('dd-mm-yyyy') %> */\n",
                preserveComments: 'some'
            },
            files: [{
                expand: true,
                src: ['<%= config.dest %>/js/**/*.min.js'],
                dest: './'
            }]
        }
    };

    // Only if you really want imagemin
    // tasks.imagemin = {
    //     dist: {
    //         files: [{
    //             expand: true,
    //             cwd: '<%= config.dest %>/<%= config.file_dest %>',
    //             src: '{,*/}*.{gif,jpeg,jpg,png}',
    //             dest: '<%= config.dest %>/<%= config.file_dest %>'
    //         }, {
    //             expand: true,
    //             cwd: '<%= config.dest %>/styles/<%= config.file_dest %>',
    //             src: '{,*/}*.{gif,jpeg,jpg,png}',
    //             dest: '<%= config.dest %>/styles/<%= config.file_dest %>'
    //         }]
    //     }
    // };

    tasks.svgmin = {
        dist: {
            files: [{
                expand: true,
                cwd: '<%= config.dest %>/files',
                src: '{,*/}*.svg',
                dest: '<%= config.dest %>/files'
            }]
        }
    };

    tasks.htmlmin = {
        dist: {
            options: {
                collapseBooleanAttributes: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true,
                removeCommentsFromCDATA: true,
                removeEmptyAttributes: true,
                removeOptionalTags: true,
                removeRedundantAttributes: true,
                useShortDoctype: true
            },
            files: [{
                expand: true,
                cwd: '<%= config.dest %>',
                src: '*.html',
                dest: '<%= config.dest %>'
            }]
        }
    };

    tasks.cssmin = {
        dist: {
            files: [{
                expand: true,
                cwd: '<%= config.dest %>/styles',
                src: '{,*/}*.min.css',
                dest: '<%= config.dest %>/styles'
            }]
        }
    };

    tasks.autoprefixer = {
        dist: {
            options: {
                browsers: tasks.config.browsers
            },
            files: [{
                expand: true,
                cwd: '<%= config.dest %>/styles',
                src: '*.css',
                dest: '<%= config.dest %>/styles'
            }]
        }
    };

    ///////////
    // Tests //
    ///////////
    tasks.jshint = {
        options: {
            jshintrc: '.jshintrc',
            reporter: require('jshint-stylish')
        },
        all: [
            '<%= config.dest %>/scripts/{,*/}*.js',
            '!<%= config.dest %>/scripts/plugins.js',
            'test/spec/{,*/}*.js'
        ]
    };

    // W3C Validator checks - not to be confused with HTMLCS
    tasks.validation = {
        options: {},
        files: {
            src: ['*.html',
                  '!*parse.html',
                  '!parse*'],
            cwd: '<%= config.dest %>',
            expand: true
        }
    };

    // HTML Code Sniffer
    tasks.htmlcs = {
        dist: {
            options: {
                standard: 'WCAG2AA'
            },
            files: [{
                src: ['*.html',
                      '!*parse.html',
                      '!parse*'],
                cwd: '<%= config.dest %>',
                expand: true
            }]
        }
    };

    // Unit tests that require the DOM
    tasks.qunit = {
        modules: {
            options: {
                force: true,
                timeout: 10000
            },
            files: {
                src: [
                    '<%= config.source %>/modules/**/tests/*.html',
                    '<%= bowerrc.directory %>/squiz-module-*/tests/*.html'
                ]
            }
        }
    };

    ///////////////////////
    // Watch for changes //
    ///////////////////////
    tasks.watch = {
        js: {
            options: {
                livereload: true
            },
            files: [
                '<%= config.source %>/js/{,*/}*.js',
                '<%= config.source %>/modules/**/js/*.js',
                '<%= bowerrc.directory %>/squiz-module-*/js/*.js'
            ],
            tasks: ['build_js']
        },

        files: {
            options: {
                livereload: true
            },
            files: [
                '<%= config.source %>/files/*.*',
                '<%= config.source %>/modules/**/files/*.*',
                '<%= bowerrc.directory %>/squiz-module-*/files/*.*'
            ],
            tasks: ['copy']
        },

        // Any other source files edited that require re-building
        source: {
            options: {
                livereload: true
            },
            files: [
                'Gruntfile.js',
                'tasks/*.js',
                '<%= config.source %>/html/**/*.html',
                '<%= config.source %>/modules/**/html/*.html',
                '<%= config.source %>/styles/{,*/}*.scss',
                '<%= config.source %>/modules/**/css/*.scss',
                '<%= bowerrc.directory %>/squiz-module-*/html/*.html',
                '<%= bowerrc.directory %>/squiz-module-*/css/*.scss'
            ],
            tasks: ['build']
        }
    };

    tasks.cssbeautifier = {
        files: [
            '<%= config.dest %>/styles/*.css'
        ]
    };

    grunt.initConfig(tasks);

    // Load any tasks from the tasks directory
    //grunt.loadTasks('tasks');

    // Run optimisation tasks
    var optimiseTasks = [
        'modernizr',
        'cssmin',
        'svgmin',
        'uglify',
        'prettify'
    ];
    if (tasks.config.autoprefixer) {
        optimiseTasks.push('autoprefixer');
    }//end if
    grunt.registerTask('optimise', optimiseTasks);

    ///////////
    // Tests //
    ///////////

    // Code Quality Tests
    grunt.registerTask('test', ['jshint', 'validation', 'htmlcs', 'qunit']);


    // HTTP server
    grunt.registerTask('serve', ['build', 'connect:livereload', 'watch']);

    // Build only the tasks necessary when JS is edited
    grunt.registerTask('build_js', [
        'jshint',
        'substitute:html',
        'boilerplate',
        'add_module_banners',
        'substitute',
        'clean:distFragments'
    ]);

    // Defer load of required npm tasks
    grunt.registerTask('build', [
        'substitute:html',
        'boilerplate',
        'newer:copy:files',
        'newer:copy:favicon',
        'newer:copy:moduleFiles',
        'newer:copy:moduleCSSFiles',
        'newer:copy:moduleFonts',
        'substitute',
        'clean:distFragments',
        'cssbeautifier'
    ]);

    // Run the whole lot
    grunt.registerTask('all', ['build', 'optimise', 'test']);

    grunt.registerTask('default', ['build']);

    require('jit-grunt')(grunt, {
        validation:             'grunt-html-validation',
        substitute:             'tasks/boilerplate-substitute.js',
        htmlcs:                 'tasks/htmlcs.js',
        boilerplate:            'grunt-squiz-boilerplate' 
    });
};