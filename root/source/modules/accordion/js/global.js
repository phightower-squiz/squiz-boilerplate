(function($, document){
    $(document).ready(function() {
        var $accordions = $('.accordion');
        $accordions.each(function(){
            $('.accordion-group:last', this).addClass('accordion-group-last');
        });
        $accordions.accordion();
    });
}(jQuery, document));