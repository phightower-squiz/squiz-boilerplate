/**
 * Tablesorter ARIA widget
 *
 * @description
 *     Adds missing ARIA attributes to the tablesorter plugin in an attempt
 *     to make the table sorting options more accessible after JS has modified
 *     them.
 * @author abarnes@squiz.com.au
 */

;(function($, undefined){
    $.tablesorter.addWidget({
      id: 'ariaWidget',
      options: {},
      format: function(table, config, widgetOptions, initFlag) {
        if (!initFlag) {
            var $table = $(table);
            var $headerCells = $('thead', $table).find('th,td');
            $headerCells
                .filter(function(){
                    return !$(this).hasClass('tablesorter-headerDesc');
                })
                .each(function(){
                    $(this).attr('aria-sort','none');
                })
                .end()
                .filter('.tablesorter-headerDesc')
                .attr('aria-sort', 'descending');
            $headerCells
                .filter('.tablesorter-headerAsc')
                .attr('aria-sort', 'ascending');
        }
      }
    });
}(jQuery));
