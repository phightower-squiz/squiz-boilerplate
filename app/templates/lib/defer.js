/**
 * Defer required NPM packages until they are required
 */
'use strict';

var exec    = require('child_process').exec;
var async   = require('async');
var _       = require('lodash');

module.exports = function defer(pkg, additional, grunt, done) {
    if (!pkg.hasOwnProperty('dependencies')) {
        done();
        return;
    }//end if

    var newDeps = _.map(additional, function(version, name) {
        return {
            version: version,
            name:    name
        };
    });

    newDeps = _.filter(newDeps, function(item) {
        var exists = pkg.dependencies.hasOwnProperty(item.name);
        if (exists) {
            grunt.loadNpmTasks(item.name);
        }//end if
        return !exists;
    });

    if (newDeps.length >= 1) {
        console.log('+ ------------------------------------------- +');
        console.log('|    Loading dependencies, please wait...     |');
        console.log('| (this should only happen on the first run)  |');
        console.log('+ ------------------------------------------- +');
    }//end if

    async.eachSeries(newDeps, function(item, next) {
        var command = 'npm install ' + item.name + '@' +item.version + ' --save';
        console.log('Installing via NPM (%s)', command);
        var npm = exec(command, function(err, stdout, stderr) {
            if (err) {
                throw stderr;
            }
            grunt.loadNpmTasks(item.name);
        });
        npm.on('exit', next);
    }, done);
};//end defer()