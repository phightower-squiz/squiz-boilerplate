/*
 * grunt-contrib-sass
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 Sindre Sorhus, contributors
 * Licensed under the MIT license.
 */
'use strict';

module.exports = function (grunt) {
    grunt.initConfig({
        config: {
            tmp: 'test/tmp',
            source: 'test/fixtures',
        },
        bowerrc: {
            directory: 'test/fixtures'
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: ['Gruntfile.js', 'app/templates/tasks/*.js', '<%= nodeunit.tests %>']
        },
        clean: {
            test: ['test/tmp', '.sass-cache']
        },
        nodeunit: {
            tests: ['test/test*.js']
        },

        'boilerplate-importer': {
            html: {
                options: {
                    dest: '<%= config.tmp %>'
                },
                files: [{
                    src: [
                        '<%= config.source %>/source.html'
                    ]
                }]
            }
        },

        substitute: {
            template: {
                options: {
                    replacements: {
                        test: 'replaced'
                    }
                },
                files: [{
                    expand: true,
                    cwd: '<%= config.tmp %>',
                    src: ['*.html'],
                    dest: '<%= config.tmp %>'
                }]
            }
        }
    });

    grunt.loadTasks('app/templates/tasks');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-internal');

    grunt.registerTask('mkdir', grunt.file.mkdir);
    grunt.registerTask('test', [
        'clean',
        'boilerplate-importer',
        'substitute',
        'nodeunit'
    ]);
    grunt.registerTask('default', ['jshint', 'test']);
};