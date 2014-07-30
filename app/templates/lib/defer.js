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

    async.eachSeries(newDeps, function(item, next) {
        var command = 'npm install ' + item.name + '@' +item.version + ' --save';
        console.log('Installing deferred dependency via NPM (%s)', command);
        var npm = exec(command, function(err, stdout, stderr) {
            console.log(stdout);
            if (err) {
                throw stderr;
            }
        });
        npm.on('exit', next);
    }, done);
};//end defer()