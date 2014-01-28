/**
 * Main boilerplate generator
 */

'use strict';

var util   = require('util');
var fs     = require('fs');
var path   = require('path');
var yeoman = require('yeoman-generator');
var lingo  = require('lingo');

var SquizBoilerplateGenerator = module.exports = function SquizBoilerplateGenerator(args, options) {
    yeoman.generators.Base.apply(this, arguments);

    this.cachedDeps = options['cached-deps'] || false;

    this.on('end', function () {
        this.log.writeln('Installing dependencies using npm and bower. Cache: ' + this.cachedDeps);
        this.npmInstall(null, {
            skipInstall: options['skip-install'],
            cacheMin: this.cachedDeps ? 999999 : 0
        }, function () {
            this.bowerInstall(null, {
                skipInstall: options['skip-install'],
                offline: this.cachedDeps,
                forceLatest: true // Supplies --force-latest in the bower install
            }, function () {
                this.spawnCommand('grunt', ['build']);
            }.bind(this));
        }.bind(this));
        // this.installDependencies({
        //     skipInstall: options['skip-install'],
        //     forceLatest: true, // Supplied --force-latest to the install commands auto-resolving conflicts
        //     callback: function () {
        //         // Run the initial build
        //         if (!options['skip-install']) {
        //             this.spawnCommand('grunt', ['build']);
        //         }//end if
        //     }.bind(this)
        // });
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
    console.log(fs.readFileSync(logo, {encoding: 'utf8'}));
    console.log('Squiz Boilerplate Generator');

    // Read the module registry configuration to allow a display of module choices
    var registry = JSON.parse(this.readFileAsString(path.join(__dirname, '../moduleRegistry.json')));

    var currentDir = path.basename(process.cwd());
    var projectName = lingo.capitalize(currentDir.replace(/[\-_]+/gm, ' '));

    var prompts = [{
        type: 'input',
        name: 'name',
        message: 'What name would you like to give your boilerplate?',
        validate: function (input) {
            if (input.match(/^\s*$/)) {
                return 'You need to give the boilerplate a name';
            }
            return true;
        },
        default: projectName
    }, {
        type: 'input',
        name: 'description',
        message: 'Enter a description for this boilerplate',
        default: 'A Squiz Boilerplate design cutup'
    }, {
        type: 'input',
        name: 'email',
        message: 'What email would you like to use?',
        default: function () {
            return ((_.has(process.env, 'USER')) ? process.env.USER : '<name>') + '@squiz.com.au';
        }
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
        type: 'confirm',
        name: 'matrix',
        message: 'Is this a design cutup for Squiz Matrix?',
        default: true
    }, {
        type: 'confirm',
        name: 'bootstrap',
        message: 'Include components from Twitter Bootstrap 3?',
        default: false
    },/* {
        type: 'confirm',
        name: 'foundation',
        message: 'Include components from Zurb Foundation 5?',
        default: false
    }, */{
        type: 'confirm',
        name: 'unitTest',
        message: 'Include Unit Tests? (Useful if you are developing or otherwise altering the boilerplate from default)',
        default: false
    }];

    function getModuleChoices() {
        var choices = _.map(registry, function (config, name) {
            return {
                name: config.name,
                checked: false,
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
        message: 'Select the Squiz modules you would like to use',
        choices: getModuleChoices()
    });

    this.prompt(prompts, function (props) {
        this.name = props.name;
        this.email = props.email;
        this.version = props.version;
        this.description = props.description;
        this.modules = props.modules;
        this.matrix = props.matrix;
        this.unitTest = props.unitTest;

        // 3rd party frameworks
        this.includeFoundation = props.foundation;
        this.includeBootstrap = props.bootstrap;
        cb();
    }.bind(this));
};

////////////////////////////
// Build helper functions //
////////////////////////////

function getSassImport(path, comment) {
    return ((comment) ? '// ' : '') + '@import "' + path + '";';
}//end getSassImport()

function getJSImport(path, comment) {
    return '<!--' + ((comment) ? '@@ ' : ' ') +
                'import:js source/bower_components/' + path + ' ' +
            ((comment) ? '@@' : '') + '-->';
}//end getJSImport()

function fetchBootstrapComponentInfo($elem, _) {
    // Determine dependencies
    var dependents = [];
    if ($elem.data('dependents')) {
        dependents = _.map($elem.attr('data-dependents').split(','), function (fileName){
            return fileName.replace('.less', '');
        });
    }//end if

    // Get a trimmed name value to use as a display name
    var name = _.trim($elem.parent().text());
    var value = $elem.val().split('.').shift();

    return {
        name: name,
        value: value,
        dependents: dependents
    };
}//end fetchBootstrapComponentInfo()

/////////////////////////
// Customise Bootstrap //
/////////////////////////
SquizBoilerplateGenerator.prototype.bootstrap = function bootstrap() {
    if (!this.includeBootstrap) {
        return;
    }//end if

    var cb        = this.async();
    var _         = this._;
    var url       = 'http://getbootstrap.com/customize/';

    var $ = require('cheerio');
    var request = require('request');

    this.log.writeln('Bootstrap component selection (hint: don\'t worry you can change this later manually)');
    this.log.writeln('Fetching remote', url);
    request(url, function (err, resp, html) {
        if (err) {
            this.log.error(err);
            cb();
            return;
        }//end if

        var page = $.load(html);

        var cssChoices = [];
        var jsChoices  = [];

        // Find all the .less components
        var lessComponents = page('#less-section input[type="checkbox"]');
        lessComponents.each(function () {
            var info = fetchBootstrapComponentInfo($(this), _);

            // Build the choice to present to the user
            cssChoices = cssChoices.concat([{
                name: info.name,
                checked: false,
                value: info
            }]);
        });

        // Find all the .less components
        var pluginComponents = page('#plugin-section input[type="checkbox"]');
        pluginComponents.each(function () {
            var info = fetchBootstrapComponentInfo($(this), _);

            // Build the choice to present to the user
            jsChoices = jsChoices.concat([{
                name: info.name,
                checked: false,
                value: info
            }]);
        });

        // Build the bootstrap sass output into a temporary file
        function buildBootstrapSass (props) {
            // Start with the content in this folder first, it's our base file
            var content = fs.readFileSync(path.join(__dirname, 'templates/bootstrap/bootstrap.scss'), {encoding: 'utf8'});
            var imports = [];

            var selectedWithDeps = [];
            _.each(props, function(selection) {
                selectedWithDeps.push(selection.value);
                selectedWithDeps = selectedWithDeps.concat(selection.dependents);
            });

            selectedWithDeps = _.uniq(selectedWithDeps);

            // Loop each component building an import directive.
            // Only selected choices are output as uncommented directives.
            lessComponents.each(function () {
                var value = $(this).val().replace('.less','');
                var sassFile = 'bootstrap-sass/lib/' + value;
                imports.push(getSassImport(sassFile, _.indexOf(selectedWithDeps, value) === -1));
            });

            content += imports.join('\n');

            // Write out a temporary file
            fs.writeFileSync(path.join(__dirname, 'templates/bootstrap/_tmp.scss'), content);
        }//end buildBootstrapSass

        // Build the bootstrap JS choices into a temporary file
        function buildBootstrapJS (props) {
            var content = fs.readFileSync(path.join(__dirname, 'templates/bootstrap/bootstrap.html'), {encoding: 'utf8'});
            var imports = [];

            // Loop each component building an import directive.
            // Only selected choices are output as uncommented directives.
            pluginComponents.each(function () {
                var value = $(this).val();
                var jsFile = 'bootstrap-sass/js/' + value;
                imports.push(getJSImport(jsFile, _.indexOf(props, value) === -1));
            });

            content += imports.join('\n');

            // Write out a temporary file
            fs.writeFileSync(path.join(__dirname, 'templates/bootstrap/_tmp.html'), content);
        }//end buildBootstrapSass

        var prompts = [{
            type: 'list',
            name: 'build',
            message: 'What type of Bootstrap build do you want?',
            choices: [
                {
                    name: 'Let me choose the components',
                    value: 'custom'
                },
                {
                    name: 'Include all components and I can customise later on',
                    value: 'all'
                },
            ]
        }, {
            type: 'checkbox',
            name: 'bootstrapComponentsCSS',
            message: 'Select the Bootstrap CSS components (dependencies automatically resolve)',
            when: function (props) {
                return props.build === 'custom';
            },
            choices: cssChoices
        }, {
            type: 'checkbox',
            name: 'bootstrapComponentsJS',
            message: 'Select the Bootstrap JS plugin components',
            when: function (props) {
                return props.build === 'custom';
            },
            choices: jsChoices
        }];

        this.prompt(prompts, function(props) {
            if (props.build === 'custom') {
                buildBootstrapSass(props.bootstrapComponentsCSS);
                buildBootstrapJS(props.bootstrapComponentsJS);
            } else {
                buildBootstrapSass(_.map(lessComponents, function(component) {
                    return fetchBootstrapComponentInfo($(component), _);
                }));
                buildBootstrapJS(_.map(pluginComponents, function(component) {
                    return fetchBootstrapComponentInfo($(component), _);
                }));
            }//end if
            cb();
        }.bind(this));
    }.bind(this));
};

//////////////////////////
// Customise Foundation //
//////////////////////////
/*SquizBoilerplateGenerator.prototype.foundation = function foundation() {
    if (!this.includeFoundation) {
        return;
    }//end if

    var cb        = this.async();
    var _         = this._;
    var url       = 'http://foundation.zurb.com/develop/download.html';

    var $ = require('cheerio');
    var request = require('request');

    this.log.writeln('Foundation component selection (hint: don\'t worry you can change this later manually)');
    this.log.writeln('Fetching remote', url);
    request(url, function (err, resp, html) {
        if (err) {
            this.log.error(err);
            cb();
            return;
        }//end if

        var page = $.load(html);
        var foundationChoices = [];

        var allCSS = [];
        var allJS  = [];

        // Loop through the component inputs sourced from the HTML
        var components = page('input[name^="scss_components"]');
        components.each(function (){
            var name  = $(this).parent().text();
            var css   = $(this).val();
            var js    = $(this).attr('data-js-dependency');

            foundationChoices.push({
                name: name,
                value: css,
                js: js,
                checked: false
            });

            if (js) {
                allJS.push(js);
            }//end if

            allCSS.push(css);
        });

        var prompts = [{
            type: 'list',
            name: 'build',
            message: 'What type of Foundation build do you want?',
            choices: [
                {
                    name: 'Let me choose the components',
                    value: 'custom'
                },
                {
                    name: 'Include all components and I can customise later on',
                    value: 'all'
                },
            ]
        }, {
            type: 'checkbox',
            name: 'foundationComponents',
            message: 'Select the foundation components you want',
            when: function (props) {
                return props.build === 'custom';
            },
            choices: foundationChoices
        }];

        function buildFoundationCSS (props) {
            // Start with the content in this folder first, it's our base file
            var content = fs.readFileSync(path.join(__dirname, 'templates/foundation/foundation.scss'), {encoding: 'utf8'});
            var imports = [];

            // Build an array of selected components
            var selected = _.map(props, function (prop) {
                if (_.has(prop, 'value')) {
                    return prop.value;
                }
                return prop;
            });

            // Loop each component building an import directive.
            // Only selected choices are output as uncommented directives.
            components.each(function () {
                var value = $(this).val();
                var sassFile = 'foundation/scss/' + value;
                imports.push(getSassImport(sassFile, _.indexOf(selected, value) === -1));
            });

            content += imports.join('\n');

            // Write out a temporary file
            fs.writeFileSync(path.join(__dirname, 'templates/foundation/_tmp.scss'), content);
        }//end buildFoundationCSS

        function buildFoundationJS (props) {
            // Start with the content in this folder first, it's our base file
            var content = fs.readFileSync(path.join(__dirname, 'templates/foundation/foundation.html'), {encoding: 'utf8'});
            var imports = [];

            // Build an array of selected components
            var selected = _.map(props, function (prop) {
                if (_.has(prop, 'value')) {
                    return prop.value;
                }
                return prop;
            });

            // Loop each component building an import directive.
            // Only selected choices are output as uncommented directives.
            components.each(function () {
                var value = $(this).val();
                var jsDep = $(this).attr('data-js-dependency');
                if (jsDep) {
                    _.each(jsDep.split(','), function(jsFile) {
                        jsFile = 'foundation/js/' + jsFile;
                        imports.push(getJSImport(jsFile, _.indexOf(selected, value) === -1));
                    });
                }//end if
            });

            content += imports.join('\n');

            // Write out a temporary file
            fs.writeFileSync(path.join(__dirname, 'templates/foundation/_tmp.html'), content);
        }//end buildFoundationJS

        this.prompt(prompts, function(props) {
            if (props.build === 'custom') {
                buildFoundationCSS(props.foundationComponents);
                buildFoundationJS(props.foundationComponents);
            } else {
                buildFoundationCSS(allCSS);
                buildFoundationJS(allCSS);
            }//end if
            cb();
        }.bind(this));
    }.bind(this));
};//end foundation*/


////////////////
// Copy Files //
////////////////
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

    if (this.unitTest) {
        this.directory('test', 'test');
    }//end if

    this.mkdir('source/html/fragments');

    if (this.includeBootstrap) {
        this.copy('bootstrap/variables.scss', 'source/styles/imports/bootstrap_variables.scss');
        this.copy('bootstrap/_tmp.scss', 'source/styles/imports/bootstrap.scss');
        this.copy('bootstrap/_tmp.html', 'source/html/fragments/bootstrap.html');
    }

    /*if (this.includeFoundation) {
        this.copy('foundation/settings.scss', 'source/styles/imports/foundation_settings.scss');
        this.copy('foundation/_tmp.scss', 'source/styles/imports/foundation.scss');
        this.copy('foundation/_tmp.html', 'source/html/fragments/foundation.html');
    }*/
};