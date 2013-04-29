/*global module:false, console:false*/
module.exports = function(grunt) {

  // Bring in the list of modules from external source.
  var modules = grunt.file.readJSON('modules.json');

  // The selected modules can be overwritten by using:
  // --modules=<module1>,<module2>
  var userModules = grunt.option('modules') || '';
  if (userModules !== '') {
    modules = userModules.split(',');
  }//end if

  // The destination distribution directory.
  var destDir = grunt.option('dest') || 'dist';
  destDir = destDir.replace('/', '');

  // Gather glob patterns for each listed module. This is used in the copy
  // pattern so only files from modules listed to be installed will be copied.
  var moduleCSSFiles = {
    global: [],
    medium: [],
    wide:   []
  };

  // Sass processing from the temporary directory.
  var sassFiles = {};
  sassFiles[destDir + '/css/global/global.css'] = 'tmp/global.scss';
  sassFiles[destDir + '/css/medium/medium.css'] = 'tmp/medium.scss';
  sassFiles[destDir + '/css/wide/wide.css'] = 'tmp/wide.scss';

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
        {expand: true, flatten: true, src: [destDir + '/js/global.js', destDir + '/js/plugins.js'],
          dest: destDir + '/js/'},
        {src: ['**/*.css'], dest: destDir + '/css/', cwd: destDir + '/css/',
          expand: true, flatten: false}
      ]
    },

    // Global CSS module numbering system
    global_css: {
      options: {
        variables: {
          num: "4"
        }
      },
      files: [
        {expand: true, flatten: true, src: [destDir + '/css/global/global.css'],
        dest: destDir + '/css/global/'}
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
        {expand: true, flatten: true, src: [destDir + '/js/global.js'],
        dest: destDir + '/js/'}
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
        {expand: true, flatten: true, src: [destDir + '/js/plugins.js'],
        dest: destDir + '/js/'},
        {expand: true, flatten: true, src: [destDir + '/css/medium/*.css'],
        dest: destDir + '/css/medium/'},
        {expand: true, flatten: true, src: [destDir + '/css/wide/*.css'],
        dest: destDir + '/css/wide/'}
      ]
    }
  };


  // Some storage for arrays of information related to example files to generate for
  // installed modules.
  var exampleHTMLFiles = [];
  var exampleMatrixFiles = [];
  var exampleAssociatedFiles = [];
  var keywordFileReplacements = {};

  modules.forEach(function(name, i){
    // A list of module CSS associated files (images) to supply to the copy task
    // Performing this logic here ensures only installed module files are copied.
    moduleCSSFiles.global.push(name + '/css/global/*.*');
    moduleCSSFiles.medium.push(name + '/css/medium/*.*');
    moduleCSSFiles.wide.push(name + '/css/wide/*.*');

    // Gather any matrix parse file examples.
    var matrixFiles = grunt.file.expand('source/modules/' + name + '/matrix/parse*.html');
    if (matrixFiles.length) {
      exampleMatrixFiles.push({src: [matrixFiles], dest: destDir + '/examples/' + name +'/',
         flatten: true, expand: true});
    }//end if

    var htmlFiles = grunt.file.expand('source/modules/' + name + '/html/*.html');
    if (htmlFiles.length) {
      // Create HTML examples
      exampleHTMLFiles.push({src: ['index.html'], dest: destDir + '/examples/' + name +'/',
        cwd: 'source/core/example/', expand: true});

      var combinedHTML = '';
      htmlFiles.forEach(function(file){
        combinedHTML += grunt.file.read(file);
      });

      // Replace keywords in generate module example HTML files.
      keywordReplacements['module_' + name] = {
          options: {
            variables: {
              jsPath: "../../js",
              title: name + " Example",
              content: combinedHTML
            }
          },
          files: [
            {expand: true, flatten: true, src: [destDir + '/examples/' + name + '/*.html'],
            dest: destDir + '/examples/' + name + '/'}
          ]
        };

      // Keyword replacements for module html content in final file generation.
      htmlFiles.forEach(function(file){
        if (grunt.file.exists(file)) {
          var fileName = file.split('/').pop().split('.').shift();
          var keywordName = 'module_' + name + '--' + fileName;
          keywordFileReplacements[keywordName] = grunt.file.read(file);
        }//end if
      });
    }//end if

    var associatedFiles = grunt.file.expand('source/modules/' + name + '/files/*.*');
    if (associatedFiles.length) {
      // Create HTML examples
      exampleAssociatedFiles.push({src: ['*.*'], dest: destDir + '/examples/' + name +'/files/',
        cwd: 'source/modules/' + name + '/files/', expand: true});
    }
  });

  // Generic HTML keyword replacement for module html
  keywordReplacements['module_generic_html'] = {
    options: {
      variables: keywordFileReplacements
    },
    files: [
      {expand: true, flatten: true, src: [destDir + '/*.html'],
            dest: destDir + '/'}
    ]
  };

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
        dest: destDir + '/js/plugins.js'
      }
    },

    // Automatic minification for known targets
    uglify: {
      custom_plugins: {
        options: {
          banner: "/* Generated: <%= grunt.template.today('yyyy-mm-dd') %> */\n"
        },
        files: {
          'source/modules/overlay/js/plugin.min.js': 'source/modules/overlay/lib/overlay.js',
          'source/modules/tables_sortable/js/plugin.min.js': 'source/modules/tables_sortable/lib/*.js'
        }
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
        files: sassFiles
      }
    },

    watch: {
      files: ['source/**/*.scss', 'source/**/*.js', 'source/**/*.html'],
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
          {src: moduleCSSFiles.global,
            dest: destDir + '/css/global/files/', cwd: 'source/modules/', expand: true, flatten: true},
          {src: moduleCSSFiles.medium,
            dest: destDir + '/css/medium/files/', cwd: 'source/modules/', expand: true, flatten: true},
          {src: moduleCSSFiles.wide,
            dest: destDir + '/css/wide/files/', cwd: 'source/modules/', expand: true, flatten: true}
        ]
      },
      // Copy any matrix parse files into relevant example folders
      matrix: {
        files: exampleMatrixFiles
      },
      examples: {
        files: exampleHTMLFiles
      },
      // Any associated files from <module>/files/*.*
      associated: {
        files: exampleAssociatedFiles
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
          "$": true
        }
      },
      all: ['Gruntfile.js', 'source/core/js/global.js',
            'source/modules/**/js/*.js', '!source/modules/**/js/*.min.js']
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