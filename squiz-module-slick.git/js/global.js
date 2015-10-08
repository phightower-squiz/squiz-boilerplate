(function($){
    var $slideshow = $('.slick-slideshow');

    $slideshow.slick({
        dots:           true,
        arrows:         true,
        speed:          400,
        slide:          '.slick-slideshow__slide',
        slidesToScroll: 3,
        slidesToShow:   3
    });
}(jQuery));
