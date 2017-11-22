var mergeAllOf = require('json-schema-merge-allof')
	, $RefParser = require('json-schema-ref-parser')
	, toJsonSchema = require('openapi-schema-to-json-schema')

module.exports = openapi2schema;

function openapi2schema(spec, options, callback) {
	var schemaOptions = {};

	if (typeof options === 'function') {
		callback = options;
		options = {};
	}

	if (typeof callback !== 'function') {
		throw new Error('callback function required as third argument');
	}

	options = options || {};
	options.includeBodies = options.includeBodies === false ? false : true;
	options.includeResponses = options.includeResponses === false ? false : true;
	options.clean = options.clean === true ? true : false

	schemaOptions.dateToDateTime = options.dateToDateTime === true ? true : false;
	schemaOptions.supportPatternProperties = 
		options.supportPatternProperties === true ? true : false;

	$RefParser.dereference(spec)
		.then(function(dereferenced) {
			var result;
			if (! dereferenced.paths) {
				throw new Error("no paths defined in the specification file");
			}
			result = buildPaths(dereferenced.paths, options, schemaOptions);
			callback(null, result);
		})
		.catch(function(err) {
			callback(err, null);
		})
	;
}

function buildPaths(paths, options, schemaOptions) {
	var pathName
		, pathStruct
		, methodName
		, methodStruct
		, resultMethod
		, result = {}
	;

	for (pathName in paths) {
		result[pathName] = {};
		pathStruct = paths[pathName];

		for (methodName in pathStruct) {
			if (methodName === 'parameters') {
				continue;
			}

			resultMethod = {};
			methodStruct = pathStruct[methodName];

			if (options.includeBodies && methodStruct.requestBody) {
				resultMethod.body = 
					getConvertedSchema('request', methodStruct.requestBody, schemaOptions);
			}
			
			if (options.includeResponses && methodStruct.responses) {
				resultMethod.responses =
					buildResponses(methodStruct.responses, schemaOptions);
			}

			if (options.clean && isEmptyObj(resultMethod)) {
				continue;
			}
			result[pathName][methodName] = resultMethod;
		}

		if (options.clean && isEmptyObj(result[pathName])) {
			delete result[pathName];
		}
	}

	return result;
}

function buildResponses(responses, schemaOptions) {
	var statusCode
		, responseData
		, schema
		, resultResponses = {}
	;

	for (statusCode in responses) {
		responseData = responses[statusCode];
		resultResponses[statusCode] =
			getConvertedSchema('response', responseData, schemaOptions);
	}

	return resultResponses;
}

function getConvertedSchema(type, struct, options) {
	var schema;

	if (! (struct.content && struct.content['application/json'])) {
		return {};
	}

	schema = struct.content['application/json'].schema;
	schema = mergeAllOf(JSON.parse(JSON.stringify(schema)));

	if (type === 'response') {
		options.removeWriteOnly = true
		options.removeReadOnly = false
	} else if (type === 'request') {
		options.removeWriteOnly = false
		options.removeReadOnly = true
	}

	schema = toJsonSchema(schema, options);
	return schema;
}

function isEmptyObj(obj) {
	return Object.keys(obj).length > 0 ? false : true;
}

