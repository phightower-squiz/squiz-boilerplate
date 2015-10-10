'use strict';

var htmlparser = require('htmlparser2'),
    async      = require('async'),
    grunt      = require('grunt'),
    _          = require('lodash'),
    chalk      = require('chalk'),
    path       = require('path'),
    extend     = require('extend'),
    importer   = require('./handlers/import.js'),
    Block      = require('./handlers/block.js'),
    Directive  = require('./directive.js'),
    element    = require('./util/element.js');

/**
 * Trim the leading and trailing white space from a string
 * @param  {string} data String containing possible whitespace
 * @return {string}      Transformed
 */
var trim = function(data) {
    return data.replace(/^[\t\s\n]+|[\t\s\n]+$/g, '');
};

/**
 * Parse HTML content using htmlparser2 and send back transformed content
 *  via the callback
 * @param  {string}   content Valid HTML content
 * @param  {Function} done    Note style callback(err, content)
 * @return {void}
 */
module.exports.parse = function(content, options, done) {
    var output     = [],
        imports    = [],
        open       = [],
        blocks     = [],
        internals  = 0;

    var parser = new htmlparser.Parser({
        recognizeSelfClosing: true,
        oncomment: function(data) {
            var stub;
            var block;
            data = trim(data);
            var directive = new Directive(data, options);
            var handler   = directive.handler;
            if (!directive.isValid() && /^@@/.test(data)) {
                handler = 'internal';
            } else if (data === 'endbuild') {
                handler = data;
            }

            switch (handler) {
                case 'build':
                    stub = output.length;
                    block = new Block(directive, stub);

                    if (open.length) {
                        block.setNested(true);
                    }

                    open.push(block);
                    blocks.push(block);
                    output.push('');
                    break;
                case 'endbuild':
                    stub = output.length;
                    if (!open.length) {
                        console.log(chalk.red('A block was closed without being open, check for mismatched build tags'));
                        process.exit(1);
                    }
                    block = open.pop();
                    block.close(stub);
                    output.push('');
                    break;
                case 'import':
                    stub = output.length;
                    // Process imports in series by pushing them to an
                    // array of callbacks
                    imports.push(function(next) {
                        importer.fetch(directive, function(err, content) {
                            output[stub] = content;
                            next(err);
                        });
                    });
                    output.push('');
                    break;
                case 'internal':
                    // Do nothing, we can ignore internal comments
                    internals += 1;
                    break;
                default:
                    // Push the comment back out, it's a standard
                    // HTML comment
                    output.push('<!--' + data + '-->');
                    break;
            }
        },
        onopentag: function(name, attr) {
            output.push(element.create(name, attr));
        },
        onclosetag: function(name) {
            output.push(element.close(name));
        },
        ontext: function(data) {
            output.push(data);
        },
        onprocessinginstruction: function(name, data) {
            // Doctype declarations
            output.push(element.create(data));
        },

        // If there is an error parsing just pass it through
        onerror: function(err, data) {
            console.log(chalk.red('Error: '), err);
            output.push(data);
        },

        onend: function() {
            // Run each of the block compile functions turning the blocks into 
            // content (in reverse order to avoid nested block issues)
            blocks.reverse();
            blocks = _.map(blocks, function(block) {
                return function(next) {
                    if (block.isValid()) {
                        block.compile(output, function(blockOutput) {
                            output = blockOutput;
                            next();
                        });
                    }
                };
            });

            async.series(imports.concat(blocks), function(err) {
                done(err, output.join(''));
            });
        }
    });
    parser.write(content);
    parser.done();
};