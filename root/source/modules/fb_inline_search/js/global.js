;(function($, undefined){

    // JSON P connection to a funnelback JSON service.

    $(document).ready(function(){
        var baseUrl    = "http://docs.funnelback.com",
            jsonPath   = "/s/search.json",
            collection = "funnelback_docs_1240",
            $container = $('.fb-inline-search'),
            $input     = $('input[type=text]', $container);

        $input.autocomplete({
             source: function( request, response ) {
                $.ajax({
                    url: baseUrl + jsonPath,
                    dataType: "jsonp",
                    data: {
                        collection: collection,
                        query: request.term
                    },
                    success: function( data ) {
                        var results = [];
                        if (typeof(data.response.resultPacket.results) !== "undefined") {
                            results = data.response.resultPacket.results;
                        }//end if
                        response(results);
                    }
                });
            },
            minLength: 2,
            appendTo: $container,
            select: function( event, ui ) {
                // Do something with ui.item
            }
        })

        // The UI Auto Complete HTML results template
        .data( "ui-autocomplete" )._renderItem = function( ul, item ) {
            $(ul).addClass("fb-inline-search-list");
            var date = new Date(item.date);
            return $( '<li class="fb-inline-search-list-item" />' )
                .append( '<a href="' + baseUrl + item.clickTrackingUrl + '">' +
                     item.title + '</a><br />Date: ' + date.toString() )
                .appendTo( ul );
        };
    });
}(jQuery));