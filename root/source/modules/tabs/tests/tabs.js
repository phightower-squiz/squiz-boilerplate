test('basic test', function() {
  expect(1);
  ok(true, 'this had better work.');
});

test('can access the DOM', function() {
  expect(1);
  var $fixture = $('#qunit-fixture');
  equal($fixture.text(), 'this had better work.', 'should be able to access the DOM.');
});