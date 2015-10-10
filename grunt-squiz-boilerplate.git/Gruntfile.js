module.exports = function(grunt) {
    'use strict';

    grunt.initConfig({
        jshint: {
            options: {
                node: true
            },
            all: [
                'Gruntfile.js',
                'tasks/*.js',
                'lib/**/*.js',
                '<%= nodeunit.tests %>'
            ]
        },
        boilerplate: {
            main: {
                options: {
                    dest: 'dist',
                    filePrefixes: {
                        dist:   'dist/',
                        bower:  'test/fixtures/source/bower_components/',
                        source: 'test/fixtures/source/',
                        tmp:    '.tmp/',
                        module: [
                            'test/fixtures/source/bower-components/squiz-module-',
                            'test/fixtures/source/modules/'
                        ]
                    },
                    sass: {
                        includePaths: [
                            'test/fixtures/source/bower_components',
                            'test/fixtures/source/styles'
                        ]
                    },
                    banner: function(file) {
                        return null;
                    }
                },
                files: {
                    src: [
                        'test/fixtures/source/html/*.html',
                        '!test/fixtures/source/html/_*.html'
                    ],
                }
            }
        },
        clean: {
            all: [
                'dist',
                '.tmp'
            ]
        },
        nodeunit: {
            tests: ['test/*_test.js']
        }
    });

    grunt.loadTasks('tasks');

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');

    grunt.registerTask('build', ['clean', 'boilerplate']);
    grunt.registerTask('test', ['clean', 'nodeunit']);
    grunt.registerTask('default', ['jshint', 'build']);
};