/**
 * Bower dependency solver that uses the bower package to draw a list
 * of dependencies and generate a new list of main file names to include
 * as JS and CSS dependencies in the boilerplate.
 */
'use strict';

var bower = require('bower');
var _     = require('lodash');

// Store our results so we don't have to hit bower API twice
// Even though it's offline it still adds about a second to the load
var mainFiles,
    dependencies;

/**
 * Fetch a list of bower main files
 * @param {Function} callback    Run this function async
 * @param {Array}    whitelist   Only extract from packages that match the whitelist
 * @param {Array}    ignored     A list of ignored package names
 */
function fetchMainFiles(callback, whitelist, ignored) {
    if (mainFiles) {
        callback(mainFiles);
        return;
    }//end if

    bower.commands
    .list({
        paths: true
    }, {
        offline: true
    })
    .on('end', function (packages) {
        var files = _.chain(packages)

            // Filter the packages to only include packages that aren't squiz modules
            // and only match the whitelist
            .filter(function (pkg, name) {
                // Modules should not be included in the main file list as the scripts
                // and css are handled through the boilerplate importer.
                if (name.match(/^squiz\-module\-/)) {
                    return false;
                }//end fi

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
            .map(function (paths) {
                return (!_.isArray(paths)) ? [paths] : paths;
            })
            .compact()
            .uniq()
            .flatten()
            .value();

        callback(files);
    });
}//end fetchMainFiles()

/**
 * Fetch a list of dependencies from bower
 * @param  {Function} callback callback to pass found dependencies
 */
function fetchDependencies(callback) {
    if (dependencies) {
        callback(dependencies);
        return;
    }
    bower.commands
    .list({}, {offline: true})
    .on('end', function (installed) {
        dependencies = installed;
        callback(dependencies);
    });
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
            }, _.filter(installed.dependencies, function (pkg, name) {
                return name.match(/^squiz\-module\-/);
            }), ignored);
        });
    },
    dependencies: fetchDependencies,
    files: fetchMainFiles
};