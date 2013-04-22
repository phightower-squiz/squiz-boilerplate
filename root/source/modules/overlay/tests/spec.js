test('basic test', function() {
  expect(1);
  equal(typeof($.module_overlay), 'function', 'The plugin exists.');
});

test('default handlers', function() {
  expect(3);
  var overlay = new $.module_overlay();
  overlay.show();
  equal($('.' +overlay.settings.className).length, 1, 'Overlay appended the element when shown.');
  overlay.hide();
  equal($('.' +overlay.settings.className).length, 0, 'Overlay detached the element when hidden.');
  overlay.show();
  equal($('.' +overlay.settings.className).length, 1, 'It is shown back again.');
});

test('test custom show hide handlers', function() {
  expect(2);
  var overlay = new $.module_overlay({
    className: 'overlay2',
    show: function($elem) {
        $elem.show();
    },
    hide: function($elem) {
        $elem.hide();
    }
  });
  overlay.show();

  // Needs to be added to the dom in order to work properly.
  $('body').prepend(overlay.settings.elem);

  ok(overlay.settings.elem.is(':visible'), 'The element should be visible');

  overlay.hide();

  ok(overlay.settings.elem.is(':not(:visible)'), 'The element should be invisible');
});