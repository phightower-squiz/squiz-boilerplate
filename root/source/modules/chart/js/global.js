/*global google:false*/
(function($) {
    var options = {
        chartClass: 'chart'
    };

    // Load charts using the google script loader
    function loadCharts() {
        // Callback is required here to force google charts to use append rather
        // than document.write which will destroy the page.
        // http://stackoverflow.com/questions/9519673/why-does-google-load-cause-my-page-to-go-blank
        google.load('visualization', '1', {'callback':'', 'packages':['corechart']});
        google.setOnLoadCallback(drawChart);
    }//end loadCharts()

    // Draw the chart
    function drawChart() {
        var $charts = $('.' + options.chartClass);
        $charts.each(function(){
            // Create the data table.
            var data = new google.visualization.DataTable();
            data.addColumn('number', 'Asset');
            data.addColumn('date', 'Date');
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
                width:400,
                height:300,
                colors: ['#e0440e', '#e6693e', '#ec8f6e', '#f3b49f', '#f6c7b6']
            };

            // Instantiate and draw our chart, passing in some options.
            var chart = new google.visualization.LineChart($(this).find('.chart-output').get(0));
            chart.draw(data, options);
        });
    }//end drawChart()

    // Script loader when google charts is not available
    $(document).ready(function() {

        // Only proceed if we have google chart element on the
        // page indicating we need this script loader.
        if (!$('.' + options.chartClass).length) {
            return;
        }//end if

        loadCharts();

    });
}(jQuery));