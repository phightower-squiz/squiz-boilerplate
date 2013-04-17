/**
 * @@overlay
 */
;(function($, undefined){
    var Overlay = function(options) {
        var defaults = {
            content:   '',
            tag:       'div',
            className: 'overlay',
            parent:    $('body')
        };
        this.settings = $.extend({}, defaults, options);
        this.elem = $('<' + this.settings.tag + ' class="' + this.settings.className +
            '">' + this.settings.content + '</' + this.settings.tag + '>');
    };

    Overlay.prototype = {
        // Show the overlay by prepending it to the parent.
        show: function() {
            if (!this.settings.parent.length) {
                return false;
            }//end if
            this.settings.parent.prepend(this.elem);
        },// show();
        hide: function() {
            this.elem.detach();
        }//end hide();
    };

    Squiz.plugins.overlay = {
        // Add the constructor so it can be invoked anywhere if needed.
        constructor: Overlay,
        init: function() {
            // Example 
            // var overlay = new Overlay({
            //   content: 'Some content',
            //   parent:   $('body')
            // });
            // overlay.show();
        }//end init()
    };//end overlay()
}(jQuery));