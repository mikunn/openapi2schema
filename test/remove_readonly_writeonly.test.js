var test = require('tape')
	, openapi2schema = require('../lib/openapi2schema')
	, helpers = require('./helpers')

;

test('remove read-only and write-only properties', function(assert) {
	var spec
		, expected
	;
	
	assert.plan(4);

	expected = helpers.parseJSON('read-write-only.json');
	spec = helpers.specPath('read-write-only-spec.yaml');

	openapi2schema(spec, function(err, result) {
		assert.equal(err, null, 'no error');
		assert.deepEqual(result, expected, 'structure ok');
	});

	var result = openapi2schema(spec, { async: false });
	assert.equal(result instanceof Error, false, 'no error (sync)');
	assert.deepEqual(result, expected, 'structure ok (sync)');
});
