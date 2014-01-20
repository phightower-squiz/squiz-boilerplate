/**
 * HTML file generator for boilerplate
 */
'use strict';

var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');

var SquizBoilerplateGenerator = module.exports = function SquizBoilerplateGenerator() {
    var self = this;
    yeoman.generators.Base.apply(this, arguments);

    this.on('end', function () {
        this.installDependencies({ skipInstall: true, skipMessage: true });
    });

    this.nested = self.options.nested;

    this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
    this.bower = JSON.parse(this.readFileAsString('.bower.json'));
};

util.inherits(SquizBoilerplateGenerator, yeoman.generators.Base);

SquizBoilerplateGenerator.prototype.askFor = function askFor() {
    var cb = this.async();
    var _ = this._;

    var prompts = [{
        type: 'input',
        name: 'fileName',
        message: 'What name would you like to give the html file?',
        validate: function (input) {
            if (!input.match(/^([^\.]+)\.html$/)) {
                return 'You need to give the file name ending with the extension .html';
            }
            return true;
        },
        default: 'index.html'
    }, {
        type: 'input',
        name: 'mediumMQ',
        message: 'Set the width for the medium media query (portrait tablets, low res desktops and higher) in ems',
        default: '37.5em'
    }, {
        type: 'input',
        name: 'wideMQ',
        message: 'Set the width for the wide media query (landscape tablets, desktops and higher) in ems',
        default: '60em'
    }, {
        type: 'confirm',
        name: 'ie8',
        message: 'Is Internet Explorer version 8 or older required?',
        default: true
    }, {
        type: 'confirm',
        name: 'ieConditionals',
        message: 'Should IE conditional tags be added to the body?',
        default: true
    },  {
        type: 'list',
        name: 'cssTagStyle',
        message: 'What method would you like to choose for building module CSS?',
        choices: [
            {
                name: "Individual CSS files",
                value: "individual"
            },
            {
                name: "Single CSS file",
                value: "single"
            }
        ]
    }];

    this.prompt(prompts, function (props) {
        this.fileName = props.fileName;
        this.ie8 = props.ie8;
        this.ieConditionals = props.ieConditionals;
        this.cssTagStyle = props.cssTagStyle;
        this.mediumMQ = props.mediumMQ;
        this.wideMQ = props.wideMQ;

        // Whether bootstrap JS plugins should be included
        this.bootstrap = _.has(this.bower.dependencies, 'squiz-module-bootstrap');

        // Whether foundation JS plugins should be included
        this.foundation = _.has(this.bower.dependencies, 'squiz-module-foundation');

        cb();
    }.bind(this));
};

SquizBoilerplateGenerator.prototype.boilerplate = function boilerplate() {
    this.template('index.html', 'source/html/' + this.fileName);
};