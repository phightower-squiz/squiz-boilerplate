'use strict';

var fs = require('fs'),
    path = require('path'),
    _   = require('lodash'),
    parser,
    prefs = {
        prefixes: {
            module: [
                'test/fixtures/source/bower-components/squiz-module-',
                'test/fixtures/source/modules/'
            ],
            source: [
                'test/fixtures/source/'
            ],
            tmp: [
                '.tmp/'
            ],
            dist: [
                '.tmp/dist/'
            ]
        },
        sass: {
            includePaths:  [
                'test/fixtures/source/bower_components',
                'test/fixtures/source/styles'
            ],
            sourceMap:      false,
            sourceComments: false,
            outputStyle:    'nested'
        }
    },
    banner = function(file, content) {
        // Custom logic here - return null/undefined for no banner
        var basename = path.basename(file);
        if (basename.indexOf('variables') === -1) {
            return '/*-- ' + path.basename(file) + ' --*/\n' + content;
        }
        return content;
    };

exports.parser = {
    init: function(test) {
        parser = require('../lib/parser.js');
        test.done();
    },

    basicHTML: function(test) {
        var input = ['<html>',
                 '<head>',
                    '<title>This is a title</title>',
                 '</head>',
             '</html>'
            ].join('\n');
        parser.parse(input, {}, function(err, content) {
            test.equal(input, content, 'Tags output remains unaffected');
            test.done();
        });
    },

    selfClosingTags: function(test) {
        var input = '<meta charset="utf8" />';
        parser.parse(input, {}, function(err, content) {
            test.equal(input, content, 'Self closing tags are unaffected');
            test.done();
        });
    },

    directiveParser: function(test) {
        var Directive = require('../lib/directive.js');

        var c1 = 'import:js test/fixtures/js/1.js';
        var d1 = new Directive(c1);
        test.equal(d1.id, c1);
        test.equal(d1.handler, 'import');
        test.equal(d1.type, 'js');
        test.equal(d1.files[0], 'test/fixtures/js/1.js');

        var c2 = 'import:js source:js/1.js,module:test/fixtures/js/2.js';
        var d2 = new Directive(c2, {
            prefixes: prefs.prefixes
        });
        test.equal(d2.id, c2);
        test.equal(d2.handler, 'import');
        test.equal(d2.type, 'js');
        test.equal(d2.files.length, 3, 'Array length is expected');
        var file1 = d2.files[0];
        var file2 = d2.files[1];
        var file3 = d2.files[2];

        // Prefixes
        test.equal(file1, prefs.prefixes.source + 'js/1.js');
        test.equal(file2, prefs.prefixes.module[0] + 'test/fixtures/js/2.js');
        test.equal(file3, prefs.prefixes.module[1] + 'test/fixtures/js/2.js');

        // Options hash & getter function
        var c3 = 'import:js test/fixtures/js/1.js { "media": "(min-width: 37.5em)" }';
        var d3 = new Directive(c3);
        test.equal(d3.option('media'), '(min-width: 37.5em)', 'Options JSON gets parsed correctly');

        test.done();
    },

    jsImportTag: function(test) {
        var input = [
            '<!-- import:js test/fixtures/source/js/1.js -->',
            '<p>Mixed HTML</p>',
            '<!-- import:js test/fixtures/source/js/2.js -->'
        ].join('\n');
        parser.parse(input, {}, function(err, content) {
            test.equal(content,[
                '<script src="test/fixtures/source/js/1.js"></script>',
                '<p>Mixed HTML</p>',
                '<script src="test/fixtures/source/js/2.js"></script>'
            ].join('\n'), 'Tag content is replaced as expected');
            test.done();
        });
    },

    cssBasicImportTag: function(test) {
        var basic = '<!-- import:css test/fixtures/source/styles/global.scss -->';

        parser.parse(basic, {}, function(err, content) {
            test.equal(
                content,
                '<link rel="stylesheet" href="test/fixtures/source/styles/global.scss" />',
                'Tag content is replaced as expected');
            test.done();
        });
    },

    cssMediaQueryImportTag: function(test) {
        var media = '<!-- import:css test/fixtures/source/styles/medium.scss {"media": "(min-width: 37.5em)"} -->';
        parser.parse(media, {}, function(err, content) {
            test.equal(
                content,
                '<link rel="stylesheet" href="test/fixtures/source/styles/medium.scss" media="(min-width: 37.5em)" />',
                'Tag content is replaced as expected');
            test.done();
        });
    },

    contentImportTag: function(test) {
        var input = '<!-- import:content test/fixtures/source/html/fragments/1.html -->';
        parser.parse(input, {}, function(err, content) {
            test.equal(content,
                'This is fragment 1',
                'Tag content is replaced as expected');
            test.done();
        });
    },

    parserFilePrefixes: function(test) {
        var input = '<!-- import:content source:html/fragments/1.html -->';
        parser.parse(input, prefs, function(err, content) {
            test.equal(content,
                'This is fragment 1',
                'Tag content is replaced as expected');
            test.done();
        });
    },

    contentGlobbingPatterns: function(test) {
        var input = '<!-- import:content test/fixtures/source/html/fragments/*.html -->';
        parser.parse(input, {}, function(err, content) {
            test.equal(content,
                // Note: no newlines here, just strait concatenation
                'This is fragment 1This is fragment 2',
                'Tag content is replaced as expected');
            test.done();
        });
    },

    contentImporterWithPrefixes: function(test) {
        var input = '<!-- import:content module:test/html/1.html -->';
        parser.parse(input, prefs, function(err, content) {
            test.equal(content,
                'module file 1',
                'Tag content is replaced as expected');
            test.done();
        });
    },

    buildJSTag: function(test) {
        var input = [
            '<!-- build:js .tmp/js/file.js -->',
                '\t<!-- import:js test/fixtures/source/js/1.js -->',
                '\t<script src="test/fixtures/source/js/2.js"></script>',
            '<!-- endbuild -->'
        ].join('\n');
        parser.parse(input, prefs, function(err, content) {
            test.equal(content,
                '<script src=".tmp/js/file.js"></script>',
                'Tag content is replaced as expected');

            var distFileContent = fs.readFileSync('.tmp/js/file.js', {encoding: 'utf8'});
            test.equal(distFileContent,[
                    'alert(\'1\');',
                    'alert(\'2\');'
                ].join('\n'),
                'File content has been concatenated');

            test.done();
        });
    },

    buildCSSTag: function(test) {
        var file = '.tmp/styles/main.css';
        var input = [
            '<!-- build:css ' + file + ' -->',
                '\t<link rel="stylesheet" href="test/fixtures/source/styles/global.scss" />',
            '<!-- endbuild -->'
        ].join('\n');
        parser.parse(input, prefs, function(err, content) {
            test.equal(content,
                '<link rel="stylesheet" href="' + file + '" />',
                'Tag content is replaced as expected');

            var distFileContent = fs.readFileSync(file, {encoding: 'utf8'});
            test.equal(distFileContent,
                '.rule1 { background: #ccc; }',
                'File content has been concatenated');

            test.done();
        });
    },

    // Files in build: directives should only be concatenated once. Multiple references
    // to the same file should be ignored.
    concatOnce: function(test) {
        var input = [
            '<!-- build:js .tmp/js/concatOnce.js -->',
                '\t<!-- import:js test/fixtures/source/js/1.js -->',
                '\t<!-- import:js test/fixtures/source/js/1.js -->',
                '\t<!-- import:js test/fixtures/source/js/1.js -->',
                '\t<script src="test/fixtures/source/js/2.js"></script>',
                '\t<script src="test/fixtures/source/js/2.js"></script>',
                '\t<script src="test/fixtures/source/js/2.js"></script>',
            '<!-- endbuild -->'
        ].join('\n');
        parser.parse(input, prefs, function(err, content) {
            test.equal(content,
                '<script src=".tmp/js/concatOnce.js"></script>',
                'Tag content is replaced as expected');

            var distFileContent = fs.readFileSync('.tmp/js/concatOnce.js', {encoding: 'utf8'});
            test.equal(distFileContent,[
                    'alert(\'1\');',
                    'alert(\'2\');'
                ].join('\n'),
                'File content has been concatenated only once');

            test.done();
        });
    },

    // Make sure when it builds that same file is not overwritten multiple times
    // The file will take on the last build directive called and simply replace
    // any further instances with the same tag reference
    // This is default from parser.config.rememberBlocks
    remembersBlocks: function(test) {
        var file = '.tmp/styles/multiple.css';
        var input = [
            '<!-- build:css ' + file + ' -->',
                '\t<link rel="stylesheet" href="test/fixtures/source/styles/global.scss" />',
            '<!-- endbuild -->',
            '<!-- build:css ' + file + ' -->',
                '\t<link rel="stylesheet" href="test/fixtures/source/styles/medium.scss" />',
            '<!-- endbuild -->',
        ].join('\n');
        parser.parse(input, prefs, function(err, content) {
            test.equal(content,[
                '<link rel="stylesheet" href="' + file + '" />',
                '<link rel="stylesheet" href="' + file + '" />',
                ].join('\n'),
                'Tag content is replaced as expected');

            var distFileContent = fs.readFileSync(file, {encoding: 'utf8'});
            test.equal(distFileContent,[
                    '.rule2 { color: #000; }'
                ].join(''),
                'File content reflects the last build directive and is not overwritten');

            test.done();
        });
    },

    nestedBlocks: function(test) {
        var input = [
            '<!-- build:css tmp:styles/nested1.css -->',
                '\t<link rel="stylesheet" href="test/fixtures/source/styles/global.scss" />',
                '<!-- build:css tmp:styles/nested2.css -->',
                    '\t<link rel="stylesheet" href="test/fixtures/source/styles/medium.scss" />',
                '<!-- endbuild -->',
            '<!-- endbuild -->',
            
        ].join('\n');
        parser.parse(input, prefs, function(err, content) {
            // Higher level blocks will output relative paths to the created file assuming that the
            // parsed HTML files will exist in that directory - this only occurs with the special prefixes
            test.equal(content,
                '<link rel="stylesheet" href="styles/nested1.css" />',
                'Tag content is replaced as expected');

            var distFileContent = fs.readFileSync('.tmp/styles/nested1.css', {encoding: 'utf8'});
            test.equal(distFileContent,
                '.rule1 { background: #ccc; }\n.rule2 { color: #000; }',
                'File content reflects nested directives being processed in the correct order');

            var secondFileContent = fs.readFileSync('.tmp/styles/nested2.css', {encoding: 'utf8'});
            test.equal(secondFileContent,
                '.rule2 { color: #000; }',
                'The second file only contains it\'s own content, not combined content of others');

            test.done();
        });
    },

    sassBlocks: function(test) {
        var input = [
            '<!-- build:sass .tmp/styles/sass1.css -->',
                '<!-- import:css test/fixtures/source/styles/imports/variables.scss -->',
                '<!-- import:css test/fixtures/source/styles/imports/utilities.scss -->',
                '<!-- import:css test/fixtures/source/styles/global.scss -->',
            '<!-- endbuild -->',
        ].join('\n');
        parser.parse(input, prefs, function(err, content) {
            test.equal(content,
                '<link rel="stylesheet" href=".tmp/styles/sass1.css" />',
                'Tag content is replaced as expected');

            var distFileContent = fs.readFileSync('.tmp/styles/sass1.css', {encoding: 'utf8'});
            test.equal(distFileContent,
                // Accounting for Sass re-formatting
                '.utility {\n  background: #000; }\n\n.rule1 {\n  background: #ccc; }\n',
                'File content reflects sass being combined and processed correctly');

            test.done();
        });
    },

    // Modern browser media query wrapping
    sassMediaModern: function(test) {
        var input = [
            '<!-- build:sass .tmp/styles/sass2.css {"mediaWrap": "(min-width: 60em)"} -->',
                '<!-- import:css test/fixtures/source/styles/imports/variables.scss -->',
                '<!-- import:css test/fixtures/source/styles/imports/utilities.scss -->',
                '<!-- import:css test/fixtures/source/styles/global.scss -->',
            '<!-- endbuild -->',
        ].join('\n');
        parser.parse(input, prefs, function(err, content) {
            test.equal(content,
                '<link rel="stylesheet" href=".tmp/styles/sass2.css" />',
                'Tag content is replaced as expected');

            var distFileContent = fs.readFileSync('.tmp/styles/sass2.css', {encoding: 'utf8'});
            test.equal(distFileContent,
                // Accounting for Sass re-formatting
                '@media (min-width: 60em) {\n.utility {\n  background: #000; }\n\n.rule1 {\n  background: #ccc; }\n\n}',
                'File content reflects sass being combined and processed correctly');

            test.done();
        });
    },

    // Older browser media query - basically apply a media attribute instead and let the user handle
    // how older browsers read the link tag (e.g. duplicating link tags for IE <= 8 minus the media query)
    sassMediaOlder: function(test) {
        var input = [
            '<!-- build:sass .tmp/styles/sass3.css {"media": "(min-width: 60em)"} -->',
                '<!-- import:css test/fixtures/source/styles/imports/variables.scss -->',
                '<!-- import:css test/fixtures/source/styles/imports/utilities.scss -->',
                '<!-- import:css test/fixtures/source/styles/global.scss -->',
            '<!-- endbuild -->',
        ].join('\n');
        parser.parse(input, prefs, function(err, content) {
            test.equal(content,
                '<link rel="stylesheet" href=".tmp/styles/sass3.css" media="(min-width: 60em)" />',
                'Tag content is replaced as expected');

            var distFileContent = fs.readFileSync('.tmp/styles/sass3.css', {encoding: 'utf8'});
            test.equal(distFileContent,
                // Accounting for Sass re-formatting
                '.utility {\n  background: #000; }\n\n.rule1 {\n  background: #ccc; }\n',
                'File content reflects sass being combined and processed correctly');

            test.done();
        });
    },

    // Test the application of banners to concatenated content
    concatBanners: function(test) {
        var input = [
            '<!-- build:sass .tmp/styles/sass4.css -->',
                '<!-- import:css test/fixtures/source/styles/imports/variables.scss -->',
                '<!-- import:css test/fixtures/source/styles/imports/utilities.scss -->',
                '<!-- import:css test/fixtures/source/styles/global.scss -->',
            '<!-- endbuild -->',
        ].join('\n');

        parser.parse(input, _.extend({}, prefs, {
            banner: banner
        }), function(err, content) {
            test.equal(content,
                '<link rel="stylesheet" href=".tmp/styles/sass4.css" />',
                'Tag content is replaced as expected');

            var distFileContent = fs.readFileSync('.tmp/styles/sass4.css', {encoding: 'utf8'});
            test.equal(distFileContent,[
                    '/*-- utilities.scss --*/',
                    '.utility {\n  background: #000; }\n',
                    '/*-- global.scss --*/',
                    '.rule1 {\n  background: #ccc; }\n'
                ].join('\n'),
                'File content reflects sass being combined and processed correctly');

            test.done();
        });
    },

    // Browserify dependency resolutions
    browserifyJS: function(test) {
        var input = '<!-- import:browserify ./test/fixtures/source/js/browserify1.js {"target": ".tmp/js/modules.js"} -->';

        parser.parse(input, prefs, function(err, content) {
            test.equal(content,
                '<script src=".tmp/js/modules.js"></script>',
                'Tag content is replaced as expected');

            var distFileContent = fs.readFileSync('.tmp/js/modules.js', {encoding: 'utf8'});
            var expectedFileContent = fs.readFileSync('test/fixtures/expected/js/modules.js', {encoding: 'utf8'});
            test.notEqual(distFileContent, '', 'File content is not blank');
            test.equal(distFileContent,expectedFileContent,
                'File content has been browserified');
            test.done();
        });
    },

    browserifyShim: function(test) {
        var input = '<!-- import:browserify ./test/fixtures/source/js/shim.js {"target": ".tmp/js/shimmed.js"} -->';
        parser.parse(input, prefs, function(err, content) {
            test.equal(content,
                '<script src=".tmp/js/shimmed.js"></script>',
                'Tag content is replaced as expected');

            var distFileContent = fs.readFileSync('.tmp/js/shimmed.js', {encoding: 'utf8'});
            var expectedFileContent = fs.readFileSync('test/fixtures/expected/js/shimmed.js', {encoding: 'utf8'});
            test.notEqual(distFileContent, '', 'File content is not blank');
            test.equal(distFileContent,expectedFileContent,
                'File content has been browserified');
            test.done();
        });
    },

    markdownContent: function(test) {
        var input = '<!-- import:markdown source:test.md -->';
        parser.parse(input, prefs, function(err, content) {
            test.equal(content, '<h1 id="test">Test</h1>\n<pre><code class="lang-html"><span class="hljs-tag">&lt;html&gt;</span><span class="hljs-tag">&lt;/html&gt;</span>\n</code></pre>\n', 'Markdown parsed as expected');
            test.done();
        });
    },

    markdownTransformations: function(test) {
        var input = '<!-- import:markdown test/fixtures/source/test.md -->';
        parser.parse(input,{
                markdownParser: function(tokens, file, cb) {
                    // Bump the heading levels by 1
                    tokens.forEach(function(token) {
                        if (token.type === 'heading' &&
                            token.hasOwnProperty('depth')) {
                            token.depth += 1;
                        }
                    });
                    cb(null, tokens);
                }
            }, function(err, content) {
            test.equal(content, '<h2 id="test">Test</h2>\n<pre><code class="lang-html"><span class="hljs-tag">&lt;html&gt;</span><span class="hljs-tag">&lt;/html&gt;</span>\n</code></pre>\n', 'Markdown parsed as expected');
            test.done();
        });
    },

    handlebars: function(test) {
        var input = '<!-- import:handlebars test/fixtures/source/template.hbs { "data": "test/fixtures/source/data.json" } -->';
        parser.parse(input, prefs, function(err, content) {
            var expected = fs.readFileSync('test/fixtures/expected/html/handlebars.html', {encoding: 'utf8'});
            test.equal(content, expected, 'Handlebars template has been parsed and rendered');
            test.done();
        });
    },

    handlebarsHelpers: function(test) {
        var input = '<!-- import:handlebars test/fixtures/source/template2.hbs { "data": "test/fixtures/source/data.json", "helpers": "test/fixtures/source/js/helper.js" } -->';
        parser.parse(input, prefs, function(err, content) {
            test.equal(content, '<div id="test">Hello World</div>', 'Handlebars template works with helpers');
            test.done();
        });
    },

    handlebarsHelpersAsArray: function(test) {
        var input = '<!-- import:handlebars test/fixtures/source/template2.hbs { "data": "test/fixtures/source/data.json", "helpers": ["test/fixtures/source/js/helper.js"] } -->';
        parser.parse(input, prefs, function(err, content) {
            test.equal(content, '<div id="test">Hello World</div>', 'Handlebars template works with helpers when supplied as an array');
            test.done();
        });
    }
};