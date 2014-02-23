var grunt = require('grunt');
var _     = require('lodash');
var path  = require('path');
var config = grunt.config('config');

function fileNotEmpty(file) {
    var content = grunt.file.read(file);
    return !content.match(/^[\s\n\t]*$/);
}

module.exports = {

    // Make sure we are set up correctly
    copy: function (test) {
        test.ok(grunt.file.exists(config.source + '/html/_test.html'), 'The test file has been created');
        test.done();
    },

    output: function (test) {
        var outputFile = config.dest + '/_test.html';
        var output     = grunt.file.read(outputFile);
        var expected   = grunt.file.read('test/expected/test.html');

        test.ok(fileNotEmpty(outputFile), 'The output has content');
        test.equal(output, expected, 'The output HTML matches the expected output');

        // Test that we have expected file outputs
        _.each(['styles/test/main.css',
                'styles/test/test1.css',
                'styles/test/test2.css',
                'js/test/vendor/jquery.min.js',
                'js/test/vendor/modernizr.min.js',
                'js/test/global.js'],
        function (file) {
            var fullPath = path.join(config.dest, file);
            test.ok(grunt.file.exists(fullPath), 'The file ' + file + ' should exist');
            test.ok(fileNotEmpty(fullPath), 'The file ' + file + ' should not be empty');
        });

        test.done();
    }
}