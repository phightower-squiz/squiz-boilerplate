/*
 * Defer install install for grunt tasks
 */

'use strict';

var path  = require('path');
var cp    = require('child_process'); 
var _     = require('lodash');
var async = require('async');

var PREFIXES = ['grunt-contrib-', 'grunt-', ''];

var defer = {
    pkgRoot: path.resolve('node_modules'),

    // Ignored patterns for package names & grunt.loadNpmTask()
    ignore: /^grunt\-lib\-/,

    _tasks: {}
};

// Run the task
// Load the NPM task only if not ignored and a package name is supplied
defer.runTask = function(task, pkgName) {
    defer.grunt.verbose.writeln('Run task', task.yellow);
    if (pkgName && !defer.ignore.test(pkgName)) {
        defer.grunt.loadNpmTasks(pkgName);
    }//end if
    defer.grunt.task.run(task);
};

// Parse the name and version out of a package name
defer.parsePackageName = function(name) {
    if (name.indexOf('@') === -1) {
        return { name: name, version: '' };
    } else {
        var parts = name.split('@');
        return { name: parts[0], version: parts[1] };
    }
};

// Use the file system to check if the module is already installed
defer.isInstalled = function(name) {
    return defer.grunt.file.exists(path.resolve(defer.pkgRoot, name));
};

// Install the module by spawning `npm install [pkgName] --save`
defer.installModule = function(name, args, cb) {
    var cmd = 'npm install ' + name + ' ' + args.join(' ');
    defer.grunt.log.writeln('Installing deferred NPM: ' + name.yellow);
    console.log('Please wait...');

    var npm = cp.exec(cmd, {}, cb);

    npm.on('exit', function() {
        console.log('Done'.green + '\n');
    });
};

// Fetch a task name parsed from the package name
// e.g. grunt-contrib-jshint becomes jshint
defer.fetchTaskName = function(pkgName) {
    var pkg = defer.parsePackageName(pkgName);
    return _.reduce(PREFIXES, function(memo, prefix) {
        var reg = new RegExp('^' + prefix.replace('-', '\\-'));
        return memo.replace(reg, '');
    }, pkg.name);
};

// Proxy a list of packages associated with a task and arrange
// for them to be installed asynchronously as required
defer.proxy = function(packages, task) {
    var allInstalled = _.every(packages, function(pkgName) {
        var pkg = defer.parsePackageName(pkgName);
        return defer.isInstalled(pkg.name);
    });

    // No further action required
    if (allInstalled) {
        return;
    }//end if

    defer.grunt.log.writeln('proxy applied %s', task.yellow);
    defer.grunt.task.registerTask(task, task, function() {
        var runName = Array.prototype.concat.apply([task], arguments).join(':');
        defer.grunt.verbose.writeln('task executed: %s', runName.yellow);
        var done = this.async();
        defer.grunt.task.renameTask(task, '_'+task+'_');

        async.forEachSeries(packages, function (pkgName, next) {
            var pkg = defer.parsePackageName(pkgName);
            if (!defer.isInstalled(pkg.name)) {
                defer.installModule(pkgName, ['--save'], function() {
                    defer.runTask(runName, pkg.name);
                    next();
                });
            } else {
                defer.runTask(runName, pkg.name);
                next();
            }//end if
        }, function() {
            done();
        });
    });
};

// Each task can have multiple package dependencies associated
defer.pushTask = function(taskName, pkgName) {
    var tasks = defer._tasks;
    if (tasks.hasOwnProperty(taskName)) {
        tasks[taskName].push(pkgName);
        tasks[taskName] = _.uniq(tasks[taskName]);
    } else {
        tasks[taskName] = [pkgName];
    }
    defer._tasks = tasks;
};

// Takes an array of package names
// If a hash is supplied package names are associated with tasks manually,
// otherwise the assignment is automated based on the list of PREFIXES
// e.g.
// [
//  'grunt-contrib-jshint',
//  'grunt-contrib-concat@0.5.0',
//  { 'grunt-contrib-connect': ['serve'] }
// ]
module.exports = function deferLoad(grunt, map) {
    if (!defer.grunt) {
        defer.grunt = grunt;
    }

    _.each(map, function(val) {
        if (typeof(val) === 'string') {
            defer.pushTask(defer.fetchTaskName(val), val);
        } else {
            _.each(val, function(taskList, pkgName) {
                _.each(taskList, function(taskName) {
                    defer.pushTask(taskName, pkgName);
                });
            });
        }
    });

    _.each(defer._tasks, defer.proxy);
};