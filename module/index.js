/**
 * Generator for new individual squiz modules
 */
'use strict';

var util    = require('util');
var path    = require('path');
var fs      = require('fs');
var async   = require('async');
var yeoman  = require('yeoman-generator');
var exec    = require('child_process').exec;
var slang   = require('slang');
var chalk   = require('chalk');
var pkgRoot = path.resolve(process.cwd(), 'source/bower_components');

var SquizBoilerplateGenerator = module.exports = function SquizBoilerplateGenerator() {
    yeoman.generators.Base.apply(this, arguments);
    this.on('end', function () {
        this.installDependencies({ skipInstall: true, skipMessage: true });
    });

    this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
    this.registry = JSON.parse(this.readFileAsString(path.join(__dirname, '../moduleRegistry.json')));
};

util.inherits(SquizBoilerplateGenerator, yeoman.generators.Base);

SquizBoilerplateGenerator.prototype.askFor = function askFor() {
    var cb = this.async();
    var prompts = [{
        type: 'list',
        name: 'type',
        message: 'Do you want a custom module, or use an existing module?',
        choices: [{
            name: 'I want to create a new custom module',
            checked: true,
            value: 'custom'
        },{
            name: 'I want to pick an existing Squiz Boilerplate Module',
            checked: false,
            value: 'existing'
        }]
    }];

    this.prompt(prompts, function (props) {
        this.type = props.type;
        cb();
    }.bind(this));
};

