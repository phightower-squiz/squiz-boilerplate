/*global Squiz_Matrix_API*/
(function(exports) {
    'use strict';
    /**
     * Helper function to convert an API argument into a format valid for
     * the JS API batchRequest function
     * @param  {string} source      Source property name
     * @param  {string} destination Destination property name
     * @return {function}           A filter function that accepts an arguments hash
     */
    var filterApiArg = function(source, destination) {
        if (typeof(destination) === 'undefined') {
            destination = source;
        }//end if
        return function (args) {
            if (typeof(args[source]) === 'undefined') {
                return args;
            }

            args[destination] = args[source];
            if (source !== destination) {
                delete args[source];
            }//end if

            if (Object.prototype.toString.call(args[destination]) === '[object Array]') {
                args[destination] = args[destination].join('\\,');
            }//end if

            return args;
        };
    };//end filterApiArg

    // Mapping functions to convert arguments supplied to batchRequest API function
    var normaliseMap = {
        getKeywordsReplacements: [
            filterApiArg('keywords_array', 'keyword')
        ],
        getChildCount: [
            filterApiArg('level', 'levels')
        ],
        setMultipleAttributes: [
            function setMultipleAttributes(args) {
                if (args.hasOwnProperty('field_info')) {
                    var field_names = [];
                    var field_vals  = [];
                    for (var field_name in args.field_info) {
                        if (args.field_info.hasOwnProperty(field_name)) {
                            field_names.push(field_name);
                            field_vals.push(args.field_info[field_name]);
                        }// end if
                    }// end of
                    args.attr_name = field_names.join('\\,');
                    args.attr_val = field_vals.join('\\,');
                    delete args.field_info;
                }// End if
                return args;
            }
        ],
        setWebPath: [
            filterApiArg('paths', 'webpath')
        ],
        acquireLock: [
            filterApiArg('screen_name', 'screen')
        ],
        createFileAsset: [
            filterApiArg('parentID', 'id')
        ],
        removeLink: [
            filterApiArg('child_id', 'id')
        ],
        createLink: [
            filterApiArg('child_id', 'id')
        ],
        moveLink: [
            filterApiArg('child_id', 'id')
        ],
        createAsset: [
            filterApiArg('parent_id', 'id'),
            function (args) {
                if (args.hasOwnProperty('attributes') &&
                    args.hasOwnProperty('extra_attributes')) {
                    args.extra_attributes = args.extra_attributes + '&' + args.attributes;
                    delete args.attributes;
                }// End if
                return args;
            }
        ],
        getChildren: [
            filterApiArg('type_codes'),
            filterApiArg('link_types', 'link_type'),
            filterApiArg('link_values', 'link_value')
        ],
        updateMultipleLinks: [
            function updateMultipleLinks(args) {
                // This function does alot of work to convert the 'links' argumement
                // into server friendly data. We need to replicate it here
                if (args.hasOwnProperty('link_info') &&
                    args.link_info.hasOwnProperty('links')){

                    // Links array
                    var links = args.link_info.links;

                    var child_ids               = [];
                    var parent_ids              = [];
                    var link_types              = [];
                    var link_values             = [];
                    var existing_link_types     = [];
                    var existing_link_values    = [];
                    var sort_orders             = [];
                    var link_locks              = [];

                    for (var i = 0, l = links.length; i<l; i+=1) {
                        child_ids.push(links[i].child);
                        parent_ids.push(links[i].parent);
                        link_types.push(links[i].link_type);
                        link_values.push(links[i].link_value);
                        existing_link_types.push(links[i].existing_link_type);
                        existing_link_values.push(links[i].existing_link_value);
                        sort_orders.push(links[i].sort_order);
                        link_locks.push(links[i].link_lock);
                    }// end for

                    delete args.link_info;

                    args.child_id = child_ids.join('\\,');
                    args.parent_id = parent_ids.join('\\,');
                    args.link_type = link_types.join('\\,');
                    args.link_value = link_values.join('\\,');
                    args.existing_link_type = existing_link_types.join('\\,');
                    args.existing_link_value = existing_link_values.join('\\,');
                    args.sort_order = sort_orders.join('\\,');
                    args.locked = link_locks.join('\\,');

                }// End if
                return args;
            }
        ],
        removeMultipleLinks: [
            function removeMultipleLinks(args) {
                // This function does alot of work to convert the 'links' argumement
                // into server friendly data. We need to replicate it here
                if (args.hasOwnProperty('link_info') &&
                    args.link_info.hasOwnProperty('links')){

                    // Links array
                    var links = args.link_info.links;

                    var child_ids               = [];
                    var parent_ids              = [];
                    var link_types              = [];
                    var link_values             = [];

                    for (var i = 0, l = links.length; i<l; i+=1) {
                        child_ids.push(links[i].child);
                        parent_ids.push(links[i].parent);
                        link_types.push(links[i].link_type);
                        link_values.push(links[i].link_value);
                    }// end for

                    delete args.link_info;

                    args.child_id = child_ids.join('\\,');
                    args.parent_id = parent_ids.join('\\,');
                    args.link_type = link_types.join('\\,');
                    args.link_value = link_values.join('\\,');
                }// End if
                return args;
            }
        ],
        getUrlFromLineage: [
            function getUrlFromLineage(args) {
                if (args.hasOwnProperty('lineage')) {
                    var lineageArray = [];
                    for (var i = 0, l = args.lineage.length; i<l; i+=1) {
                        if (args.lineage[i].hasOwnProperty('assetid')) {
                           lineageArray.push(args.lineage[i].assetid);
                        }
                        else {
                           lineageArray.push(args.lineage[i]);
                        }
                    }
                    args.lineage = lineageArray;
                }// End if
                return args;
            }
        ],
        updateQuestionOrder: [
            function updateQuestionOrder(args) {
                args.sort_order = args.sort_order.join('\\,');
                return args;
            }
        ],
        updateQuestion: [
            function updateQuestion(args) {
                for (var field_name in args.field_info) {
                    if (Object.prototype.toString.call(args.field_info[field_name]) === '[object Array]') {
                        args[field_name] = args.field_info[field_name].join('\\,');
                    } else {
                        args[field_name] = args.field_info[field_name];
                    }//end if
                }//end for
                delete args.field_info;
                args.question_id = args.question_id;
                return args;
            }
        ]
    };

    /**
     * Single JS API threads intended to queue and execute batch functions
     * @param {object} api Squiz Matrix JS API reference
     */
    var JSAPI_Thread = function (api) {
        this.api   = api;
        this._queue = [];
    };

    JSAPI_Thread.prototype = {
        /**
         * Queue a Matrix JS API function to be called with arguments
         * @param  {string} fnName JS API function name
         * @param  {object} args   Argument object hash to pass to the JS API function
         * @return {object}        reference to this object
         */
        queue: function (fnName, args) {
            this._queue.push({
                fn: fnName,
                args: args
            });
            return this;
        },//end queue()

        /**
         * Get a normalised array of batch request functions to send
         * @return {[type]} [description]
         */
        normalise: function () {
            var batchQuery = {},
                self       = this;

            function normaliseArgs(args, fn) {
                if (normaliseMap.hasOwnProperty(fn)) {
                    for (var j = 0, jl = normaliseMap[fn].length; j<jl; j+=1) {
                        args = normaliseMap[fn][j](args);
                    }//end for
                }//end if
                return args;
            }//end normaliseArgs

            for (var i = 0, l = this._queue.length; i<l; i+=1) {
                batchQuery[i] = {
                    'function': this._queue[i].fn,
                    'args'    : normaliseArgs(self._queue[i].args, self._queue[i].fn)
                };
            }//end for
            return batchQuery;
        },//end normalise()

        /**
         * Executes the currently queued functions and returns the results in a callback
         * @param  {Function} callback
         * @return {object}   reference to this object
         */
        execute: function (callback) {
            if (this._queue.length <= 0) {
                callback({
                    error: "No functions queued"
                });
                return;
            }//end if

            var self  = this;

            this.api.batchRequest({
                "functions": this.normalise(),
                "block": 1,
                dataCallback: function (results) {
                    callback(results);
                }
            });

            return this;
        },//end execute()

        /**
         * Merge the queue of another thread with the queue of this thread
         * @param  {object} thread JSAPI_Thread object
         * @return {object}        reference to this object
         */
        merge: function (thread) {
            this._queue = this._queue.concat(thread._queue);
            return this;
        },

        /**
         * Clear the internal queue
         * @return {object} reference to this object
         */
        clear: function () {
            this._queue = [];
            return this;
        }//end clear()
    };

    // Export the object
    exports.JSAPI_Thread = JSAPI_Thread;
}(window));