(function ($) {
    "use strict";
    var $boxTitle, iconHTML;
    $boxTitle = $(".collapsible-box-header");
    iconHTML  = '<span class="collapsible-box-icon">' +
        '<a href="#" class="collapsible-box-link">Hide content</a></span>';
    $boxTitle.append(iconHTML);
    $boxTitle.on('click', function (evt) {
        var $content, $icon;
        $content = $(this).parent().find('.collapsible-box-content');
        $icon    = $(this).find('.collapsible-box-link');
        $content.slideToggle(function () {
            var txt, re, newTxt;
            txt = $icon.html();
            re  = /^Hide/i;
            newTxt = (re.test(txt)) ? "Show content" : "Hide content";
            $icon.html(newTxt);
        });
        $content.parent().toggleClass('collapsible-box--collapsed');
        return false;
    });
}(jQuery));