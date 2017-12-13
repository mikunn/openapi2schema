var test = require('tape')
	, openapi2schema = require('../lib/openapi2schema')
	, helpers = require('./helpers')
	, fs = require('fs')

;

test('load specification from string in sync mode', function(assert) {
	var spec
		, expected
	;

	assert.plan(2);

	expected = {
		'/test': {
			get: {
				responses: {
					200: {
						type: 'object',
						properties: {
							testprop: {
								type: 'string',
								format: 'date'
							}
						},
						$schema: 'http://json-schema.org/draft-04/schema#'
					}
				}
			}
		}
	};

	spec = fs.readFileSync(helpers.specPath('date-spec.yaml'));

	var result = openapi2schema(spec, {async: false});
	assert.equal(result instanceof Error, false, 'no error (sync)');
	assert.deepEqual(result, expected, 'structure ok (sync)');
});
