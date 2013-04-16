/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      dist: {
        options: {
          separator: "\n\n"
        },
        src: ['source/core/js/global.js',
              'source/core/js/core-*.js', // Any core modules
              'source/modules/**/js/init.js' // All modules
             ],
        dest: 'dist/js/global.js'
      },
      plugins: {
        src: ['source/modules/**/js/plugin.js'],
        dest: 'dist/js/plugins.js'
      }
    },

    sass: {
      dist: {
        options: {
          style: 'expanded'
        },
        files: {
          'dist/css/global/global.css': 'source/core/css/global.scss',
          'dist/css/medium/medium.css': 'source/core/css/medium.scss',
          'dist/css/wide/wide.css': 'source/core/css/wide.scss'
        }
      }
    },

    // Update 
    watch: {
      files: ['source/**/*.scss', 'source/**/*.js'],
      tasks: 'build'
    },

    copy: {
      main: {
        files: [
          // Copy any JS files not being concatenated.
          {src: ['*.js', '!global.js', '!core-*.js'], dest: 'dist/js/',
            cwd: 'source/core/js/', expand: true},

          // Copy any HTML example files across.
          {src: ['*.html'], dest: 'dist/', cwd: 'source/core/html/', expand: true},

          // Copy any core files across.
          {src: ['*'], dest: 'dist/files/', cwd: 'source/core/files/', expand: true},

          // Copy any associated css files (images) into the correct location.
          {src: ['**/css/*.png', '**/css/*.gif', '**/css/*.jpeg', '**/css/*.jpg'],
            dest: 'dist/css/global/files/', cwd: 'source/modules/', expand: true, flatten: true}
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
    clean: ["dist", ".sass-cache"]
  });

  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Tasks
  grunt.registerTask('reset', ['clean']);
  grunt.registerTask('build', ['clean', 'sass', 'copy', 'concat']);
  grunt.registerTask('default', ['jshint', 'qunit', 'clean', 'sass', 'copy', 'concat']);

};