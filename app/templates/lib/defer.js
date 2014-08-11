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

defer.runTask = function(task, pkgName) {
    defer.grunt.verbose.writeln('Run task', task.yellow);
    if (pkgName && !defer.ignore.test(pkgName)) {
        defer.grunt.loadNpmTasks(pkgName);
    }//end if
    defer.grunt.task.run(task);
};

defer.isInstalled = function(name) {
    return defer.grunt.file.exists(path.resolve(defer.pkgRoot, name));
};

defer.installModule = function(name, args, cb) {
    var cmd = 'npm install ' + name + ' ' + args.join(' ');
    defer.grunt.log.writeln('Installing deferred NPM: ' + name.yellow);
    console.log('Please wait...');

    var npm = cp.exec(cmd, {}, cb);

    npm.on('exit', function() {
        console.log('Done'.green + '\n');
    });
};

defer.fetchTaskName = function(npmName) {
    return _.reduce(PREFIXES, function(memo, prefix) {
        var reg = new RegExp('^' + prefix.replace('-', '\\-'));
        return memo.replace(reg, '');
    }, npmName);
};

defer.proxy = function(packages, task) {
    var allInstalled = _.every(packages, function(pkgName) {
        return defer.isInstalled(pkgName);
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
            if (!defer.isInstalled(pkgName)) {
                defer.installModule(pkgName, ['--save'], function() {
                    defer.runTask(runName, pkgName);
                    next();
                });
            } else {
                defer.runTask(runName, pkgName);
                next();
            }//end if
        }, function() {
            done();
        });
    });
};

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