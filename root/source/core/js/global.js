/*global jQuery:false*/
/**
 * {%= client_name %} - {%= client_project %}
 * Global JavaScript
 *
 * version: @@version
 * file:    global.js
 * author:  Squiz Australia
 * change log: 
 *     {%= author_email %} - @@date - First revision
 */

/*
 * Table of Contents
 * 1. Global
 *     1.1. Namespace
 *     1.2. Plugin Execution
 * 2. Modules
@@toc
 */

/*
--------------------
1. Global
--------------------
*/

// 1.1. Namespace.
var Squiz = {
    plugins: {}
};

var $ = jQuery.noConflict();

// 1.2. Plugin execution.
// On dom ready each plugin with an init function will be triggered.
$(document).ready(function(){
    'use strict';
    for (var plugin in Squiz.plugins) {
        if (Squiz.plugins[plugin].hasOwnProperty('init') &&
            typeof(Squiz.plugins[plugin]) === 'function') {
            Squiz.plugins[plugin].init.call();
        }//end if
    }//end for
});

/*
--------------------
2. Modules
--------------------
*/