/*eslint no-console: 0, new-cap: 0*/
(function($){
    // Match this with the breakpoint at which the screen transforms
    // from smaller size to medium size
    var minMq = '(min-width: 60em)';
    var $body = $('body');
    var $nav = $('#navbar__dropdown');

    // Load the menu
    function loadMenu() {
        var isCurrent = $nav.find('.navbar__item--current .sub-nav').length !== 0;
        $nav.NavBar({
            onState: function($item, active) {
                if (isCurrent) {
                    return;
                }
                if ($item.find('.sub-nav').length && active) {
                    $body.addClass('is-nav-active');
                } else {
                    $body.removeClass('is-nav-active');
                }
            }
        });

        if (isCurrent) {
            $body.addClass('is-nav-active');
        }
    }

    window.matchMedia(minMq).addListener(function(mql) {
        // Emoty console statement needed to ensure FF always runs this
        console.log('');
        if (mql.matches) {
            loadMenu();
        } else {
            $nav.NavBar('destroy');
        }
    });

    if (window.matchMedia(minMq).matches) {
        loadMenu();
    }
}(jQuery));
