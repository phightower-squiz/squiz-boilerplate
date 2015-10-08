/*globals debounce*/
/**
 * NavBar jQuery plugin
 * @copyright Squiz
 * @preserve
 */
(function($) {
    var pluginName = 'NavBar',
        defaults = {
            classes: {
                item:        'navbar__item',
                link:        'navbar__link',
                sub:         'sub-nav',
                itemActive:  'navbar__item--active',
                itemCurrent: 'navbar__item--current'
            },
            onClear: function() {},
            /*eslint no-unused-vars: 0*/
            onState: function($item, active) {}
        };

    /**
     * NavBar jQuery Plugin
     * @constructor
     * @param  {object} elem    The DOM element
     * @param  {object} options JSON hash of options to apply
     * @return {void}
     */
    function NavBar(elem, options) {
        this.$elem = $(elem);
        this.inner = this.$elem.html();
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }//end UberAccordion constructor

    // Public methods
    NavBar.prototype = {
        /**
         * Plugin initialisation
         * @return {void}
         */
        init: function() {
            var self = this;
            this.$items = $('.' + this.settings.classes.item, this.$elem);
            this.$links = $('.' + this.settings.classes.link, this.$elem);
            this.$subs = $('.' + this.settings.classes.sub, this.$elem);

            this.$subs.attr({
                'aria-expanded': 'false',
                'aria-hidden':   'true'
            });

            // Setup item/sub nav pairs and associate controls
            this.$items.each(function(i, item) {
                var id = self.settings.classes.sub + '-' + i;
                var $item = $(item);
                var $link = $('.' + self.settings.classes.link, item);
                var $sub = $('.' + self.settings.classes.sub, item);

                var linkAttr = {
                    'aria-haspopup': $sub.length ? true : false
                };

                if ($sub.length) {
                    linkAttr['aria-controls'] = id;
                    $sub.attr({
                        'id':   id,
                        'role': 'region'
                    });

                    // Prevent click events until the current item is active
                    // Stops things like touch devices from triggering navigation
                    // when there are sub items to expose first
                    $link.on('click.' + pluginName, function(e) {
                        if (!$item.hasClass(self.settings.classes.itemActive)) {
                            e.preventDefault();
                            self.clearState();
                            self.setState($item, true);
                        }
                    });
                }

                $link.attr(linkAttr);

                $link.on(['keyup', 'focus'].map(function(event) {
                    return event+'.'+pluginName;
                }).join(' '), function() {
                    self.clearState();
                    self.setState($item, true);
                });

                $item.on('mouseenter.' + pluginName, function() {
                    self.clearState();
                    self.setState($item, true);
                });

                $item.on('mouseleave.' + pluginName, function() {
                    self.setState($item, false);
                });
            });

            // Handle blur events on tabbable items in the menu. If there are no
            // elements focused after the blur event then clear the menu state
            this.$items.find(':tabbable').on('blur.' + pluginName, debounce(function() {
                if (!self.$items.find(':focus').length) {
                    self.clearState();
                }
            }, 50));

            // Ensure current item has state set appropriately
            this.$items.filter('.' + self.settings.classes.itemCurrent).each(function(){
                self.setState($(this), true);
            });

            $('body').on('click.' + pluginName, function(e) {
                if (!$(e.target).parents(self.$elem).length &&
                    e.target !== self.$elem.get(0)) {
                    self.clearState();
                }
            });
        },

        // Clear the states of items items and sub menus
        clearState: function() {
            this.$items.removeClass(this.settings.classes.itemActive);
            this.$subs.attr({
                'aria-expanded': 'false',
                'aria-hidden':   'true'
            });
            this.settings.onClear.call(this);
        },

        // Set the state of the menu item
        setState: function($item, active) {
            if (active) {
                $item.addClass(this.settings.classes.itemActive);
                $('.' + this.settings.classes.sub, $item).attr({
                    'aria-expanded': 'true',
                    'aria-hidden':   'false'
                });
            } else {
                $item.removeClass(this.settings.classes.itemActive);
                $('.' + this.settings.classes.sub, $item).attr({
                    'aria-expanded': 'false',
                    'aria-hidden':   'true'
                });
            }
            this.settings.onState.call(this, $item, active);
        },

        /**
         * Destroy any markup and events bound by this plugin
         * @return {void}
         */
        destroy: function() {
            // Reset HTML & Classes
            this.$elem.html(this.inner);
            $('body').off('click.' + pluginName);
        }
    };

    // jQuery plugin
    $.fn[pluginName] = function(options) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.each(function() {
            // Invoke as a specific method
            if (typeof options === 'string') {
                var menu = $.data(this, 'plugin_' + pluginName);
                var method = options;
                if (menu && typeof menu[method] === 'function') {
                    menu[method].apply(menu, args);
                }
            // Init the menu
            } else if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new NavBar(this, options));
            }
        });
    };

    // Find tabbable items
    $.extend($.expr[':'], {
        tabbable: function (elem) {
            var index = $(elem).attr('tabindex'),
                valid = isNaN(index);
            return valid || index >= 0;
        }
    });

}(jQuery));
