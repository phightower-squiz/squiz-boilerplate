/*global module:false, console:false, require:false*/
var Boilerplate = require('./lib/boilerplate.js');
module.exports = function(grunt) {

    // Tasks.
    var tasks = {};

    //////////////////
    // Package JSON //
    //////////////////
    var pkg = tasks.pkg = grunt.file.readJSON('package.json');

    ///////////////////
    // Configuration //
    ///////////////////
    if (!grunt.file.exists('config.json')) {
        throw "Missing config.json required file";
    }//end if
    var config = grunt.file.readJSON('config.json');

    ////////////////////////////
    // The Boilerplate Helper //
    ////////////////////////////
    var bp = new Boilerplate(config, pkg);

    // Default external NPM tasks to be loaded.
    var npmTasks = [
        'grunt-contrib-sass',
        'grunt-contrib-concat',
        'grunt-contrib-copy',
        'grunt-contrib-jshint',
        'grunt-contrib-qunit',
        'grunt-contrib-watch',
        'grunt-contrib-clean',
        'grunt-contrib-uglify',
        'grunt-html-validation',
        'grunt-markdown',
        'grunt-jsbeautifier',
        'grunt-prettify',
        'grunt-replace'
    ];

    ////////////////
    // Copy Files //
    ////////////////
    tasks.copy = {

        // Core sass files into the tmp directory
        core_sass: {
            files: [
                {
                    src: ['*.scss'],
                    dest: config.temp_dir + '/',
                    cwd:  config.source.core + 'css/',
                    expand: true
                }
            ]
        },

        // Copy across core HTML files
        core_html: {
            files: [
                {
                    src: ['*.html'],
                    dest: config.destination + '/',
                    cwd:  config.source.core + 'html/',
                    expand: true
                }
            ]
        },

        // Copy across core javascripts
        core_js: {
            files: [
                {
                    src: ['*.js'],
                    dest: config.destination + '/js/',
                    cwd:  config.source.core + 'js/',
                    expand: true
                }
            ]
        },

        // Copy across core files
        core_files: {
            files: [
                {
                    src: ['*.*'],
                    dest: config.destination + '/' + config.file_dest + '/',
                    cwd:  config.source.core + 'files/',
                    expand: true
                }
            ]
        },

        // Get any associated files for module CSS
        module_css_files: {
            files: bp.getAssociatedCSSFiles()
        },

        module_files: {
            files: [
                {
                    src: ['**/files/*.*'],
                    dest: config.destination + '/' + config.file_dest + '/',
                    cwd:  config.source.modules,
                    expand: true,
                    flatten: true
                }
            ]
        }
    };

    //////////////
    // Markdown //
    //////////////
    // Turn markdown file into source HTML
    tasks.markdown = {
        docs: {
            files: [
                {
                    expand: true,
                    src: '*.md',
                    dest: config.destination,
                    ext: '.html'
                }
            ]
        }
    };

    ////////////
    // Concat //
    ////////////
    // @todo Remove duplication
    // @todo Replace module comment with a template

    // Table of contents entries
    tasks.js_toc = {
        global: [],
        plugins: []
    };

    tasks.concat = {
        global_js: {
            options: {
                process: function(src, filePath) {
                    var moduleName = bp.getModuleNameFromPath(filePath);
                    tasks.js_toc.global.push(" *     " + moduleName);
                    return "\n/*-- " + moduleName + " --*/\n" + src;
                }
            },
            files: bp.getGlobalJS()
        },
        plugins_js: {
            options: {
                process: function(src, filePath) {
                    var moduleName = bp.getModuleNameFromPath(filePath);
                    tasks.js_toc.plugins.push(" *     " + moduleName);
                    return "\n/*-- " + moduleName + " --*/\n" + src;
                }
            },
            files: bp.getPluginsJS()
        }
    };

    /////////////
    // Plugins //
    /////////////
    // Process plugin dependencies
    tasks.plugins = {
        dist: {
            modules: config.modules,
            dest: config.destination + '/js/plugins.js',
            libPath: config.source.libs,
            modulePath: config.source.modules
        }
    };

    /////////////////
    // JS Beautify //
    /////////////////
    tasks.jsbeautifier = {
        files : [config.destination + "/js/global.js"],
        options : {
            braceStyle: "collapse",
            breakChainedMethods: true,
            e4x: false,
            evalCode: false,
            indentChar: " ",
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

    //////////
    // Sass //
    //////////
    tasks.sass = {

        // Core sass files containing module content (global, medium, wide)
        main: {
            options: {
                style: 'expanded',
                loadPath: [
                    'source/core/css/',
                    '/'
                ]
            },
            files: bp.getSassTaskFileList()
        }
    };

    ///////////
    // Watch //
    ///////////
    // Watch all source files for changes and trigger appropriate
    // build tasks.
    tasks.watch = {
        sass: {
            files: ['source/**/*.scss'],
            tasks: 'build_css'
        },
        html: {
            files: ['source/**/*.html'],
            tasks: 'build_html'
        },
        javascript: {
            files: ['source/**/*.js', 'source/**/*.json', '!source/**/*.min.js'],
            tasks: 'build_js'
        },
        config: {
            files: ['*.json'],
            tasks: 'build'
        },
        docs: {
            files: ['*.md'],
            tasks: 'build_docs'
        }
    };

    //////////////
    // Clean Up //
    //////////////
    // Clean the sass cache & distribution directories
    tasks.clean = {
        dist: [config.destination], // This one will remove all dist files, be careful with it.
        tmp:  [config.temp_dir, ".sass-cache"]
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
            cwd: config.destination,
            ext: '.html',
            src: ['*.html'],
            dest: config.destination
        }
    };

    ////////////
    // Minify //
    ////////////
    // Automatic minification for known targets
    tasks.uglify = {
        plugins: {
            options: {
                banner: "/* Generated: <%= grunt.template.today('yyyy-mm-dd') %> */\n"
            },
            files: bp.getFilesToMinify()
        }
    };

    //////////////
    // Keywords //
    //////////////
    tasks.replace = {
        sass:    bp.getSassModuleReplacements(),
        html:    bp.getHTMLModuleReplacements(),
        css_tags:     {
            options: {
                patterns: [
                    {
                    match: 'css',
                    replacement: bp.buildCSSTags()
                    }
                ]
            },
            files: [
                {
                    src: ['*.html'],
                    expand: true,
                    cwd: config.destination,
                    dest: config.destination
                }
            ]
        },
        javascript: {
            options: {
                patterns: [
                    {
                        match: 'version',
                        replacement: '<%= pkg.version %>'
                    },
                    {
                        match: 'date',
                        replacement: '<%= grunt.template.today() %>'
                    },
                    {
                        match: 'global_js_toc',
                        replacement: '<%= js_toc.global.join("\\n") %>'
                    },
                    {
                        match: 'plugins_js_toc',
                        replacement: '<%= js_toc.plugins.join("\\n") %>'
                    }
                ]
            },
            files: [
                {
                    src: ['*.js'],
                    expand: true,
                    cwd: config.destination + '/js/',
                    dest: config.destination + '/js/'
                }
            ]
        },
        module_js: {
            options: {
                prefix: '//@@',
                patterns: [
                    {
                        match: 'global_modules',
                        replacement: "<%= grunt.file.read('" + config.temp_dir + "/global.js') %>"
                    },
                    {
                        match: 'plugin_modules',
                        replacement: "<%= grunt.file.read('" + config.temp_dir + "/plugins.js') %>"
                    }
                ]
            },
            files: [
                {
                    src: ['*.js'],
                    expand: true,
                    cwd:  config.destination + '/js/',
                    dest: config.destination + '/js/'
                }
            ]
        },
        files_location: {
            options: {
                patterns: [
                    {
                        match: 'files',
                        replacement: config.file_dest
                    }
                ]
            },
            files: [
                {
                    src: ['*.html', 'css/**/*.css'],
                    expand: true,
                    cwd:  config.destination + '/',
                    dest: config.destination + '/'
                }
            ]
        }
    };

    ////////////////
    // JS Linting //
    ////////////////
    tasks.jshint = {
        options: {
            curly: true,
            eqeqeq: true,
            immed: true,
            latedef: true,
            newcap: true,
            noarg: true,
            sub: true,
            undef: true,
            boss: true,
            eqnull: true,
            globals: {
                "jQuery": true,
                "document": true,
                "window": true,
                "Modernizr": true,
                "clearInterval": true,
                "setTimeout": true,
                "setInterval": true,
                "$": true
            }
        },
        all: [
            'Gruntfile.js',
            '*.json',
            (config.destination + '/js/global.js'),
            (config.source.modules + '/**/js/*.js'),

            // Exclusions
            '!' + config.source.libs + '/**',
            '!' + config.source.modules + '/**/js/jquery.*.js', // 3rd party jQuery plugins
            '!' + config.source.modules + '/**/js/bootstrap*.js',
            '!' + config.source.modules + '/**/js/*.min.js'
        ]
    };

    //////////////////
    // Unit Testing //
    //////////////////
    // Unit tests that require the DOM
    tasks.qunit = {
        all: [
            config.source.modules + '/**/tests/*.html',
            config.source.libs + '/**/tests/*.html'
        ]
    };

    ///////////////////////
    // HTML Code Sniffer //
    ///////////////////////
    tasks.htmlcs = {
        dist: {
            options: {
                standard: 'WCAG2AA'
            },
            files: [
                // Run HTML CS across examples
                // {src: config.destination + '/examples/**/index.html'},
                {
                    src: ['*.html',
                          '!*parse.html',
                          '!parse*',
                          '!README.html'],
                    cwd: config.destination,
                    expand: true
                }
            ]
        }
    };

    /////////////////////
    // HTML Validation //
    /////////////////////
    // W3C Validator checks - not to be confused with HTMLCS
    tasks.validation = {
        options: {

        },
        files: {
            src: ['*.html',
                  '!*parse.html',
                  '!parse*',
                  '!README.html'],
            cwd: config.destination,
            expand: true
        }
    };

    /////////////////////////
    // Image Optimisations //
    /////////////////////////
    // https://github.com/heldr/grunt-img
    // If the grunt-img npm module is installed images will be automatically
    // optimised by this task
    // Note: this task can take quite a while to run, it's best to leave it to the end
    // and run it separately when ready to publish. Run with 'grunt img'.
    if (grunt.file.isDir('node_modules/grunt-img')) {
        npmTasks.push('grunt-img');
        tasks.img = {
            css_files: {
                src: [config.destination + '/css/**/**/*.jpg',
                      config.destination + '/css/**/**/*.png',
                      config.destination + '/css/**/**/*.jpeg']
            },
            dist_files: {
                src: [config.destination + '/files/*.jpg',
                      config.destination + '/files/*.png',
                      config.destination + '/files/*.jpeg']
            }
        };
    }//end if

    // Project configuration.
    grunt.initConfig(tasks);

    // Load the tasks.
    grunt.loadTasks('tasks');
    npmTasks.forEach(function(task){
        grunt.loadNpmTasks(task);
    });

    ///////////
    // Tasks //
    ///////////

    // Reset the generated files.
    // Alias to 'clean'
    grunt.registerTask('reset', ['clean']);

    ////////////////
    // Test Tasks //
    ////////////////
    grunt.registerTask('test', ['jshint', 'qunit', 'htmlcs', 'validation']);

    /////////////////
    // Build tasks //
    /////////////////

    // Build CSS from Sass source
    grunt.registerTask('build_css',
        ['copy:core_sass', 'replace:sass', 'sass',
         'replace:files_location', 'clean:tmp']);

    // Build HTML from source core and module files
    grunt.registerTask('build_html',
        ['copy:core_html', 'replace:html', 'replace:css_tags',
         'replace:files_location', 'prettify']);

    // Build JavaScript //
    grunt.registerTask('build_js',
        ['copy:core_js', 'concat:global_js', 'uglify:plugins',
         'concat:plugins_js', 'plugins', 'replace:module_js',
         'replace:javascript', 'jsbeautifier', 'clean:tmp']);

    // Build any associated binary files
    grunt.registerTask('build_files',
        ['copy:core_files', 'copy:module_files', 'copy:module_css_files']);

    // Build documents from markdown into html and inject it into any HTML document
    // that contains the document keyword replacements.
    grunt.registerTask('build_docs', ['markdown:docs', 'prettify']);

    // The main build task. Special attention needs to be paid to the order in
    // which the tasks are run, many tasks require previously run tasks.
    grunt.registerTask('build',
        ['build_css', 'build_html', 'build_js', 'build_files', 'build_docs']);

    // Default without any arguments
    grunt.registerTask('default', ['build']);
};