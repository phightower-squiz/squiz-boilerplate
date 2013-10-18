(function($, undefined) {
    'use strict';
    $(document).ready(function(){
        $('.chart').google_chart({

            // Chart options map directly to the google chart visualisation options
            // See: https://developers.google.com/chart/interactive/docs/customizing_charts
            chart: {

            },

            // When the chart has finished loading this callback will be triggered
            callbacks: {
                loaded: function() {}
            }
        });
    });
}(jQuery));