(function($, undefined){
    "use strict";

    $('.overlay-image').magnificPopup({
        delegate: 'a',
        type: 'image',
        image: {
            titleSrc: 'title'
        }
    });

    $('.overlay-gallery').magnificPopup({
        delegate: 'a',
        type: 'image',
        gallery: {
            enabled: true
        },
        image: {
            titleSrc: 'title'
        }
    });

}(jQuery));