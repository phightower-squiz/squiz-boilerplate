/**
 * Main boilerplate generator
 */

'use strict';

var util   = require('util');
var fs     = require('fs');
var path   = require('path');
var yeoman = require('yeoman-generator');
var slang  = require('slang');
var moment = require('moment');
var chalk  = require('chalk');

var SquizBoilerplateGenerator = module.exports = function SquizBoilerplateGenerator(args, options) {
    yeoman.generators.Base.apply(this, arguments);

    // A final message with some instructions
    function writeEndMessage(depsInstalled) {
        this.emit('buildComplete');
        if (options['test-mode']) {
            return;
        }
        this.log.writeln('\n**************    Intall Completed    ****************');
        if (!depsInstalled) {
            this.log.writeln('Warning: Dependencies were not installed, you will need to install this manually');
            this.log.writeln('Run the following commands in the boilerplate directory');
            this.log.writeln('\n\tnpm install');
            this.log.writeln('\tbower install\n');
        }//end if

        this.log.writeln('Please make sure you read the wiki documentation for instructions on using this boilerplate.');
        this.log.writeln('https://gitlab.squiz.net/boilerplate/squiz-boilerplate/wikis/home\n');
    }

    this.on('end', function () {
        if (!options['skip-install']) {
            this.log.writeln('Installing dependencies using npm and bower.');

            // Need to make sure custom directory is made current before
            // running NPM and bower install commands
            if (this.createDirectory) {
                process.chdir(this.customDirectory);
            }//end if

            this.npmInstall(null, {
                skipInstall: options['skip-install'],
                cacheMin: options['npm-cache'] ? 999999 : 0
            }, function () {
                this.bowerInstall(null, {
                    skipInstall: options['skip-install'],
                    offline: options['bower-offline'],
                    forceLatest: !this.ie8 // Supplies --force-latest in the bower install
                }, function () {
                    this.emit('dependenciesInstalled');
                }.bind(this));
            }.bind(this));
        } else {
            writeEndMessage.call(this, false);
        }//end if
    });

    this.on('dependenciesInstalled', function () {
        var gp = this.spawnCommand('grunt', ['build']);

        gp.on('exit', function(code) {
            writeEndMessage.call(this, true);
        }.bind(this));
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
function enforceEms(value, defaultValue) {
    var base = 16;

    // If it's a number do the conversion from pixel to ems
    if (typeof(value) === 'number') {
        return value / base + 'em';
    }//end if

    // Check to see if we've already specified ems
    if (value.match(/em$/)) {
        return value;
    }// end if

    // A whole number without units attached is considered a pixel value, e.g.
    // 768
    if (value.match(/^[0-9]+$/)) {
        return parseFloat(value) / base + 'em';
    }//end if

    // A decimal value is considered em, since you can't effectively have half a pixel
    if (value.match(/^[0-9]+\.[0-9]+$/)) {
        return value + 'em';
    }//end if

    // If 'px' was specified find the numerical value and strip the unit to calculate ems
    if (value.match(/^[0-9]+\s+?px$/)) {
        var px = parseFloat(value.replace(/\s+?px$/, ''));
        return px / base + 'em';
    }//end if

    return defaultValue;
}//end enforceEms

/**
 * Update this repository to the latest version
  */
function updateVersion(yo, cb) {
    // Only load these when required
    var request = require('request');
    var semver  = require('semver');
    var current = yo.pkg.version;
    var repoPath  = 'https://gitlab.squiz.net/boilerplate/squiz-boilerplate.git';
    var remoteUrl = 'https://gitlab.squiz.net/boilerplate/squiz-boilerplate/raw/master/package.json';

    request(remoteUrl, function(err, resp, html) {
        if (err) {
            throw chalk.red('Unable to read remote package url: ' + remoteUrl);
        }//end if

        var remotePkg = JSON.parse(html);

        // Is this package out of date?
        if (semver.lt(current, remotePkg.version)) {

            var prompts = [{
                type: 'confirm',
                name: 'update',
                message: 'The boilerplate is out of date (current: ' + chalk.cyan(current) + ', ' +
                    'remote: ' + chalk.cyan(remotePkg.version) + ')' +
                    '. Do you want to update it?',
                'default': true
            }, {
                type: 'confirm',
                name: 'auto',
                message: 'Would you like the installer to try and update it automatically?',
                'default': true
            }];

            yo.prompt(prompts, function (props) {
                var options = ['install', '-g', 'git+' + repoPath];
                if (props.update && props.auto) {
                    // Run the update by manually spawning the npm install -g command
                    var npm     = yo.spawnCommand('npm', options);
                    yo.log.writeln('Updating repository...');
                    npm.on('exit', function(err) {
                        if (err === 1) {
                            yo.log.writeln('Npm install failed, please run manually:');
                            yo.log.writeln(chalk.yellow('\tnpm ' + options.join(' ')));
                            process.exit(1);
                        }//end if
                        yo.log.writeln('All done, re-run the yeoman command to generate a new project');
                        yo.log.writeln(chalk.yellow('\tyo squiz-boilerplate'));
                        this.writeFileFromString(moment().toISOString(), path.resolve(__dirname, '../.last_check.txt'));
                        process.exit(0);
                    });
                } else if (!props.auto) {
                    yo.log.writeln('To update this generator manually run the following in your terminal:');
                    yo.log.writeln(chalk.yellow('\tnpm ' + options.join(' ')));
                    yo.log.writeln('Then re-launch the generator by running:');
                    yo.log.writeln(chalk.yellow('\tyo squiz-boilerplate'));
                } else {
                    cb();
                }//end if
            });
        } else {
            yo.log.writeln(chalk.green('Up to date.'));
            cb();
        }//end if
    });
}

/**
 * Check for newer versions of this boilerplate
  */
SquizBoilerplateGenerator.prototype.versionCheck = function versionCheck() {
    var cb = this.async();
    this.log.writeln('Current Version: %s', this.pkg.version);

    var tmpCheck  = path.join(__dirname, '../.last_check.txt');
    var now       = moment();
    var elapsed   = 2; // Maximum number of days to elapse before re-checking

    if (fs.existsSync(tmpCheck)) {
        var last = moment(this.readFileAsString(tmpCheck));
        var diff = now.diff(last, 'days');
        if (last.isValid() &&  diff > elapsed) {
            this.log.writeln('Checking version... (Last checked: %s days ago)', chalk.red(diff));
            updateVersion(this, function() {
                this.writeFileFromString(now.toISOString(), tmpCheck);
                cb();
            }.bind(this));
        } else {
            cb();
        }//end if
    } else {
        // No check has occured, it's likely it was just installed
        this.writeFileFromString(now.toISOString(), tmpCheck);
        cb();
    }//end if
};

/**
 * Run the generator prompts
 */
SquizBoilerplateGenerator.prototype.askFor = function askFor() {
    var cb = this.async();
    var _ = this._;

    // Greet the user with the squiz logo and message
    if (!this.options['test-mode']) {
        var logo = path.resolve(__dirname, './squiz.txt');
        console.log(fs.readFileSync(logo, {encoding: 'utf8'}));
        console.log('Squiz Boilerplate Generator');
    }//end if

    // Read the module registry configuration to allow a display of module choices
    var registry = JSON.parse(this.readFileAsString(path.join(__dirname, '../moduleRegistry.json')));

    var currentDir = path.basename(process.cwd());
    var projectName = slang.capitalize(currentDir.replace(/[\-_]+/gm, ' '));

    var prompts = [{
        type: 'input',
        name: 'name',
        message: 'What name would you like to give your project?',
        validate: function (input) {
            if (input.match(/^\s*$/)) {
                return 'You need to give the boilerplate project a name';
            }
            return true;
        },
        "default": projectName
    }, {
        type: 'confirm',
        name: 'createDirectory',
        message: 'Do you want to create a new directory for the project?',
        "default": true
    }, {
        type: 'input',
        name: 'customDirectory',
        message: 'Enter a name for the directory',
        validate: function (input) {
            if (!input.match(/^[a-z\s\-\_0-9\/]+$/)) {
                return 'Please only use alpha characters, forward slash, hypens or underscores';
            }
            return true;
        },
        when: function (props) {
            return props.createDirectory;
        },
        "default": function (props) {
            return path.normalize(props.name
                .replace(/^\s+/, '')
                .replace(/\s+$/, '')
                .replace(/\s+/g, '_')
                .replace(/((?![0-9a-z\-\_\/]).)*/gi, '')
                .toLowerCase());
        }
    }, {
        type: 'input',
        name: 'description',
        message: 'Enter a description for this project',
        "default": 'A Squiz Boilerplate design cutup'
    }, {
        type: 'input',
        name: 'email',
        message: 'What email would you like to use?',
        "default": function () {
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
        "default": '0.0.1'
    }, {
        type: 'confirm',
        name: 'matrix',
        message: 'Is this a design cutup for Squiz Matrix?',
        "default": true
    }, {
        type: 'input',
        name: 'mediumMQ',
        message: 'Set min width media query for medium/tablet (pixel units will be auto-converted to ems)',
        "default": '37.5em'
    }, {
        type: 'input',
        name: 'wideMQ',
        message: 'Set min width media query wide/desktop (pixel units will be auto-converted to ems)',
        "default": '60em'
    }, {
        type: 'confirm',
        name: 'ie8',
        message: 'Is Internet Explorer version 8 or older required?',
        "default": false
    }, {
        type: 'confirm',
        name: 'ieConditionals',
        message: 'Should IE conditional tags be added to the body?',
        "default": true
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

        // IE 8 and conditionals
        this.ie8            = props.ie8;
        this.ieConditionals = props.ieConditionals;

        // Media queries
        this.mediumMQ = enforceEms(props.mediumMQ, '37.5em');
        this.wideMQ   = enforceEms(props.wideMQ, '60em');

        // Custom directory
        this.customDirectory = props.customDirectory;
        this.createDirectory = props.createDirectory;

        // Make sure we've not got a blank custom directory name
        if (this.customDirectory && this.customDirectory.match(/^\s*$/g)) {
            this.createDirectory = false;
        }//end if

        cb();
    }.bind(this));
};

////////////////
// Copy Files //
////////////////
SquizBoilerplateGenerator.prototype.boilerplate = function boilerplate() {

    var dir = '';
    if (this.createDirectory) {
        dir = path.normalize(this.customDirectory) + '/';
        this.mkdir(dir);
    }//end if

    this.copy('_package.json',  dir + 'package.json');
    this.copy('_bower.json',    dir + 'bower.json');
    this.copy('.bowerrc',       dir + '.bowerrc');
    this.copy('.jshintrc',      dir + '.jshintrc');
    this.copy('_gitignore',     dir + '.gitignore');
    this.copy('config.json',    dir + 'config.json');
    this.copy('Gruntfile.js',   dir + 'Gruntfile.js');
    this.copy('README.md',      dir + 'README.md');

    // Copy these directories
    this.directory('source/files',   dir + 'source/files');
    this.directory('source/js',      dir + 'source/js');
    this.directory('source/modules', dir + 'source/modules');
    this.directory('source/styles',  dir + 'source/styles');
    this.directory('tasks',          dir + 'tasks');
    this.directory('lib',            dir + 'lib');

    this.mkdir(dir + 'source/html');

    if (this.matrix) {
        this.copy('source/html/parse.html', dir + 'source/html/parse.html');
    }//end if

    this.mkdir(dir + 'source/html/fragments');

    // Copy html fragments across
    this.directory('source/html/fragments', dir + 'source/html/fragments');

    this.template('source/html/index.html', dir + 'source/html/index.html');
};