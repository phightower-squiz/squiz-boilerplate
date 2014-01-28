'use strict';

module.exports = function (grunt) {

    // Load grunt tasks automatically
    //require('load-grunt-tasks')(grunt, {pattern: ['grunt-*', '!grunt-lib-*']});

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
                dest: '<%= config.dest %>',
                ignored: tasks.config.bower_ignore
            },
            files: [{
                src: [
                    '<%= config.dest %>/*.html'
                ]
            }]
        }
    };

    tasks.copy = {
        files: {
            files: [{
                src: ['*.*'],
                dest: '<%= config.dest %>/<%= config.file_dest %>/',
                cwd:  '<%= config.source %>/files/',
                expand: true
            }]
        },

        moduleFonts: {
            files: [{
                src: [
                    // If we have bower modules that contain fonts we need to copy
                    // them into the destination CSS directory
                    '**/fonts/*.*'
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

        html: {
            expand: true,
            cwd: '<%= config.source %>/html/',
            dest: '<%= config.dest %>',
            src: '*.html'
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
        }
    };

    tasks.useminPrepare = {
        options: {
            dest: '<%= config.dest %>',
            root: __dirname,
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

    tasks['regex-replace'] = {
        // Looks for comment syntax of <!--@@ ... @@--> to replace in html files
        comments: {
            src: [tasks.config.dest + '/*.html'],
            actions: [{
                name: 'internal',
                search: /([\s\t]*)?<\!--@@(?:[^@@]+)@@-->/gm,
                replace: ''
            }]
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
                '<%= bowerrc.directory %>/squiz-module-*/css/*.scss'
            ],
            tasks: ['build']
        }
    };

    tasks.compass = {
        options: {
            sassDir: '<%= config.tmp %>/styles',
            cssDir: '<%= config.dest %>/styles',
            generatedImagesDir: '<%= config.tmp %>/images/generated',
            javascriptsDir: '<%= config.dest %>/js',
            imagesDir: '<%= config.dest %>/styles/<%= config.file_dest %>',
            httpImagesPath: '<%= config.dest %>/<%= config.file_dest %>',
            httpFontsPath: '<%= config.dest %>/styles/<%= config.file_dest %>',
            importPath: [
                '<%= bowerrc.directory %>',
                '<%= config.source %>/styles/imports/',
                __dirname
            ],

            // Whether to output debugging info
            debugInfo: false,

            // Set this to false if you want the CSS to include comments on where the rule came
            // from in the source .scss file
            noLineComments: true,

            // nested|expanded|compact|compressed
            outputStyle: 'expanded',

            relativeAssets: false,
            assetCacheBuster: false
        },
        dist: {
            // No special config
        }
    };

    grunt.initConfig(tasks);

    // Load any tasks from the tasks directory
    grunt.loadTasks('tasks');

    // Load global tasks
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Run optimisation tasks
    grunt.registerTask('optimise', [], function() {
        _.each([
            'grunt-contrib-imagemin',
            'grunt-contrib-cssmin',
            'grunt-contrib-uglify',
            'grunt-svgmin',
            'grunt-htmlmin',
            'grunt-modernizr',
            'grunt-jsbeautifier',
            'grunt-prettify'
        ], function(task) {
            grunt.loadNpmTasks(task);
        });
        grunt.task.run([
            'modernizr',
            'cssmin',
            'imagemin',
            'svgmin',
            'uglify',
            'prettify',
            'jsbeautifier'
        ]);
    });

    ///////////
    // Tests //
    ///////////

    // Code Quality Tests
    grunt.registerTask('test', [], function () {
        grunt.loadNpmTasks('grunt-contrib-jshint');
        grunt.loadNpmTasks('grunt-contrib-qunit');
        grunt.loadNpmTasks('grunt-html-validation');
        grunt.task.run(['jshint', 'validation', 'htmlcs', 'qunit']);
    });

    // Setup test config
    grunt.registerTask('set_test_config', 'Alter the configuration for testing', function () {

        // Copy the html source file into it's location for testing. It'll be picked up
        // by the default build functions
        var htmlSourceFile = grunt.config('config').source + '/html/_test.html';
        grunt.file.copy('test/fixtures/index.html', htmlSourceFile);
        grunt.config('boilerplate-importer').html.files = htmlSourceFile;
        grunt.config('copy').html.src = '_test.html';

        // These variables are output to the resulting template by default, replace them
        // with something expected that can be tested
        tasks.pkg.version = '0.0.0';
        tasks.pkg.name = 'boilerplate-test';
        var sub = grunt.config('substitute');
        sub.template.options.replacements = _.extend(sub.template.options.replacements, tasks.pkg);
        sub.html.options.replacements = _.extend(sub.html.options.replacements, tasks.pkg);
        grunt.config('substitute', sub);

        // Output a predictable file destination variable
        grunt.config('config').file_dest = 'files';
    });

    tasks.nodeunit = {
        all: ['test/*.js']
    };

    // Build tests
    grunt.registerTask('build_test', [], function () {
        grunt.loadNpmTasks('grunt-contrib-nodeunit');
        grunt.task.run([
            'clean:test',
            'clean:tmp',
            'set_test_config',
            'build',
            'nodeunit',
            'clean:test'
        ]);
    });

    // HTTP server
    grunt.registerTask('serve', function () {
        grunt.loadNpmTasks('grunt-contrib-connect');
        grunt.task.run([
            'build',
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
                    if (filePath.indexOf(tasks.config.source + '/modules') !== -1 ||
                        filePath.indexOf(tasks.bowerrc.directory + '/squiz-module-') !== -1) {
                        var parts = filePath.split('/');
                        var module = parts[parts.length - 3]; // source/<folder>/<module_name>
                        return '\n/*-- module:' + module.replace(/^squiz\-module\-/, '') + ' --*/\n' + src;
                    }//end if
                    return src;
                }
            };
            grunt.config('concat', concatConfig);
        }//end if
    });

    // Build only the tasks necessary when JS is edited
    grunt.registerTask('build_js', [], function () {
        _.each([
            'grunt-contrib-concat',
            'grunt-contrib-copy',
            'grunt-regex-replace',
            'grunt-contrib-jshint',
            'grunt-usemin'
        ], function(task) {
            grunt.loadNpmTasks(task);
        });
        grunt.task.run([
            'jshint',
            'copy:html',
            'regex-replace:comments',
            'substitute:html',
            'boilerplate-importer',
            'useminPrepare',
            'add_module_banners',
            'concat',
            'substitute',
            'regex-replace',
            'usemin'
        ]);
    });

    // Defer load of required npm tasks
    // https://github.com/gruntjs/grunt/issues/975
    grunt.registerTask('build', [], function () {
        _.each([
            'grunt-contrib-concat',
            'grunt-contrib-copy',
            'grunt-regex-replace',
            'grunt-contrib-compass',
            'grunt-usemin',
            'grunt-newer'
        ], function(task) {
            grunt.loadNpmTasks(task);
        });
        grunt.task.run([
            'copy:html',
            'regex-replace:comments',
            'substitute:html',
            'boilerplate-importer',
            'newer:copy:files',
            'newer:copy:moduleFiles',
            'newer:copy:moduleCSSFiles',
            'newer:copy:moduleFonts',
            'compass',
            'useminPrepare',
            'add_module_banners',
            'concat',
            'substitute',
            'regex-replace',
            'usemin'
        ])
    });

    // Run the whole lot
    grunt.registerTask('all', ['build', 'optimise', 'test']);

    grunt.registerTask('default', ['build']);
};