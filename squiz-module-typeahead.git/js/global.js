(function($){
    // This example uses funnelback docs as an example of typeahead functionality
    var baseUrl = 'http://docs.funnelback.com',
        suggestPath = '/s/suggest.json',
        collection = 'funnelback_docs_1240',
        searchInput = $('#typeahead-query');

    searchInput.typeahead({
        name:   'site-search',
        limit:  10,
        remote: {
            url:      baseUrl + suggestPath + '?collection=' + collection + '&partial_query=%QUERY',
            dataType: 'jsonp'
        }
    });
}(jQuery));
