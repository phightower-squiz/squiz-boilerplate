;(function($, undefined){
    var options = {
        // Set this to false to stop any JS behaviour overriding CSS defaults.
        jsNavEnhancementEnabled: true,

        // The class to apply to the enclosing nav-dropdown-item
        // when the menu is active
        activeClass: 'nav-dropdown-item-active',

        // The class applied to each enclosing parent menu item (e.g. li)
        itemClass:   'nav-dropdown-item',

        // The class applied to the sub menu
        subMenuClass: 'nav-dropdown-sub',
        hasSubsClass: 'nav-dropdown-item-subs',

        // The class applied to links
        linkClass:    'nav-dropdown-item-link',

        // Time in milliseconds to trigger the hide of a sub menu.
        // This should give the user enough time to navigate from the hyperlink
        // to a sub menu without accidentally mousing off the element
        menuHideDelay: 150
    };

    var isSmallScreen = function() {
        // Detect support for media queries, then match
        // small screen.
        if (!Modernizr.mq('only all')) {
            return false;
        }//end if
        var mq = '(min-width: 37.5em)';
        return !Modernizr.mq(mq);
    };

    var $dropdowns = $('.nav-dropdown');
    var $items = $('.' + options.itemClass, $dropdowns);
    var $subs  = $('.' + options.subMenuClass, $dropdowns);
    var $links = $('.' + options.linkClass, $dropdowns);

    function showSub($sub, $link) {
        $link.addClass(options.activeClass);
        $sub.show();
    }//end showSub()

    function hideSub($sub, $link) {
        $link.removeClass(options.activeClass);
        $sub.hide();
    }//end hideSub()

    function hideAll() {
        // Hide other subs
        $subs.hide();
        $links.removeClass(options.activeClass);
    }//end hideAll()

    // Hover menu behaviour changes
    $dropdowns.each(function(){

        // Check if JS Nav is enabled.
        if (!options.jsNavEnhancementEnabled) {
            return false;
        }//end if

        var $nav   = $(this);
        var hideInterval = null;

        // Some detection on whether the menu has subs available.
        $items.each(function(){
            if ($('.' + options.subMenuClass,this).length) {
                $(this).addClass(options.hasSubsClass);
            }
        });

        // Mouse over with timeout
        $items.on('mouseenter', function() {
            hideAll();

            // Show this sub.
            if (!isSmallScreen()) {
                // Reveal sub
                showSub($(this).find('.' + options.subMenuClass),
                        $(this).find('.' + options.linkClass));
            }//end if
        }).on('mouseleave', function(e) {
            hideAll();
            if (!isSmallScreen()) {
                clearInterval(hideInterval);
                var $sub = $(this).find('.' + options.subMenuClass);
                hideInterval = setTimeout(function() {
                    $links.removeClass(options.activeClass);
                    hideSub($sub,
                            $sub.find('.' + options.linkClass));
                }, options.menuHideDelay);
            }//end if
        });

        // Keyboard focus
        $('*', $items).on('focus', function(){
            hideAll();
            if (!isSmallScreen()) {
                var $item = $(this).parents('.' + options.itemClass);
                if ($item.length) {
                    var $link = $item.find('.' + options.linkClass);
                    var $sub  = $item.find('.' + options.subMenuClass);
                    if (!$link.hasClass(options.activeClass)) {
                        showSub($sub, $link);
                    }//end if
                }//end if
            }//end if
        }).on('blur', function(e) {
            if (!isSmallScreen()) {
                clearInterval(hideInterval);
                var $item = $(this).parents('.' + options.itemClass);
                if ($item.length) {
                    var $link = $item.find('.' + options.linkClass);
                    var $sub  = $item.find('.' + options.subMenuClass);
                    if (!$link.hasClass(options.activeClass)) {
                        hideInterval = setTimeout(function() {
                            hideSub($sub, $link);
                        }, options.menuHideDelay);
                    }//end if
                }//end if
            }//end if
        });

        // Clickable links to activate menu
        $('.' + options.linkClass, $items).on('click touch', function(e){
            var $link = $(this);
            // We're using a touch supported device. We need to calculate the
            // initial tap may be attempting to expand the menu item. We also
            // need a click to expand the menu if we're on small screen regardless
            // of touch support.
            if ((Modernizr.touch || isSmallScreen()) &&
                !$link.hasClass(options.activeClass)) {
                $link.addClass(options.activeClass);
                e.preventDefault();
            }//end if

            $items.find('.' + options.linkClass).removeClass(options.activeClass);
            $link.addClass(options.activeClass);

            // Toggle view by allowing the menu to behave like an accordion.
            var $sub = $(this).parent().find('.' + options.subMenuClass);
            if ($sub.length) {
                $subs.stop().slideUp('fast');
                $sub.stop().slideDown('fast');
            }//end if
        });
    });
}(jQuery));