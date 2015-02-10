'use strict';

module.exports = function (grunt) {
    var path = require('path');
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

    var handlebars = require('handlebars');

    ///////////////////
    // Configuration //
    ///////////////////
    tasks.config  = grunt.file.readJSON('config.json');
    tasks.bower   = grunt.file.readJSON('bower.json');
    tasks.bowerrc = grunt.file.readJSON('.bowerrc');
    tasks.pkg     = grunt.file.readJSON('package.json');

    ////////////////////////
    // Documentation Mode //
    ////////////////////////
    var docMode = grunt.option('docs') || grunt.option('doc');
    if (docMode) {
        grunt.log.writeln('=== Documentation Mode ==='.yellow);

        // Hard code the destination directory
        tasks.config.dest = 'doc';
    }

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

    // Which HTML files to build
    var htmlFiles = [].concat(grunt.option('file') ?
        // if --file name.html is specified
        ['<%= config.source %>/html/' + grunt.option('file')] :
        // else build all *.html files without _ prefix
        [
            '<%= config.source %>/html/*.html',
            '!<%= config.source %>/html/_*.html'
        ]);

    // Documentation mode changes the files we need to source from
    if (docMode) {
        htmlFiles = ['<%= config.source %>/html/docs/*.html'];
    }

    // Analyses import directives and creates appropriate output
    tasks.boilerplate = {
        html: {
            options: {
                dest: tasks.config.dest,
                prefixes: {
                    module: [
                        tasks.config.source + '/modules/',
                        tasks.bowerrc.directory + '/' + tasks.config.module_prefix,
                    ],
                    bower:  [tasks.bowerrc.directory + '/'],
                    source: [tasks.config.source + '/'],
                    tmp:    [tasks.config.tmp + '/'],
                    dist:   [tasks.config.dest + '/']
                },
                sass: {
                    includePaths: [
                       tasks.bowerrc.directory,
                       tasks.config.source + '/styles/imports/',
                       __dirname
                    ]
                },
                banner:  function(file, content) {
                    var basename = path.basename(file);
                    var dirname  = path.dirname(file);
                    var isModule = (file.indexOf(tasks.config.source + '/modules/') !== -1)
                        || (file.indexOf(tasks.bowerrc.directory + '/squiz-module-') !== -1);

                    if (isModule) {
                        var moduleName = file.split(/\//g)[2];
                        if (/\.((s)?css|js)/.test(basename) && basename.indexOf('variables') === -1) {
                             return '\n/*-- module:' + moduleName + ' --*/\n' + content;
                        }
                    }
                    return content;
                },
                browserify: {
                    // Set this to true to enable source map comments to be
                    // written out after the browserified content
                    debug: true,

                    // Wrapped content will write out start and end inline
                    // comments to identify where the JS has been browserified
                    wrapped: true
                },
                // Intercept the markdown tree and transform it
                // markdownParser: function(tokens, file, cb) {
                //     if (/README\.md$/i.test(file)) {
                //         // Bump the heading levels by 1
                //         tokens.forEach(function(token) {
                //             if (token.type === 'heading' &&
                //                 token.hasOwnProperty('depth')) {
                //                 token.depth += 1;
                //             }
                //         });
                //     }
                //     cb(null, tokens);
                // }
            },
            files: {
                src: htmlFiles
            }
        }
    };

    // Documentation builder
    tasks.boilerplate.doc = _.extend({}, tasks.boilerplate.html, {
        options: _.extend({}, tasks.boilerplate.html.options, {
            banner:  function(file, content) {
                var basename = path.basename(file);
                var dirname  = path.dirname(file);
                var isModule = (file.indexOf(tasks.config.source + '/modules/') !== -1)
                    || (file.indexOf(tasks.bowerrc.directory + '/squiz-module-') !== -1);

                if (isModule) {
                    var moduleName = file.split(/\//g)[2];
                    var templates = {
                        moduleDemo:
                            '<section class="demo" id="{{moduleName}}">' +
                                '<div class="demo__inner">' +
                                    '{{#bower.version}}<div class="demo__git-version">Version: {{.}}</div>{{/bower.version}}' +
                                    '{{#bower._source}}<a class="demo__git-link" href="{{.}}" target="_blank"><span class="fa fa-external-link"></span> Gitlab</a>{{/bower._source}}' +
                                    '{{&content}}' +
                                    '<div class="demo__bower">' +
                                    '{{#bower.dependencies}}<h2>Bower Dependencies</h2><ul>{{/bower.dependencies}}' +
                                    '{{#each bower.dependencies}}' +
                                        '<li>{{@key}} (version: {{this}})</li>' +
                                    '{{/each}}' +
                                    '{{#bower.dependencies}}</ul>{{/bower.dependencies}}' +
                                    '</div>' +
                                    '<div class="demo__example">' +
                                        '<h2>Examples</h2>' +
                                        '<!-- import:content {{moduleDir}}/html/*.html -->' +
                                    '</div>' +
                                '</div>' +
                            '</section>'
                    };

                    var tplvars = {
                        moduleName: moduleName,
                        content: content,
                        moduleDir: dirname
                    };

                    // Bower info
                    var bowerFile = path.join(dirname, '.bower.json');
                    if (grunt.file.exists(bowerFile)) {
                        tplvars.bower = JSON.parse(grunt.file.read(bowerFile));
                    }

                    // Demo markdown content
                    if (basename === 'README.md') {
                        var demoContent = handlebars.compile(templates.moduleDemo)(tplvars);
                        return demoContent;
                    }
                }
                return content;
            }
        })
    });

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
                    '<%= config.source %>/modules/*/css/files/*.*',
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
                    '<%= config.source %>/modules/*/files/*.*',
                    '<%= bowerrc.directory %>/squiz-module-*/files/*.*'
                ],
                expand: true,
                flatten: true,
                dest: '<%= config.dest %>/<%= config.file_dest %>/'
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

    tasks.assemble = {
        options: {
            flatten:true,
            partials: ['<%= config.source %>/html/fragments/**/*.hbs'],
            layout: ['<%= config.source %>/html/layouts/default.hbs'],
            data: ['<%= config.source %>/html/data/*.{json,yml}']
        },
        pages: {
            files: {
                // Assemble from temp into dist
                '<%= config.dest  %>/': ['<%= config.source  %>/html/pages/*.hbs']
            }
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
                '<%= config.source %>/html/**/*.{html,hbs,json,yml}',
                '<%= config.source %>/modules/**/html/*.html',
                '<%= config.source %>/styles/{,*/}*.scss',
                '<%= config.source %>/modules/**/*.md',
                '<%= config.source %>/modules/**/css/*.scss',
                '<%= bowerrc.directory %>/squiz-module-*/*.md',
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
        (docMode) ? 'boilerplate:doc' : 'boilerplate:html',
        'substitute',
        'assemble',
        'clean:distFragments'
    ]);

    // Defer load of required npm tasksass
    grunt.registerTask('build', [
        'substitute:html',
        (docMode) ? 'boilerplate:doc' : 'boilerplate:html',
        'newer:copy:files',
        'newer:copy:favicon',
        'newer:copy:moduleFiles',
        'newer:copy:moduleCSSFiles',
        'newer:copy:moduleFonts',
        'substitute',
        'assemble',
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