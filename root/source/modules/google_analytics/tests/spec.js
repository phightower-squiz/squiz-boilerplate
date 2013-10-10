test('Fixtures', function() {
    expect(1);
    ok(typeof(_gaq) !== 'undefined', 'Google analytics mock object exists');
});

test('Mail links', function() {
    expect(10);

    var $link = $('#mailto-link');
    equal($link.length, 1, 'The link exists in the DOM');
    equal($link.attr('href'), 'mailto:email@domain.com', 'The link has the right href to test');

    $link.on('click', function() {
        ok(true, 'Link was clicked');
    });

    $link.trigger('click');
    var ev = _gaq.pop();

    ok(ev.length >= 1, 'The event item exists as an array.');
    equal(ev[0], '_trackEvent', 'The event item has the tracking type');
    equal(ev[1], 'email', 'The category is correct');
    equal(ev[2], 'click', 'The action is correct');
    equal(ev[3], 'email@domain.com', 'The label is correct');
    equal(ev[4], 0, 'The value is correct');
    equal(ev[5], false, 'The non interactive flag is correct');
});

test('Anchor links', function() {
    expect(1);

    var $link = $('#anchor-link');
    var lengthBefore = _gaq.length;
    $link.trigger('click');
    equal(_gaq.length, lengthBefore, 'The google array remains unchanged');
});

test('Matrix link', function() {
    expect(1);

    var $link = $('#matrix-link');
    var lengthBefore = _gaq.length;
    $link.trigger('click');
    equal(_gaq.length, lengthBefore, 'The google array remains unchanged');
});

test('External links', function() {
    expect(7);

    var $link = $('#external-link');
    $link.trigger('click');
    var ev = _gaq.pop();

    ok(ev.length >= 1, 'The event item exists as an array.');
    equal(ev[0], '_trackEvent', 'The event item has the tracking type');
    equal(ev[1], 'external', 'The category is correct');
    equal(ev[2], 'click', 'The action is correct');
    equal(ev[3], 'http://www.google.com', 'The label is correct');
    equal(ev[4], 0, 'The value is correct');
    equal(ev[5], true, 'The non interactive flag is correct');
});


test('Relative links', function() {
    expect(1);

    var $link = $('#relative-link');
    var lengthBefore = _gaq.length;
    $link.trigger('click');
    equal(_gaq.length, lengthBefore, 'The google array remains unchanged');
});

test('Telephone links', function() {
    expect(7);

    var $link = $('#telephone-link');
    $link.trigger('click');
    var ev = _gaq.pop();

    ok(ev.length >= 1, 'The event item exists as an array.');
    equal(ev[0], '_trackEvent', 'The event item has the tracking type');
    equal(ev[1], 'telephone', 'The category is correct');
    equal(ev[2], 'click', 'The action is correct');
    equal(ev[3], '+12345', 'The label is correct');
    equal(ev[4], 0, 'The value is correct');
    equal(ev[5], false, 'The non interactive flag is correct');
});

test('Javascript links', function() {
    expect(1);

    var $link = $('#javascript-link');
    var lengthBefore = _gaq.length;
    $link.trigger('click');
    equal(_gaq.length, lengthBefore, 'The google array remains unchanged');
});

test('Relative downloadable file links', function() {
    expect(7);

    var $link = $('#relative-downloadable-link');
    $link.trigger('click');
    var ev = _gaq.pop();

    ok(ev.length >= 1, 'The event item exists as an array.');
    equal(ev[0], '_trackEvent', 'The event item has the tracking type');
    equal(ev[1], 'download', 'The category is correct');
    equal(ev[2], 'click', 'The action is correct');
    equal(ev[3], 'doc', 'The label is correct');
    equal(ev[4], 0, 'The value is correct');
    equal(ev[5], false, 'The non interactive flag is correct');
});

test('External downloadable links', function() {
    expect(7);

    var $link = $('#external-downloadable-link');
    $link.trigger('click');
    var ev = _gaq.pop();

    ok(ev.length >= 1, 'The event item exists as an array.');
    equal(ev[0], '_trackEvent', 'The event item has the tracking type');
    equal(ev[1], 'download', 'The category is correct');
    equal(ev[2], 'click', 'The action is correct');
    equal(ev[3], 'xls', 'The label is correct');
    equal(ev[4], 0, 'The value is correct');
    equal(ev[5], false, 'The non interactive flag is correct');
});