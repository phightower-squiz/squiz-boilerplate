/**
 * {{name}}
 * Plugins JS
 *
 * version: {{version}}
 * file:    {{file}}
 * modules: {{modules}}
 * libs:    {{deps}}
 * author:  Squiz Australia
 * modified: {{date}}
 * @preserve
 */

/*
 * Table of Contents
 * 1. Global
 * Modules
{{toc}}
 */


/*
--------------------
1. Global
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

/*
--------------------
Modules
--------------------
*/