;(function($){
    'use strict';
    // Add a link wrapping in the table header
    var addHeaderLink = function($th) {
        var $container = $th.find('.tablesorter-header-inner');
        var text = $container.text();
        $container.empty();

        var $link = $('<a class="table-sortable-header-link" href="#">' + text + '</a>');
        $container.append($link);

        $link.on('click', function(e){
            e.preventDefault();
            e.which = 1;
            e.type  = 'sort';
        });

        // Add keyboard accessibility to the link
        $link.on('keyup', function(e){
            // Keyup on the link registers as a click
            if (e.which === 13) {
                var evt = new jQuery.Event('mouseup.tablesorter ');
                evt.which = 1;
                evt.type  = 'sort';
                e.stopPropagation();
                $th.trigger(evt);
            }//end if
        });

    };//end addHeaderLink

    $(document).ready(function(){
        $('.table-sortable').tablesorter({
            onRenderHeader: function(index) {
                // Add a keyboard accessible hyperlink that can be used to trigger
                // the sorting action by looking back up the tree to the header
                addHeaderLink($(this));
            },
            widgets: ['ariaWidget']
        });
    });
}(jQuery));