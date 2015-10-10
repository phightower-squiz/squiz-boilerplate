var expr  =  /^\s*([\S]+):([\S]+)[\s\t\n]+([^{]+,?)+[\s\t\n]*(.*)/i,
    chalk = require('chalk'),
    _     = require('lodash'),
    log   = require('./util/logger.js'),
    glob  = require('./util/glob.js');

var Directive = function(data, options) {
    this.id          = data;
    this.valid       = false;
    this.handler     = null;
    this.type        = null;
    this.files       = [];
    this.options     = options || {};

    log.verbose(chalk.cyan('New Directive'), chalk.yellow(this.id));

    if (this.isDirective(data)) {
        this._parse();
    }
};

Directive.prototype._parse = function() {
    var matches = this.id.match(expr);
    if (matches) {
        this.valid       = true;
        this.handler     = matches[1];
        this.type        = matches[2];
        this.relPath     = matches[3].indexOf(':') !== -1 ? matches[3].split(':').pop() : matches[3];

        // File patterns
        if (matches[3]) {
            var prefixes = this.options.hasOwnProperty('prefixes') ? this.options.prefixes : {};
            this.files = glob.expand(prefixes, matches[3]);
        }

        // Parse the options argument
        if (matches[4] && matches[4] !== '') {
            try {
                this.options = _.extend({}, this.options, JSON.parse(matches[4]));
            } catch (e) {
                log.error('Unable to parse options for:', this.id);
            }
        }//end if
    }
};

Directive.prototype.option = function(key) {
    if (typeof(key) === 'string' && this.options.hasOwnProperty(key)) {
        return this.options[key];
    }
    return;
};

Directive.prototype.isValid = function() {
    return this.valid;
};

Directive.prototype.isDirective = function(data) {
    return expr.test(data);
};

module.exports = Directive;