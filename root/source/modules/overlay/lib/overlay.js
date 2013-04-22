;(function($, window, document, undefined){
    var Overlay = function(options) {
        var defaults = {
            // The default className for the overlay
            className: 'overlay',

            // The parent element for the overlay.
            parent:    $('body'),

            // Default show function.
            show: function($elem, $parent) {
                $parent.prepend($elem);
            },//end show()

            // Default hide function.
            hide: function($elem, $parent) {
                $elem.detach();
            }//end hide()
        };

        // Create a default element.
        defaults.elem = $('<div aria-live="polite" class="' + defaults.className + '"></div>');

        // Extend the defaults with user supplied options
        this.settings = $.extend({}, defaults, options);
    };

    Overlay.prototype = {
        // Show the overlay by prepending it to the parent.
        show: function() {
            this.settings.show(this.settings.elem, this.settings.parent);
        },// show();
        hide: function() {
            this.settings.hide(this.settings.elem, this.settings.parent);
        }//end hide();
    };

    // Export the Overlay constructor.
    $.module_overlay = Overlay;
}(jQuery, window, document));