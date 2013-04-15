/**
 * {%= name %} - Global JavaScript
 *
 * global.js
 * author: Squiz Australia
 * change log: 
 *     {%= author_email %} - 01/01/2013 - First revision
 */

/*
 * Table of Contents
 *
 * 1. User Interface
 *     1.1 Declare JS Enabled
 */

/*
--------------------
1. User Interface
--------------------
*/

// Namespace.
var squizImp = {
    plugins: {}
};

;(function($, window, undefined){
    "use strict";
    // Process squiz imp plugins
    $(document).ready(function(){
        for (var plugin in squizImp.plugins) {
            if (squizImp.plugins[plugin].hasOwnProperty('init') &&
                typeof(squizImp.plugins[plugin]) === 'function') {
                squizImp.plugins[plugin].init.call();
            }//end if
        }//end for
    });
}(jQuery, window));