/*
 * grunt-lazyload
 * https://github.com/raphaeleidus/grunt-lazyload
 *
 * Copyright (c) 2013 Raphael Eidus
 * Licensed under the MIT license.
 */

'use strict';

var util = require('util');
var path = require('path');
var cp   = require('child_process'); 
var argv = process.argv;

module.exports = function(grunt) {
  grunt.lazyLoadNpmTasks = function lazyload(NpmPackage, tasks, options) {
    var root = path.resolve('node_modules');
    var pkgfile = path.join(root, NpmPackage, 'package.json');
    var opts = {
      defer: false,
      runTask: true,
      args: []
    };
    Object.keys(options).forEach(function(prop){
      opts[prop] = options[prop];
    });
    //when displaying the grunt help eager load everything
    if(argv.indexOf('--help') !== -1 || argv.indexOf('-h') !== -1) {
      grunt.loadNpmTasks(NpmPackage);
      return;
    }
    if(!util.isArray(tasks)) {
      tasks = [tasks];
    }
    //run task
    function runTask(name) {
      if (opts.runTask) {
        grunt.verbose.writeln('Loading & Running NPM task: %s with name: %s', NpmPackage, name);
        grunt.loadNpmTasks(NpmPackage);
        grunt.task.run(name);
      }
    }
    tasks.forEach(function(task) {
      //register the task aliases
      grunt.task.registerTask(task, task, function() {
        var done = this.async();
        //pass along any arguments passed in
        var runName = Array.prototype.concat.apply([task], arguments).join(':');
        tasks.forEach(function(t) {
          //rename all the aliases (grunt doesn't have a task.delete ... yet)
          grunt.task.renameTask(t, '_'+t+'_');
        });

        if (!grunt.file.exists(pkgfile) && opts.defer === true) {
          var pkg = NpmPackage + (opts.hasOwnProperty('version') ? '#' + opts.version : '');
          var cmd = 'npm install ' + pkg + ' ' + opts.args.join(' ');
          grunt.log.writeln('Installing deferred NPM: ' + pkg);
          grunt.verbose.writeln('Exec: ' + cmd);
          var npm = cp.exec(cmd, {},
            function(err, stdout, stderr) {
            grunt.log.writeln('stdout: %s, stderr: %s, err: %o', stdout, stderr, err);
            if (err) {
              grunt.log.error(stderr);
              return;
            }
          });
          npm.stdout.on('data', function(data) {
            grunt.log.writeln('stdout: ' + data);
          });
          npm.on('exit', function() {
            grunt.log.writeln('exit', arguments);
            runTask(runName);
            done();
          });
        } else {
          runTask(runName);
          done();
        }
      });
    });
  };
};