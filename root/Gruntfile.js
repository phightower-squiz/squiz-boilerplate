/*global module:false, console:false*/
module.exports = function(grunt) {

  // Bring in the list of modules from external source.
  var modules = grunt.file.readJSON('modules.json');

  // Gather glob patterns for each listed module. This is used in the copy
  // pattern so only files from modules listed to be installed will be copied.
  var moduleCSSFiles = {
    global: [],
    medium: [],
    wide:   []
  };

  // Some keyword replacements that the example generation can append to.
  var keywordReplacements = {
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
          num: "2"
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
  };


  // Some storage for arrays of information related to example files to generate for
  // installed modules.
  var exampleHTMLFiles = [];

  modules.forEach(function(name, i){
    // A list of module CSS associated files (images) to supply to the copy task
    // Performing this logic here ensures only installed module files are copied.
    moduleCSSFiles.global.push(name + '/css/global/*.*');
    moduleCSSFiles.medium.push(name + '/css/medium/*.*');
    moduleCSSFiles.wide.push(name + '/css/wide/*.*');

    var htmlFiles = grunt.file.expand('source/modules/' + name + '/html/*.html');
    if (htmlFiles.length) {
      // Create HTML examples
      exampleHTMLFiles.push({src: ['*.html'], dest: 'dist/examples/' + name +'/',
        cwd: 'source/core/example/', expand: true});

      // Replace keywords in generate module example HTML files.
      keywordReplacements['module_' + name] = {
          options: {
            variables: {
              jsPath: "../../js",
              title: name + " Example",
              content: grunt.file.read(htmlFiles)
            }
          },
          files: [
            {expand: true, flatten: true, src: ['dist/examples/' + name + '/*.html'],
            dest: 'dist/examples/' + name + '/'}
          ]
        };
    }//end if
  });

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // Combines known module patterns into prefined output into a temp directory
    module: {
      dist: {
        // Add and remove module names from this array to decide which modules are
        // automatically included in the final build. Any associated JS plugins and CSS
        // will appear in a numbered format in the output.
        modules: modules
      }
    },

    // Process plugin dependencies
    plugins: {
      dist: {
        modules: modules,
        dest: 'dist/js/plugins.js'
      }
    },

    // Replace keywords in the generated .js files.
    replace: keywordReplacements,

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

          // Copy any HTML files across.
          {src: ['*.html'], dest: 'dist/', cwd: 'source/core/html/', expand: true},

          // Copy any core files across.
          {src: ['*'], dest: 'dist/files/', cwd: 'source/core/files/', expand: true},

          // Copy any associated css files (images) into the correct location.
          {src: moduleCSSFiles.global,
            dest: 'dist/css/global/files/', cwd: 'source/modules/', expand: true, flatten: true},
          {src: moduleCSSFiles.medium,
            dest: 'dist/css/medium/files/', cwd: 'source/modules/', expand: true, flatten: true},
          {src: moduleCSSFiles.wide,
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
      all: ['Gruntfile.js', 'source/core/js/global.js',
            'source/modules/**/js/*.js', '!source/modules/**/js/*.min.js']
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
  grunt.registerTask('test', ['jshint', 'qunit']);
  grunt.registerTask('build', ['clean', 'module', 'sass', 'copy', 'replace', 'plugins', 'clean:tmp']);
  grunt.registerTask('default', ['test', 'build']);

};