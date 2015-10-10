// Inspired by: http://stackoverflow.com/questions/10617070/how-to-measure-execution-time-of-javascript-code-with-callbacks
var chalk = require('chalk'),
    argv = require('optimist').argv,
    defaultThreshold = 1000; // 1 second

// Supply --timer as an argument to report "benchmarked" code

var Timer = function(threshold) {
    this.threshold = threshold;
    this.benches = {};
};

Timer.prototype.start = function(id) {
    var args = Array.prototype.slice.call(arguments, 1);
    this.benches[id] = {
        start: process.hrtime(),
        notes: args || [],
        elapsed: 0
    };
};

Timer.prototype.end = function(id) {
    if (this.benches.hasOwnProperty(id)) {
        this.benches[id].elapsed = (process.hrtime(this.benches[id].start)[1] / 1000000).toFixed(3);
    }
};

Timer.prototype.report = function() {
    for (var id in this.benches) {
        var method = (this.benches[id].elapsed > this.threshold) ? 'red' : 'green';
        console.log.apply(this,
           [chalk[method](this.benches[id].elapsed + 'ms') + ': ',
            chalk.yellow(id)].concat(this.benches[id].notes)
        );
    }
};

Timer.prototype.reset = function() {
    this.start = process.hrtime();
};

var timer = new Timer(argv.hasOwnProperty('timer') ? argv.timer : defaultThreshold);

module.exports = timer;