'use strict';
var util = require('util');
var fs   = require('fs');
var path = require('path');
var yeoman = require('yeoman-generator');
var lingo = require('lingo');

var SquizBoilerplateGenerator = module.exports = function SquizBoilerplateGenerator(args, options, config) {
    var self = this;
    yeoman.generators.Base.apply(this, arguments);

    this.on('end', function () {
        this.installDependencies({ skipInstall: true });
    });

    this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(SquizBoilerplateGenerator, yeoman.generators.Base);

SquizBoilerplateGenerator.prototype.askFor = function askFor() {
    var cb = this.async();
    var _ = this._;

    var dest = 'source/modules/';

    var registry = JSON.parse(this.readFileAsString(path.join(__dirname, '../moduleRegistry.json')));

    var prompts = [{
        type: 'input',
        name: 'name',
        message: 'What name would you like to give the module?',
        validate: function(input) {
            var slug = _.slugify(input);
            var moduleDir = dest + slug;
            if (input.match(/^\s*$/)) {
                return 'Module names cannot be blank';
            }//end if

            var prefix = 'squiz-module-';

            if (_.has(registry, prefix + slug)) {
                var existingModule = registry[prefix + slug];
                return 'There is already a module registered with this name "' +
                    (prefix + slug) + ' (' + existingModule.name + ')' +
                     '", please specify a different name';
            }//end if

            return true;
        }.bind(this),
        default: 'Test Module'
    },{
        type: 'input',
        name: 'version',
        message: 'What version are you starting from?',
        validate: function(input) {
            if (!input.match(/^[0-9]+\.[0-9]+\.[0-9]+$/)) {
                return 'please use a valid SemVer number, e.g. 0.0.1';
            }
            return true;
        },
        default: '0.0.0'
    },{
        type: 'input',
        name: 'description',
        message: 'Give this module a short description'
    },{
        type: 'confirm',
        name: 'javascript',
        message: 'Will this module include any javascript?',
        confirm: true
    },{
        type: 'confirm',
        name: 'jqueryPlugin',
        message: 'Do you require jQuery plugin scaffolding?',
        when: function(props) {
            return props.javascript;
        }.bind(this),
        confirm: false
    },{
        type: 'input',
        name: 'pluginName',
        message: 'What name would you like to give your plugin? (this will appear in jQuery.fn.[pluginName])',
        when: function(props) {
            return props.jqueryPlugin;
        }.bind(this),
        default: function(props) {
            return lingo.camelcase(props.name);
        }.bind(this)
    },{
        type: 'confirm',
        name: 'html',
        message: 'Will this module include HTML fragments/examples?',
        confirm: true
    },{
        type: 'checkbox',
        name: 'stylesheets',
        message: 'Select/De-select any Sass files you require (you can add your own later if you wish, just follow the naming conventions)',
        choices: [{
                name: 'Global (all screen sizes)',
                checked: true,
                value: {
                    name: 'global.scss'
                }
            },{
                name: 'Medium (tablets, very low resolution desktop and higher)',
                checked: true,
                value: {
                    name: 'medium.scss'
                }
            },{
                name: 'Wide (desktops and higher)',
                checked: false,
                value: {
                    name: 'wide.scss'
                }
            },{
                name: 'Extra Wide (high resolution desktops, televisions and higher)',
                checked: false,
                value: {
                    name: 'extra_wide.scss'
                }
            },{
                name: 'Print (any custom print styles)',
                checked: false,
                value: {
                    name: 'print.scss'
                }
            }]
    }];

    this.prompt(prompts, function (props) {
        this.name = props.name;
        this.description = props.description;
        this.dir  = dest + _.slugify(props.name);
        this.javascript = props.javascript;
        this.jqueryPlugin = props.jqueryPlugin;
        this.html = props.html;
        this.stylesheets = props.stylesheets;
        this.version = props.version;
        this.pluginName = props.pluginName;

        this.cssName = _.slugify(props.name);
        this.camelCaseName = lingo.camelcase(props.name);

        cb();
    }.bind(this));
};

SquizBoilerplateGenerator.prototype.boilerplate = function boilerplate() {
    this.mkdir(this.dir);

    this.template('css/variables.scss', this.dir + '/css/variables.scss');
    this.template('README.md', this.dir + '/README.md');
    this.template('_bower.json', this.dir + '/.bower.json');

    // Copy the core example stylesheet with each specified varation
    this._.each(this.stylesheets, function(sassFile) {
        this.template('css/styles.scss', this.dir + '/css/' + sassFile.name);
    }.bind(this));

    if (this.javascript) {
        this.template('js/global.js', this.dir + '/js/global.js');
        if (this.jqueryPlugin) {
            this.template('js/plugin.js', this.dir + '/js/plugin.js');
            this.mkdir(this.dir + '/tests');
            this.template('tests/spec.html', this.dir + '/tests/spec.html');
            this.template('tests/spec.js', this.dir + '/tests/spec.js');
        }//end if
    }//end if

    if (this.html) {
        this.template('html/index.html', this.dir + '/html/index.html');
    }//end if
};