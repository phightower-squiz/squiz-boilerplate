(function($){
    // First example is a standard accordion
    /*eslint new-cap: 0*/
    $('.accordion').UberAccordion({
        buttonClass:          'accordion__link',
        autoExpand:           '#accordion__target-1',
        toggle:               true,
        multiple:             true,
        expandOnFocus:        false,
        preventDefaultButton: true,
        hashChange:           true
    });

    // Second example is a tab-like setup
    $('.tabs').UberAccordion({
        buttonClass: 'tabs__link',

        autoExpand: function() {
            return window.location.hash || '#tabs__target-1';
        },

        toggle:               false,
        multiple:             false,
        preventDefaultButton: true
    });
}(jQuery));
