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
    bootstrap: true,
    mediumMQ: '37.5em',
    wideMQ: '60em',
    ie8: false,
    ieConditionals: false,
    modules: []
};

describe('Squiz Boilerplate generator test', function () {

    before(function (done) {
        this.timeout(5*60*1000);
        rimraf(tmpDir, done);
    });

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
            this.webapp.options['skip-install'] = false;

            // Turn on dependency caching to make sure npm uses cached data instead of fresh
            // each time this is run.
            this.webapp.options['bower-offline'] = false;
            this.webapp.options['npm-cache'] = true;

            // Put the webapp in test mode which will mute certain outputs
            this.webapp.options['test-mode'] = true;
            done();
        }.bind(this));
    });

    it('the generator can be required without throwing an error', function () {
        // not testing the actual run of generators yet
        this.app = require('../app');
    });

    it('creates expected files with a custom directory', function (done) {
        this.timeout(10*60*1000);

        // Bootstrap options
        this.webapp.build = 'custom';
        this.webapp.bootstrapComponentsCSS = ['type', 'code'];
        this.webapp.bootstrapComponentsJS = [];
        this.webapp.includeBootstrap = true;

        var dir = tmpDir + '/gen/';

        var expected = [
            [dir + 'package.json', /"name": "my-test-project"/],
            [dir + 'bower.json', /"name": "my-test-project"/],
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
            dir + 'source/html/index.html',
            [dir + 'source/styles/imports/bootstrap.scss', /\n@import "bootstrap-sass\/lib\/type";/],
            dir + 'source/styles/imports/bootstrap_variables.scss',
            dir + 'Gruntfile.js',
            dir + 'dist/index.html',
            [
                dir + 'dist/styles/main.css',
                // The content exists with keyword replacements
                / \* file:    main\.css/
            ],
            dir + 'dist/mysource_files/robots.txt',
            dir + 'dist/js/vendor/jquery.min.js',
            dir + 'dist/js/vendor/modernizr.min.js',
            dir + 'dist/js/global.js',
            dir + 'dist/js/plugins.min.js',

            // Bower squiz modules
            dir + 'source/bower_components/squiz-module-google-analytics/bower.json'
        ];

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
                [dir + 'bower.json', new RegExp("\\s{4}\"" + prop + "\": \"(.*)\"", "g")]
            );
        }//end for
        testProject.modules = modules;

        helpers.mockPrompt(this.webapp, testProject);

        this.webapp.run({}, function () {

        });

        this.webapp.on('buildComplete', function() {
            helpers.assertFiles(expected);
            done();
        }.bind(this));
    });
});