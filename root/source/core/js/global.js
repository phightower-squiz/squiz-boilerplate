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
 *     1.1. Core Init Functions
 * 2. Modules
@@toc
 */

/*
--------------------
1. Global
--------------------
*/

var $ = jQuery.noConflict();

/*-- 1.1 Core Init Functions --*/
$(document).ready(function(){
    'use strict';
    //  Declare JS Enabled.
    $('body').removeClass('no-js').addClass('js-enabled');
});

/*
--------------------
2. Modules
--------------------
*/

//@@modules