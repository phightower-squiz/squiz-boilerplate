/*global require:false*/
/**
 * The boilerplate.
 */

var grunt = require('grunt'),
    _     = require('underscore');

var Module = function(name, dir) {
    'use strict';
    this.config = {};
    this.dir    = dir;
    this.name   = name;

    // Read the json config for this module.
    // Drop back to js/plugin.json if module.json isn't present.
    if (grunt.file.exists(dir + 'module.json')) {
        this.config = grunt.file.readJSON(dir + '/module.json');
    } else if (grunt.file.exists(dir + '/js/plugin.json')) {
        this.config = grunt.file.readJSON(dir + '/js/plugin.json');
    }//end if

};//end constructor

Module.prototype = {
    /**
     * Get the details for a named sass file
     * This is stored in the module's 'css' directory
     */
    getSassFiles: function(names) {
        var self = this;

        if (!Array.isArray(names)) {
            names = [names];
        }//end if

        var files = names.map(function(name, i){
            var sassFile = self.dir + '/css/' + name + '.scss';
            var filesPath = self.dir + '/css/' + name + '/';
            if (grunt.file.exists(sassFile)) {
                var content = grunt.file.read(sassFile);
                return {
                    name:    name,
                    module:  self.name,
                    path:    sassFile,
                    files:   grunt.file.expand(self.filesPath + '*.*'),
                    content: content
                };
            }//end if
            return null;
        });

        files = _.compact(files);

        return files;
    },//end getSassFiles

    /**
     * Get html files for the module
     */
    getHTMLFiles: function() {
        return grunt.file.expand(this.dir + '/html/*.html');
    },//end getHTMLFiles()

    /**
     * Get the path of any associated global js file
     * @return array
     */
    getGlobalJS: function() {
        var globalJSFile = this.dir + '/js/global.js';
        if (grunt.file.exists(globalJSFile)) {
            return [globalJSFile];
        }//end if
        return [];
    },//end getGlobalJS

    /**
     * Get associated plugin file paths
     * @return array
     */
    getPluginJS: function() {
        if (this.config.hasOwnProperty('main')) {
            var fileName = this.dir + '/js/' + this.config.main;
            if (grunt.file.exists(fileName)) {
                return [fileName];
            }//end if
        }//end if
        return [];
    }//end getPluginJS
};

module.exports = Module;