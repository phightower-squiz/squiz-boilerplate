(function($){
    var $searchInput = $('#quick-search-query');
    // Mimick placeholder support where it is not available.
    // Credit: http://webdesignerwall.com/tutorials/cross-browser-html5-placeholder-text
    if(!Modernizr.input.placeholder && $searchInput.attr('placeholder') !== '') {
        $searchInput.focus(function() {
          var input = $(this);
          if (input.val() === input.attr('placeholder')) {
            input.val('');
            input.removeClass('placeholder');
          }
        }).blur(function() {
          var input = $(this);
          if (input.val() === '' || input.val() === input.attr('placeholder')) {
            input.addClass('placeholder');
            input.val(input.attr('placeholder'));
          }
        }).blur();
        $searchInput.parents('form').submit(function() {
          $(this).find('[placeholder]').each(function() {
            var input = $(this);
            if (input.val() === input.attr('placeholder')) {
              input.val('');
            }
          });
        });
    }//end if
}(jQuery));