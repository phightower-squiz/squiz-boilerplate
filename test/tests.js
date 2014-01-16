'use strict';

// var path  = require('path');
var grunt = require('grunt');

exports.importer = {
    compile: function (test) {
        test.expect(2);

        var expected = grunt.file.read('test/expected/source.html');
        var outputFile = 'test/tmp/source.html';
        var actual   = grunt.file.read(outputFile);

        test.ok(grunt.file.exists(outputFile), 'The file has been generated');
        test.equal(expected, actual, 'All replacements have been made correctly');
        test.done();
    }
};