;(function($, document, undefined){
    $(document).ready(function(){
        // Editable options for flexslider
        var options = {
            animation: "slide",
            selector: ".slideshow-slides > .slideshow-slide",
            controlsContainer: ".slideshow-nav",
            pausePlay: true
        };

        $('.slideshow').each(function(){
            var $slideshow = $(this);
            $slideshow.flexslider(options);
            var flex = $slideshow.data('flexslider');
            if (!flex) {
                throw "Unable to initialise flexslider";
            }//end if
        });
    });
}(jQuery, document));