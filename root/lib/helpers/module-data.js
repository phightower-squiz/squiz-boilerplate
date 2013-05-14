/*global require:false*/
/**
 * Helper to abstract the gathering and populating of data to be passed to grunt tasks
 *
 * This is where magic happens.
 */

var grunt = require('grunt'),
    data  = {};

module.exports = (function(){
    'use strict';

    if (!grunt.file.exists('modules.json')) {
        throw "Missing modules.json required file";
    }//end if

    // Bring in the list of modules from external source.
    data.modules = grunt.file.readJSON('modules.json');

    // The selected modules can be overwritten by using:
    // --modules=<module1>,<module2>
    var userModules = grunt.option('modules') || '';
    if (userModules !== '') {
        data.modules = userModules.split(',');
    }//end if

    // Only use valid module names.
    data.modules = data.modules.map(function(module){
        if (!grunt.file.isDir('source/modules/' + module)) {
            return module;
        }
    });

    // The destination distribution directory.
    var destDir = data.destDir = (grunt.option('dest') || 'dist').replace('/', '');

    // Gather glob patterns for each listed module. This is used in the copy
    // pattern so only files from modules listed to be installed will be copied.
    data.moduleCSSFiles = {
        global: [],
        medium: [],
        wide:   []
    };

    // Sass processing from the temporary directory.
    data.sassFiles = {};
    data.sassFiles[destDir + '/css/global/global.css'] = 'tmp/global.scss';
    data.sassFiles[destDir + '/css/medium/medium.css'] = 'tmp/medium.scss';
    data.sassFiles[destDir + '/css/wide/wide.css'] = 'tmp/wide.scss';
    data.sassFiles[destDir + '/css/print/print.css'] = 'source/core/css/print.scss';

    // Some keyword replacements that the example generation can append to.
    data.keywordReplacements = {
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
    data.exampleHTMLFiles        = [];
    data.exampleMatrixFiles      = [];
    data.exampleAssociatedFiles  = [];
    data.keywordFileReplacements = {};
    data.minifyPluginFiles       = {};

    // Iterate each module to be installed.
    data.modules.forEach(function(name, num){

    ////////////////////////////////////////
    // Module CSS associated binary files //
    ////////////////////////////////////////
    // A list of module CSS associated files (images) to supply to the copy task
    // Performing this logic here ensures only installed module files are copied.
    data.moduleCSSFiles.global.push(name + '/css/global/*.*');
    data.moduleCSSFiles.medium.push(name + '/css/medium/*.*');
    data.moduleCSSFiles.wide.push(name + '/css/wide/*.*');

    ////////////////////////////////
    // Matrix parse file examples //
    ////////////////////////////////
    var matrixFiles = grunt.file.expand('source/modules/' + name + '/matrix/parse*.html');
    if (matrixFiles.length) {
      data.exampleMatrixFiles.push({src: [matrixFiles], dest: destDir + '/examples/' + name +'/',
         flatten: true, expand: true});
    }//end if

    ////////////////////////
    // Example HTML Files //
    ////////////////////////
    var htmlFiles = grunt.file.expand('source/modules/' + name + '/html/*.html');
    if (htmlFiles.length) {
      // Create HTML examples
      data.exampleHTMLFiles.push({src: ['index.html'], dest: destDir + '/examples/' + name +'/',
        cwd: 'source/core/example/', expand: true});

      var combinedHTML = '';
      htmlFiles.forEach(function(file){
        combinedHTML += grunt.file.read(file);
      });

      // Replace keywords in generate module example HTML files.
      data.keywordReplacements['module_' + name] = {
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
          data.keywordFileReplacements[keywordName] = grunt.file.read(file);
        }//end if
      });
    }//end if

    /////////////////////////////
    // Associated Binary Files //
    /////////////////////////////
    var associatedFiles = grunt.file.expand('source/modules/' + name + '/files/*.*');
    if (associatedFiles.length) {
      // Create HTML examples
      data.exampleAssociatedFiles.push({src: ['*.*'], dest: destDir + '/examples/' + name +'/files/',
        cwd: 'source/modules/' + name + '/files/', expand: true});
    }

    //////////////////////////////////////
    // Plugins that need to be minified //
    //////////////////////////////////////
    var pluginJSPath   = 'source/modules/' + name + '/js/';
    var pluginJSONFile = 'source/modules/' + name + '/js/plugin.json';
    if (grunt.file.exists(pluginJSONFile)) {
      var pluginSettings = grunt.file.readJSON(pluginJSONFile);
      if (pluginSettings.hasOwnProperty('minify')) {
        for (var dest in pluginSettings.minify) {

          // Make all the plugin paths relative to the js directory
          for (var i = 0, l = pluginSettings.minify[dest].length; i<l; i+=1) {
            pluginSettings.minify[dest][i] = pluginJSPath + pluginSettings.minify[dest][i];
          }//end for

          // Add them for minification.
          data.minifyPluginFiles[pluginJSPath + dest] = pluginSettings.minify[dest];
        }// end for
      }//end if
    }//end if
    });

    // Generic HTML keyword replacement for module html
    data.keywordReplacements.module_generic_html = {
        options: {
          variables: data.keywordFileReplacements
        },
        files: [
          {expand: true, flatten: true, src: [destDir + '/*.html'],
                dest: destDir + '/'}
        ]
    };

    return data;
}());