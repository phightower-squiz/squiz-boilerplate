'use strict';

var async    = require('async'),
    chalk    = require('chalk'),
    cache    = require('../util/cache.js'),
    element  = require('../util/element.js'),
    log      = require('../util/logger.js'),
    fileUtil = require('../util/file.js'),
    concat   = require('../blocks/concat.js'),
    blocks = {
        js:   concat('script', 'src'),
        css:  concat('link', 'href'),
        sass: require('../blocks/sass.js')
    };

/**
 * Constructor
 * @param {object} directive The parsed directive object
 * @param {number} openIndex The opening index in the source array
 */
var Block = function(directive, openIndex) {
    this.directive  = directive;
    this.openIndex  = openIndex;
    this.closeIndex = null;
    this.content    = '';
    this.isNested   = false;
};

Block.prototype = {

    setNested: function(status) {
        this.isNested = status;
    },

    /**
     * Close the index
     * @param  {number} closeIndex The index the closing tag can be found in the source array
     * @return {void}
     */
    close: function(closeIndex) {
        this.closeIndex = closeIndex;
    },

    /**
     * Has this block been resolved with an opening and closing index?
     * @return {Boolean} Returns true if both a closing and opening index are valid numbers
     */
    isValid: function() {
        return typeof(this.openIndex) === 'number' &&
               typeof(this.closeIndex) === 'number' &&
               blocks.hasOwnProperty(this.directive.type);
    },

    replaceTag: function(tag, output) {
        // Check to see if we should be outputting tag content or not
        var hide = this.directive.option('hide');
        if (hide) {
            output[this.openIndex] = '';
        } else {
            output[this.openIndex] = tag;
        }
        
        // Remove the rest of the content in the range
        for (var i = this.openIndex+1, l = this.closeIndex; i<l; i+=1) {
            output[i] = '';
        }
        return output;
    },

    /**
     * Modify the content of an array of outputs based on the range of this block
     * @param  {Array}    output   Output array to modify
     * @param  {Function} callback Passes back the modified output array
     * @return {void}
     */
    compile: function(output, callback) {
        var self = this,
            cacheKey = 'block ' + this.directive.id,
            tag;

        if (this.isValid()) {
            // Check the cache first
            if (cache.exists(cacheKey)) {
                tag = cache.fetch(cacheKey);
                callback(this.replaceTag(tag, output));
            } else {
                // Grab the HTML content from an output array
                this.content = output.slice(this.openIndex, this.closeIndex).join('');

                // Build a tag to replace this block content
                var tagPath = this.isNested ? this.directive.files.slice(0, 1).join('') : this.directive.relPath;
                tagPath = tagPath.replace(/^\s+|\s+$/g, '');

                if (this.directive.option('abspath')) {
                    tagPath = '/' + tagPath;
                }

                switch(this.directive.type) {
                    case 'js':
                        tag = element.create('script', {src: tagPath}) +
                              element.close('script');
                    break;
                    case 'css':
                    case 'sass':
                        var attr = {rel: 'stylesheet', href: tagPath};
                        var media = this.directive.option('media');
                        if (media) {
                            attr.media = media;
                        }
                        tag = element.create('link', attr) +
                              element.close('link');
                    break;
                }

                // Call the block module to compile the content
                blocks[this.directive.type](self.directive, this.content, function(parsed) {
                    async.forEachSeries(self.directive.files, function(file, next) {
                        // Write the file content to disk
                        log.write('Build %s:%s', chalk.yellow(self.directive.type), chalk.cyan(file));
                        fileUtil.write(file, parsed);
                        next(null);
                    }, function(err) {
                        cache.write(cacheKey, tag);
                        callback(self.replaceTag(tag, output));
                    });
                });
            }
        } else {
            console.log(chalk.red('An invalid block attempted to compile but failed'), this.directive);
            callback(output);
        }//end if
    }
};

module.exports = Block;