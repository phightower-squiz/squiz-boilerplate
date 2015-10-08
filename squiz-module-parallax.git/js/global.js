(function($){
    var ua = window.navigator.userAgent;
    var appName = window.navigator.appName;
    var isIE = appName === 'Microsoft Internet Explorer' && ua.indexOf('MSIE ') ||
           /Trident/.test(ua) && appName === 'Netscape';

    // Parallax behavior is generally undesirable on
    // mobile devices or ie8 and older due to performance issues
    // and screen real-estate. If you want parallax behavior to
    // init and destroy on screen resize consider a listener on a
    // window.matchMedia media query list object and call:
    // parallax.destroy()
    /*eslint new-cap: 0*/
    if (Modernizr.mq('(min-width: 37.5em') &&
        !$('body').hasClass('lt-ie9')) {
        $('.parallax').SquizParallax({
            smoothScroll:   isIE,
            debounceScroll: isIE ? 5 : 0
        });
    }
}(jQuery));
