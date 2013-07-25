/* global Raphael:false */
;(function($, undefined){
    "use strict";

    var $data = $('#pie-chart-data .pie-chart-data-item');

    if (!$data.length) {
        return false;
    }//end if

    // Map the chart data from the dom into an array.
    var chartData = $data.map(function(i, val){
        var tmpData = $(val).data();
        return {
            value:  tmpData.value,
            legend: tmpData.legend,
            color:  tmpData.colour
        };
    });

    // Values to supply to Raphael.piechart()
    var values  = [],
        legends = [],
        colors  = [];

    $.each(chartData, function(i, val){
        values.push(val.value);
        legends.push(val.legend);
        colors.push(val.color);
    });

    // Initiate the pie chart function and supply the data.
    $(document).ready(function(){
        // Example: http://g.raphaeljs.com/piechart2.html
        // Need .apply() to be used here to avoid jshint complaints
        var r = Raphael.apply(this,["pie-chart"]),
            pie = r.piechart(
                320,
                240,
                100,
                values,
                {
                    legend: legends,
                    legendpos: "west",
                    colors: colors
                });

        pie.hover(function () {
            this.sector.stop();
            this.sector.scale(1.05, 1.05, this.cx, this.cy);

            if (this.label) {
                this.label[0].stop();
                this.label[0].attr({ r: 7.5 });
                this.label[1].attr({ "font-weight": 800 });
            }
        }, function () {
            this.sector.animate({ transform: 's1 1 ' + this.cx + ' ' + this.cy }, 500);

            if (this.label) {
                this.label[0].animate({ r: 5 }, 500);
                this.label[1].attr({ "font-weight": 400 });
            }
        });
    });
}(jQuery));