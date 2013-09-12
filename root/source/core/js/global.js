/*global jQuery:false*/
/**
 * Squiz - Internet Site
 * Global JavaScript
 *
 * version: @@version
 * file:    global.js
 * author:  Squiz Australia
 * change log:
 *     <name>@squiz.com.au - @@date - First revision
 */

/*
 * Table of Contents
 * 1. Global
 *     1.1. Core Init Functions
 * Modules
@@global_js_toc
 */

/*
--------------------
1. Global
--------------------
*/

(function($){
    'use strict';

    /*-- 1.1 Core Init Functions --*/
    $(document).ready(function(){
        //  Declare JS Enabled.
        $('body').removeClass('no-js').addClass('js-enabled');
    });
}(jQuery));


/*
--------------------
Modules
--------------------
*/
//@@global_modules