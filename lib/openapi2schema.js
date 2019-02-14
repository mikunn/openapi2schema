var mergeAllOf = require('json-schema-merge-allof')
	, $RefParser = require('json-schema-ref-parser')
	, $RefParserSync = require('json-schema-deref-sync')
	, toJsonSchema = require('openapi-schema-to-json-schema')
	, jsYaml = require('js-yaml')
	, fs = require('fs');

module.exports = openapi2schema;

function openapi2schema(spec, options, callback) {
	var schemaOptions = {};

	if (typeof options === 'function') {
		callback = options;
		options = {};
	}

	options = options || {};
	options.includeBodies = options.includeBodies === false ? false : true;
	options.includeResponses = options.includeResponses === false ? false : true;
	options.includeParameters = options.includeParameters === true ? true : false;
	options.clean = options.clean === true ? true : false;
	options.async = options.async === false ? false : true;

	if (typeof callback !== 'function' && options.async === true) {
		throw new Error('callback function required as third argument');
	}

	schemaOptions.dateToDateTime = options.dateToDateTime === true ? true : false;
	schemaOptions.supportPatternProperties =
		options.supportPatternProperties === true ? true : false;

	if (options.async === true) {
		$RefParser.dereference(spec)
			.then(function(dereferenced) {
				var result;
				if (! dereferenced.paths) {
					throw new Error('no paths defined in the specification file');
				}
				result = buildPaths(dereferenced.paths, options, schemaOptions);
				callback(null, result);
			})
			.catch(function(err) {
				callback(err, null);
			})
		;
	} else {
		var parsedSpec, dereferenced;
		if (typeof (spec) === 'string' || spec instanceof Buffer) {
			if (typeof (spec) === 'string' && ! fs.existsSync(spec)) {
				spec = new Buffer(spec);
			}

			if (typeof (spec) === 'string' && fs.existsSync(spec)) {
				spec = fs.readFileSync(spec);
			}

			try {
				parsedSpec = JSON.parse(spec.toString());
			} catch (error) { /** error, go on and try yaml parser **/ }

			if (! parsedSpec) {
				try {
					parsedSpec = jsYaml.safeLoad(spec.toString());
				} catch (error) { /** error **/ }
			}
		} else {
			parsedSpec = spec;
		}

		dereferenced = $RefParserSync(parsedSpec);
		if (dereferenced instanceof Error) {
			return dereferenced;
		}
		if (! dereferenced.paths) {
			return new Error('no paths defined in the specification file');
		}
		try {
			result = buildPaths(dereferenced.paths, options, schemaOptions);
		} catch (e) {
			return e;
		}

		return result;
	}
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
			if (methodName === 'parameters' && !options.includeParameters) {
				continue;
			}

			resultMethod = {};
			methodStruct = pathStruct[methodName];
			try {
				if (options.includeBodies && methodStruct.requestBody) {
					resultMethod.body =
						getConvertedSchema('request', methodStruct.requestBody, schemaOptions);
				}

				if (options.includeResponses && methodStruct.responses) {
					resultMethod.responses =
						buildResponses(methodStruct.responses, schemaOptions);
				}

				if (options.includeParameters && methodStruct.parameters) {
					for (parameter of methodStruct.parameters) {
						if (parameter.in === 'query') {
							if (!resultMethod.parameters) {
								resultMethod.parameters = {
									type: 'object',
									additionalProperties: false
								};
							}
							if (parameter.required === true) {
								if (!resultMethod.parameters.required) resultMethod.parameters.required = [];
								resultMethod.parameters.required.push(parameter.name);
							}
							if (!resultMethod.parameters.properties) resultMethod.parameters.properties = {};
							resultMethod.parameters.properties[parameter.name] = getConvertedSchema('parameters', parameter, schemaOptions);
						}
					}
					resultMethod.parameters['$schema'] = 'http://json-schema.org/draft-04/schema#';
				}
			} catch (e) {
				if (e.name == 'InvalidTypeError') {
					throw new Error(e.message + ' in ' + pathName);
				}
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

	if (!(struct.content && struct.content['application/json'])) {
		if (type === 'parameters' && struct.schema) {
			schema = struct.schema;
		} else {
			return {};
		}
	} else {
		schema = struct.content['application/json'].schema;
	}

	schema = mergeAllOf(JSON.parse(JSON.stringify(schema)));

	if (type === 'response') {
		options.removeWriteOnly = true;
		options.removeReadOnly = false;
	} else if (type === 'request') {
		options.removeWriteOnly = false;
		options.removeReadOnly = true;
	}

	schema = toJsonSchema(schema, options);
	if (type === 'parameters')
		delete schema['$schema'];
	return schema;
}

function isEmptyObj(obj) {
	return Object.keys(obj).length > 0 ? false : true;
}

