/**
 * {{name}}
 * Global JS
 *
 * version: {{version}}
 * file:    {{file}}
 * author:  Squiz Australia
 * change log:
 *     {{date}}- First revision
 */

/*
 * Table of Contents
 * 1. Global
 *     1.1. Core Init Functions
 * Modules
{{toc}}
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