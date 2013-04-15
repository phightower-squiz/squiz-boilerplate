/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '/* Temp banner */'
    },

    concat: {
      dist: {
        src: ['source/core/js/global.js',
              'source/modules/**/js/*.js' // All modules
             ],
        dest: 'dist/js/global.js'
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
      files: ['source/core/css/*.scss', 'modules/**/css/*.scss'],
      tasks: 'build'
    },

    copy: {
      main: {
        files: [
          {src: ['*.js', '!global.js'], dest: 'dist/js/', cwd: 'source/core/js/', expand: true},
          {src: ['*.html'], dest: 'dist/', cwd: 'source/core/html/', expand: true}
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
          "squizImp": true,
          "$": true
        }
      },
      all: ['Gruntfile.js', 'source/core/js/global.js', 'source/modules/**/js/*.js']
    },

    // Clean the sass cache & distribution directories
    clean: ["dist", ".sass-cache"]
  });

  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Tasks
  grunt.registerTask('reset', ['clean']);
  grunt.registerTask('build', ['clean', 'sass', 'copy', 'concat']);
  grunt.registerTask('default', ['jshint','clean', 'sass', 'copy', 'concat']);

};