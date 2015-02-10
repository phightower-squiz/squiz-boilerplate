// Add some active classes to menu links
$('.demo-menu__link').each(function(){
    var href = $(this).attr('href');
    var pathReg = new RegExp(href.replace(/\./,'\\.') + '$');
    if (pathReg.test(window.location.href)) {
        $(this).addClass('demo-menu__link-active');
    }
});

(function($) {
    'use strict';

    var $list = $('.demo-heading-list');

    if (!$list.length) {
        return;
    }

    var $headings = $('h1', 'body');

    $headings.each(function(){
        var $heading = $(this);
        var text = $heading.text();
        var id   = $heading.attr('id');
        $list.append('<li class="demo-heading-list__item">' +
            '<a href="#' + id + '">' + text + '</a></li>')
    });
}(jQuery));