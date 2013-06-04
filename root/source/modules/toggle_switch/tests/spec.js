test('The plugin has created the toggle switch ui element', function() {
  expect(1);
  equal($('.toggle-switch-ui').length, 1, 'The toggle switcher has created content.');
});

test('The select function works as expected', function() {
  expect(3);
  var toggle = $('.toggle-switch').data('toggle_switch');
  equal(typeof(toggle.select), 'function', 'The selection property is a function');

  toggle.select(0);

  equal($('.toggle-switch-active').length, 0, 'The toggle has de-activated');

  toggle.select(1);

  equal($('.toggle-switch-active').length, 1, 'The toggle has activated');
});