/**
 * SquizParallax jQuery plugin
 * @copyright Squiz
 * @preserve
 */
(function($, window, M) {
    var $w = $(window);

    var pluginName = 'SquizParallax',
        defaults = {
            layerClassName: 'parallax__layer',

            // Smooth scrolling can help alleviate the issues in IE where positioning elements
            // 'jump' around the page at the cost of hijacking the user's scrollwheel
            // Note: this does not play nicely with other smooth scrolls and should be used
            // sparingly.
            smoothScroll:   false,

            // How much to debounce the scroll event by (if at all). 0 = no debounce
            debounceScroll: 0,

            // Whether or not to cache the offset coordinates of the parallax layers
            // This is intended to avoid browser repaints when the element.offsetTop property is 
            // calculated
            cacheOffset:    false,

            // The default speed of the scroll. The lower value the slower the layer will scroll.
            // Higher values make the layer appear as if in the foreground.
            speed:          0.5
        },

        // Animation tick
        ticking = false,

        // Smmoth scroll params
        mouseDelta = 0,
        mouseDistance = 150,
        mouseSpeed = 1000;

    /**
     * SquizParallax jQuery Plugin
     * @constructor
     * @param  {object} elem    The DOM element
     * @param  {object} options JSON hash of options to apply
     * @return {void}
     */
    function SquizParallax(elems, options) {
        this.elems     = elems;
        this.settings  = $.extend({}, defaults, options);
        this.layers    = [];
        this.init();
    }//end SquizParallax constructor

    // Private methods
    /**
     * Get the value of a data attribute as a float value
     * @param  {object} $elem      Element to check
     * @param  {string} name       The name of the data attribute
     * @param  {number} (defaultVal) Optional default value to send back
     * @return {number}            The value (defaults to 0)
     */
    var getDataAsFloat = function($elem, name, defaultVal) {
        if ($elem.data(name)) {
            return parseFloat($elem.data(name));
        }
        return defaultVal || 0;
    };

    // Credit: http://stackoverflow.com/questions/10564680/get-div-position-top-in-javascript
    var getOffsetTop = function(el) {
        var _y = 0;
        while( el && !isNaN( el.offsetTop ) ) {
            _y += el.offsetTop;
            el = el.offsetParent;
        }
        return _y;
    };

    function doScroll() {
        $('html, body').stop().animate({
            /*eslint no-extra-parens: 0*/
            scrollTop: $(window).scrollTop() - (mouseDistance * mouseDelta)
        }, mouseSpeed);
    }

    function smoothScroll(e) {
        if (e.wheelDelta) {
            mouseDelta = e.wheelDelta / 120;
        } else if (e.detail) {
            mouseDelta = -e.detail / 3;
        }

        doScroll();
        e.preventDefault();
        e.returnValue = false;
    }

    // Source: http://davidwalsh.name/javascript-debounce-function
    function debounce(func, wait) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                timeout = null;
                func.apply(context, args);
            }, wait);
        };
    }

    // Public methods
    SquizParallax.prototype = {

        /**
         * Init the parallax behavior
         * @return {void}
         */
        init: function() {
            /*eslint no-unused-vars:0*/
            var doSmoothScroll;
            var self = this;
            self.destroy();
            this.groups = [];

            this.elems.each(function() {
                self.initElem($(this));
            });

            this.requestTick = function() {
                if (!ticking) {
                    window.requestAnimationFrame(function(){
                        self.update();
                    });
                }
                ticking = true;
            };

            // Add debounce to the scroll events
            if (this.settings.debounceScroll > 0) {
                this.requestTick = debounce(this.requestTick, this.settings.debounceScroll);
                doSmoothScroll = debounce(smoothScroll, this.settings.debounceScroll);
            } else {
                doSmoothScroll = smoothScroll;
            }

            $w.on('ready.sqp scroll.sqp resize.sqp', this.requestTick);

            if (this.settings.smoothScroll) {
                window.addEventListener('DOMMouseScroll', smoothScroll, false);
                window.onmousewheel = document.onmousewheel = smoothScroll;
            }
        },


        /**
         * Checks a parallaxed element for layers and adds them to an array
         * @param  {object} $elem      Element to check
         * @return {void}
         */
        initElem: function($elem) {
            var self = this;
            var $layers = $('.' + this.settings.layerClassName, $elem);
            this.layers = this.layers.concat($layers.toArray());
            if ($layers.length) {
                // Populate groups with it's element and layers contained
                this.groups.push({
                    $elem:         $elem,
                    elem:          $elem.get(0),
                    initialHeight: $elem.height(),

                    layers: $layers.map(function() {
                        var $layer = $(this);
                        return {
                            $elem:  $layer,
                            speed:  getDataAsFloat($layer, 'speed', self.settings.speed),
                            offset: {
                                top:  getDataAsFloat($layer, 'offset-top'),
                                side: getDataAsFloat($layer, 'offset-side')
                            }
                        };
                    }),
                    numLayers: $layers.length
                });
            }
            this.numGroups = this.groups.length;
        },

        transform: (function() {
            var prop = M.prefixed('transform');
            if (M.csstransforms3d) {
                return function($layer, x, y) {
                    $layer.css(prop, 'translate3d(' + x + 'px, ' + y + 'px, 0)');
                };
            } else if (M.csstransforms) {
                return function($layer, x, y) {
                    $layer.css(prop, 'translate(' + x + 'px, ' + y + 'px)');
                };
            } else {
                // Fallback to top & left positioning
                return function($layer, x, y) {
                    $layer.css({
                        top:  y + 'px',
                        left: x + 'px'
                    });
                };
            }
        }()),

        // Position the top of each layer relative to it's containing
        // group and the scrolled position of the document
        /*eslint max-statements: 0*/
        update: function() {
            var self = this;
            var viewTop = window.pageYOffset;
            var viewHeight = window.innerHeight;
            var viewBottom = viewTop + viewHeight;
            var group, layer;

            for (var i = 0; i<this.numGroups; i+=1) {
                group = this.groups[i];
                var _top = getOffsetTop(group.elem);
                var _height = group.initialHeight;
                var _bottom = _top + _height;
                // Partial visibility is desirable to start parallax behavior,
                // only when it's bounding box is in view does the parallax start
                var isVisible = _bottom >= viewTop && _top <= viewBottom;
                if (isVisible) {
                    /*eslint max-depth: 0*/
                    for (var j = 0; j<group.numLayers; j+=1) {
                        layer = group.layers[j];
                        var topPos = ((viewTop - _top) + layer.offset.top) * layer.speed;
                        self.transform(layer.$elem, layer.offset.side, topPos);
                    }
                }
            }

            ticking = false;
        },

        // Destroy the bound events and reset the parallaxed elements
        destroy: function() {
            $w.off('resize.sqp scroll.sqp', this.requestTick);
            $.each(this.layers, function(i, layer) {
                $(layer).attr('style', '');
            });
        }
    };

    $.fn[pluginName] = function(options) {
        var instance = new SquizParallax(this, options);
        $(this).data('plugin_SquizParallax', instance);
        return instance;
    };

}(jQuery, window, Modernizr));
