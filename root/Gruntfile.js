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
        src: ['<banner:meta.banner>', 'source/core/js/global.js'],
        dest: 'dist/js/global.js'
      }
    },

    sass: {
      dist: {
        files: {
          'dist/css/global/global.css': 'source/core/css/global.scss',
          'dist/css/medium/medium.css': 'source/core/css/medium.scss',
          'dist/css/wide/wide.css': 'source/core/css/wide.scss'
        }
      }
    },

    watch: {
      files: '<config:sass.dist.files>',
      tasks: 'sass'
    },

    copy: {
      main: {
        files: [
          {src: ['*.js', '!global.js'], dest: 'dist/js/', cwd: 'source/core/js/', expand: true}
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
          "window": true
        }
      },
      all: ['Gruntfile.js', 'source/core/js/global.js']
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
  grunt.registerTask('default', ['jshint','clean', 'sass', 'copy', 'concat']);

};
