(function($){
    $('.responsive-table').each(function() {
        var headings = $('th', this).map(function(){
            return $(this).text();
        });
        $('tr', this).each(function(){
            var $row = $(this);
            $.each(headings, function(i, heading) {
                $('td:eq(' + i + ')', $row).attr('data-th', heading);
            });
        });
    });
}(jQuery));
