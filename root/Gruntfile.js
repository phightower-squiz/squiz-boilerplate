/*global module:false, console:false, require:false*/
var moduleData = require('./lib/helpers/module-data.js');

module.exports = function(grunt) {

  // The destination directory
  // Can be overidden by supplying --dest=<dir>
  var destDir = moduleData.destDir;

  // Default external NPM tasks to be loaded.
  var npmTasks = [
    'grunt-contrib-sass',
    'grunt-contrib-concat',
    'grunt-contrib-copy',
    'grunt-contrib-jshint',
    'grunt-contrib-qunit',
    'grunt-contrib-watch',
    'grunt-contrib-clean',
    'grunt-contrib-uglify',
    'grunt-prettify',
    'grunt-replace'
  ];

  // Default build tasks.
  var buildTasks = [
    'uglify:custom_plugins',
    'module',
    'sass',
    'copy',
    'replace',
    'plugins',
    'clean:tmp',
    'prettify'
  ];

  // Tasks config list.
  var tasks = {};

  //////////////////
  // Package JSON //
  //////////////////
  tasks.pkg = grunt.file.readJSON('package.json');

  /////////////
  // Modules //
  /////////////
  // Combines known module patterns into prefined output into a temp directory
  tasks.module = {
    dist: {
      // Add and remove module names from this array to decide which modules are
      // automatically included in the final build. Any associated JS plugins and CSS
      // will appear in a numbered format in the output.
      modules: moduleData.modules
    }
  };

  /////////////
  // Plugins //
  /////////////
  // Process plugin dependencies
  tasks.plugins = {
    dist: {
      modules: moduleData.modules,
      dest: destDir + '/js/plugins.js'
    }
  };

  ////////////
  // Minify //
  ////////////
  // Automatic minification for known targets
  tasks.uglify = {
    custom_plugins: {
      options: {
        banner: "/* Generated: <%= grunt.template.today('yyyy-mm-dd') %> */\n"
      },
      files: moduleData.minifyPluginFiles
    }
  };

  //////////////
  // Keywords //
  //////////////
  // Replace keywords in the generated .js files.
  tasks.replace = moduleData.keywordReplacements;

  //////////
  // Sass //
  //////////
  var extraSassFiles = {};
  extraSassFiles[destDir + '/css/print/print.css'] = 'source/core/css/print.scss';
  extraSassFiles[destDir + '/css/examples/examples.css'] = 'source/core/css/examples.scss';

  tasks.sass = {

    // Core sass files containing module content (global, medium, wide)
    modules: {
      options: {
        style: 'expanded',
        loadPath: [
          'source/core/css/',
          '/'
        ]
      },
      files: moduleData.sassFiles
    },

    // Extra Sass files to process in addition to those containing module content
    // This would include things like print CSS, or page specific CSS (e.g. home page).
    extras: {
      options: {
        style: 'expanded',
        loadPath: ['source/core/css/']
      },
      files: extraSassFiles
    }
  };

  ///////////
  // Watch //
  ///////////
  // Watch all source files except minified ones.
  tasks.watch = {
      files: ['source/**/*.scss', 'source/**/*.js', 'source/**/*.html',
              'source/**/*.json', '!source/**/*.min.js'],
      tasks: 'build'
  };

  ////////////////
  // Copy Files //
  ////////////////
  tasks.copy = {
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
    };

  ////////////////
  // JS Linting //
  ////////////////
  tasks.jshint = {
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
  };

  //////////////////
  // Unit Testing //
  //////////////////
  // Unit tests that require the DOM
  tasks.qunit = {
    all: [
      'source/modules/**/tests/*.html',
      'source/libs/**/tests/*.html'
    ]
  };

  //////////////
  // Clean Up //
  //////////////
  // Clean the sass cache & distribution directories
  tasks.clean = {
    dist: [destDir], // This one will remove all dist files, be careful with it.
    tmp:  ["tmp", ".sass-cache"]
  };

  ///////////////////////
  // HTML Code Sniffer //
  ///////////////////////
  tasks.htmlcs = {
    dist: {
      options: {
        standard: 'WCAG2AA'
      },
      files: [
        // Run HTML CS across examples
        // {src: destDir + '/examples/**/index.html'},
        {src: destDir + '/*.html'}
      ]
    }
  };

  /////////////////////////
  // Image Optimisations //
  /////////////////////////
  // https://github.com/heldr/grunt-img
  // If the grunt-img npm module is installed images will be automatically
  // optimised by this task
  // Note: this task can take quite a while to run, it's best to leave it to the end
  // and run it separately when ready to publish. Run with 'grunt img'.
  if (grunt.file.isDir('node_modules/grunt-img')) {
    npmTasks.push('grunt-img');
    tasks.img = {
      css_files: {
        src: [destDir + '/css/**/files/*.jpg', destDir + '/css/**/files/*.png', destDir + '/css/**/files/*.jpeg']
      },
      dist_files: {
        src: [destDir + '/files/*.jpg', destDir + '/files/*.png', destDir + '/files/*.jpeg']
      }
    };
  }//end if

  ///////////////////////
  // Pretty Print HTML //
  ///////////////////////
  // https://npmjs.org/package/grunt-prettify
  tasks.prettify = {
    options: {
      indent: 4,
      unformatted: ['a', 'pre', 'code']
    },
    all: {
      expand: true,
      cwd: destDir,
      ext: '.html',
      src: ['*.html'],
      dest: destDir
    }
  };

  // Project configuration.
  grunt.initConfig(tasks);

  // Load the tasks.
  grunt.loadTasks('tasks');
  npmTasks.forEach(function(task){
    grunt.loadNpmTasks(task);
  });

  ///////////
  // Tasks //
  ///////////

  // Reset the generated files.
  grunt.registerTask('reset', ['clean']);

  // Run tests.
  grunt.registerTask('test', ['jshint', 'qunit', 'htmlcs']);

  // The main build task. Special attention needs to be paid to the order in
  // which the tasks are run, many tasks require previously run tasks.
  grunt.registerTask('build', buildTasks);

  // Default without any arguments
  grunt.registerTask('default', ['test', 'build']);

};