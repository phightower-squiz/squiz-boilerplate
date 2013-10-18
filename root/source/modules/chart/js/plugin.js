/*global jquery:false*/
/**
 * Boilerplate wrapper for invoking google charts
 */
(function($, undefined){
    'use strict';

    var callbackName = '__loadCharts';

    var isLoadCalled = false;

    // Default configuration
    var defaults = {
        classes: {
            ignore: 'chart-ignore',
            output: 'chart-output',
            loaded: 'chart-loaded',
            data:   'chart-data'
        },
        loaded: function() {}
    };

    var instantiatedCharts = [];

    // Be a good citizen and allow restoration of the old chart function if
    // present.
    var oldLoader = window[callbackName];
    var loadCharts = window[callbackName] = function() {
        if (window.google) {
            window.google.load('visualization', '1', {'callback':'', 'packages':['corechart']});
            window.google.setOnLoadCallback(function() {
                for (var i = 0, l = instantiatedCharts.length; i<l; i++) {
                    instantiatedCharts[i].init();
                }//end for
            });
        }//end if
    };//end __loadCharts

    ///////////////////////
    // Private functions //
    ///////////////////////

    // Load the Google JS API, but only load it once
    function loadGoogleJSAPI() {
        if (!window.google && !isLoadCalled) {
            var script = document.createElement("script");
            script.src = "https://www.google.com/jsapi?callback=" + callbackName;
            script.type = "text/javascript";
            document.getElementsByTagName("head")[0].appendChild(script);
            isLoadCalled = true;
        }//end if
    }//end loadGoogleJSAPI()

    // Constructor
    var GoogleChart = function(elem, options) {
        this.settings = $.extend({}, defaults, options, true);
        this.elem     = elem;
        this.$elem    = $(elem);

        // Add the chart to an internal list ready to init after load
        instantiatedCharts.push(this);
        loadGoogleJSAPI();
    };

    //////////////////////
    // Public functions //
    //////////////////////

    GoogleChart.prototype = {

        /**
         * Initialise the chart
         */
        init: function() {
            this.loadData();
            this.draw();
            this.$elem.addClass(this.settings.classes.loaded);
            this.$elem.trigger('google-chart:loaded');
        },

        /**
         * Load the chart data from the DOM
         */
        loadData: function() {
            var self = this;
            var $data = $('.' + self.settings.classes.data, self.$elem);
            var columns = [];

            // Create a google data table.
            self.dataTable = new window.google.visualization.DataTable();

            // Columns are defined in the header rows
            $('thead th', self.$elem).each(function() {
                if (!$(this).hasClass(self.settings.classes.ignore)) {
                    var type = $(this).data('type');
                    columns.push(type);
                    self.dataTable.addColumn(type, $(this).text());
                }//end if
            });

            $('tbody tr', self.$elem).each(function() {
                if (!$(this).hasClass(self.settings.classes.ignore)) {
                    var $cells = $('td', this);
                    var row = $.map($cells, function(cell, i) {
                        var cellValue = $(cell).text();
                        switch(columns[i]) {
                            case 'number':
                                cellValue = parseFloat(cellValue);
                            break;
                            case 'date':
                                cellValue = new Date(cellValue);
                            break;
                        }//end switch
                        return cellValue;
                    });
                    self.dataTable.addRow(row);
                }//end if
            });
        },//end loadData()

        /**
         * Draw the chart
         */
        draw: function() {
            var type = this.$elem.data('chart-type') || 'PieChart';
            var $output = $('.' + this.settings.classes.output, this.$elem);

            // Read any options from the dom if present
            var dataOptions = {};
            var optionAttr = this.$elem.data('options');
            try {
                if (typeof(optionAttr) === 'string') {
                    dataOptions = $.parseJSON(optionAttr);
                } else if (typeof(optionAttr) !== 'undefined') {
                    dataOptions = optionAttr;
                }//end if
            } catch(e) {
                alert(e.message);
            }//end try

            var options = $.extend({}, dataOptions, this.settings.chart);
            if (typeof(this.dataTable) !== 'undefined' &&
                window.google.visualization.hasOwnProperty(type) &&
                $output.length) {
                var chart = new window.google.visualization[type]($output.get(0));
                chart.draw(this.dataTable, options);
            }//end if
            this.settings.loaded.call(this);
        },//end draw()

        /**
         * Restore the global load function
         */
        loaderNoConflict: function() {
            window[callbackName] = oldLoader;
            return loadCharts;
        }//end loaderNoConflict()
    };

    // jQuery plugin
    $.fn.google_chart = function(options) {
        return this.each(function () {
            if (!$.data(this, 'google_chart')) {
                $.data(this, 'google_chart', new GoogleChart( this, options ));
            }
        });
    };
}(jQuery));