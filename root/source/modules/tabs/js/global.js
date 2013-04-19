;(function($){
    $(document).ready(function(){
        $('.tabs').each(function(){
            var $container = $(this);
            var $content   = $('.tabs-panel', $container);
            var $links     = $('.tabs-nav-link', $container);
            $content.tabbedContent({
                links: $links,
                currentClass: 'tabs-nav-link-active'
            });
        });
    });
}(jQuery));