var two = require('./browserify2.js');
var three = two();

module.exports = function() {
    alert('hello world');
}