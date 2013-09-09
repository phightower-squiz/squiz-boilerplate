;(function($, window, document, undefined){

    // Default options.
    var defaults = {
        classes: {
            container: 'chart',
            data:      'chart-data',
            group:     'chart-group',
            label:     'chart-label',
            point:     'chart-point'
        }
    };

    // Plugin Constructor.
    var ChartData = function(elem, options) {
        this.settings = $.extend({}, defaults, options);
        this.$elem = $(elem);
        this.init();
    };

    // Public Methods.
    ChartData.prototype = {
        init: function(){
            var self = this;
            var $groups = $('.' + self.settings.classes.group, self.$elem);
            $groups.each(function(){
                var label = $('.' + self.settings.classes.label, self.$elem).text();
                var key   = $(this).data('key');
                var $points = $('.' + self.settings.classes.point, self.$elem);
            });
        },//end init

        /**
         * Export chart data in google format
         * @param {string} format The name of the charting library as a key of exporters
         * @returns {object}
         */
        exportData: function(format) {
            return null;
        }//end exportData()
    };

    // Expose as a jQuery Plugin
    $.fn.chart_data = function(options) {
        return this.each(function() {
            if (!$.data(this, 'chart-data')) {
                $.data(this, 'chart-data',
                    new ChartData( this, options ));
            }//end if
        });
    };

}(jQuery, window, document));