/*global module:false, console:false*/
module.exports = function(grunt) {

  // Files to concatenate (this gets populated below)
  var pluginFiles    = [];
  var initFiles      = [];

  // Module JS keyword replacement
  var moduleKeywords = {
    toc: ''
  };

  (function(){
    // The order of this will determine how module associated JS files are
    // concatenated and labelled in the resulting global.js and plugin.js
    // Commenting out any of these modules will cause it to be omitted from
    // compilation
    var JSCompiler = {
      // Core initialisation functions
      'core-init': {
        global: ['source/core/js/core-init.js']
      },

      // Tabs module
      'tabs': {
        global: ['source/modules/tabs/js/init.js'],
        plugin: ['source/modules/tabs/js/plugin.js']
      },

      // Overlay Module
      'overlay': {
        //global: ['source/core/modules/overlay/js/init.js'],
        plugin: ['source/modules/overlay/js/plugin.js']
      }
  };

    var count          = 1; // A simple counter
    var startingNum    = 2; // The module numbering in the js file starts at
    var friendlyName   = ''; // Converted friendly name of the module

    // This will generate the necessary file list of module JS files and assign
    // some numbered labels and table of contents based on those enabled in the
    // JSCompiler variable.
    for (var name in JSCompiler) {

      // Make the presentation of the name a bit nicer.
      friendlyName = name.charAt(0).toUpperCase() + name.slice(1);
      friendlyName = friendlyName.replace('_', ' ');

      // Global init files
      if (JSCompiler[name].hasOwnProperty('global') &&
          Array.isArray(JSCompiler[name].global)) {

        initFiles = initFiles.concat(JSCompiler[name].global);

        // Build the numbered labels and table of contents
        moduleKeywords[name] = '2.' + count + '. ' + friendlyName;
        moduleKeywords.toc += " *     2." + count + ". " + friendlyName + "\n";
      }//end if

      // Plugin files
      if (JSCompiler[name].hasOwnProperty('plugin') &&
          Array.isArray(JSCompiler[name].plugin)) {
        pluginFiles = pluginFiles.concat(JSCompiler[name].plugin);
        moduleKeywords[name] = '2.' + count + '. ' + friendlyName;
      }//end if

      count ++;
    }//end for

    // Trim the last newline character
    moduleKeywords.toc = moduleKeywords.toc.slice(0,-1);
  }());

  moduleKeywords.version = '<%= pkg.version %>';
  moduleKeywords.date = '<%= grunt.template.today() %>';

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      dist: {
        options: {
          separator: "\n\n"
        },
        src: ['source/core/js/global.js'].concat(initFiles),
        dest: 'dist/js/global.js'
      },
      plugins: {
        options: {
          separator: "\n\n"
        },
        src: pluginFiles,
        dest: 'dist/js/plugins.js'
      }
    },

    // Replace keywords in the generated .js files.
    replace: {
      dist: {
        options: {
          variables: moduleKeywords,
          prefix: '@@'
        },
        files: [
          {expand: true, flatten: true, src: ['dist/js/global.js', 'dist/js/plugins.js'], dest: 'dist/js/'},
          {src: ['**/*.css'], dest: 'dist/css/', cwd: 'dist/css/',
            expand: true, flatten: true}
        ]
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
    clean: ["dist", ".sass-cache"]
  });

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
  grunt.registerTask('build', ['clean', 'sass', 'copy', 'concat', 'replace']);
  grunt.registerTask('default', ['jshint', 'qunit', 'clean', 'sass', 'copy', 'concat', 'replace']);

};