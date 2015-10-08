(function($){
    // Data table with only sorting enabled
    $('table.table-sortable').dataTable({
        'bPaginate':     false,
        'bLengthChange': false,
        'bFilter':       false,
        'bSort':         true,
        'bInfo':         false,
        'bAutoWidth':    false
    });
}(jQuery));
