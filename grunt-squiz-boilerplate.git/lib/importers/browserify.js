var chalk    = require('chalk'),
    fileUtil = require('../util/file.js');

module.exports = function(directive, callback) {
    var files = directive.files,
        options = directive.option('browserify') || {},
        target = directive.option('target');

    if (target === null) {
        throw new Error('Directive option "target" for browserify is required');
    }

    var b = require('browserify')(options);

    files.forEach(function(file) {
        b.add('./' + file);
    });

    if (files.length) {
        // Log a message so we can see where the target is going
        process.stdout.write(chalk.cyan('Browserify target:') + ' ' + chalk.yellow(target) + '...');

        b.bundle(function(err, src) {
            if (!err) {
                var content = src.toString();
                console.log(chalk.green('OK'));
                fileUtil.write(target, content);
            } else {
                console.log(chalk.red('FAIL'));
                console.log(chalk.red(err.message));
            }
            callback(null, '<script src="' + target + '"></script>');
        });
    } else {
        callback(null, '');
    }
};