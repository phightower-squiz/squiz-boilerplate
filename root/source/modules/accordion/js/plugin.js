;(function($, window, document, undefined){
    var Accordion = function(elem, options) {
        var defaults = {
            activeClass: 'accordion-group-active'
        };
        this.$elem = $(elem);

        // Store some vars
        this.$groups  = $('.accordion-group', this.$elem);
        this.$content = $('.accordion-group-content', this.$elem);
        this.$links   = $('.accordion-group-header-link', this.$elem);

        this.settings = $.extend({}, defaults, options);
        this.init();
    };

    Accordion.prototype = {
        // Show a group.
        show: function($group) {
            this.$groups
                .filter('.accordion-group-active')
                .find('.accordion-group-content')
                .stop()
                .slideUp('fast')
                .end()
                .removeClass(this.settings.activeClass);
            $group
                .find('.accordion-group-content')
                .stop()
                .slideDown('fast')
                .end()
                .addClass(this.settings.activeClass);
        },//end show()

        // Initialise the accordion (can be called multiple times to re-initialise)
        init: function() {
            var self = this;
            this.$groups.each(function() {
                var $group = $(this);
                var $link = $('.accordion-group-header-link', $group);
                $link.off().on('click touch', function(e){
                    e.preventDefault();
                    // Can't activate the same link twice
                    if ($(this).hasClass(self.settings.activeClass)) {
                        return false;
                    }//end if
                    self.show($group);
                });
            });
            this.$content.hide();
            self.show(this.$groups.first());
        }//end init()
    };

    $.fn.accordion = function(options) {
        return this.each(function () {
            if (!$.data(this, 'accordion')) {
                $.data(this, 'accordion', new Accordion( this, options ));
            }
        });
    };
}(jQuery));