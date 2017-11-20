var test = require('tape')
	, openapi2schema = require('../lib/openapi2schema')
	, helpers = require('./helpers')

;

test('cleaning the result from empty objects and endpoints', function(assert) {
	var spec
		, expected
		, options
	;
	
	assert.plan(2);

	expected = {
		'/clean2': {
			post: {
				body: {
					'$schema': 'http://json-schema.org/draft-04/schema#',
					type: 'string'
				}
			}
		}	
	};

	spec = helpers.specPath('clean.yaml');

	options = {
		clean: true,
		includeResponses: false
	};

	openapi2schema(spec, options, function(err, result) {
		assert.equal(err, null, 'no error');
		assert.deepEqual(result, expected, 'structure ok');
	});
});
