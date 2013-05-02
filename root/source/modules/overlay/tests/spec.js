test('basic test', function() {
  expect(1);
  equal(typeof($.fn.overlay), 'function', 'The plugin exists.');
});

test('default handlers', function() {
  expect(3);
  var $overlay = $('#overlay1');
  $overlay.overlay();
  var overlay = $.data($overlay.get(0), 'overlay');

  overlay.show();
  equal($('#overlay1').length, 1, 'Overlay appended the element when shown.');
  overlay.hide();
  equal($('#overlay1').length, 0, 'Overlay detached the element when hidden.');
  overlay.show();
  equal($('#overlay1').length, 1, 'It is shown back again.');
});

test('test custom show hide handlers', function() {
  expect(2);
  var $overlay = $('#overlay2');
  $overlay.overlay({
    show: function() {
        this.$elem.show();
    },
    hide: function() {
        this.$elem.hide();
    }
  });
  var overlay = $.data($overlay.get(0), 'overlay');
  overlay.show();

  ok(overlay.$elem.is(':visible'), 'The element should be visible');

  overlay.hide();

  ok(overlay.$elem.is(':not(:visible)'), 'The element should be invisible');
});

asyncTest('test callbacks', function() {
  expect(2);
  var $overlay = $('#overlay3');
  $overlay.overlay({
    onShow: function() {
        ok(true, 'on Show callback was called');
    },
    onHide: function() {
        ok(true, 'on Hide callback was called');
    }
  });

  var overlay = $.data($overlay.get(0), 'overlay');
  overlay.show();
  overlay.hide();
  start();
});