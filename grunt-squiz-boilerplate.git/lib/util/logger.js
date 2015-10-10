var chalk = require('chalk'),
    argv  = require('optimist').argv,
    verbose = argv.hasOwnProperty('verbose');

module.exports.write = function() {
    console.log.apply(this, arguments);
};

module.exports.error = function() {
    var args = Array.prototype.slice.call(arguments);
    var msg = chalk.red(args.join(' '));
    console.log(msg);
};

module.exports.verbose = function() {
    if (verbose) {
        console.log.apply(this, arguments);
    }
};