(function($){
    var options = {
        // Classes
        menuToggleClass:   'nav-basic-list-menu-toggle-inactive',
        buttonToggleClass: 'nav-basic-menu-toggle-active',
        buttonClass:       'nav-basic-menu-toggle',

        // Button contents
        title:       'Menu Toggle',
        content:      'Menu'
    };

    // This can be changed to an id selector for better performance.
    $('.nav-basic').each(function(){
        var $nav = $(this);
        var $toggle = $('<a class="' + options.buttonClass + '" ' +
                        'role="button" href="#" title="' + options.title +
                        '">' + options.content + '</a>');
        var $menu = $('.nav-basic-list', $nav);

        // The link only gets prepended with js enabled.
        $nav.prepend($toggle);

        // Button toggle click
        $toggle.click(function(e){
            e.preventDefault();
            $menu.toggleClass(options.menuToggleClass);
            $(this).toggleClass(options.buttonToggleClass);
        });
    });
}(jQuery));