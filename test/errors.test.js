var test = require('tape')
	, openapi2schema = require('../lib/openapi2schema')

;

test('get error with no specification', function(assert) {
	assert.plan(2);

	openapi2schema('', function(err) {
		assert.equal(err instanceof Error, true, 'got error');
	});

	var result = openapi2schema('', {async: false});
	assert.equal(result instanceof Error, true, 'got error (sync)');
});
