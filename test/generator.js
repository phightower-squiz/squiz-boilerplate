/**
 * Tests to figure out whether the generator itself is creating
 * the right files without errors
 */

/*global describe, beforeEach, it*/

var path    = require('path');
var rimraf  = require('rimraf');
var helpers = require('yeoman-generator').test;
var tmpDir  = path.join(__dirname, 'tmp');
var assert  = require('assert');

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

function clearTmpDir(done) {
    // 5 mins to clear directory
    this.timeout(5*60*1000);
    rimraf(tmpDir, done);
}

describe('Squiz Boilerplate generator test', function () {

    // Make sure we've cleaned up for testing
    before(clearTmpDir);
    //after(clearTmpDir);

    beforeEach(function (done) {
        this.timeout(10*60*1000);
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

            // Turn on dependency caching to make sure npm uses cached data instead of fresh
            // each time this is run.
            this.webapp.options['bower-offline'] = false;
            this.webapp.options['npm-cache'] = true;

            // Put the webapp in test mode which will mute certain outputs
            this.webapp.options['test-mode'] = true;
            done();
        }.bind(this));
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
            [dir + 'package.json', /"name": "my-test-project"/],
            [dir + '/bower.json', /"name": "my-test-project"/],
            dir + '.bowerrc',
            dir + '.jshintrc',
            dir + 'config.json',
            dir + 'Gruntfile.js',
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
        this.timeout(10*60*1000);
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

    it ('builds a custom project based on user selections', function (done) {
        ///////////////
        // BOOTSTRAP //
        ///////////////
        testProject.bootstrap = true;

        // We might need some extra time out to allow the script to fetch the packages
        this.timeout(5*60*1000);

        // Need to test that a custom build brings in the components we want, and not
        // the ones that aren't needed. Difficult to test so we'll test a couple
        this.webapp.build = 'custom';
        this.webapp.bootstrapComponentsCSS = ['type', 'code'];
        this.webapp.bootstrapComponentsJS = [];
        this.webapp.includeBootstrap = true;

        // Expected new files
        var expected = [
            [tmpDir + '/source/styles/imports/bootstrap.scss', /\n@import "bootstrap-sass-official\/assets\/stylesheets\/bootstrap\/type";/],
            tmpDir + '/source/styles/imports/bootstrap_variables.scss'
        ];

        ///////////////////
        // Squiz Modules //
        ///////////////////

        var moduleRegistry = JSON.parse(this.webapp.readFileAsString(path.join(__dirname, '../moduleRegistry.json')));
        var modules = [];

        // Loop all of the modules and make them selected
        for (var prop in moduleRegistry) {
            modules.push({
                name: prop,
                repository: moduleRegistry[prop].repository
            });

            // We need each module selected to appear in the bower.json
            expected.push(
                [tmpDir + '/bower.json', new RegExp("\\s{4}\"" + prop + "\": \"(.*)\"", "g")]
            );
        }//end for
        testProject.modules = modules;

        assert(modules.length >= 1, 'The modules were read and populated correctly');

        helpers.mockPrompt(this.webapp, testProject);

        this.webapp.run({}, function () {
            helpers.assertFiles(expected);
            done();
        });
    });

    it('runs install commands (npm, bower, grunt)', function (done) {
        // Timeout after 30 mins
        this.timeout(1000*60*30);

        testProject.createDirectory = false;
        testProject.customDirectory = '';

        helpers.mockPrompt(this.webapp, testProject);

        // Now change the install options to allow npm, bower and grunt to run
        this.webapp.options['skip-install'] = false;

        this.webapp.run({}, function() {
            // no op
        });

        this.webapp.on('buildComplete', function() {
            helpers.assertFiles([
                tmpDir + '/Gruntfile.js',
                tmpDir + '/dist/index.html',
                [
                    tmpDir + '/dist/styles/main.css',
                    // The content exists with keyword replacements
                    / \* file:    main\.css/
                ],
                tmpDir + '/dist/mysource_files/robots.txt',
                tmpDir + '/dist/js/vendor/jquery.min.js',
                tmpDir + '/dist/js/vendor/modernizr.min.js',
                tmpDir + '/dist/js/global.js',
                tmpDir + '/dist/js/plugins.min.js',

                // Bower squiz modules
                tmpDir + '/source/bower_components/squiz-module-google-analytics/bower.json'
            ]);

            done();
        }.bind(this));
    });
});