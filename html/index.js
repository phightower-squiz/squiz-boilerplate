'use strict';
var util = require('util');
var fs   = require('fs');
var path = require('path');
var yeoman = require('yeoman-generator');

var SquizBoilerplateGenerator = module.exports = function SquizBoilerplateGenerator(args, options, config) {
    var self = this;
    yeoman.generators.Base.apply(this, arguments);

    this.on('end', function () {
        this.installDependencies({ skipInstall: true });
    });

    this.nested = self.options.nested;

    this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(SquizBoilerplateGenerator, yeoman.generators.Base);

SquizBoilerplateGenerator.prototype.askFor = function askFor() {
    var cb = this.async();
    var _ = this._;

    var prompts = [{
        type: 'input',
        name: 'fileName',
        message: 'What name would you like to give the html file?',
        validate: function(input) {
            if (!input.match(/^([^\.]+)\.html$/)) {
                return 'You need to give the file name ending with the extension .html';
            }
            return true;
        },
        default: 'index.html'
    },{
        type: 'confirm',
        name: 'ie8',
        message: 'Is Internet Explorer version 8 or older required?',
        default: true
    },{
        type: 'confirm',
        name: 'ieConditionals',
        message: 'Should IE conditional tags be added to the body?',
        default: true
    },{
        type: 'confirm',
        name: 'singleCSS',
        message: 'Would you like to combine all CSS into a single CSS file?',
        when: function(props) {
            // Only ask this question when we don't have to support IE8 because the resulting
            // CSS will result in @media queries
            return !props.ie8;
        }.bind(this)
    },{
        type: 'confirm',
        name: 'bootstrap',
        message: 'Are twitter bootstrap plugins required? (Will automatically reference plugins for you)',
        default: true
    }];

    this.prompt(prompts, function (props) {
        this.fileName = props.fileName;
        this.ie8 = props.ie8;
        this.singleCSS = props.singleCSS;
        this.ieConditionals = props.ieConditionals;
        this.bootstrap = props.bootstrap;
        cb();
    }.bind(this));
};

SquizBoilerplateGenerator.prototype.boilerplate = function boilerplate() {
    this.template('index.html', 'source/html/' + this.fileName);
};