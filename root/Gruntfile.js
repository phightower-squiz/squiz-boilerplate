/*global module:false, console:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // Combines known module patterns into prefined output into a temp directory
    module: {
      dist: {
        // Add and remove module names from this array to decide which modules are
        // automatically included in the final build. Any associated JS plugins and CSS
        // will appear in a numbered format in the output.
        modules: [
          'breadcrumbs',
          'button',
          'overlay',
          'skip_links',
          'responsive_image',
          'responsive_video',
          'tabs'
        ]
      }
    },

    // Replace keywords in the generated .js files.
    replace: {
      dist: {
        options: {
          variables: {
            version: '<%= pkg.version %>',
            date:    '<%= grunt.template.today() %>'
          }
        },
        files: [
          {expand: true, flatten: true, src: ['dist/js/global.js', 'dist/js/plugins.js'],
            dest: 'dist/js/'},
          {src: ['**/*.css'], dest: 'dist/css/', cwd: 'dist/css/',
            expand: true, flatten: false}
        ]
      },

      // Global CSS module numbering system
      global_css: {
        options: {
          variables: {
            num: "5"
          }
        },
        files: [
          {expand: true, flatten: true, src: ['dist/css/global/global.css'],
          dest: 'dist/css/global/'}
        ]
      },

      // Global JS module numbering system
      global_js: {
        options: {
          variables: {
            num: "3"
          }
        },
        files: [
          {expand: true, flatten: true, src: ['dist/js/global.js'],
          dest: 'dist/js/'}
        ]
      },

      // Other files module numbering system
      others: {
        options: {
          variables: {
            num: "1"
          }
        },
        files: [
          {expand: true, flatten: true, src: ['dist/js/plugins.js'],
          dest: 'dist/js/'},
          {expand: true, flatten: true, src: ['dist/css/medium/*.css'],
          dest: 'dist/css/medium/'},
          {expand: true, flatten: true, src: ['dist/css/wide/*.css'],
          dest: 'dist/css/wide/'}
        ]
      }
    },

    sass: {
      dist: {
        options: {
          style: 'expanded',

          // We need extra load paths to account for the source being in the modules
          // tmp folder
          loadPath: [
            'source/core/css/',
            '/'
          ]
        },
        files: {
          'dist/css/global/global.css': 'tmp/global.scss',
          'dist/css/medium/medium.css': 'tmp/medium.scss',
          'dist/css/wide/wide.css':     'tmp/wide.scss'
        }
      }
    },

    watch: {
      files: ['source/**/*.scss', 'source/**/*.js'],
      tasks: 'build'
    },

    copy: {
      main: {
        files: [
          // Copy any JS files not being concatenated.
          {src: ['*.js', '!global.js', '!plugin.js'], dest: 'dist/js/',
            cwd: 'source/core/js/', expand: true},

          // Copy the JS files from the module tmp folder into distribution
          {src: ['*.js'], dest: 'dist/js/', cwd: 'tmp/', expand: true},

          // Copy any HTML example files across.
          {src: ['*.html'], dest: 'dist/', cwd: 'source/core/html/', expand: true},
          {src: ['**/html/*.html'], dest: 'dist/examples/', cwd: 'source/modules/', expand: true},

          // Copy any core files across.
          {src: ['*'], dest: 'dist/files/', cwd: 'source/core/files/', expand: true},

          // Copy any associated css files (images) into the correct location.
          {src: ['**/css/global/*.png', '**/css/global/*.gif', '**/css/global/*.jpeg', '**/css/global/*.jpg'],
            dest: 'dist/css/global/files/', cwd: 'source/modules/', expand: true, flatten: true},
          {src: ['**/css/medium/*.png', '**/css/medium/*.gif', '**/css/medium/*.jpeg', '**/css/medium/*.jpg'],
            dest: 'dist/css/medium/files/', cwd: 'source/modules/', expand: true, flatten: true},
          {src: ['**/css/wide/*.png', '**/css/wide/*.gif', '**/css/wide/*.jpeg', '**/css/wide/*.jpg'],
            dest: 'dist/css/wide/files/', cwd: 'source/modules/', expand: true, flatten: true}
        ]
      }
    },

    jshint: {
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
          "Squiz": true,
          "$": true
        }
      },
      all: ['Gruntfile.js', 'source/core/js/global.js', 'source/modules/**/js/*.js']
    },

    // Unit tests that require the DOM
    qunit: {
      all: ['source/modules/**/tests/*.html']
    },

    // Clean the sass cache & distribution directories
    clean: {
      dist: ["dist", ".sass-cache"],
      tmp:  ["tmp"]
    }
  });

  grunt.loadTasks('tasks');

  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-replace');

  // Tasks
  grunt.registerTask('reset', ['clean']);
  grunt.registerTask('default', [
    // Testing
    'jshint',
    'qunit',
    // After test begin the build
    'clean',
    'module',
    'sass',
    'copy',
    'replace',
    // Clean up after the build
    'clean:tmp'
  ]);

};