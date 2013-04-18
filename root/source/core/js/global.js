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
 *     1.3. Core init functions
 *           1.3.A - Declare JS Enabled
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
            typeof(Squiz.plugins[plugin].init) === 'function') {
            Squiz.plugins[plugin].init.call();
        }//end if
    }//end for
});

/*-- 1.3. Core Init Functions --*/
Squiz.plugins.core_init = {
    init: function() {
        // 1.3.A - Declare JS Enabled.
        $('body').removeClass('no-js').addClass('js-enabled');
    }//end init()
};//end module_tabs

/*
--------------------
2. Modules
--------------------
*/

//@@modules