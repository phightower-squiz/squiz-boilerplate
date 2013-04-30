;(function($){
    var getContainerForInput = function(elem) {
        var $container = $(elem).parents('.sq-form-question');
        return $container;
    };

    $('.sq-form').validate({
        errorElement: "p",
        errorClass: "sq-form-error",
        errorPlacement: function(error, element) {
            var $container = getContainerForInput(element);
            $container.append(error);
        },

        highlight: function( element, errorClass, validClass ) {
            getContainerForInput(element).addClass('sq-form-question-error');
        },

        unhighlight: function( element, errorClass, validClass ) {
            getContainerForInput(element).removeClass('sq-form-question-error');
        }
/* jQuery.validate helpful methods:
        showErrors: function(errorMap,errorList) {},
        invalidHandler: function(e, validate) {}
*/
    });
}(jQuery));