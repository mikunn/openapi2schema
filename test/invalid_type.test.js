var test = require('tape')
	, openapi2schema = require('../lib/openapi2schema')
	, helpers = require('./helpers')
;

test('invalid type in request', function(assert) {
	var spec, result;

	assert.plan(4);

	spec = helpers.specPath('invalid-type-request-spec.yaml');

	openapi2schema(spec, function(err, result) {
		assert.equal(result, null, 'no result');
		assert.ok(err.message.match(/not a valid type in \/ok_and\/invalid\/type/), 'error message');
	});

	result = openapi2schema(spec, { async: false });

	assert.equal(result instanceof Error, true, 'error (sync)');
	assert.ok(result.message.match(/not a valid type in \/ok_and\/invalid\/type/), 'error message (sync)');
});

test('invalid type in response', function(assert) {
	var spec, result;

	assert.plan(4);

	spec = helpers.specPath('invalid-type-response-spec.yaml');

	openapi2schema(spec, function(err, result) {
		assert.equal(result, null, 'no result');
		assert.ok(err.message.match(/not a valid type in \/invalid\/type/), 'error message');
	});

	result = openapi2schema(spec, { async: false });

	assert.equal(result instanceof Error, true, 'error (sync)');
	assert.ok(result.message.match(/not a valid type in \/invalid\/type/), 'error message (sync)');
});

