/*global jQuery:false*/
/**
 * Squiz - Internet Site
 * JavaScript Plugins
 *
 * version: @@version
 * file:    plugins.js
 * author:  Squiz Australia
 * change log:
 *     <name>@squiz.com.au - @@date - First revision
 */

/*
 * Table of Contents
 * 1. Core
 * Modules
@@plugins_js_toc
 */


/*
--------------------
1. Core
--------------------
*/

// Fallback for inadvertant console statements
if (!window.console) {
    window.console = {
        log: function(){},
        warn: function(){},
        error: function(){}
    };
}

//@@dependencies

/*
--------------------
Modules
--------------------
*/
//@@plugin_modules