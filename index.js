#!/usr/bin/env node

var program = require('commander')
	, openapi2schema = require('./lib/openapi2schema')
;

var options;

program
	.option('-i, --input [filepath]', 'OpenAPI file')
	.option('-p, --pretty-print', 'Enable pretty printing')
	.option('-d, --date-to-datetime', 'Convert dates to datetimes')
	.option('--pattern-properties', 'Support patternProperties with x-patternProperties')
	.option('--no-responses', 'Exclude responses')
	.option('--merge-allof', 'Merge allOfs')
	.parse(process.argv)
;

options = {
	'includeResponses': program.responses || false,
	'mergeAllOf': program.mergeAllof || false,
	'dateToDateTime': program.dateToDateTime || false,
	'supportPatternProperties': program.patternProperties || false
};

openapi2schema(program.input, options, function(err, res) {
	if (err) {
		return console.log(err);
	}

	print(res);
});

function print(data) {
	spaces = program.prettyPrint ? 2 : null;
	console.log(JSON.stringify(data, null, spaces));
}

