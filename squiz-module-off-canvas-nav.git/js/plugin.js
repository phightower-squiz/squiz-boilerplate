/**
 * SquizOffCanvas jQuery plugin
 * @copyright Squiz
 * @preserve
 */
/*globals Hammer*/
(function($, Hammer) {
    var prefix = 'off-canvas';

    var pluginName = 'SquizOffCanvas',
        defaults = {
            classes: {
                container:    prefix,
                closeButton:  prefix + '__close',
                navActive:    prefix + '--active',
                toggleActive: prefix + '__toggle--active',
                left:         prefix + '__nav--left',
                right:        prefix + '__nav--right'
            },
            swipeElem: document.body,
            tapElem:   document.body
        };
    /**
     * SquizOffCanvas jQuery Plugin
     * @constructor
     * @param  {object} elem    The DOM element
     * @param  {object} options JSON hash of options to apply
     * @return {void}
     */
    function SquizOffCanvas(elem, options) {
        this.$toggle = $(elem);
        this.settings = $.extend({}, defaults, options);
        this.swipeDetect = this.$toggle.attr('data-swipe') === 'true' ? true : false;
        this.tapDetect = this.$toggle.attr('data-tap') === 'true' ? true : false;
        this.init();
    }//end SquizOffCanvas constructor

    // Public methods
    SquizOffCanvas.prototype = {

        /**
         * Init the off canvas toggle behavior
         * @return {void}
         */
        init: function() {
            var self = this;
            this.$nav = $('#' + this.$toggle.attr('aria-controls'));
            this.$container = this.$nav.parents('.' + this.settings.classes.container);
            this.$close = this.$nav.find('.' + this.settings.classes.closeButton);

            // Make sure the element button is tab accessible
            this.$toggle.add(this.$close).attr({
                role:     'button',
                tabindex: '0'
            });

            // Click events
            this.$toggle.on('click.soc', function() {
                self.toggle();
            });

            this.$close.on('click.soc', function() {
                self.close();
            });

            // Touch events

            // Detect swipe
            if (this.swipeDetect) {
                this.swipe = new Hammer(this.settings.swipeElem);
                var dirLeft = this.$nav.hasClass(this.settings.classes.left);

                this.swipe.on('swipeleft', function() {
                    self[dirLeft ? 'close' : 'open']();
                });
                this.swipe.on('swiperight', function() {
                    self[dirLeft ? 'open' : 'close']();
                });
            }//end if

            // Detect tap events
            if (this.tapDetect) {
                this.tap = new Hammer(this.settings.tapElem);
                this.tap.on('tap', function(e) {
                    if (self.$nav.parents().filter(function(){
                            return this === e.target;
                        }).length || self.$nav.get(0) === e.target) {
                        return;
                    }
                    if (self.isActive()) {
                        self.close();
                    }
                });
            }
        },

        isActive: function() {
            return this.$nav.hasClass(this.settings.classes.navActive);
        },

        open: function() {
            this.$toggle.addClass(this.settings.classes.toggleActive);
            this.$nav.addClass(this.settings.classes.navActive);
            this.$nav.attr('aria-expanded', true);
        },

        close: function() {
            this.$toggle.removeClass(this.settings.classes.toggleActive);
            this.$nav.removeClass(this.settings.classes.navActive);
            this.$nav.attr('aria-expanded', false);
        },

        toggle: function() {
            var method = this.isActive() ? 'close' : 'open';
            this[method]();
        },

        destroy: function() {
            this.$toggle.off('click.soc');
            this.$close.off('click.soc');
            if (this.swipe) {
                this.swipe.off('swipe');
            }
            if (this.tap) {
                this.tap.off('tap');
            }
        }
    };

    $.fn[pluginName] = function(options) {
        return this.each(function() {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new SquizOffCanvas(this, options));
            }
        });
    };

}(jQuery, Hammer));
