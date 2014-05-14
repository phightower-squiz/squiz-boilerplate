/*global describe, beforeEach, it*/

var path    = require('path');
var rimraf  = require('rimraf');
var helpers = require('yeoman-generator').test;
var tmpDir  = path.join(__dirname, 'tmp');

var testProject = {
    name: 'My Test Project',
    createDirectory: true,
    customDirectory: 'gen',
    description: '',
    email: 'noreply@squiz.net',
    version: '0.0.1',
    matrix: true,
    bootstrap: false,
    mediumMQ: '37.5em',
    wideMQ: '60em',
    ie8: false,
    ieConditionals: false,
    unitTest: false,
    modules: []
};

describe('Squiz Boilerplate generator test', function () {
    beforeEach(function (done) {
        helpers.testDirectory(tmpDir, function (err) {
            if (err) {
                return done(err);
            }

            this.webapp = helpers.createGenerator('squiz-boilerplate:app', [
                '../../app',
                [
                    helpers.createDummyGenerator(),
                    'mocha:app'
                ]
            ]);

            // Don't run bower or npm by default
            this.webapp.options['skip-install'] = true;

            // Put the webapp in test mode which will mute certain outputs
            this.webapp.options['test-mode'] = true;

            done();
        }.bind(this));
    });

    afterEach(function (done) {
        //rimraf(tmpDir, done);
        done();
    });

    it('the generator can be required without throwing', function () {
        // not testing the actual run of generators yet
        this.app = require('../app');
    });

    it('creates expected files with a custom directory', function (done) {

        // Test that it creates a custom directory and copies expected files
        testProject.createDirectory = true;
        testProject.customDirectory = 'gen';

        var dir = tmpDir + '/gen/';

        var expected = [
            [dir + 'package.json', /"name": "my-test-project"/],
            [dir + '/bower.json', /"name": "my-test-project"/],
            dir + '.bowerrc',
            dir + '.jshintrc',
            dir + 'config.json',
            dir + 'GruntFile.js',
            dir + 'README.md',
            dir + 'source/files/logo-144x144.png',
            dir + 'source/files/robots.txt',
            dir + 'source/js/global.js',
            dir + 'source/js/plugins.js',
            dir + 'source/modules/README.md',
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
            dir + 'tasks/boilerplate-importer.js',
            dir + 'tasks/boilerplate-substitute.js',
            dir + 'tasks/htmlcs.js',
            dir + 'lib/bowerdeps.js',
            dir + 'lib/htmlcs/htmlcs_combined.js',
            dir + 'source/html/parse.html',
            dir + 'source/html/_head.html',
            dir + 'source/html/_foot.html',
            dir + 'source/html/index.html'
        ];

        helpers.mockPrompt(this.webapp, testProject);

        this.webapp.run({}, function () {
            helpers.assertFiles(expected);
            done();
        });
    });

    it('creates expected files without a custom directory', function (done) {
        testProject.createDirectory = false;
        testProject.customDirectory = '';

        var expected = [
            [tmpDir + '/package.json', /"name": "my-test-project"/]
        ];

        helpers.mockPrompt(this.webapp, testProject);

        this.webapp.run({}, function () {
            helpers.assertFiles(expected);
            done();
        });
    });

    it ('builds a bootstrap template based on user selections', function (done) {
        testProject.bootstrap = true;

        // We might need some extra time out to allow the script to fetch the packages
        // from a remote install - 10 seconds
        this.timeout(1000*10);

        // Need to test that a custom build brings in the components we want, and not
        // the ones that aren't needed. Difficult to test so we'll test a couple
        this.webapp.build = 'custom';
        this.webapp.bootstrapComponentsCSS = ['type', 'code'];
        this.webapp.bootstrapComponentsJS = [];
        this.webapp.includeBootstrap = true;

        // Expected new files
        var expected = [
            [tmpDir + '/source/styles/imports/bootstrap.scss', /\n@import "bootstrap-sass\/lib\/type";/],
            tmpDir + '/source/styles/imports/bootstrap_variables.scss'
        ];

        helpers.mockPrompt(this.webapp, testProject);

        this.webapp.run({}, function () {
            helpers.assertFiles(expected);
            done();
        });
    });

});