SquizBoilerplateGenerator.prototype.createCustomModule = function() {
    var cb = this.async();
    if (this.type !== 'custom') {
        cb();
        return;
    }//end if

    var _ = this._;
    var self = this;

    var dest = 'source/modules/';

    var prompts = [{
        type: 'input',
        name: 'name',
        message: 'What name would you like to give the module?',
        validate: function (input) {
            var slug = _.slugify(input);
            if (input.match(/^\s*$/)) {
                return 'Module names cannot be blank';
            }//end if

            var prefix = 'squiz-module-';

            if (_.has(self.registry, prefix + slug)) {
                var existingModule = self.registry[prefix + slug];
                return 'There is already a module registered with this name "' +
                    (prefix + slug) + ' (' + existingModule.name + ')' +
                     '", please specify a different name';
            }//end if

            return true;
        }.bind(this),
        default: 'Test Module'
    }, {
        type: 'input',
        name: 'version',
        message: 'What version are you starting from?',
        validate: function (input) {
            if (!input.match(/^[0-9]+\.[0-9]+\.[0-9]+$/)) {
                return 'please use a valid SemVer number, e.g. 0.0.1';
            }
            return true;
        },
        default: '0.0.1'
    }, {
        type: 'input',
        name: 'description',
        message: 'Give this module a short description'
    }, {
        type: 'confirm',
        name: 'javascript',
        message: 'Will this module include any javascript?',
        default: true
    }, {
        type: 'confirm',
        name: 'jqueryPlugin',
        message: 'Do you require jQuery plugin scaffolding?',
        when: function (props) {
            return props.javascript;
        }.bind(this),
        default: false
    }, {
        type: 'input',
        name: 'pluginName',
        message: 'What name would you like to give your plugin? (this will appear in jQuery.fn.[pluginName])',
        when: function (props) {
            return props.jqueryPlugin;
        }.bind(this),
        default: function (props) {
            return slang.camelize(props.name);
        }.bind(this)
    }, {
        type: 'confirm',
        name: 'unitTests',
        message: 'Would you like to set up unit tests for your javascript?',
        when: function (props) {
            return props.javascript;
        }.bind(this),
        default: true
    }, {
        type: 'confirm',
        name: 'html',
        message: 'Will this module include HTML fragments/examples?',
        default: true
    }, {
        type: 'checkbox',
        name: 'stylesheets',
        message: 'Select/De-select any Sass files you require (you can add your own later if you wish, just follow the naming conventions)',
        choices: [{
            name: 'Global (all screen sizes)',
            checked: true,
            value: {
                name: 'global.scss'
            }
        }, {
            name: 'Medium (tablets, very low resolution desktop and higher)',
            checked: true,
            value: {
                name: 'medium.scss'
            }
        }, {
            name: 'Wide (desktops and higher)',
            checked: false,
            value: {
                name: 'wide.scss'
            }
        }, {
            name: 'Extra Wide (high resolution desktops, televisions and higher)',
            checked: false,
            value: {
                name: 'extra_wide.scss'
            }
        }, {
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
        this.unitTests = props.unitTests;

        this.cssName = _.slugify(props.name);
        this.camelCaseName = slang.camelize(props.name);

        cb();
    }.bind(this));
};

function isModuleInstalled(name) {
    return fs.existsSync(path.resolve(pkgRoot, name));
}

SquizBoilerplateGenerator.prototype.pickExistingModule = function() {
    var cb = this.async();
    if (this.type !== 'existing') {
        cb();
        return;
    }//end if

    var _ = this._;
    var self = this;

    // Prompt for the available list of modules
    var prompts = [{
        type: 'checkbox',
        name: 'modules',
        message: 'Select the Squiz modules you would like to use (or de-select those you want to remove)',
        choices: _.map(self.registry, function (config, name) {
            var installed = isModuleInstalled(name);
            return {
                name: config.name,
                checked: installed,
                value: {
                    name: name,
                    installed:  installed,
                    repository: config.repository
                }
            };
        })
    }, {
        type: 'confirm',
        name: 'exitPrompt',
        message: 'You\'ve select to remove module/s, are you sure you want to do this?',
        when: function (props) {
            self.removeModules =
                _.chain(self.registry)
                .map(function (config, id) {
                    config.id = id;
                    return config;
                })
                .filter(function (config) {
                    return isModuleInstalled(config.id) && !_.any(props.modules, { name: config.id });
                })
                .value();
            return _.size(self.removeModules) >= 1;
        },
        'default': false
    }];

    this.prompt(prompts, function (props) {
        this.modules = props.modules;
        cb();
    }.bind(this));
};

SquizBoilerplateGenerator.prototype.boilerplate = function boilerplate() {
    var _ = this._;
    if (this.type === 'custom') {
        // It's a custom module, create it based on user choices
        this.mkdir(this.dir);

        this.template('css/variables.scss', this.dir + '/css/variables.scss');
        this.template('README.md', this.dir + '/README.md');
        this.template('_bower.json', this.dir + '/bower.json');

        // Copy the core example stylesheet with each specified varation
        this._.each(this.stylesheets, function (sassFile) {
            this.template('css/styles.scss', this.dir + '/css/' + sassFile.name);
        }.bind(this));

        if (this.javascript) {
            this.template('js/global.js', this.dir + '/js/global.js');
            if (this.jqueryPlugin) {
                this.template('js/plugin.js', this.dir + '/js/plugin.js');
            }//end if
        }//end if

        if (this.html) {
            this.template('html/index.html', this.dir + '/html/index.html');
        }//end if

        if (this.unitTests) {
            this.mkdir(this.dir + '/tests');
            this.template('tests/spec.html', this.dir + '/tests/spec.html');
            this.template('tests/spec.js', this.dir + '/tests/spec.js');
        }//end if
    } else {
        var allModules = _.map(this.registry, function (config, name) {
            config.id = name;
            return config;
        });

        // Process modules to be installed/removed via bower
        async.forEachSeries(allModules, function(module, next) {
            var installed = isModuleInstalled(module.id);
            var remove    = installed && _.any(this.removeModules, { id: module.id });
            var install   = !installed && _.any(this.modules, { name: module.id });
            if (remove) {
                console.log(chalk.red('Removing module: ') + chalk.yellow(module.id));
                exec('bower ' + ['uninstall', module.id, '--save'].join(' '), function(err) {
                    next(err);
                });
            } else if (install) {
                console.log(chalk.green('Installing module: ') + chalk.yellow(module.id));
                exec('bower ' + ['install', module.repository, '--save', '--force-latest'].join(' '), function(err) {
                        next(err);
                    });
            } else {
                next();
            }//end if
        }.bind(this), function(err) {
            if (err) {
                console.log(chalk.red('Install issues encountered.'));
            } else {
                console.log(chalk.green('Done.'));
            }
        });
    }//end if
};