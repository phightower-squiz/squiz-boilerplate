(function($, undefined){

    var baseUrl    = "http://docs.funnelback.com",
        suggestPath   = "/s/suggest.json",
        collection = "funnelback_docs_1240",
        searchInput = $('#query');

    searchInput.typeahead({
        name: 'site-search',
        limit: 10,
        remote: {
            url: baseUrl + suggestPath + '?collection=' + collection + '&partial_query=%QUERY',
            dataType: 'jsonp'
        }
    });

}(jQuery));
