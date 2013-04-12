/**
 * [Client Name] - Global JavaScript
 *
 * global.js
 * author: Squiz Australia
 * change log: 
 *     [Author email] - 01/01/2013 - First revision
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

;(function($, window, undefined){
  "use strict";
  $(document).ready(function(){
    /*-- 1.1 Declare JS Enabled --*/
    $('body').addClass('js-enabled').removeClass('no-js');
  });
}(jQuery, window));