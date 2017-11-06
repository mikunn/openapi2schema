var test = require('tape')
	, openapi2schema = require('../lib/openapi2schema')
	, helpers = require('./helpers')

;

test('support partternProperties', function(assert) {
	var spec
		, expected
	;
	
	assert.plan(2);

	spec = helpers.specPath('patternproperties-spec.yaml');
	expected = helpers.parseJSON('patternproperties-supported.json');

	openapi2schema(spec, {supportPatternProperties: true}, function(err, result) {
		assert.equal(err, null, 'no error');
		assert.deepEqual(result, expected, 'structure ok');
	});
});

test('do not support partternProperties by default', function(assert) {
	var spec
		, expected
	;
	
	assert.plan(2);

	spec = helpers.specPath('patternproperties-spec.yaml');
	expected = helpers.parseJSON('patternproperties-not-supported.json');

	openapi2schema(spec, function(err, result) {
		assert.equal(err, null, 'no error');
		assert.deepEqual(result, expected, 'structure ok');
	});
});
