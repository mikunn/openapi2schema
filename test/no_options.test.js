var test = require('tape')
	, openapi2schema = require('../lib/openapi2schema')
	, helpers = require('./helpers')

;

test('basic spec', function(assert) {
	var spec
		, expected
	;
	
	assert.plan(2);

	expected = {
		'/test': {
			get: {
				responses: {
					200: {
						$schema: 'http://json-schema.org/draft-04/schema#',
						type: 'object',
						properties: {
							testprop: {
								type: 'string',
								format: 'date-time'
							}
						}
					}
				}
			},
			post: {
				body: {
					$schema: 'http://json-schema.org/draft-04/schema#',
					type: 'object',
					properties: {
						testprop: {
							type: 'string'
						}
					}
				},
				responses: {
					201: {
						$schema: 'http://json-schema.org/draft-04/schema#',
						type: 'object',
						properties: {
							testprop: {
								type: 'string',
								format: 'date-time'
							}
						}
					}
				}
			}
		}	
	};

	spec = helpers.specPath('basic-spec.yaml');

	openapi2schema(spec, {}, function(err, result) {
		assert.equal(err, null, 'no error');
		assert.deepEqual(result, expected, 'structure ok');
	});
});

test('petstore spec', function(assert) {
	var spec
		, expected
	;
	
	assert.plan(2);

	expected = helpers.parseJSON('petstore-no-options-result.json');
	spec = helpers.specPath('petstore-spec.yaml');

	openapi2schema(spec, {}, function(err, result) {
		assert.equal(err, null, 'no error');
		assert.deepEqual(result, expected, 'structure ok');
	});
});

test('test without options parameter', function(assert) {
	var spec
		, expected
	;
	
	assert.plan(2);

	expected = helpers.parseJSON('petstore-no-options-result.json');
	spec = helpers.specPath('petstore-spec.yaml');

	openapi2schema(spec, function(err, result) {
		assert.equal(err, null, 'no error');
		assert.deepEqual(result, expected, 'structure ok');
	});
});

test('test without callback', function(assert) {
	var spec;
	
	assert.plan(1);

	spec = helpers.specPath('petstore-spec.yaml');
	assert.throws(function() {openapi2schema(spec);});
});
