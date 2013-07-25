// Toggle switcher inspired by jQuery.mobile toggle switcher.
;(function($, window, document, undefined){
    "use strict";

    var defaults = {
        // Button text applied to switcher.
        buttonText: "",

        // CSS classes.
        activeClass: "toggle-switch-active",
        selectClass: "toggle-switch-listbox",
        optionClass: "toggle-switch-option",

        // Change callback.
        onChange: function() {}
    };

    // The HTML template for the toggle switch UI element.
    var template =
        '<div class="toggle-switch-ui">' +
            '<div class="toggle-switch-left-bg"></div>' +
            '<div class="toggle-switch-right-bg"></div>' +
            '<a href="#" class="toggle-switch-clickable">' +
                '<span class="toggle-switch-ui-button">' +
                    '<span class="toggle-switch-ui-button-text"></span>' +
                '</span>' +
            '</a>' +
        '</div>';

    // Constructor.
    var Toggle = function(elem, options) {
        var self = this;

        this.$elem    = $(elem);
        this.settings = $.extend({}, defaults, options);

        // Build an array of option elements.
        var $options = $('.toggle-switch-option', this.$elem);
        this.optionElements = $.map($options, function(elem, i) {
            var $option = $(elem);
            return {
                elem: '<span class="toggle-switch-ui-option">' +
                          $option.text() +
                      '</span>',
                option: $option,
                value: $option.attr('value'),
                text:  $option.text(),
                selected: $option.is(':selected')
            };
        });

        // Create a switcher element from the template.
        this.$switcher = $(template);
        this.$select = $('.' + this.settings.selectClass, this.$elem);
        this.$clickable = this.$switcher.find('.toggle-switch-clickable');

        // Add the clickable switcher element to the DOM.
        this.$elem.after(this.$switcher);

        // Hide the select element from view & screen readers.
        this.$select.hide();

        // Add the options to the clickable region.
        $.each(this.optionElements, function(){
            self.$clickable.prepend(this.elem);
        });

        // Bind on click events.
        this.$clickable.click(function(e){
            e.preventDefault();
            if (self.$switcher.hasClass(self.settings.activeClass)) {
                self.select(1);
            } else {
                self.select(0);
            }//end if
        });

        // Set the initial state.
        if (this.optionElements[0].selected) {
            this.$switcher.addClass(self.settings.activeClass);
        }//end if
    };//end constructor

    Toggle.prototype = {
        /**
         * Select an element.
         * @param {number} index The index of the option to select (0|1)
         */
        select: function(index) {
            if (typeof(this.optionElements[index]) === 'undefined') {
                return false;
            }//end if
            this.$switcher.toggleClass(this.settings.activeClass);
            this.$select.val(this.optionElements[index].value);
            this.$select.trigger('change');
            this.settings.onChange.call(this, this.$select.val());
        }//end select()
    };

    // Expose as a jQuery plugin.
    $.fn.toggle_switch = function(options) {
        return this.each(function (){
            // @todo - sort out instantation and access to the toggle object
            // via jQuery .data()
            $(this).data('toggle_switch', new Toggle(this, options));
        });
    };
}(jQuery, window, document));