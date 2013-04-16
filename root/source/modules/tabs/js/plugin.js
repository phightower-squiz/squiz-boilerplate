/* @todo replace this with an actual plugin */
;(function($, undefined){
    'use strict';

    var Tabs = function(elem, options) {

    };

    Tabs.prototype = {

    };

    $.fn.module_tabs = function(options) {
        return this.each(function () {
            if (!$.data(this, 'plugin_module_tabs')) {
                $.data(this, 'plugin_module_tabs', new Tabs( this, options ));
            }//end if
        });
    };
}(jQuery));