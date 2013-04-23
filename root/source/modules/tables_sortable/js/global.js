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
            var evt = new jQuery.Event('mousedown.tablesorter');
            evt.which = 1;
            evt.type  = 'sort';
            $th.trigger(evt);
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