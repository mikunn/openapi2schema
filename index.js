#!/usr/bin/env node

/*eslint no-console: "off"*/

var program = require('commander')
	, openapi2schema = require('./lib/openapi2schema')
;

var options;

program
	.option('-i, --input <filepath>', 'OpenAPI file')
	.option('-c, --clean', 'Clean output from extra methods and endpoints')
	.option('-p, --pretty-print', 'Enable pretty printing')
	.option('-d, --date-to-datetime', 'Convert dates to datetimes')
	.option('--pattern-properties', 'Support patternProperties with x-patternProperties')
	.option('--no-responses', 'Exclude responses')
	.parse(process.argv)
;

if (! process.argv.slice(2).length) {
	program.help();
}

if (! program.input) {
	console.error('Option -i, --input <filepath> required. Display help with -h.');
	process.exit(1);
}


options = {
	'includeResponses': program.responses || false,
	'dateToDateTime': program.dateToDateTime || false,
	'supportPatternProperties': program.patternProperties || false,
	'clean': program.clean || false
};

openapi2schema(program.input, options, function(err, res) {
	if (err) {
		return console.error(err);
	}

	print(res);
});

function print(data) {
	var spaces = program.prettyPrint ? 2 : null;
	console.log(JSON.stringify(data, null, spaces));
}

