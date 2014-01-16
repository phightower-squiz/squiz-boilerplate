var bower = require('bower');
var _     = require('lodash');

// Store our results so we don't have to hit bower API twice
// Even though it's offline it still adds about a second to the load
var mainFiles,
    dependencies;

/**
 * Fetch a list of bower main files
 * @param  {Function} callback
 * @param  {[type]}   whitelist Only extract from packages that match the whitelist
 */
function fetchMainFiles(callback, whitelist) {
    if (mainFiles) {
        callback(mainFiles);
        return;
    }//end if

    bower.commands
    .list({
        paths: true
    },{
        offline: true
    })
    .on('end', function (packages) {
        var files = _.chain(packages)
            .filter(function (pkg, name) {
                // Modules should not be included in the main file list as the scripts
                // and css are handled through the boilerplate importer.
                if (name.match(/^squiz\-module\-/)) return false;

                // Only include packages from a white list of packages with matching
                // dependency names
                var include = false;
                _.each(whitelist, function (pkg) {
                    if (_.has(pkg.dependencies, name)) {
                        include = true;
                    }//end if
                });

                return include;
            })
            .map(function (paths, name) {
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
    resources: function (callback, filter) {
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
            }));
        });
    },
    dependencies: fetchDependencies,
    files: fetchMainFiles
};