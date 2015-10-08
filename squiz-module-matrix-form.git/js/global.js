(function($){
    var $form = $('.sq-form');

    var getContainerForInput = function (elem) {
        var $container = $(elem).parents('.sq-form-question');
        return $container;
    };

    var options = {
        errorClass:     'sq-form-error',
        errorPlacement: function (error, element) {
            var $container = $(element).parents('.sq-form-question-answer');
            if ($(element).attr('id') === 'recaptcha_response_field') {
                error.insertAfter(element);
            }
            else {
                $container.append(error);
            }
        },

        // fn((element, errorClass, validClass))
        highlight: function (element) {
            getContainerForInput(element).addClass('sq-form-question-error');
        },

        // fn element, errorClass, validClass)
        unhighlight: function (element) {
            getContainerForInput(element).removeClass('sq-form-question-error');
        }
    };

    // Apply form validation
    $form.validate(options);

    // WTF Forms? Styling
    $form.find('.sq-form-question-datetime select').wrap('<div class="select" />');
}(jQuery));
