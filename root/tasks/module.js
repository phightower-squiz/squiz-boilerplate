/*
 * Squiz Boilerplate Module Helper for Grunt
 *
 * Modules should follow a strict naming convention. This task helper looks after
 * gathering and combining modules with a consistent number and labelling system.
 */

module.exports = function(grunt) {
  'use strict';

  grunt.registerMultiTask('module', 'Module build helper.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
        force: false,

        // Keyword replacement prefix
        prefix:      '@@',

        // Relative path to root
        // This needs to change if the destination path changes
        destinationPath: 'tmp/',

        // Separate each module output with a double new line.
        separator:   "\n\n",

        // Root relative paths to the core & module directories
        modulePath:  'source/modules/',
        corePath:    'source/core/'
      });

    grunt.verbose.writeflags(options, 'Options');
    
    // We need a modules list.
    if (!this.data.hasOwnProperty('modules') && Array.isArray(this.data.modules)) {
      grunt.log.error();
      grunt.fail.warn('Expected a "modules" property as an array of module names.');
      return false;
    }//end if

    // Let everyone know we're starting.
    grunt.log.writeln("Processing modules:" + this.data.modules.length);

    // Target files to source and use for combinated destination file.
    var files = {
      scss: {
        global: options.corePath + 'css/global.scss',
        medium: options.corePath + 'css/medium.scss',
        wide:   options.corePath + 'css/wide.scss'
      },
      js: {
        global: options.corePath + 'js/global.js',
        plugin: options.corePath + 'js/plugins.js'
      }
    };

    // Somewhere temporary to write the strings for each target file
    var createEmptySource = function() {
      return {
          toc: [],
          content: []
        };
    };//end createEmptySource()
    var source = {
      scss: {
        global: createEmptySource(),
        medium: createEmptySource(),
        wide:   createEmptySource()
      },
      js: {
        global: createEmptySource(),
        plugin: createEmptySource()
      }
    };

    // Return a numbered comment line suitable for CSS and JS
    var createComment = function(moduleNum, name) {
      return "/*-- @@num." + moduleNum + ". " + name + " --*/\n";
    };//end createComment()

    var createTOCComment = function(moduleNum, name) {
      return " *     @@num." + moduleNum + ". " + name;
    };//end createTOCComment()

    // Create a friendly name from a module name (ucfirst, replace underscores)
    var createFriendlyName = function(name) {
      return (name.charAt(0).toUpperCase() + name.slice(1)).replace('_', ' ');
    };//end createFriendlyName()

    // Create module output using an outputter fn
    var createModuleOutput = function(moduleNum, name, fnOutputter) {
      var friendlyName = createFriendlyName(name);

      var outputterOptions = {
        friendlyName: friendlyName,
        comment:      createComment(moduleNum, friendlyName)
      };
      return fnOutputter.call(this, outputterOptions);
    };//end createModuleOutput()

    // Get the sass content for a module.
    var getSassContent = function(moduleNum, name, type) {
      return createModuleOutput(moduleNum, name, function(opt){
        var fileName = type +'.scss'; // name pattern is <type>.scss
        var filePath = options.modulePath + name + '/css/' + fileName;
        var moduleFiles = grunt.file.expand(filePath);
        if (moduleFiles.length) {
          var content = [];
          moduleFiles.forEach(function(moduleSCSSPath, i){
            content.push("@import \"" + moduleSCSSPath + "\";");
          });
          return {
            toc: createTOCComment(moduleNum, opt.friendlyName),
            content: opt.comment + content.join(options.separator)
          };
        }//end if
      });
    };

    // Get the js output for a module.
    var getJSContent = function(moduleNum, name, type, fileName) {
      return createModuleOutput(moduleNum, name, function(opt){
        if (fileName === undefined) {
          // If no specific file name applied, then use a pre-defined pattern.
          fileName = type + '.js';
        }
        var filePath = options.modulePath + name + '/js/' + fileName;
        var moduleFiles = grunt.file.expand(filePath);
        if (moduleFiles.length) {
          var content = [];
          moduleFiles.forEach(function(moduleJSPath, i){
            content.push(grunt.file.read(moduleJSPath));
          });
          return {
            toc: createTOCComment(moduleNum, opt.friendlyName),
            content: opt.comment + content.join(options.separator)
          };
        }//end if
      });
    };//end getJSContent

    // Replace a keyword in the content of the generated source.
    // Ensures the replacement can be in an inline comment to aid linting
    var replaceKeyword = function(keyword, content, source) {
      var regExp = new RegExp('(\/\/)?' + options.prefix + keyword, "g");
      return source.replace(regExp, content);
    };//end replaceKeyword()

    // Counters for numbering
    var counters = {
      scss: {
        global: 1,
        medium: 1,
        wide:   1
      },
      js: {
        global: 1,
        plugin: 1
      }
    };

    // Push content to an array if it's not undefined, null or empty
    var pushToContent = function(source, content) {
      if (content !== undefined && content !== null && content !== '') {
        source.toc.push(content.toc);
        source.content.push(content.content);
        return true;
      }//end if
      return false;
    };//end pushToContent()

    // Push Sass content to the Sass content array.
    var pushSass = function(name, type) {
      if (pushToContent(source.scss[type],
          getSassContent(counters.scss[type], name, type))) {
          counters.scss[type] += 1;
      }//end if
    };//end pushSass()

    // Push JS content to the JS content array.
    var pushJS = function(name, type, fileName) {
      if (pushToContent(source.js[type],
          getJSContent(counters.js[type], name, type, fileName))) {
          counters.js[type] += 1;
      }//end if
    };//end pushJS()

    // Gather output for each module.
    this.data.modules.forEach(function(name, i){
      // Combine Sass.
      grunt.log.write('Processing module "' + name + '"...');
      pushSass(name, 'global');
      pushSass(name, 'medium');
      pushSass(name, 'wide');
      // Combine global JS.
      pushJS(name, 'global');

      // Figure out the plugin option for the 'main' file and perform
      // the combination based on preference (only if plugin.json is present)
      var mainPluginFile = 'plugin.js';
      var pluginJSONPath = options.modulePath + name + '/js/plugin.json';
      if (grunt.file.exists(pluginJSONPath)) {
        var json = grunt.file.readJSON(pluginJSONPath);
        if (json.hasOwnProperty('main')) {
          mainPluginFile = json.main;
        }//end if
      }//end if

      pushJS(name, 'plugin', mainPluginFile);

      grunt.log.ok();
    });

    // Write out a manipulated module file.
    var writeModuleFile = function(fileName, sourceArray, tocArray) {
      if (grunt.file.exists(fileName)) {
        // Gather file content and manipulate it
        var fileContent     = grunt.file.read(fileName);
        var moduleContent   = sourceArray.join(options.separator);
        var tocContent      = tocArray.join("\n");
        var destinationFile = options.destinationPath + fileName.split('/').pop();

        // Perform keyword replacements.
        fileContent = replaceKeyword('modules', moduleContent, fileContent);
        fileContent = replaceKeyword('toc', tocContent, fileContent);

        // Write out the modified file content
        grunt.file.write(destinationFile, fileContent);
        grunt.log.writeln('Created: ' + destinationFile.cyan);
      }//end if
    };

    try {
      for (var type in files) {
        for (var name in files[type]) {
          writeModuleFile(files[type][name],
                          source[type][name].content,
                          source[type][name].toc);
        }//end for
      }//end for
      grunt.log.write("Temporary module files written...");
      grunt.log.ok();
    } catch (e) {
      grunt.log.error();
      grunt.verbose.error(e);
      grunt.fail.warn('Module build failed.');
    }//end try
  });
};