/*global google:false*/
// Globally scoped chart loader
function loadCharts() {
    google.load('visualization', '1', {'callback':'', 'packages':['corechart']});
    google.setOnLoadCallback(drawChart);
}//end loadCharts()

var drawChart = (function($) {
    function initLoader() {
        var script = document.createElement("script");
        script.src = "https://www.google.com/jsapi?callback=loadCharts";
        script.type = "text/javascript";
        document.getElementsByTagName("head")[0].appendChild(script);
    }//end initLoader

    // Script loader when google charts is not available
    $(document).ready(function() {

        // Only proceed if we have google chart element on the
        // page indicating we need this script loader.
        if (!$('.chart').length) {
            return;
        }//end if

        initLoader();
    });

    return function() {
        var $charts = $('.chart');
        $charts.each(function(){
            // Create the data table.
            var data = new google.visualization.DataTable();
            data.addColumn('string', 'Type');
            data.addColumn('number', 'Number');
            data.addRows([
              ['Mushrooms', 3],
              ['Onions', 1],
              ['Olives', 1],
              ['Zucchini', 1],
              ['Pepperoni', 2]
            ]);

            // Set chart options
            var options = {
                title:'How Much Pizza I Ate Last Night',
                colors: ['#e0440e', '#e6693e', '#ec8f6e', '#f3b49f', '#f6c7b6']
            };

            // Instantiate and draw our chart, passing in some options.
            var chart = new google.visualization.PieChart($(this).find('.chart-output').get(0));
            chart.draw(data, options);
        });
    };
}(jQuery));