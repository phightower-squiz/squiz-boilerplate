/*global require:false, module:false*/
/*
 * Squiz Boilerplate Plugin Dependency Solver
 *
 * Modules can have some dependency management built in by using a pre-defined
 * format. This tool solves those dependencies and performs a keyword replacement
 * in the destination plugin file.
 */

var _ = require('underscore');

module.exports = function(grunt) {
  'use strict';

  grunt.registerMultiTask('plugins', 'Module plugin dependency solver.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
        force: false,

        // Keyword replacement
        keyword:     '@@dependencies',

        // Separate each plugin file content output with a double new line.
        separator:   "\n\n",

        // Root relative paths to libs directory
        libPath:  'source/libs/',
        modulePath: 'source/modules/'
      });

    grunt.verbose.writeflags(options, 'Options');

    // We need a modules list.
    if (!this.data.hasOwnProperty('modules') && Array.isArray(this.data.modules)) {
      grunt.log.error();
      grunt.fail.warn('Expected a "modules" property as an array of module names.');
      return false;
    }//end if

    grunt.log.writeln('Replacing plugin content...');

    // Gather initial library dependencies - jQuery and Modernizr are assumed.
    var moduleDeps = {};
    var libraryDeps = {};
    var dependencies = [];

    // Initital population of the dependency array.
    var libDeps = grunt.file.expand(options.libPath + '**/deps.json');
    libDeps.forEach(function(file, i){
        var pathParts = file.split('/');
        var deps = grunt.file.readJSON(file);
        libraryDeps[deps.name] = deps;
        dependencies.push(deps.name);
        if (deps.hasOwnProperty('dependencies') && Array.isArray(deps.dependencies)) {
            dependencies = dependencies.concat(deps.dependencies);
        }//end if
    });

    // Iterate the menu and solve dependencies.
    this.data.modules.forEach(function(name, i){
        var depFiles = grunt.file.expand(options.modulePath + name + '/js/deps.json');
        depFiles.forEach(function(file, i){
            var pathParts = file.split('/');
            moduleDeps[name] = grunt.file.readJSON(file);
            dependencies.concat(moduleDeps[name].dependencies);
        });
    });

    // We need a unique array.
    dependencies = _.uniq(dependencies);

    // Find the index of a dependency.
    var getIndexOfDependency = function(name) {
        var index = null;
        _.each(dependencies, function(item, i){
            if (item === name) {
                index = i;
                return {};
            }
        });
        return index;
    };//end getIndexOfDependency()

    var reorderDependency = function(name, before) {
        var indexAfter = getIndexOfDependency(name);
        var indexBefore = getIndexOfDependency(before);
        // Is the index lower?
        if (indexAfter > indexBefore) {
            // Remove after index
            dependencies.splice(indexAfter, 1);
            dependencies.splice(indexBefore, 0, name);
        }//end if
    };//end reorderDependency()

    for (var name in libraryDeps) {
        if (libraryDeps[name].hasOwnProperty('dependencies') &&
            Array.isArray(libraryDeps[name].dependencies)) {
            libraryDeps[name].dependencies.forEach(function(dep){
                reorderDependency(dep, name);
            });
        }//end if
    }//end for

    var pluginContent = [];
    dependencies.forEach(function(dep){
        var fileName = dep + '.js';
        if (libraryDeps[dep] && libraryDeps[dep].hasOwnProperty('main')) {
            fileName = libraryDeps[dep].main;
        }//end if
        var file = options.libPath + dep + '/' + fileName;
        if (grunt.file.exists(file)) {
            grunt.log.writeln('Resolving dependency: ' + dep.green);
            pluginContent.push(grunt.file.read(file));
        }//end if
    });

    if (!grunt.file.exists(this.data.dest)) {
        grunt.log.error();
        grunt.fail.warn("Expected a valid file destination.");
    }

    var regExp = new RegExp('(\/\/)?' + options.keyword);
    var content = grunt.file.read(this.data.dest);
    content = content.replace(regExp, pluginContent.join(options.separator));
    grunt.file.write(this.data.dest, content);
    grunt.log.write(this.data.dest.cyan);

    grunt.log.ok();
  });
};