/*global module:false, console:false, require:false*/
var moduleData = require('./lib/helpers/module-data.js');

module.exports = function(grunt) {

  var destDir = moduleData.destDir;

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // Combines known module patterns into prefined output into a temp directory
    module: {
      dist: {
        // Add and remove module names from this array to decide which modules are
        // automatically included in the final build. Any associated JS plugins and CSS
        // will appear in a numbered format in the output.
        modules: moduleData.modules
      }
    },

    // Process plugin dependencies
    plugins: {
      dist: {
        modules: moduleData.modules,
        dest: destDir + '/js/plugins.js'
      }
    },

    // Automatic minification for known targets
    uglify: {
      custom_plugins: {
        options: {
          banner: "/* Generated: <%= grunt.template.today('yyyy-mm-dd') %> */\n"
        },
        files: moduleData.minifyPluginFiles
      }
    },

    // Replace keywords in the generated .js files.
    replace: moduleData.keywordReplacements,

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
        files: moduleData.sassFiles
      }
    },

    // Watch all source files except minified ones.
    watch: {
      files: ['source/**/*.scss', 'source/**/*.js', 'source/**/*.html',
              'source/**/*.json', '!source/**/*.min.js'],
      tasks: 'build'
    },

    copy: {
      main: {
        files: [
          // Copy any JS files not being concatenated.
          {src: ['*.js', '!global.js', '!plugin.js'], dest: destDir + '/js/',
            cwd: 'source/core/js/', expand: true},

          // Copy the JS files from the module tmp folder into distribution
          {src: ['*.js'], dest: destDir + '/js/', cwd: 'tmp/', expand: true},

          // Copy any HTML files across.
          {src: ['*.html'], dest: destDir + '/', cwd: 'source/core/html/', expand: true},

          // Copy any core files across.
          {src: ['*'], dest: destDir + '/files/', cwd: 'source/core/files/', expand: true},

          // Copy any associated css files (images) into the correct location.
          {src: moduleData.moduleCSSFiles.global,
            dest: destDir + '/css/global/files/', cwd: 'source/modules/', expand: true, flatten: true},
          {src: moduleData.moduleCSSFiles.medium,
            dest: destDir + '/css/medium/files/', cwd: 'source/modules/', expand: true, flatten: true},
          {src: moduleData.moduleCSSFiles.wide,
            dest: destDir + '/css/wide/files/', cwd: 'source/modules/', expand: true, flatten: true}
        ]
      },
      // Copy any matrix parse files into relevant example folders
      matrix: {
        files: moduleData.exampleMatrixFiles
      },
      examples: {
        files: moduleData.exampleHTMLFiles
      },
      // Any associated files from <module>/files/*.*
      associated: {
        files: moduleData.exampleAssociatedFiles
      },

      // Copy associated files into a folder where they will also work outside
      // of the examples folder
      associated_publish: {
        files: [
          {src: ['**/files/*'], dest: destDir + '/files/', cwd: destDir + '/examples/', expand: true, flatten: true}
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
          "Modernizr": true,
          "clearInterval": true,
          "setTimeout": true,
          "setInterval": true,
          "$": true
        }
      },
      all: ['Gruntfile.js',
            'source/core/js/global.js',
            'source/modules/**/js/*.js',

            // Exclusions
            '!source/libs/**',
            '!source/modules/**/js/bootstrap*.js',
            '!source/modules/**/js/*.min.js']
    },

    // Unit tests that require the DOM
    qunit: {
      all: [
        'source/modules/**/tests/*.html',
        'source/libs/**/tests/*.html'
      ]
    },

    // Clean the sass cache & distribution directories
    clean: {
      dist: [destDir], // This one will remove all dist files, be careful with it.
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
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Non contrib npm tasks
  grunt.loadNpmTasks('grunt-replace');

  // Tasks
  grunt.registerTask('reset', ['clean']);
  grunt.registerTask('test', ['jshint', 'qunit']);
  grunt.registerTask('build', ['uglify:custom_plugins', 'module', 'sass', 'copy',
    'replace', 'plugins', 'clean:tmp']);
  grunt.registerTask('default', ['test', 'build']);

};