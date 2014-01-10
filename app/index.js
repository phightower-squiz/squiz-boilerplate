'use strict';
var util = require('util');
var fs   = require('fs');
var path = require('path');
var yeoman = require('yeoman-generator');

var SquizBoilerplateGenerator = module.exports = function SquizBoilerplateGenerator(args, options, config) {
    yeoman.generators.Base.apply(this, arguments);

    this.on('end', function () {
        this.installDependencies({
            skipInstall: options['skip-install'],
            callback: function () {
                // Run the initial build
                if (!options['skip-install']) {
                    this.spawnCommand('grunt', ['build']);
                }//end if
            }.bind(this)
        });
    });

    this.hookFor('squiz-boilerplate', {as: 'html'});

    this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(SquizBoilerplateGenerator, yeoman.generators.Base);

SquizBoilerplateGenerator.prototype.askFor = function askFor() {
    var cb = this.async();
    var _ = this._;

    // Greet the user with the squiz logo and message
    var logo = path.resolve(__dirname, './squiz.txt');
    console.log(logo);
    console.log(fs.readFileSync(logo, {encoding: 'utf8'}));
    console.log('Squiz Boilerplate Generator');

    // Read the module registry configuration to allow a display of module choices
    var registry = JSON.parse(this.readFileAsString(path.join(__dirname, '../moduleRegistry.json')));

    var prompts = [{
        type: 'input',
        name: 'name',
        message: 'What name would you like to give your boilerplate?',
        validate: function(input) {
            if (input.match(/^\s*$/)) {
                return 'You need to give the boilerplate a name';
            }
            return true;
        },
        default: 'Squiz Boilerplate'
    },{
        type: 'input',
        name: 'description',
        message: 'Enter a description for this boilerplate',
        default: 'A Squiz Boilerplate design cutup'
    },{
        type: 'input',
        name: 'email',
        message: 'What email would you like to use?',
        default: function() {
            return ((_.has(process.env, 'USER')) ? process.env.USER : '<name>') + '@squiz.com.au';
        }
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
        name: 'jqueryVersion',
        message: 'What version of jQuery do you want?',
        default: '~1.10.2'
    },{
        type: 'confirm',
        name: 'matrix',
        message: 'Is this a design cutup for Squiz Matrix?',
        default: true
    }];

    function getModuleChoices() {
        var choices = _.map(registry, function(config, name) {
            return {
                name: config.name,
                checked: true,
                value: {
                    name: name,
                    repository: config.repository
                }
            };
        });
        return choices;
    }//end getModuleList()

    // Prompt for the available list of modules
    prompts = prompts.concat({
        type: 'checkbox',
        name: 'modules',
        message: 'Select the modules you would like to use (arrow keys to navigate, spacebar to toggle)',
        choices: getModuleChoices()
    });

    this.prompt(prompts, function (props) {
        this.name = props.name;
        this.email = props.email;
        this.version = props.version;
        this.description = props.description;
        this.jqueryVersion = props.jqueryVersion;
        this.modules = props.modules;
        this.matrix = props.matrix;
        cb();
    }.bind(this));
};

SquizBoilerplateGenerator.prototype.boilerplate = function boilerplate() {
    this.copy('_package.json', 'package.json');
    this.copy('_bower.json', '.bower.json');
    this.copy('.bowerrc', '.bowerrc');
    this.copy('.jshintrc', '.jshintrc');
    this.copy('.gitignore', '.gitignore');
    this.copy('config.json', 'config.json');
    this.copy('Gruntfile.js', 'Gruntfile.js');
    this.copy('README.md', 'README.md');

    // Copy these directories
    this.directory('source/files', 'source/files');
    this.directory('source/js', 'source/js');
    this.directory('source/modules', 'source/modules');
    this.directory('source/styles', 'source/styles');
    this.mkdir('source/html');
    this.directory('tasks', 'tasks');
    this.directory('lib', 'lib');

    if (this.matrix) {
        this.copy('source/html/parse.html', 'source/html/parse.html');
    }//end if
};