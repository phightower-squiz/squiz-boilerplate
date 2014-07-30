'use strict';

var fs     = require('fs');
var path   = require('path');
var semver = require('semver');
var async  = require('async');
var sys    = require('sys');
var chalk  = require('chalk');
var exec   = require('child_process').exec;

var pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../', 'app/templates/_package.json'), 'utf8'));
var config = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../', 'app/templates/config.json'), 'utf8'));

var checks = [];

function checkVersion(name, version) {
    return function(next) {

        exec('npm show ' + name + ' version', function(err, stdout, stderr) {
            var message = chalk.blue(name) + ', current: ' + version;
            if (!err) {
                var latest = semver.clean(stdout);
                if (semver.satisfies(latest, version)) {
                    console.log(message + ' ' + chalk.red('out of date') + ' latest: ' + chalk.yellow(latest));
                } else {
                    console.log(message + ' ' + chalk.green('ok'));
                }//end if
            }//end if
            next();
        });
    };
}

for (var pkgName in pkg.dependencies) {
    checks.push(checkVersion(pkgName, pkg.dependencies[pkgName]));
}//end for

for (var type in config.defer) {
    for (var pkgName in config.defer[type]) {
        checks.push(checkVersion(pkgName, config.defer[type][pkgName]));
    }//end for
}

console.log('Checking npm versions...');
async.parallel(checks, function done() {
    console.log('All Done.');
});