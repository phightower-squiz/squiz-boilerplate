/**
 * Uber Accordion jQuery plugin
 * @copyright Squiz
 * @preserve
 */
(function($) {
    var pluginName = 'UberAccordion',
        defaults = {
            // Map buttons and targets to the accordion behavior
            buttonClass: '',

            // Apply classes to elements to help control the show/hide behavior
            // Generally you won't need to change these
            appliedClasses: {
                base:         'uber-accordion',
                button:       'uber-accordion__button',
                target:       'uber-accordion__target',
                activeButton: 'uber-accordion__button-active',
                activeTarget: 'uber-accordion__target-active'
            },

            // An id to auto expand when first initialised
            // null         = no auto expansion
            // #hash string = expand to this target/button pair
            // function     = return the hash to expand to
            // Autoexpand function example:
            // autoExpand: function($elem) {
            //     return this.$buttons.first().attr('href');
            // }
            autoExpand: null,

            // Allow items to be toggled.
            // true = successive clicks will toggle the visible state of the target element
            // false = initial click will set the target element visible, successive clicks are ignored
            toggle: true,

            // Whether to allow multiple items to be expanded
            // true = multiple
            // false = only a single element can be expanded
            multiple: true,

            // Whether to automatically expand an item when button gets keyboard focus, or any element inside
            // the target has been focused
            expandOnFocus: false,

            // Prevent the default button action (e.g hash change)
            // If you don't prevent this the default browser scroll behavior to the
            // target id will occur as button clicks may update the window.location.hash
            preventDefaultButton: true,

            // Whether this plugin should respond to hash change events
            hashChange: true,

            // Each time an item is selected this function will be called passing the active $button and $target pair.
            /*eslint no-unused-vars: 0*/
            onSelect: function($button, $target) {}
        };

    /**
     * Uber Accordion jQuery Plugin
     * @constructor
     * @param  {object} elem    The DOM element
     * @param  {object} options JSON hash of options to apply
     * @return {void}
     */
    function UberAccordion(elem, options) {
        this.$elem = $(elem);
        this.inner = this.$elem.html();
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }//end UberAccordion constructor

    function getTargetHash($elem) {
        var href = $elem.attr('href');
        if (!href) {
            href = $elem.attr('data-target');
        }
        if (!/^#/.test(href)) {
            href = '#'+href;
        }
        return href;
    }

    // Public methods
    UberAccordion.prototype = {
        /**
         * Plugin initialisation
         * @return {void}
         */
        /*eslint complexity: 0, max-statements: 0*/
        init: function() {
            var self = this;
            this.$buttons = $('.' + this.settings.buttonClass, this.$elem);
            this.$targets = $();

            // Setup buttons
            this.$buttons.each(function() {
                var $button = $(this);
                var hash = getTargetHash($button);

                if (!hash) {
                    return;
                }

                $button.attr({
                    'role':          'button',
                    'aria-controls': hash.replace(/^#/, '')
                });

                self.$targets = self.$targets.add($(hash));
            });

            if (!this.$buttons.length || !this.$targets.length) {
                // Silent pass through?
                //throw "Missing buttons or targets for " + pluginName;
                if (window.console && window.console.warn) {
                    window.console.warn('Some accordion components appear to be missing or not configured correctly');
                }
            }

            // Add classes
            this.$elem.addClass(this.settings.appliedClasses.base);
            this.$buttons.addClass(this.settings.appliedClasses.button);
            this.$targets.addClass(this.settings.appliedClasses.target);

            // Setup targets
            this.$targets.attr({
                'role':          'region',
                'aria-expanded': 'false'
            });

            // Bind button click events
            this.$buttons.on('click.' + pluginName, function(e) {
                // Override the default button behavior
                if (self.settings.preventDefaultButton) {
                    e.preventDefault();
                }//end if
                var hash = getTargetHash($(this));
                if (hash) {
                    self.toggleActive(hash);
                }
            });

            // Focus events (only trigger expand, not collapse)
            if (this.settings.expandOnFocus) {
                this.$buttons.on('focus.' + pluginName, function() {
                    var hash = getTargetHash($(this));
                    if (hash) {
                        self.toggleActive(hash, true);
                    }
                });

                // Detect focus events on all child elements
                this.$targets.each(function() {
                    var $target = $(this);
                    $target.find('*').on('focus.' + pluginName, function(){
                        var id = $target.attr('id');
                        if (!id) {
                            return;
                        }
                        self.toggleActive('#' + id, true);
                    });
                });
            }

            // Bind hash change event to hook up hash to active target
            if (this.settings.hashChange) {
                $(window).on('hashchange.' + pluginName, function() {
                    self.toggleActive(window.location.hash);
                });
            }

            var expandType = typeof this.settings.autoExpand;
            if (expandType === 'string') {
                self.toggleActive(this.settings.autoExpand);
            } else if (expandType === 'function') {
                self.toggleActive(this.settings.autoExpand.call(this, this.$elem));
            }
        },

        /**
         * Toggle the active state of the button
         * @param  {string}  hash   Id hash to search for
         * @param  {boolean} active Whether to force only the active state (disable the toggle behavior)
         * @return {void}
         */
        toggleActive: function(hash, active) {
            var $button = this.$buttons.filter('[href="' + hash + '"], [data-target="' + hash.replace(/^#/, '') + '"]');
            var $target = $(hash);
            var classes = this.settings.appliedClasses;

            if (!$button.length || !$target.length) {
                // No active target & button match found
                if (window.console && window.console.warn) {
                    window.console.warn('Could not find target or button');
                }
                return;
            }

            // Toggle the state of the buttons
            if ($button.hasClass(classes.activeButton) &&
                this.settings.toggle &&
                !active) {
                // De-activate button & target
                $button.removeClass(classes.activeButton);
                $target.attr('aria-expanded', false)
                    .removeClass(classes.activeTarget);
            } else if (!$button.hasClass(classes.activeButton)) {
                // Button classes
                if (!this.settings.multiple) {
                    this.$buttons.removeClass(classes.activeButton);
                }
                $button.addClass(classes.activeButton);

                // Target classes
                if (!this.settings.multiple) {
                    this.$targets
                        .attr('aria-expanded', false)
                        .removeClass(classes.activeTarget);
                }
                $target
                    .attr('aria-expanded', true)
                    .addClass(classes.activeTarget);
            }

            this.settings.onSelect.call(this, $button, $target);
        },

        /**
         * Destroy any markup and events bound by this plugin
         * @return {void}
         */
        destroy: function() {
            // Unbind events
            this.$buttons
                .off('click.' + pluginName + ' focus.' + pluginName);
            if (this.settings.expandOnFocus) {
                this.$targets.find('*').off('focus.' + pluginName);
            }
            $(window).off('hashchange.' + pluginName);

            // Reset HTML & Classes
            this.$elem.removeClass(this.settings.appliedClasses.base);
            this.$elem.html(this.inner);
        }
    };

    // Use the lightweight plugin wrapper to prevent against multiple instantiations.
    $.fn[pluginName] = function(options) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.each(function() {
            // Invoke as a specific method
            if (typeof options === 'string') {
                var accordion = $.data(this, 'plugin_' + pluginName);
                var method = options;
                if (accordion && typeof accordion[method] === 'function') {
                    accordion[method].apply(accordion, args);
                }
            // Init the accordion
            } else if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new UberAccordion(this, options));
            }
        });
    };

}(jQuery));
