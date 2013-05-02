;(function($, undefined){
    var options = {
        // The class to apply to the enclosing nav-dropdown-item
        // when the menu is active
        activeClass: 'nav-dropdown-item-active',

        // The class applied to each enclosing parent menu item (e.g. li)
        itemClass:   'nav-dropdown-item',

        // The class applied to the sub menu
        subMenuClass: 'nav-dropdown-sub',
        hasSubsClass: 'nav-dropdown-item-subs',

        // The class applied to links
        linkClass:    'nav-dropdown-item-link'
    };

    var isSmallScreen = function() {
        var mq = '(min-width: 37.5em)';
        return !Modernizr.mq(mq);
    };

    var $dropdowns = $('.nav-dropdown');

    // Hover menu behaviour changes
    $dropdowns.each(function(){
        var $nav   = $(this);
        var $items = $('.' + options.itemClass, $nav);
        var $subs  = $('.' + options.subMenuClass, $nav);

        // Some detection on whether the menu has subs available.
        $items.each(function(){
            if ($('.' + options.subMenuClass,this).length) {
                $(this).addClass(options.hasSubsClass);
            }
        });

        // Override the default hover behavior
        $items.on('mouseenter focus', function() {
            if (!isSmallScreen()) {
                var $sub = $(this).find('.' + options.subMenuClass);
                $sub.show();
                $('.' + options.linkClass,this).addClass(options.activeClass);
            }//end if
        }).on('mouseleave blur', function(){
            if (!isSmallScreen()) {
                var $sub = $(this).find('.' + options.subMenuClass);
                $sub.hide();
                $('.' + options.linkClass,this).removeClass(options.activeClass);
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