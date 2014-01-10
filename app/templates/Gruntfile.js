'use strict';

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt, {pattern: ['grunt-*', '!grunt-lib-*']});

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Task config
    var tasks = {};

    var _ = grunt.util._;

    ///////////////////
    // Configuration //
    ///////////////////
    tasks.config  = grunt.file.readJSON('config.json');
    tasks.bower   = grunt.file.readJSON('.bower.json');
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
                    '.tmp',
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
    tasks['boilerplate-importer'] = {
        html: {
            options: {
                dest: '<%= config.dest %>'
            },
            files: [{
                src: [
                    '<%= config.source %>/html/*.html'
                ]
            }]
        }
    };

    tasks.copy = {
        files: {
            files: [
                {
                    src: ['*.*'],
                    dest: '<%= config.dest %>/<%= config.file_dest %>/',
                    cwd:  '<%= config.source %>/files/',
                    expand: true
                }
            ]
        },

        moduleCSSFiles: {
            files: [{
                src: [
                    '<%= config.source %>/modules/**/css/files/*.*',
                    '<%= bowerrc.source %>/squiz-module-*/css/files/*.*'
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

        styles: {
            expand: true,
            dot: true,
            cwd: '<%= config.source %>/styles',
            dest: '<%= config.tmp %>/styles/',
            src: '*.scss'
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
        }
    };

    tasks.useminPrepare = {
        options: {
            dest: '<%= config.dest %>',
            root: './',
            flow: {
                html: {
                    // Only allow concatenation
                    steps: {'js':  ['concat'], 'css': ['concat']},
                    post: {}
                }
            }
        },
        html: '<%= config.dest %>/*.html'
    };

    tasks.usemin = {
        options: {
            assetsDirs: ['<%= config.dest %>']
        },
        html: ['<%= config.dest %>/{,*/}*.html']
    };

    // Simple variable substitution
    // This also includes dynamic replacements for:
    // {{toc}} (table of contents for modules)
    // {{file}} (the name of the file)
    tasks.substitute = {
        template: {
            options: {
                replacements: _.extend(tasks.config, tasks.pkg, {
                    date: grunt.template.today('dd-mm-yyyy')
                })
            },
            files: [{
                expand: true,
                cwd: '<%= config.dest %>',
                src: ['*.html', 'styles/**.css', '**/*.js'],
                dest: '<%= config.dest %>'
            }]
        },
        html: {
            options: {
                replacements: _.extend(tasks.config, tasks.pkg, {
                    date: grunt.template.today('dd-mm-yyyy')
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
            unformatted: ['a', 'pre', 'code']
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
        devFile: '<%= config.dest %>/js/vendor/modernizr.min.js',
        outputFile: '<%= config.dest %>/js/vendor/modernizr.min.js',
        files: [
            '<%= config.dest %>/js/{,*/}*.js',
            '<%= config.dest %>/styles/{,*/}*.css',
            '!<%= config.dest %>/js/vendor/*'
        ],
        uglify: false
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

    tasks.imagemin = {
        dist: {
            files: [{
                expand: true,
                cwd: '<%= config.dest %>/<%= config.file_dest %>',
                src: '{,*/}*.{gif,jpeg,jpg,png}',
                dest: '<%= config.dest %>/<%= config.file_dest %>'
            }, {
                expand: true,
                cwd: '<%= config.dest %>/styles/<%= config.file_dest %>',
                src: '{,*/}*.{gif,jpeg,jpg,png}',
                dest: '<%= config.dest %>/styles/<%= config.file_dest %>'
            }]
        }
    };

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

    ///////////
    // Tests //
    ///////////
    tasks.jshint = {
        options: {
            jshintrc: '.jshintrc',
            reporter: require('jshint-stylish')
        },
        all: [
            'Gruntfile.js',
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
        all: [
            '<%= config.source %>/modules/**/tests/*.html',
            '<%= bowerrc.directory %>/squiz-module-*/tests/*.html'
        ]
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
                '<%= bowerrc.directory %>/squiz-module-*/files/*.js'
            ],
            tasks: ['copy']
        },

        // If core HTML is edited then a full rebuild is required
        html: {
            options: {
                livereload: true
            },
            files: ['<%= config.source %>/html/*.html'],
            tasks: ['build']
        },

        sass: {
            options: {
                livereload: true
            },
            files: [
                '<%= config.source %>/styles/{,*/}*.scss',
                '<%= config.source %>/modules/**/css/*.scss',
                '<%= bowerrc.directory %>/squiz-module-*/css/*.scss'
            ],
            tasks: ['build_sass']
        }
    };

    ////////////////
    // Concurrent //
    ////////////////
    // Process some longer runnin tasks concurrently to improve performance
    tasks.concurrent = {
        optimise: [
            'cssmin',
            'imagemin',
            'svgmin',
            //'htmlmin', // Uncomment this line if you want html minification
            'uglify'
        ]
    };

    grunt.initConfig(tasks);

    // Load any tasks from the tasks directory
    grunt.loadTasks('tasks');

    // Clean up alias
    grunt.registerTask('reset', ['clean']);

    // Run optimisation tasks
    grunt.registerTask('optimise', [
        'modernizr',
        'concurrent:optimise',
        'prettify',
        'jsbeautifier'
    ]);

    // Tests
    grunt.registerTask('test', ['jshint', 'validation', 'htmlcs', 'qunit']);

    // HTTP server
    grunt.registerTask('serve', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:tmp',
            'connect:livereload',
            'watch'
        ]);
    });

    // Task for adding module banner headings to usemin prepared concatenations
    grunt.registerTask('add_module_banners', 'Adds comment banners to the top of each module js file', function () {
        var concatConfig = grunt.config('concat') || {};
        if (_.has(concatConfig, 'generated')) {
            concatConfig.generated.options = {
                process: function (src, filePath) {
                    // Only place module banners on the right files (i.e. module js files)
                    if (filePath.indexOf(tasks.config.source + '/modules') === 0 ||
                        filePath.indexOf(tasks.bowerrc.directory + '/squiz-module-') === 0) {
                        var module = filePath.split('/')[2]; // source/<folder>/<module_name>
                        return '\n/*-- module:' + module + ' --*/\n' + src;
                    }//end if
                    return src;
                }
            };
            grunt.config('concat', concatConfig);
        }//end if
    });

    // Build only the tasks necessary when JS is edited
    grunt.registerTask('build_js', [
        'jshint',
        'boilerplate-importer',
        'substitute:html',
        'useminPrepare',
        'add_module_banners',
        'concat',
        'substitute',
        'usemin'
    ]);

    // Build only the tasks necessary when Sass is edited
    grunt.registerTask('build_sass', ['build']);

    // Build tasks
    grunt.registerTask('build', [
        //'clean',
        'boilerplate-importer',
        'copy',
        'substitute:html',
        'useminPrepare',
        'add_module_banners',
        'concat',

        // Compile the stylesheets
        // Note: when this happens we need to run concat:generated a second time to make sure we
        // concatenate any results from the sass preprocessor
        'sass',
        'substitute',
        'concat:generated',
        'usemin'
    ]);

    // Run the whole lot
    grunt.registerTask('all', ['build', 'optimise', 'test']);

    grunt.registerTask('default', ['build']);
};