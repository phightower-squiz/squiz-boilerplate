$(document).ready(function(){
    // Editable options for flexslider
    var options = {
        animation: "slide",
        selector: ".slideshow-slides > .slideshow-slide",
        controlsContainer: ".slideshow-nav",
        pausePlay: true,
        start: function(slider){
          $('body').removeClass('loading');
        }
    };

    $('.slideshow').each(function(){
        var $slideshow = $(this);
        $slideshow.flexslider(options);
    });
});