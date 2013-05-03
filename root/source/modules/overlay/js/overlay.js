;(function($, window, document, undefined){

    // Vertical center alignment helper
    var interval = null;
    var centerVertically = function($elem, delay) {
        if (!$elem.length) {
            return false;
        }//end if

        clearInterval(interval);
        setTimeout(function(){
            var halfWin    = Math.floor($(window).height()/2);
            var halfHeight = Math.floor($elem.height()/2);
            var margin     = 0 + 'px';
            if (halfWin > halfHeight) {
                margin = Math.floor(halfWin - halfHeight);
            }//end if
            $elem.css('margin-top', margin);
        }, delay);
    };

    var Overlay = function(elem, options) {
        var self = this;

        var defaults = {
            // The parent element for the overlay.
            parent:    $('body'),

            // The element to click to toggle the display
            toggle:    null,

            // Whether to allow the plugin to manage the vertical position
            // of modal elements associated with the overlay.
            verticalModalAlign: true,

            // The delay for triggering resize and orientation events.
            resizeDelay: 50,

            // Class names.
            hiddenClass: 'overlay-hidden',
            modalClass: 'overlay-modal',
            closeClass: 'overlay-modal-close',

            // Default show function.
            show: function() {
                if (this.settings.parent.length) {
                    this.settings.parent.append(this.$elem);
                    if (this.$modal.length) {
                        this.$elem.after(this.$modal);
                        this.$modal.removeClass(this.settings.hiddenClass);
                    }//end if
                    this.$elem.removeClass(this.settings.hiddenClass);
                }//end if
            },//end show()

            // Default hide function.
            hide: function() {
                this.$elem.detach();
                if (this.$modal.length) {
                    this.$modal.detach();
                    this.$modal.addClass(this.settings.hiddenClass);
                }//end if
                this.$elem.addClass(this.settings.hiddenClass);
            },//end hide()

            // Callback functions
            onShow: function() {},
            onHide: function() {}
        };

        // Extend the defaults with user supplied options
        this.settings = $.extend({}, defaults, options);

        // Store the state of the overlay.
        this.state = 'hidden';

        // Elements associated with the overlay.
        this.$elem = $(elem);
        this.$modal = this.$elem.find('.' + this.settings.modalClass);
        this.$close = this.$elem.find('.' + this.settings.closeClass);

        // Set the initial state of the overlay
        this.hide(true);

        // Re-position the modal
        if (this.$modal.length) {
            this.$elem.after(this.$modal);
        }//end if

        // Bind toggle
        if (this.settings.toggle !== null && this.settings.toggle.length) {
            $(this.settings.toggle).click(function(e){
                e.preventDefault();
                if (self.state === 'hidden') {
                    self.show();
                } else {
                    self.hide();
                }//end if
            });
        }//end if

        // Bind close
        if (this.$close.length) {
            this.$close.click(function(e){
                e.preventDefault();
                self.hide();
            });
        }//end if

        // Manage automatic alignment of the module based on screen resizes.
        if (this.settings.verticalModuleAlign) {
            centerVertically(self.$modal, 0);

            $(window).on('resize orientationchange', function() {
                centerVertically(self.$modal, self.settings.resizeDelay);
            });
        }//end if
    };

    Overlay.prototype = {
        // Show the overlay by prepending it to the parent.
        show: function() {
            centerVertically(this.$modal, 0);
            this.settings.show.call(this);
            this.state = 'visible';
            this.settings.onShow.call(this);
        },// show();
        hide: function(initial) {
            this.settings.hide.call(this);
            this.state = 'hidden';
            if (!initial) {
                this.settings.onHide.call(this);
            }//end if
        }//end hide();
    };

    $.fn.overlay = function(options) {
        return this.each(function () {
            if (!$.data(this, 'overlay')) {
                $.data(this, 'overlay', new Overlay( this, options ));
            }
        });
    };
}(jQuery, window, document));