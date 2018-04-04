var test = require('tape')
	, openapi2schema = require('../lib/openapi2schema')
	, helpers = require('./helpers')

;

test('merging allOfs', function(assert) {
	var spec
		, expected
	;
	
	assert.plan(4);

	spec = helpers.specPath('allofs-spec.yaml');
	expected = helpers.parseJSON('allofs-merged.json');

	openapi2schema(spec, {mergeAllOf: true}, function(err, result) {
		assert.equal(err, null, 'no error');
		assert.deepEqual(result, expected, 'structure ok');
	});

	var result = openapi2schema(spec, {mergeAllOf: true, async: false});
	assert.equal(result instanceof Error, false, 'no error (sync)');
	assert.deepEqual(result, expected, 'structure ok (sync)');
});
