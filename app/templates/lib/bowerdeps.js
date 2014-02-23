/**
 * Solve bower dependencies
 */
'use strict';

var grunt = require('grunt');
var path  = require('path');
var _     = require('lodash');

// Store our results so we don't have to hit bower API twice
// Even though it's offline it still adds about a second to the load
var mainFiles,
    dependencies;

var bowerrc = grunt.file.readJSON('.bowerrc');
var config  = grunt.file.readJSON('config.json');

/**
 * Fetch a list of bower main files
 * @param {Function} callback    Run this function async
 * @param {Array}    whitelist   Only extract from packages that match the whitelist
 * @param {Array}    ignored     A list of ignored package names
 */
function fetchMainFiles (callback, whitelist, ignored) {
    if (mainFiles) {
        callback(mainFiles);
        return;
    }//end if

    mainFiles = _.chain(dependencies)

        // Filter the packages to only include packages that aren't squiz modules
        // and only match the whitelist
        .filter(function (pkg, name) {
            // Modules should not be included in the main file list as the scripts
            // and css are handled through the boilerplate importer.
            if (name.match(/^squiz\-module\-/)) {
                return false;
            }//end fi

            // We are only interested in packages that tell us what the main files are
            if (!_.has(pkg, 'main')) {
                return false;
            }//end if

            // Only include packages from a white list of packages with matching
            // dependency names
            var include = false;
            _.each(whitelist, function (pkg) {
                if (_.has(pkg.dependencies, name) &&
                    _.indexOf(ignored, name) === -1) {
                    include = true;
                }//end if
            });

            return include;
        })

        // Map the resulting packages to an array of paths
        .map(function (pkg) {
            pkg.main = (!_.isArray(pkg.main)) ? [pkg.main] : pkg.main;
            // Each main file needs to be output with it's bower directory path
            return _.chain(pkg.main)
                .map(function (file) {
                    return path.join(bowerrc.directory, pkg.name, file);
                })
                .value();
        })
        .compact()
        .uniq()
        .flatten()
        .value();

    callback(mainFiles);
}//end fetchMainFiles()

/**
 * Fetch a list of dependencies from bower
 * @param  {Function} callback callback to pass found dependencies
 */
function fetchDependencies (callback) {
    if (dependencies) {
        callback(dependencies);
        return;
    }//end if

    var bowerFiles = grunt.file.expand([
        bowerrc.directory + '/**/.bower.json',
        config.source + '/modules/**/*bower.json'
    ]);

    dependencies = {};

    _.each(bowerFiles, function(file) {
        var json = grunt.file.readJSON(file);
        dependencies[json.name] = json;
    });

    callback(dependencies);
}//end fetchDependencies()

module.exports = {
    /**
     * Fetch a list of resources 
     * @param  {Function}   callback
     * @param  {Function}   (filter) Filter function to extract only those files needed
     * @return {Void}
     */
    resources: function (callback, filter, ignored) {
        fetchDependencies(function (installed) {
            // Fetch main files from packages that are referenced as dependencies
            // from squiz modules.
            fetchMainFiles(function (files) {
                if (filter) {
                    var filtered = _.filter(files, filter);
                    callback(filtered);
                } else {
                    callback(files);
                }//end if
            }, _.filter(installed, function (pkg, name) {
                return name.match(/^squiz\-module\-/);
            }), ignored || []);
        });
    },

    // Allow these 2 functions to be run independently if required
    dependencies: fetchDependencies,
    files: fetchMainFiles
};