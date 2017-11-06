var test = require('tape')
	, openapi2schema = require('../lib/openapi2schema')
	, helpers = require('./helpers')

;

test('merging allOfs', function(assert) {
	var spec
		, expected
	;
	
	assert.plan(2);

	spec = helpers.specPath('allofs-spec.yaml');
	expected = helpers.parseJSON('allofs-merged.json');

	openapi2schema(spec, {mergeAllOf: true}, function(err, result) {
		assert.equal(err, null, 'no error')
		assert.deepEqual(result, expected, 'structure ok');
	});
});

test('not merging allOfs', function(assert) {
	var spec
		, expected
	;
	
	assert.plan(2);

	spec = helpers.specPath('allofs-spec.yaml');
	expected = helpers.parseJSON('allofs-no-merge.json');

	openapi2schema(spec, {mergeAllOf: false}, function(err, result) {
		assert.equal(err, null, 'no error')
		assert.deepEqual(result, expected, 'structure ok');
	});
});

test('not merging allOfs by default', function(assert) {
	var spec
		, expected
	;
	
	assert.plan(2);

	spec = helpers.specPath('allofs-spec.yaml');
	expected = helpers.parseJSON('allofs-no-merge.json');

	openapi2schema(spec, function(err, result) {
		assert.equal(err, null, 'no error')
		assert.deepEqual(result, expected, 'structure ok');
	});
});
