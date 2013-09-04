/*global require:false*/
/**
 * The boilerplate.
 */

var grunt  = require('grunt'),
    _      = require('underscore'),
    Module = require('./module');

var Boilerplate = function(config, pkg) {
    'use strict';

    var self = this;

    this.config  = config;
    this.pkg     = pkg;
    this.modules = config.modules;

    // A list of files that will be affected by the keyword
    // replacement functions that populate information for the task
    this.files = {
        html: [{
            expand: true,
            flatten: true,
            src: [this.config.destination + '/*.html'],
            dest: this.config.destination + '/'
        }],
        sass: [{
            expand: true,
            flatten: true,
            src: [this.config.temp_dir + '/*.scss'],
            dest: this.config.temp_dir + '/'
        }]
    };

    // The selected modules can be overwritten by using:
    // --modules=<module1>,<module2>
    var userModules = grunt.option('modules') || '';
    if (userModules !== '') {
        this.modules = userModules.split(',');
    }//end if

    // Only use valid module names (alpha sorted)
    this.modules = this.modules.map(function(name){
        var dir = self.config.source.modules + name;
        if (grunt.file.isDir(dir)) {
            return new Module(name, dir);
        }//end if
    }).sort();

};//end constructor

Boilerplate.prototype = {
    /**
     * Get an object containing all necessary sass file information
     * extracted for each module.
     */
    getModuleSassFiles: function() {
        var self = this;

        if (typeof(self.sassFiles) !== 'undefined') {
            return self.sassFiles;
        }//end if

        // Initial loop for through active modules
        // to build up required data from the boilerplate.
        var sassKeys = _.keys(self.config.css);
        self.sassFiles = {};
        self.modules.forEach(function(module, i) {
            self.sassFiles[module.name] = module.getSassFiles(sassKeys);
        });
        return self.sassFiles;
    },//end getModuleSassFiles()

    getModuleHTMLFiles: function() {
        var self = this;

        if (typeof(self.HTMLFiles) !== 'undefined') {
            return self.HTMLFiles;
        }//end if

        // Initial loop for through active modules
        // to build up required data from the boilerplate.
        self.HTMLFiles = {};
        self.modules.forEach(function(module, i) {
            self.HTMLFiles[module.name] = module.getHTMLFiles();
        });
        return self.HTMLFiles;
    },//end getModuleHTMLFiles()

    /**
     * Get associated CSS files
     */
    getAssociatedCSSFiles: function() {
        var self = this;
        var sassKeys = _.keys(self.config.css);
        var files = [];
        sassKeys.forEach(function(name, k) {
            files.push({
                src: ['**/css/' + name + '/*.*'],
                dest: self.config.destination + '/css/' + name +
                    '/' + self.config.file_dest + '/',
                cwd:  self.config.source.modules,
                expand: true,
                flatten: true
            });
        });
        return files;
    },//end getAssociatedCSSFiles()

    /**
     * Build a list of Sass files with destination names for inclusion
     * in the grunt sass task files list.
     */
    getSassTaskFileList: function() {
        var data = {};
        var self = this;
        _.each(this.config.css, function(value, key) {
            var source = value.source || null;
            var output = value.output || null;
            if (source !== null && output !== null) {
                var sourcePath = self.config.temp_dir + '/' + source;
                var outputPath = self.config.destination + '/css/' + key + '/' + output;
                data[outputPath] = sourcePath;
            }//end if
        });
        return data;
    },//end getSassTaskFileList()

    /**
     * Get replacements for module data in sass files
     */
    getSassModuleReplacements: function() {
        var self = this;
        var data = {
            options: {
                variables: {
                    version: this.pkg.version,
                    date:    grunt.template.today()
                }
            },
            files: this.files.sass
        };

        // Get a list of sass files to work with
        var sassFiles = this.getModuleSassFiles();

        // Set the initial variable replacement for content.
        _.each(this.config.css, function(value, key) {
            data.options.variables[key + '_toc'] = [];
            data.options.variables[key + '_modules'] = [];
        });

        // Loop each of the sass files and fill variable data
        _.each(sassFiles, function(files, key) {
            files.forEach(function(file, i) {
                var moduleName = file.module.replace(/_/g, ' ');
                moduleName = (moduleName.charAt(0).toUpperCase() +
                    moduleName.slice(1)).replace('_', ' ');

                // Build the Sass content
                var content =
                    "/*-- " + moduleName + " --*/\n" +
                    file.content;

                // Build a TOC entry
                var toc = " *     " + moduleName;

                // Add the output to the keyword replacement variable.
                data.options.variables[file.name + '_toc'].push(toc);
                data.options.variables[file.name + '_modules'].push(content);
            });
        });

        // Join the array into final output
        for (var key in data.options.variables) {
            if (/(toc|modules)$/.test(key)) {
                data.options.variables[key] = data.options.variables[key].join("\n");
            }//end if
        }//end for

        return data;
    },//end getSassModuleKeywordReplacements()

    /**
     * Get HTML module keyword replacements
     */
    getHTMLModuleReplacements: function() {
        var self = this;
        var data = {
            options: {
                variables: {
                    version: this.pkg.version,
                    date:    grunt.template.today()
                }
            },
            files: this.files.html
        };

        var htmlFiles = this.getModuleHTMLFiles();

        // Loop each HTML file and build some keyword replacement for module files
        _.each(htmlFiles, function(files, key) {
            files.forEach(function(file, i) {
                var fileName = file.split('/').pop().replace('.html', '');
                var content  = grunt.file.read(file);
                data.options.variables['module_' + key + '--' + fileName] = content;
            });
        });

        return data;
    },//end getSassModuleReplacements()

    /**
     * Get an array of global.js file names from selected modules.
     */
    getGlobalJS: function() {
        var files = [];
        this.modules.forEach(function(module, i) {
            files = files.concat(module.getGlobalJS());
        });

        // Gather a list of global JS files to concat
        var output = {};
        output[this.config.temp_dir + '/global.js'] = files;

        return output;
    },//end getGlobalJS

    /**
     * Get an array of plugin js files.
     */
    getPluginsJS: function() {
        var files = [];
        this.modules.forEach(function(module, i) {
            files = files.concat(module.getPluginJS());
        });

        // Gather a list of plugin JS files to concat
        var output = {};
        output[this.config.temp_dir + '/plugins.js'] = files;

        return output;
    },//end getPluginsJS()

    /**
     * Turn a file path to a module into a friendly module name
     */
    getModuleNameFromPath: function(path) {
        var moduleName = path
            .replace(this.config.source.modules, '')
            .replace(/\/(.*)$/, '');
        moduleName = (moduleName.charAt(0).toUpperCase() +
            moduleName.slice(1)).replace('_', ' ');
        return moduleName;
    },//end getModuleNameFromPath()

    /**
     * Build HTML link tags for associated CSS files
     * @return string
     */
    buildCSSTags: function() {
        var tags = [];
        var ieTags = {};
        [7,8,9].forEach(function(num){
            ieTags["IE" + num] = [];
        });

        function buildTag(name, css) {

            // Should we build a tag from this css?
            if (css.hasOwnProperty('parse_only') &&
                css.parse_only) {
                return false;
            }//end if

            var path = 'css/' + name + '/' + css.output;
            var media = css.hasOwnProperty('media') ? ' media="' + css.media + '"' : '';
            var tag = '<link rel="stylesheet" href="' + path + '" ' + media + ' />';

            // Add an optional comment to the end of the tag
            if (css.hasOwnProperty('comment')) {
                tag += "<!-- " + css.comment + " -->";
            }//end if

            tags.push(tag);

            // If there needs to be a non-media query IE fallback
            // This property will add an extra link in IE conditionals
            if (css.hasOwnProperty('ie_fallback')) {
                ieTags[css.ie_fallback].push('<link rel="stylesheet" href="' + path + '" />');
            }//end if
        }//end buildTag()

        // Loop the config and build tags.
        for (var name in this.config.css) {
            buildTag(name, this.config.css[name]);
        }//end for

        var output = tags.join("\n");

        // Create IE conditional tags
        for (var browser in ieTags) {
            if (ieTags[browser].length) {
                output += "<!--[" + this.config.ie_fallback[browser] + "]>";
                ieTags[browser].forEach(function(tag){
                    output += tag;
                });
                output += "<![endif]-->";
            }//end if
        }//end for

        return output;

    },//end buildCSSTags()

    /**
     * Get an list of files to minify
     */
    getFilesToMinify: function() {
        var self = this;
        var files = {};
        self.modules.forEach(function(module, i) {
            var dir = module.dir + '/js/';
            if (module.config.hasOwnProperty('minify')) {
                for (var dest in module.config.minify) {
                    files[dir + dest] = [dir + module.config.minify[dest]];
                }//end for
            }//end if
        });
        return files;
    }//end getFilesToMinify()

};

module.exports = Boilerplate;