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

        html: {
            expand: true,
            cwd: '<%= config.source %>/html/',
            dest: '<%= config.dest %>',
            src: '*.html'
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

    tasks.sass = {
        dist: {
            options: {
                includePaths: [
                    '<%= bowerrc.directory %>',
                   '<%= config.source %>/styles/imports/',
                   __dirname
                ]
            },
            files: [{
                src: '**/*.css',
                expand: true,
                cwd: '<%= config.tmp %>/styles',
                dest: '<%= config.dest %>/styles'
            }]
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

    // Task to sub in the output of one HTML file into the contents of another
    // e.g. dist/index.html has a keyword of {{_head_html}}
    //    - the content of the file _head.html is subbed in allowing for re-use of common HTML patterns that only run
    //       directives once
    grunt.registerTask('substitute_file_fragments', 'Sub in the output of a dist/*.html file with the content of another', function () {

        // Get a list of files and determine what may need to be replaced
        var files = grunt.file.expand(grunt.config('config').dest + '/*.html');
        var subs = _.map(files, function (file) {
            var subName = file.replace(/\./, '_').replace(grunt.config('config').dest + '/', '');
            if (subName.match(/^_/)) {
                return {
                    name: subName,
                    content: grunt.file.read(file)
                };
            }
            return false;
        });
        subs = _.compact(subs);
        // Perform the replacements
        // This happens once for each _ prefixed file, not ideal but it works
        files.forEach(function (file) {
            if (file.match(/\/_/)) {
                return;
            }//end if
            subs.forEach(function (sub) {
                var content = grunt.file.read(file);
                var keyword = new RegExp('{{' + sub.name + '}}', 'gim');
                var newContent = content.replace(keyword, sub.content);
                if (content !== newContent) {
                    grunt.log.writeln('Replacing ' + sub.name.green + ' in file ' + file.cyan);
                    grunt.file.write(file, newContent);
                }//end if
            });
        });
    });

    // Build only the tasks necessary when JS is edited
    grunt.registerTask('build_js', [
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
        'usemin',
        'substitute_file_fragments',
        'clean:distFragments'
    ]);

    // Defer load of required npm tasks
    grunt.registerTask('build', [
        'copy:html',
        'regex-replace:comments',
        'substitute:html',
        'boilerplate-importer',
        'newer:copy:files',
        'newer:copy:favicon',
        'newer:copy:moduleFiles',
        'newer:copy:moduleCSSFiles',
        'newer:copy:moduleFonts',
        'sass',
        'useminPrepare',
        'add_module_banners',
        'concat',
        'substitute',
        'regex-replace',
        'usemin',
        'substitute_file_fragments',
        'clean:distFragments'
    ]);

    // Run the whole lot
    grunt.registerTask('all', ['build', 'optimise', 'test']);

    grunt.registerTask('default', ['build']);

    require('jit-grunt')(grunt, {
        validation:             'grunt-html-validation',
        substitute:             'tasks/boilerplate-substitute.js',
        htmlcs:                 'tasks/htmlcs.js',
        'boilerplate-importer': 'tasks/boilerplate-importer.js'
    });

    // Not compatible with jit-grunt
    grunt.loadNpmTasks('grunt-usemin');
};