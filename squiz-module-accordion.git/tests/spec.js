var $fixture;
var fixtureClass = 'accordion';
var buttonClass = 'accordion__button';
var targetClass = 'accordion__target';

module('accordion', {
    setup: function() {
        $fixture = $('.' + fixtureClass);
        // Start the plugin
        $fixture.UberAccordion({
            buttonClass: buttonClass
        });
    }
});

test('The plugin has loaded', function() {
    expect(2);

    // Check that the element we're looking for exists in the test dom
    equal($fixture.length, 1, 'The fixture element exists.');

    // Check that the plugin can be instantiated
    ok(typeof($fixture.data('plugin_UberAccordion')) !== 'undefined',
        'The plugin has been instantiated');
});

test('Plugin classes have been applied', function() {
    var $buttons = $fixture.find('.' + buttonClass);
    var buttonsWithClass = 0;
    $buttons.each(function() {
        buttonsWithClass += $(this).hasClass('uber-accordion__button') ? 1 : 0;
    });

    equal(buttonsWithClass, $buttons.length, 'All buttons have the applied class');
});

test('Button click events properly expand and markup the HTML', function() {
    var elems = $fixture.find('.' + buttonClass).length,
        $button,
        $target;

    // Change multiple mode to false to test accordion behavior
    var accordion = $fixture.data('plugin_UberAccordion');
    accordion.settings.multiple = false;

    // Loop each button & target pair and ensure the clicks apply the correct
    // classes
    for (var i = 0, l = elems; i<l; i+=1) {
        $button = $fixture.find('.' + buttonClass + ':eq(' + i + ')');
        $target = $fixture.find('.' + targetClass + ':eq(' + i + ')');

        if (!$button.length || !$target.length) {
            ok(false, 'Button and target mismatch');
        }

        $button.trigger('click');

        ok($button.hasClass('uber-accordion__button-active'), 'button class has been applied');
        ok($target.hasClass('uber-accordion__target-active'), 'target class has been applied');

        equal($fixture.find('.uber-accordion__button-active').length, 1, 'Only one class is applied');
        equal($fixture.find('.uber-accordion__target-active').length, 1, 'Only one class is applied');
    }

});