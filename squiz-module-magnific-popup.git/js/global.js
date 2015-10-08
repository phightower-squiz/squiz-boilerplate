(function($){
    $('.popup__image').magnificPopup({
        delegate: 'a',
        type:     'image',

        image: {
            titleSrc: 'title'
        }
    });

    $('.popup__gallery').magnificPopup({
        delegate: 'a',
        type:     'image',

        gallery: {
            enabled: true
        },

        image: {
            titleSrc: 'title'
        }
    });
}(jQuery));
