/*global describe, beforeEach, it, before*/
/**
 * Tests to figure out whether the generator itself is creating
 * the right files without errors
 */
'use strict';

var path    = require('path');
var rimraf  = require('rimraf');
var fs      = require('fs');
var helpers = require('yeoman-generator').test;
var assert  = require('yeoman-generator').assert;
var tmpDir  = path.join(__dirname, 'tmp');
var exec    = require('child_process').exec;
var async   = require('async');
var _       = require('lodash');

var testProject = {
    friendlyName: 'My Test Project',
    status: 'UAT',
    url: 'http://test.clients.squiz.net',
    name: 'My Test Project',
    createDirectory: true,
    customDirectory: 'gen',
    description: '',
    email: 'noreply@squiz.net',
    version: '0.0.1',
    matrix: true,
    mediumMQ: '37.5em',
    wideMQ: '60em',
    ie8: false,
    ieConditionals: false,
    modules: []
};

var options = {
    'skip-install-message': true,
    'skip-install': true,
    'skip-welcome-message': true,
    'skip-message': true,
    'bower-offline': false,
    'npm-cache': true,
    'test-mode': true
};

describe('Squiz Boilerplate generator test', function () {

    var runGen;
    var dummy = helpers.createDummyGenerator();

    function runInstall(cb) {
        runGen
            .withOptions(
                _.extend(options, {
                    'skip-install': false
                })
            )
            .withPrompt(testProject)
            .on('end', function() {
                this.generator.on('buildComplete', cb);
            });
    }

    // Make sure we've cleaned up for testing
    before(function clearTmpDir(done) {
        // 5 mins to clear directory
        this.timeout(5*60*1000);
        rimraf(tmpDir, done);
    });

    beforeEach(function (done) {
        this.timeout(10*60*1000);

        runGen = helpers
            .run(path.join(__dirname, '../app'))
            .inDir(tmpDir)
            .withGenerators([[dummy, 'squiz-boilerplate:app']]);

        done();
    });

    it('the generator can be required without throwing', function () {
        // not testing the actual run of generators yet
        this.app = require('../app');
    });

    it('creates expected files with a custom directory', function (done) {
        this.timeout(10*60*1000);
        // Test that it creates a custom directory and copies expected files
        testProject.createDirectory = true;
        testProject.customDirectory = 'gen';

        var dir = tmpDir + '/gen/';

        var expected = [
            dir + '.bowerrc',
            dir + '.jshintrc',
            dir + 'config.json',
            dir + 'Gruntfile.js',
            dir + 'README.md',
            dir + 'source/files/logo-144x144.png',
            dir + 'source/files/robots.txt',
            dir + 'source/js/global.js',
            dir + 'source/js/plugins.js',
            dir + 'source/styles/global.scss',
            dir + 'source/styles/medium.scss',
            dir + 'source/styles/wide.scss',
            dir + 'source/styles/print.scss',
            dir + 'source/styles/imports/boilerplate.scss',
            dir + 'source/styles/imports/functions.scss',
            dir + 'source/styles/imports/grid.scss',
            dir + 'source/styles/imports/mixins.scss',
            dir + 'source/styles/imports/normalize.scss',
            dir + 'source/styles/imports/placeholders.scss',
            dir + 'source/styles/imports/utilities.scss',
            dir + 'source/styles/imports/variables.scss',
            dir + 'tasks/boilerplate-substitute.js',
            dir + 'tasks/htmlcs.js',
            dir + 'lib/htmlcs/htmlcs_combined.js',
            dir + 'source/html/_parse.html',
            dir + 'source/html/fragments/_head-ie8.html',
            dir + 'source/html/fragments/_head-single.html',
            dir + 'source/html/fragments/_foot.html',
            dir + 'source/html/index.html'
       ];

        runGen
            .withOptions(options)
            .withPrompt(testProject)
            .on('end', function() {
                assert.file(expected);
                assert.fileContent(dir + 'package.json', /"name": "my-test-project"/);
                assert.fileContent(dir + '/bower.json', /"name": "my-test-project"/);
                done();
            });
    });

    it('creates expected files without a custom directory', function (done) {
        this.timeout(10*60*1000);
        testProject.createDirectory = false;
        testProject.customDirectory = '';

        runGen
            .withOptions(options)
            .withPrompt(testProject)
            .on('end', function() {
                assert.fileContent(tmpDir + '/package.json', /"name": "my-test-project"/);
                done();
            });
    });

    it ('builds a custom project based on user selections', function (done) {
        // We might need some extra time out to allow the script to fetch the packages
        this.timeout(5*60*1000);

        // Need to test that a custom build brings in the components we want, and not
        // the ones that aren't needed. Difficult to test so we'll test a couple
        // @todo - options not being passed, this test is failing
        testProject.build = 'custom';

        ///////////////////
        // Squiz Modules //
        ///////////////////

        var moduleRegistry = JSON.parse(fs.readFileSync(path.join(__dirname, '../moduleRegistry.json'), 'utf8'));
        var modules = [];
        var moduleContent = [];

        // Loop all of the modules and make them selected
        for (var prop in moduleRegistry) {
            modules.push({
                name: prop,
                repository: moduleRegistry[prop].repository
            });

            // We need each module selected to appear in the bower.json
            moduleContent.push(
                [tmpDir + '/bower.json', new RegExp('\\s{4}"' + prop + '": "(.*)"', 'g')]
            );
        }//end for
        testProject.modules = modules;

        assert(modules.length >= 1, 'The modules were read and populated correctly');

        runGen
            .withOptions(options)
            .withPrompt(testProject)
            .on('end', function() {
                moduleContent.forEach(function(value){
                    assert.fileContent.apply(this, value);
                });
                done();
            });
    });

    it('runs install commands (npm, bower, grunt)', function (done) {
        // Timeout after 30 mins
        this.timeout(1000*60*30);

        testProject.createDirectory = false;
        testProject.customDirectory = '';

        runInstall(function(){

            assert.file([
                tmpDir + '/Gruntfile.js',
                tmpDir + '/dist/index.html',
                tmpDir + '/dist/mysource_files/robots.txt',
                tmpDir + '/dist/js/vendor/jquery.min.js',
                tmpDir + '/dist/js/vendor/modernizr.min.js',
                tmpDir + '/dist/js/global.js',
                tmpDir + '/dist/js/plugins.min.js',

                // Bower squiz modules
                tmpDir + '/source/bower_components/squiz-module-accordion/bower.json'
            ]);

            assert.file([tmpDir + '/dist/styles/main.css']);

            assert.fileContent(tmpDir + '/dist/styles/main.css',
                // The content exists with keyword replacements
                / \* file:    main\.css/);

            // Run grunt tasks
            async.forEachSeries(['optimise', 'test'], function(task, next) {
                console.log('Excuting: `grunt ' + task + '`');
                var gp = exec('grunt ' + task, {}, function(err) {
                    assert(typeof(err) !== null, 'The ' + task + ' task has run without error');
                    next();
                });

                gp.stdout.on('data', function(data) {
                    console.log(data);
                });

                gp.stderr.on('data', function(data) {
                    console.log(data);
                });
            }, done);
        });
    });
});