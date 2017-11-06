var test = require('tape')
	, openapi2schema = require('../lib/openapi2schema')
	, helpers = require('./helpers')

;

test('do not include responses', function(assert) {
	var spec
		, expected
	;
	
	assert.plan(2);

	expected = {
		'/test': {
			get: {},
			post: {
				body: {
					$schema: 'http://json-schema.org/draft-04/schema#',
					type: 'object',
					properties: {
						testprop: {
							type: 'string'
						}
					}
				}
			}
		}	
	};

	spec = helpers.specPath('basic-spec.yaml');

	openapi2schema(spec, {includeResponses: false}, function(err, result) {
		assert.equal(err, null, 'no error')
		assert.deepEqual(result, expected, 'structure ok');
	});
});

test('do not include request bodies', function(assert) {
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

	openapi2schema(spec, {includeBodies: false}, function(err, result) {
		assert.equal(err, null, 'no error')
		assert.deepEqual(result, expected, 'structure ok');
	});
});
