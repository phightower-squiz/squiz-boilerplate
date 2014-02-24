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
        if (!options['skip-install']) {
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
        }//end if
    });

    this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(SquizBoilerplateGenerator, yeoman.generators.Base);

/**
 * Converts an expected number or pixel unit value to ems
 * @param  {mixed}  value        The value to convert
 * @param  {string} defaultValue A sane default if no match can be found
 * @return {string}              Text value with em units attached
 */
function enforceEms (value, defaultValue) {
    var base = 16;

    // If it's a number do the conversion from pixel to ems
    if (typeof(value) === 'number') {
        return value/base + 'em';
    }//end if

    // Check to see if we've already specified ems
    if (value.match(/em$/)) {
        return value;
    }// end if

    // A whole number without units attached is considered a pixel value, e.g.
    // 768
    if (value.match(/^[0-9]+$/)) {
        return parseFloat(value)/base + 'em';
    }//end if

    // A decimal value is considered em, since you can't effectively have half a pixel
    if (value.match(/^[0-9]+\.[0-9]+$/)) {
        return value + 'em';
    }//end if

    // If 'px' was specified find the numerical value and strip the unit to calculate ems
    if (value.match(/^[0-9]+\s+?px$/)) {
        var px = parseFloat(value.replace(/\s+?px$/, ''));
        return px/base + 'em';
    }//end if

    return defaultValue;
}//end enforceEms

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
    }, {
        type: 'input',
        name: 'mediumMQ',
        message: 'Set min width media query for medium/tablet (pixel units will be auto-converted to ems)',
        default: '37.5em'
    }, {
        type: 'input',
        name: 'wideMQ',
        message: 'Set min width media query wide/desktop (pixel units will be auto-converted to ems)',
        default: '60em'
    }, {
        type: 'confirm',
        name: 'ie8',
        message: 'Is Internet Explorer version 8 or older required?',
        default: false
    }, {
        type: 'confirm',
        name: 'ieConditionals',
        message: 'Should IE conditional tags be added to the body?',
        default: true
    }, {
        type: 'confirm',
        name: 'unitTest',
        message: 'Include Unit Tests? (Useful if you are developing new additions to the boilerplate)',
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
        this.name        = props.name;
        this.email       = props.email;
        this.version     = props.version;
        this.description = props.description;
        this.modules     = props.modules;
        this.matrix      = props.matrix;
        this.unitTest    = props.unitTest;

        // 3rd party frameworks
        this.includeFoundation = props.foundation;
        this.includeBootstrap  = props.bootstrap;

        // IE 8 and conditionals
        this.ie8            = props.ie8;
        this.cssTagStyle    = props.cssTagStyle;
        this.ieConditionals = props.ieConditionals;

        // Media queries
        this.mediumMQ = enforceEms(props.mediumMQ, '37.5em');
        this.wideMQ   = enforceEms(props.wideMQ, '60em');

        var modules = _.pluck(props.modules, 'name');

        // Module/Plugin defaults
        this.bootstrap  = _.contains(modules, 'bootstrap-sass');
        this.typeahead  = _.contains(modules, 'squiz-module-typeahead');
        this.flexslider = _.contains(modules, 'squiz-module-flexslider');
        this.dataTable  = _.contains(modules, 'squiz-module-datatables');

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

                // Determine if this value matches anything in the selected props array
                var jsFile = _.isUndefined(_.find(props, function (val) {
                    var test = new RegExp("^" + value.replace(/\.js$/, ''));
                    return val.value.match(test);
                }));

                imports.push(getJSImport('bootstrap-sass/js/' + value, jsFile));
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

////////////////
// Copy Files //
////////////////
SquizBoilerplateGenerator.prototype.boilerplate = function boilerplate() {
    this.copy('_package.json', 'package.json');
    this.copy('_bower.json', 'bower.json');
    this.copy('.bowerrc', '.bowerrc');
    this.copy('.jshintrc', '.jshintrc');
    this.copy('_gitignore', '.gitignore');
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

    if (this.ie8) {
        this.template('source/html/_head-ie8.html', 'source/html/_head.html');
    } else {
        this.template('source/html/_head-single.html', 'source/html/_head.html');
    }//end if

    this.template('source/html/_foot.html', 'source/html/_foot.html');
    this.template('source/html/index.html', 'source/html/index.html');

    /*if (this.includeFoundation) {
        this.copy('foundation/settings.scss', 'source/styles/imports/foundation_settings.scss');
        this.copy('foundation/_tmp.scss', 'source/styles/imports/foundation.scss');
        this.copy('foundation/_tmp.html', 'source/html/fragments/foundation.html');
    }*/
};